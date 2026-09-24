import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_time', { ascending: false })
    .limit(5);

  return NextResponse.json({
    error: error ? error.message : null,
    count: data?.length || 0,
    firstEvent: data?.[0] || null,
    allFields: data?.[0] ? Object.keys(data[0]) : [],
  });
}
