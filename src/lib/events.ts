import { supabase } from './db';
import { extractAndClusterEvents } from './ai';
import type { Article } from '../types';

/**
 * Main engine to process pending articles, cluster them into events,
 * and save the relationships in the database.
 */
export async function processPendingArticles() {
  console.log('Starting Event Engine pipeline...');

  // 1. Fetch pending articles
  const { data: articles, error: fetchError } = await supabase
    .from('articles')
    .select('*')
    .eq('processed_status', 'pending')
    .order('published_at', { ascending: false })
    .limit(100);

  if (fetchError) {
    console.error('Error fetching pending articles:', fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!articles || articles.length === 0) {
    console.log('No pending articles to process.');
    return { success: true, processedCount: 0, eventsCreated: 0 };
  }

  console.log(`Found ${articles.length} pending articles`);

  // 2. Try AI clustering first
  let eventsCreated = 0;
  let aiWorked = false;

  try {
    const { events: newEventsData, articleToEventMap } = await extractAndClusterEvents(articles as Article[]);
    
    if (newEventsData.length > 0) {
      // Add primary_url from first matching article
      const eventsWithUrl = newEventsData.map((e, i) => ({
        ...e,
        primary_url: articles[Math.min(i, articles.length - 1)]?.url || null,
      }));

      // Deduplicate AI events against existing events in the database
      const { data: existingEvents } = await supabase
        .from('events')
        .select('headline')
        .limit(200);

      const existingHeadlines = new Set(
        (existingEvents || []).map(e => e.headline?.trim().toLowerCase())
      );

      const uniqueEventsWithUrl = eventsWithUrl.filter(
        e => !existingHeadlines.has(e.headline?.trim().toLowerCase())
      );

      if (uniqueEventsWithUrl.length > 0) {
        const { data: insertedEvents, error: insertEventError } = await supabase
          .from('events')
          .insert(uniqueEventsWithUrl)
          .select('id');

        if (insertEventError) {
          console.error('Error inserting AI events:', insertEventError);
        } else if (insertedEvents) {
          eventsCreated = insertedEvents.length;
          aiWorked = true;
          console.log(`AI created ${eventsCreated} events`);
        }
      } else {
        console.log('All AI events already exist in database.');
        aiWorked = true;
      }
    }
  } catch (aiError) {
    console.error('AI clustering failed:', aiError);
  }

  // 3. Fallback: create events directly from articles if AI failed
  if (!aiWorked) {
    console.log('AI failed or returned 0 events. Creating events directly from articles...');
    
    const categoryMap: Record<string, string> = {
      'techcrunch.com': 'Technology',
      'cnbc.com': 'Finance',
      'wired.com': 'AI',
      'reuters.com': 'Finance',
      'bloomberg.com': 'Finance',
      'theverge.com': 'Technology',
    };

    const directEvents = articles.map(article => {
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

    // Deduplicate against existing events in the database
    const { data: existingEvents } = await supabase
      .from('events')
      .select('headline')
      .limit(200);

    const existingHeadlines = new Set(
      (existingEvents || []).map(e => e.headline?.trim().toLowerCase())
    );

    const newDirectEvents = directEvents.filter(
      e => !existingHeadlines.has(e.headline?.trim().toLowerCase())
    );

    if (newDirectEvents.length > 0) {
      const { data: inserted, error: directErr } = await supabase
        .from('events')
        .insert(newDirectEvents)
        .select('id');

      if (directErr) {
        console.error('Error creating direct events:', directErr);
      } else {
        eventsCreated = inserted?.length || 0;
        console.log(`Created ${eventsCreated} new direct events`);
      }
    } else {
      console.log('All articles already exist as events. No duplicates inserted.');
    }
  }

  // 4. Mark all articles as processed
  const articleIds = articles.map(a => a.id);
  await supabase
    .from('articles')
    .update({ processed_status: 'clustered' })
    .in('id', articleIds);

  console.log(`Pipeline complete. Processed ${articles.length} articles into ${eventsCreated} events.`);
  return { success: true, processedCount: articles.length, eventsCreated };
}
