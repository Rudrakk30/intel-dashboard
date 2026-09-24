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
    .limit(100); // Process in batches

  if (fetchError) {
    console.error('Error fetching pending articles:', fetchError);
    return { success: false, error: fetchError.message };
  }

  if (!articles || articles.length === 0) {
    console.log('No pending articles to process.');
    return { success: true, processedCount: 0 };
  }

  // 2. Pass to AI for clustering and extraction
  const { events: newEventsData, articleToEventMap } = await extractAndClusterEvents(articles as Article[]);
  
  if (newEventsData.length === 0) {
    return { success: true, processedCount: 0 };
  }

  // 3. Insert new Events into database
  const { data: insertedEvents, error: insertEventError } = await supabase
    .from('events')
    .insert(newEventsData)
    .select('id');

  if (insertEventError || !insertedEvents) {
    console.error('Error inserting events:', insertEventError);
    return { success: false, error: insertEventError?.message };
  }

  // 4. Create source relationships (event_sources) and update article status
  const eventSourcesToInsert = [];
  const articleIdsToUpdate = [];

  for (const article of articles as Article[]) {
    if (!article.id) continue;
    
    const eventIndex = articleToEventMap[article.id];
    if (eventIndex !== undefined && insertedEvents[eventIndex]) {
      eventSourcesToInsert.push({
        event_id: insertedEvents[eventIndex].id,
        article_id: article.id,
      });
      articleIdsToUpdate.push(article.id);
    }
  }

  if (eventSourcesToInsert.length > 0) {
    const { error: relationError } = await supabase
      .from('event_sources')
      .insert(eventSourcesToInsert);
      
    if (relationError) {
      console.error('Error linking events to sources:', relationError);
      // Depending on strictness, we might want to rollback here, but for now we log it.
    }
  }

  // 5. Mark articles as processed
  if (articleIdsToUpdate.length > 0) {
    const { error: updateError } = await supabase
      .from('articles')
      .update({ processed_status: 'clustered' })
      .in('id', articleIdsToUpdate);

    if (updateError) {
      console.error('Error updating article status:', updateError);
    }
  }

  console.log(`Successfully processed ${articles.length} articles into ${insertedEvents.length} events.`);
  return { success: true, processedCount: articles.length, eventsCreated: insertedEvents.length };
}
