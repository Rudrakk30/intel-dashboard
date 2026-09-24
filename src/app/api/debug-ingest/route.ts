import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import Parser from 'rss-parser';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'INTEL-Dashboard-Bot/1.0' },
});

export async function GET() {
  const log: string[] = [];

  try {
    // 1. Get sources
    const { data: sources, error: srcErr } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (srcErr) {
      log.push(`ERROR fetching sources: ${JSON.stringify(srcErr)}`);
      return NextResponse.json({ log });
    }

    log.push(`Found ${sources?.length || 0} active sources`);

    if (!sources || sources.length === 0) {
      return NextResponse.json({ log });
    }

    // 2. Try fetching first source RSS
    const firstSource = sources[0];
    log.push(`Trying source: ${firstSource.name} -> ${firstSource.feed_url}`);

    if (!firstSource.feed_url) {
      log.push(`ERROR: source has no feed_url`);
      return NextResponse.json({ log });
    }

    try {
      const feed = await parser.parseURL(firstSource.feed_url);
      log.push(`RSS fetched OK: ${feed.items?.length || 0} items`);

      if (feed.items && feed.items.length > 0) {
        const firstItem = feed.items[0];
        log.push(`First article: ${firstItem.title}`);
        log.push(`Link: ${firstItem.link}`);

        // 3. Try inserting one test article
        const testArticle = {
          source_id: firstSource.id,
          title: firstItem.title,
          url: firstItem.link,
          description: firstItem.contentSnippet || firstItem.content || null,
          content_hash: `test_${Date.now()}`,
          published_at: firstItem.isoDate || null,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('articles')
          .insert([testArticle])
          .select('id');

        if (insertErr) {
          log.push(`ERROR inserting article: ${JSON.stringify(insertErr)}`);
        } else {
          log.push(`SUCCESS! Inserted article with id: ${inserted?.[0]?.id}`);
        }
      }
    } catch (rssErr: any) {
      log.push(`ERROR fetching RSS: ${rssErr.message}`);
    }

    return NextResponse.json({ log });

  } catch (error: any) {
    log.push(`FATAL ERROR: ${error.message}`);
    return NextResponse.json({ log });
  }
}
