"use client";

import { useState, useMemo } from 'react';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types';
import { subDays, isAfter } from 'date-fns';

type FilterRange = 'latest' | '7d' | '30d' | '6m';

interface Props {
  initialEvents: Event[];
}

export function HomePageClient({ initialEvents }: Props) {
  const [filter, setFilter] = useState<FilterRange>('latest');

  // Filter and sort logic based on live database data
  const displayedEvents = useMemo(() => {
    const now = new Date();
    let filtered = [...initialEvents];

    if (filter === 'latest') {
      filtered = filtered.filter(e => isAfter(new Date(e.event_time), subDays(now, 2)));
    } else if (filter === '7d') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 7)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10);
    } else if (filter === '30d') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 30)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10);
    } else if (filter === '6m') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 180)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 20);
    }

    // Always sort the final output ascending new to old (descending chronological)
    return filtered.sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());
      
  }, [filter, initialEvents]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mt-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight">What's New</h1>
          <p className="text-sm text-gray-500 font-medium">
            Live Intelligence Feed — <span className="font-semibold text-gray-900 dark:text-gray-300">{displayedEvents.length} developments</span>
          </p>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#065F46] animate-pulse"></span>
          Live Feed
        </div>
      </section>

      {/* Filters */}
      <section className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setFilter('latest')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === 'latest' 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#065F46] dark:hover:text-[#065F46]'
          }`}
        >
          Latest Top News
        </button>
        <button 
          onClick={() => setFilter('7d')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '7d' 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#065F46] dark:hover:text-[#065F46]'
          }`}
        >
          Top 10 (7 Days)
        </button>
        <button 
          onClick={() => setFilter('30d')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '30d' 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#065F46] dark:hover:text-[#065F46]'
          }`}
        >
          Top 10 (30 Days)
        </button>
        <button 
          onClick={() => setFilter('6m')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '6m' 
              ? 'bg-black dark:bg-white text-white dark:text-black' 
              : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:text-[#065F46] dark:hover:text-[#065F46]'
          }`}
        >
          Major News (6 Months)
        </button>
      </section>

      {/* Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {displayedEvents.length > 0 ? (
          displayedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            Waiting for automated intelligence gathering. No events found yet.
          </div>
        )}
      </section>
    </div>
  );
}
