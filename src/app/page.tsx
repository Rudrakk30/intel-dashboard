import { supabase } from '@/lib/db';
import { HomePageClient } from '@/components/events/HomePageClient';
import type { Event } from '@/types';

// Force this page to always fetch fresh data on every request
export const dynamic = 'force-dynamic';

// This is a Server Component. It securely fetches data directly from the Supabase database
// before the page even loads for the user, ensuring blazing fast load times and great SEO.
export default async function HomePage() {
  // Fetch the latest 100 published events from the database
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('is_published', true)
    .order('event_time', { ascending: false })
    .limit(100);

  if (error) {
    console.error('Error fetching live events:', error);
  }

  const liveEvents = (data as Event[]) || [];

  // We pass the live data down to the client component which handles the tabs/filtering
  return <HomePageClient initialEvents={liveEvents} />;
}
