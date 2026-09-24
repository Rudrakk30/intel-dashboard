import { EventCard } from '@/components/events/EventCard';
import { supabase } from '@/lib/db';
import type { Event } from '@/types';

export const dynamic = 'force-dynamic';

// Server Component fetching live data for categories
export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  
  // Fetch live events for this specific category from Supabase
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .ilike('category', slug)
    .eq('is_published', true)
    .order('event_time', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Error fetching category events:', error);
  }

  const events = (data as Event[]) || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mt-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 font-medium">
            Live developments in {title}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {events.length > 0 ? (
          events.map(event => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            Waiting for automated intelligence gathering. No events found for {title} yet.
          </div>
        )}
      </section>
    </div>
  );
}
