import Parser from 'rss-parser';
import crypto from 'crypto';
import { supabase } from './db';
import type { Source, Article } from '../types';

const parser = new Parser({
  timeout: 10000,
  headers: {
    'User-Agent': 'INTEL-Dashboard-Bot/1.0',
  },
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['enclosure', 'enclosure']
    ]
  }
});

/**
 * Creates a deterministic hash for an article to prevent duplicates.
 */
export function generateArticleHash(url: string, title: string): string {
  return crypto
    .createHash('sha256')
    .update(`${url.trim()}::${title.trim()}`)
    .digest('hex');
}

/**
 * Fetches and parses an RSS feed.
 */
async function fetchRssFeed(feedUrl: string) {
  try {
    const feed = await parser.parseURL(feedUrl);
    return feed.items;
  } catch (error) {
    console.error(`Failed to fetch RSS feed at ${feedUrl}:`, error);
    return [];
  }
}

/**
 * Main ingestion function to process all active sources.
 */
export async function runIngestion() {
  console.log('Starting ingestion pipeline...');
  
  // 1. Fetch active sources
  const { data: sources, error: sourcesError } = await supabase
    .from('sources')
    .select('*')
    .eq('is_active', true);

  if (sourcesError) {
    console.error('Error fetching sources:', sourcesError);
    return { success: false, error: sourcesError.message };
  }

  if (!sources || sources.length === 0) {
    console.log('No active sources found.');
    return { success: true, articlesIngested: 0 };
  }

  let totalIngested = 0;

  // 2. Process each source
  for (const source of sources as Source[]) {
    if (source.source_type !== 'rss' || !source.feed_url) continue;

    console.log(`Fetching source: ${source.name} (${source.feed_url})`);
    const items = await fetchRssFeed(source.feed_url);
    
    if (items.length === 0) continue;

    const newArticles: Article[] = [];

    // 3. Normalize items
    for (const item of items) {
      if (!item.link || !item.title) continue;

      const hash = generateArticleHash(item.link, item.title);
      
      // Attempt to extract image from RSS enclosure or media tag
      let imageUrl = undefined;
      if (item.enclosure && item.enclosure.url && item.enclosure.type?.startsWith('image/')) {
        imageUrl = item.enclosure.url;
      } else if (item.mediaContent && item.mediaContent.$ && item.mediaContent.$.url) {
        imageUrl = item.mediaContent.$.url;
      }

      const article: Article = {
        source_id: source.id,
        title: item.title,
        url: item.link,
        description: item.contentSnippet || item.content || item.summary || null,
        image_url: imageUrl,
        content_hash: hash,
        published_at: item.isoDate || item.pubDate ? new Date(item.isoDate || item.pubDate!).toISOString() : null,
        processed_status: 'pending',
      };

      newArticles.push(article);
    }

    // 4. Deduplicate and Insert
    // We use upsert with onConflict to gracefully ignore existing articles
    if (newArticles.length > 0) {
      const { data, error } = await supabase
        .from('articles')
        .upsert(newArticles, { 
          onConflict: 'content_hash',
          ignoreDuplicates: true 
        })
        .select('id');

      if (error) {
        console.error(`Error inserting articles for ${source.name}:`, error);
      } else if (data) {
        totalIngested += data.length;
        console.log(`Ingested ${data.length} new articles from ${source.name}`);
      }
    }

    // 5. Update last_fetched_at
    await supabase
      .from('sources')
      .update({ last_fetched_at: new Date().toISOString() })
      .eq('id', source.id);
  }

  console.log(`Ingestion completed. Total new articles: ${totalIngested}`);
  return { success: true, articlesIngested: totalIngested };
}
