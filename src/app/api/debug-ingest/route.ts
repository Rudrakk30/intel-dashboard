import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import Parser from 'rss-parser';
import crypto from 'crypto';
import { extractAndClusterEvents } from '@/lib/ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

const parser = new Parser({
  timeout: 10000,
  headers: { 'User-Agent': 'INTEL-Dashboard-Bot/1.0' },
});

export async function GET() {
  const log: string[] = [];

  try {
    // Step 0: Reset all articles to pending so AI can reprocess them
    const { error: resetErr } = await supabase
      .from('articles')
      .update({ processed_status: 'pending' })
      .neq('processed_status', 'pending');
    
    if (resetErr) {
      log.push(`Reset error: ${JSON.stringify(resetErr)}`);
    } else {
      log.push('Reset all articles to pending');
    }

    // Step 1: Get unique active sources and fetch new articles
    const { data: sources } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true);

    const seen = new Set<string>();
    const uniqueSources = (sources || []).filter(s => {
      if (!s.feed_url || seen.has(s.feed_url)) return false;
      seen.add(s.feed_url);
      return true;
    });

    for (const source of uniqueSources) {
      try {
        const feed = await parser.parseURL(source.feed_url);
        log.push(`${source.name}: ${feed.items?.length || 0} items`);

        for (const item of (feed.items || []).slice(0, 15)) {
          if (!item.link || !item.title) continue;
          const hash = crypto.createHash('sha256')
            .update(`${item.link.trim()}::${item.title.trim()}`)
            .digest('hex');

          await supabase.from('articles').upsert([{
            source_id: source.id,
            title: item.title,
            url: item.link,
            description: item.contentSnippet || item.content || null,
            content_hash: hash,
            published_at: item.isoDate || null,
            processed_status: 'pending',
          }], { onConflict: 'content_hash', ignoreDuplicates: true });
        }
      } catch (e: any) {
        log.push(`RSS error: ${e.message}`);
      }
    }

    // Step 2: Get all pending articles
    const { data: pendingArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('processed_status', 'pending')
      .order('published_at', { ascending: false })
      .limit(30);

    log.push(`Pending articles for AI: ${pendingArticles?.length || 0}`);

    if (!pendingArticles || pendingArticles.length === 0) {
      return NextResponse.json({ log });
    }

    // Step 3: Run AI clustering
    log.push('--- Running Gemini 3.6 Flash AI ---');
    try {
      const { events } = await extractAndClusterEvents(pendingArticles as any);
      log.push(`AI generated ${events.length} events`);

      if (events.length > 0) {
        // Map primary_url from the first article in each cluster
        const eventsWithUrl = events.map((e, i) => ({
          ...e,
          primary_url: pendingArticles[Math.min(i, pendingArticles.length - 1)]?.url || null,
        }));

        const { data: inserted, error: evtErr } = await supabase
          .from('events')
          .insert(eventsWithUrl)
          .select('id');

        if (evtErr) {
          log.push(`Event insert error: ${JSON.stringify(evtErr)}`);
          // Fallback: create events directly
          log.push('Falling back to direct event creation...');
          await createDirectEvents(pendingArticles, log);
        } else {
          log.push(`SUCCESS! Inserted ${inserted?.length} AI-powered events`);
        }
      } else {
        log.push('AI returned 0 events, falling back...');
        await createDirectEvents(pendingArticles, log);
      }
    } catch (aiErr: any) {
      log.push(`AI error: ${aiErr.message}`);
      log.push('Falling back to direct event creation...');
      await createDirectEvents(pendingArticles, log);
    }

    // Mark processed
    await supabase
      .from('articles')
      .update({ processed_status: 'clustered' })
      .eq('processed_status', 'pending');

    // Final count
    const { count } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    log.push(`\nTotal events in database: ${count}`);

    return NextResponse.json({ log });
  } catch (error: any) {
    log.push(`FATAL: ${error.message}`);
    return NextResponse.json({ log });
  }
}

async function createDirectEvents(articles: any[], log: string[]) {
  const categoryMap: Record<string, string> = {
    'techcrunch.com': 'Technology',
    'cnbc.com': 'Finance',
    'wired.com': 'AI',
  };

  const events = articles.map(a => {
    const domain = Object.keys(categoryMap).find(d => a.url?.includes(d)) || '';
    return {
      headline: a.title,
      summary: a.description || a.title,
      category: categoryMap[domain] || 'Technology',
      event_time: a.published_at || new Date().toISOString(),
      first_seen: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      importance_score: 75,
      is_published: true,
      primary_url: a.url,
    };
  });

  const { data, error } = await supabase.from('events').insert(events).select('id');
  if (error) {
    log.push(`Direct insert error: ${JSON.stringify(error)}`);
  } else {
    log.push(`Created ${data?.length} events directly`);
  }
}
