import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';
import { runIngestion } from '@/lib/ingestion';
import { processPendingArticles } from '@/lib/events';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET() {
  const log: string[] = [];

  try {
    // Step 1: Check sources
    const { data: sources, error: srcErr } = await supabase
      .from('sources')
      .select('*')
      .eq('is_active', true);

    if (srcErr) {
      log.push(`ERROR fetching sources: ${JSON.stringify(srcErr)}`);
      return NextResponse.json({ log });
    }

    log.push(`Found ${sources?.length || 0} active sources`);
    
    // Log source details
    for (const s of (sources || [])) {
      log.push(`  Source: ${s.name} | type: ${s.source_type} | feed: ${s.feed_url}`);
    }

    // Step 2: Run full ingestion
    log.push('--- Running full ingestion pipeline ---');
    const ingestResult = await runIngestion();
    log.push(`Ingestion result: ${JSON.stringify(ingestResult)}`);

    // Step 3: Check articles count after ingestion
    const { count: articleCount } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    log.push(`Total articles in DB after ingestion: ${articleCount}`);

    // Step 4: Run AI processing
    log.push('--- Running AI event processing ---');
    const processResult = await processPendingArticles();
    log.push(`Processing result: ${JSON.stringify(processResult)}`);

    // Step 5: Check events count
    const { count: eventCount } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    log.push(`Total events in DB after processing: ${eventCount}`);

    return NextResponse.json({ log });

  } catch (error: any) {
    log.push(`FATAL ERROR: ${error.message}`);
    log.push(`Stack: ${error.stack}`);
    return NextResponse.json({ log });
  }
}
