import type { Event } from '@/types';
import { formatDistanceToNow } from 'date-fns';

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  // Safe parsing of entities
  let entitiesList: string[] = [];
  if (event.entities && typeof event.entities === 'object' && Array.isArray((event.entities as any).list)) {
    entitiesList = (event.entities as any).list;
  }

  const Wrapper = event.primary_url ? 'a' : 'div';
  const wrapperProps = event.primary_url 
    ? { href: event.primary_url, target: "_blank", rel: "noopener noreferrer" } 
    : {};

  return (
    <Wrapper {...wrapperProps} className="group bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full">
      <div className="p-6 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
            <span className="text-black">{event.category}</span>
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
          {event.importance_score >= 80 && (
            <span className="bg-[#065F46]/10 text-[#065F46] text-[10px] font-bold px-2 py-1 rounded-sm uppercase tracking-wide border border-[#065F46]/20">
              High Impact
            </span>
          )}
        </div>

        <h2 className="font-serif text-xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-[#065F46] transition-colors">
          {event.headline}
        </h2>

        <p className="text-gray-700 leading-relaxed mb-4 text-sm flex-1">
          {event.summary}
        </p>

        {event.why_it_matters && (
          <div className="mb-4 bg-gray-50 p-4 border-l-2 border-[#065F46]/30">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#065F46] mb-1">Why it matters</h3>
            <p className="text-sm text-gray-800">{event.why_it_matters}</p>
          </div>
        )}

        {entitiesList.length > 0 && (
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Entities:</span>
            {entitiesList.map((entity, i) => (
              <span key={i} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-sm">
                {entity}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3 mt-auto">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Sources:</span>
          <span className="text-xs text-gray-500">Multiple sources</span>
        </div>
      </div>
    </Wrapper>
  );
}
