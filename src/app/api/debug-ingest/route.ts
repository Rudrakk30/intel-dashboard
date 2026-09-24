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
    // Step 1: Get unique active sources
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

    log.push(`Processing ${uniqueSources.length} unique sources`);

    // Step 2: Fetch and insert articles
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
        log.push(`RSS error for ${source.name}: ${e.message}`);
      }
    }

    // Step 3: Get all pending articles
    const { data: pendingArticles } = await supabase
      .from('articles')
      .select('*')
      .eq('processed_status', 'pending')
      .order('published_at', { ascending: false })
      .limit(50);

    log.push(`Pending articles: ${pendingArticles?.length || 0}`);

    if (!pendingArticles || pendingArticles.length === 0) {
      return NextResponse.json({ log });
    }

    // Step 4: Try AI first
    log.push('--- Attempting AI clustering ---');
    let aiWorked = false;
    try {
      const { events } = await extractAndClusterEvents(pendingArticles as any);
      log.push(`AI returned ${events.length} events`);
      
      if (events.length > 0) {
        aiWorked = true;
        const eventsWithUrl = events.map((e, i) => ({
          ...e,
          primary_url: pendingArticles[i]?.url || pendingArticles[0]?.url || null,
        }));
        const { error: evtErr } = await supabase.from('events').insert(eventsWithUrl);
        if (evtErr) {
          log.push(`Event insert error: ${JSON.stringify(evtErr)}`);
          aiWorked = false;
        } else {
          log.push(`Inserted ${events.length} AI events`);
        }
      }
    } catch (aiErr: any) {
      log.push(`AI FAILED: ${aiErr.message}`);
    }

    // Step 5: If AI failed, create events directly from articles
    if (!aiWorked) {
      log.push('--- AI failed, creating events directly from articles ---');
      
      const categoryMap: Record<string, string> = {
        'techcrunch.com': 'Technology',
        'cnbc.com': 'Finance',
        'wired.com': 'AI',
      };

      const directEvents = pendingArticles.map(article => {
        const domain = Object.keys(categoryMap).find(d => article.url?.includes(d)) || '';
        return {
          headline: article.title,
          summary: article.description || article.title,
          category: categoryMap[domain] || 'Technology',
          event_time: article.published_at || new Date().toISOString(),
          first_seen: new Date().toISOString(),
          last_updated: new Date().toISOString(),
          importance_score: 75,
          is_published: true,
          primary_url: article.url,
        };
      });

      const { data: insertedEvents, error: directErr } = await supabase
        .from('events')
        .insert(directEvents)
        .select('id');

      if (directErr) {
        log.push(`Direct insert error: ${JSON.stringify(directErr)}`);
      } else {
        log.push(`SUCCESS! Created ${insertedEvents?.length} events directly from articles`);
      }
    }

    // Mark all as processed
    const articleIds = pendingArticles.map(a => a.id);
    await supabase.from('articles').update({ processed_status: 'clustered' }).in('id', articleIds);

    // Final count
    const { count: finalEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    log.push(`\nFinal event count in DB: ${finalEvents}`);

    return NextResponse.json({ log });

  } catch (error: any) {
    log.push(`FATAL: ${error.message}\n${error.stack}`);
    return NextResponse.json({ log });
  }
}
