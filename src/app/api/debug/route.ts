import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const diagnostics: any = {
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        hasAiApiKey: !!process.env.AI_API_KEY,
        hasCronSecret: !!process.env.CRON_SECRET_TOKEN,
      },
      database: {}
    };

    // Check Sources
    const { count: sourcesCount, error: sErr } = await supabase
      .from('sources')
      .select('*', { count: 'exact', head: true });
    diagnostics.database.sources = sErr ? sErr.message : sourcesCount;

    // Check Articles
    const { count: articlesCount, error: aErr } = await supabase
      .from('articles')
      .select('*', { count: 'exact', head: true });
    diagnostics.database.articles = aErr ? aErr.message : articlesCount;

    // Check Events
    const { count: eventsCount, error: eErr } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true });
    diagnostics.database.events = eErr ? eErr.message : eventsCount;

    return NextResponse.json(diagnostics);

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
