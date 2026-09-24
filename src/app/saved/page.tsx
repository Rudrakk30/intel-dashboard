"use client";

import { useSavedStore } from '@/lib/store';
import { EventCard } from '@/components/events/EventCard';
import { useEffect, useState } from 'react';

export default function SavedPage() {
  const [mounted, setMounted] = useState(false);
  const { savedEvents } = useSavedStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 mt-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight">Saved Intelligence</h1>
          <p className="text-sm text-gray-500 font-medium">
            You have <span className="font-semibold text-gray-900 dark:text-gray-300">{savedEvents.length} items</span> in your watchlist
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {savedEvents.length > 0 ? (
          // Sort saved events by newest first just in case
          [...savedEvents]
            .sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime())
            .map(event => (
              <EventCard key={event.id} event={event} />
            ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium bg-white dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
            Your watchlist is empty. Click the bookmark icon on any news card to save it here for later reading.
          </div>
        )}
      </section>
    </div>
  );
}
