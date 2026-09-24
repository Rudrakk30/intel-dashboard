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
    // Step 1: Get first active source
    const { data: sources } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true)
      .limit(3);

    if (!sources || sources.length === 0) {
      log.push('No active sources found');
      return NextResponse.json({ log });
    }

    // Deduplicate sources by feed_url
    const seen = new Set<string>();
    const uniqueSources = sources.filter(s => {
      if (!s.feed_url || seen.has(s.feed_url)) return false;
      seen.add(s.feed_url);
      return true;
    });

    log.push(`Processing ${uniqueSources.length} unique sources`);

    let totalInserted = 0;

    for (const source of uniqueSources) {
      log.push(`\nFetching: ${source.name} (${source.feed_url})`);

      try {
        const feed = await parser.parseURL(source.feed_url);
        log.push(`  Got ${feed.items?.length || 0} RSS items`);

        if (!feed.items || feed.items.length === 0) continue;

        // Insert articles one by one to catch exact errors
        for (const item of feed.items.slice(0, 10)) {
          if (!item.link || !item.title) continue;

          const hash = crypto.createHash('sha256')
            .update(`${item.link.trim()}::${item.title.trim()}`)
            .digest('hex');

          const article = {
            source_id: source.id,
            title: item.title,
            url: item.link,
            description: item.contentSnippet || item.content || null,
            content_hash: hash,
            published_at: item.isoDate || null,
            processed_status: 'pending',
          };

          const { data: inserted, error: insertErr } = await supabase
            .from('articles')
            .upsert([article], { onConflict: 'content_hash', ignoreDuplicates: true })
            .select('id');

          if (insertErr) {
            log.push(`  ERROR inserting "${item.title?.slice(0, 40)}": ${JSON.stringify(insertErr)}`);
            break; // Stop on first error to see it
          } else if (inserted && inserted.length > 0) {
            totalInserted++;
          }
        }
      } catch (rssErr: any) {
        log.push(`  RSS ERROR: ${rssErr.message}`);
      }
    }

    log.push(`\nTotal articles inserted: ${totalInserted}`);

    // Check total articles
    const { count } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    log.push(`Total articles in DB: ${count}`);

    // Check pending articles
    const { count: pendingCount, error: pendErr } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('processed_status', 'pending');
    log.push(`Pending articles: ${pendErr ? JSON.stringify(pendErr) : pendingCount}`);

    // If we have pending articles, run AI
    if (pendingCount && pendingCount > 0) {
      log.push('\n--- Running AI clustering ---');
      
      const { data: pendingArticles } = await supabase
        .from('articles')
        .select('*')
        .eq('processed_status', 'pending')
        .limit(30);

      if (pendingArticles && pendingArticles.length > 0) {
        try {
          const { events } = await extractAndClusterEvents(pendingArticles as any);
          log.push(`AI generated ${events.length} events`);

          if (events.length > 0) {
            // Add primary_url from first article for each event
            const eventsWithUrl = events.map(e => ({
              ...e,
              primary_url: pendingArticles[0]?.url || null,
            }));

            const { data: insertedEvents, error: evtErr } = await supabase
              .from('events')
              .insert(eventsWithUrl)
              .select('id');

            if (evtErr) {
              log.push(`ERROR inserting events: ${JSON.stringify(evtErr)}`);
            } else {
              log.push(`SUCCESS! Inserted ${insertedEvents?.length} events`);

              // Mark articles as processed
              const articleIds = pendingArticles.map(a => a.id);
              await supabase
                .from('articles')
                .update({ processed_status: 'clustered' })
                .in('id', articleIds);
            }
          }
        } catch (aiErr: any) {
          log.push(`AI ERROR: ${aiErr.message}`);
        }
      }
    }

    // Final counts
    const { count: finalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    log.push(`\nFinal event count: ${finalEvents}`);

    return NextResponse.json({ log });

  } catch (error: any) {
    log.push(`FATAL: ${error.message}`);
    return NextResponse.json({ log });
  }
}
