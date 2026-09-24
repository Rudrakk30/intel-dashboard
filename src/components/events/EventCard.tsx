"use client";

import type { Event } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { useSavedStore } from '@/lib/store';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useState, useEffect } from 'react';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const [mounted, setMounted] = useState(false);
  const { isSaved, saveEvent, removeEvent } = useSavedStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  let entitiesList: string[] = [];
  if (event.entities && typeof event.entities === 'object' && Array.isArray((event.entities as any).list)) {
    entitiesList = (event.entities as any).list;
  }

  const saved = mounted ? isSaved(event.id) : false;

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (saved) {
      removeEvent(event.id);
    } else {
      saveEvent(event);
    }
  };

  const handleCardClick = () => {
    if (event.primary_url) {
      window.open(event.primary_url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full rounded-md overflow-hidden relative"
    >
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
            <span className="text-black dark:text-white">{event.category}</span>
            {event.subcategory && (
              <>
                <span>·</span>
                <span>{event.subcategory}</span>
              </>
            )}
            <span>·</span>
            <span>
              {formatDistanceToNow(new Date(event.event_time), { addSuffix: true })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {event.importance_score >= 80 && (
              <span className="bg-[#065F46]/10 text-[#065F46] dark:text-[#10B981] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide border border-[#065F46]/20">
                High Impact
              </span>
            )}
            <button 
              onClick={handleSave}
              className="text-gray-400 hover:text-[#065F46] dark:hover:text-[#10B981] transition-colors z-10 p-1"
              title={saved ? "Remove from saved" : "Save article"}
            >
              {saved ? <BookmarkCheck className="w-5 h-5 text-[#065F46] dark:text-[#10B981]" /> : <Bookmark className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <h2 className="font-serif text-xl font-bold text-gray-900 dark:text-white mb-3 leading-snug group-hover:text-[#065F46] dark:group-hover:text-[#10B981] transition-colors">
          {event.headline}
        </h2>

        <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4 text-sm flex-1">
          {event.summary}
        </p>

        {event.why_it_matters && (
          <div className="mb-4 bg-gray-50 dark:bg-gray-950 p-4 border-l-2 border-[#065F46]/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] dark:text-[#10B981] mb-1">Why it matters</h3>
            <p className="text-sm text-gray-800 dark:text-gray-200">{event.why_it_matters}</p>
          </div>
        )}

        {entitiesList.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entities:</span>
            {entitiesList.map((entity, i) => (
              <span key={i} className="text-xs text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-sm">
                {entity}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 border-t border-gray-100 dark:border-gray-800 pt-3 mt-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sources:</span>
          <span className="text-xs text-gray-500 dark:text-gray-400">Verified Intelligence</span>
        </div>
      </div>
    </div>
  );
}
