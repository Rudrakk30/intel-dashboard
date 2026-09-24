"use client";

import { useState, useMemo } from 'react';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types';
import { subDays, isAfter } from 'date-fns';

// Extensive mock data spanning multiple days/weeks
const mockEvents: Event[] = [
  // LATEST (Today/Yesterday)
  {
    id: '1',
    headline: 'Anthropic Releases Claude 3.5 Sonnet',
    summary: 'Anthropic has announced the release of Claude 3.5 Sonnet, matching or exceeding competitor models on a wide range of benchmarks while operating at twice the speed.',
    why_it_matters: 'This puts massive pressure on OpenAI and Google to release their next-generation models, fundamentally altering the price-to-performance ratio.',
    category: 'AI',
    subcategory: 'Foundation Models',
    event_time: new Date().toISOString(),
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    importance_score: 95,
    entities: { list: ['Anthropic', 'OpenAI', 'Google'] },
    is_published: true,
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
    primary_url: 'https://www.anthropic.com/news'
  },
  {
    id: '101',
    headline: 'OpenAI Unveils Sora Updates',
    summary: 'OpenAI has quietly rolled out structural updates to its Sora video generation model, expanding access to select creators and studios.',
    why_it_matters: 'Signals the impending commercialization of high-fidelity AI video generation.',
    category: 'AI',
    subcategory: 'Generative Video',
    event_time: new Date().toISOString(),
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    importance_score: 88,
    entities: { list: ['OpenAI'] },
    is_published: true,
    image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '102',
    headline: 'EU Finalizes AI Act Implementation Framework',
    summary: 'European regulators have released the final technical framework for enforcing the AI act, specifying exact compliance metrics for high-risk models.',
    why_it_matters: 'Companies now have a hard 6-month deadline to comply or face severe revenue penalties in the EU.',
    category: 'Technology',
    subcategory: 'Regulation',
    event_time: subDays(new Date(), 1).toISOString(),
    first_seen: subDays(new Date(), 1).toISOString(),
    last_updated: subDays(new Date(), 1).toISOString(),
    importance_score: 92,
    entities: { list: ['European Union'] },
    is_published: true,
  },
  {
    id: '103',
    headline: 'Y Combinator Winter Batch Shows 70% AI Focus',
    summary: 'Analysis of the latest YC batch reveals that over 70% of participating startups are building core infrastructure or applications around LLMs.',
    why_it_matters: 'Indicates that venture capital at the earliest stages is still completely dominated by the AI thesis.',
    category: 'Startups',
    subcategory: 'Venture Capital',
    event_time: subDays(new Date(), 1).toISOString(),
    first_seen: subDays(new Date(), 1).toISOString(),
    last_updated: subDays(new Date(), 1).toISOString(),
    importance_score: 80,
    entities: { list: ['Y Combinator'] },
    is_published: true,
  },
  {
    id: '104',
    headline: 'Revolut Valuation Hits $45 Billion in Secondary Share Sale',
    summary: 'Fintech giant Revolut has allowed employees to sell shares in a secondary round that values the company at $45 billion.',
    why_it_matters: 'Cements Revolut as Europe\'s most valuable private tech company and signals strong private market appetite for profitable fintechs.',
    category: 'Fintech',
    subcategory: 'Valuation',
    event_time: new Date().toISOString(),
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    importance_score: 91,
    entities: { list: ['Revolut'] },
    is_published: true,
  },
  {
    id: '105',
    headline: 'Nvidia Blackwell Production Reaches Full Capacity',
    summary: 'Nvidia has reportedly overcome its packaging bottlenecks, with the new Blackwell architecture chips now in full mass production.',
    why_it_matters: 'Relieves a major supply chain chokepoint for hyperscalers racing to build next-generation AI data centers.',
    category: 'Technology',
    subcategory: 'Semiconductors',
    event_time: new Date().toISOString(),
    first_seen: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    importance_score: 97,
    entities: { list: ['Nvidia', 'TSMC'] },
    is_published: true,
  },
  {
    id: '106',
    headline: 'Apple Intelligence Rolling out to EU Devices',
    summary: 'After months of regulatory delays, Apple is beginning a phased rollout of its AI features to devices in the European Union.',
    why_it_matters: 'Resolves one of the largest regulatory standoffs of the year, opening a massive market for Apple\'s on-device AI ecosystem.',
    category: 'Technology',
    subcategory: 'Consumer Tech',
    event_time: subDays(new Date(), 1).toISOString(),
    first_seen: subDays(new Date(), 1).toISOString(),
    last_updated: subDays(new Date(), 1).toISOString(),
    importance_score: 89,
    entities: { list: ['Apple'] },
    is_published: true,
  },
  
  // LAST WEEK (3-7 days ago)
  {
    id: '2',
    headline: 'Stripe Acquires Bridge for $1.1 Billion',
    summary: 'Stripe has completed its acquisition of Bridge, a stablecoin platform, in a deal valued at $1.1 billion. This marks Stripe\'s largest acquisition to date.',
    why_it_matters: 'This strongly signals Stripe\'s commitment to embedding stablecoins directly into the global financial infrastructure.',
    category: 'Fintech',
    subcategory: 'M&A',
    event_time: subDays(new Date(), 4).toISOString(),
    first_seen: subDays(new Date(), 4).toISOString(),
    last_updated: subDays(new Date(), 4).toISOString(),
    importance_score: 85,
    entities: { list: ['Stripe', 'Bridge'] },
    is_published: true,
    image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '201',
    headline: 'Klarna Files Confidentially for US IPO',
    summary: 'The Swedish buy-now-pay-later giant has confidentially submitted a draft registration statement to the SEC for an IPO in the United States.',
    why_it_matters: 'Could be one of the largest fintech IPOs of the year, testing public market appetite for BNPL business models post-ZIRP.',
    category: 'Finance',
    subcategory: 'IPO',
    event_time: subDays(new Date(), 5).toISOString(),
    first_seen: subDays(new Date(), 5).toISOString(),
    last_updated: subDays(new Date(), 5).toISOString(),
    importance_score: 93,
    entities: { list: ['Klarna', 'SEC'] },
    is_published: true,
  },
  {
    id: '202',
    headline: 'Google Merges Android and Hardware Teams',
    summary: 'Sundar Pichai announced a massive reorganization, merging the Android software engineering teams with the Pixel hardware division.',
    why_it_matters: 'A strategic shift to deeply integrate AI across software and hardware, mirroring Apple\'s closed-ecosystem advantage.',
    category: 'Technology',
    subcategory: 'Corporate Strategy',
    event_time: subDays(new Date(), 6).toISOString(),
    first_seen: subDays(new Date(), 6).toISOString(),
    last_updated: subDays(new Date(), 6).toISOString(),
    importance_score: 87,
    entities: { list: ['Google'] },
    is_published: true,
  },

  // LAST MONTH (10-30 days ago)
  {
    id: '3',
    headline: 'Federal Reserve Cuts Interest Rates by 50 bps',
    summary: 'The Federal Reserve has aggressively cut its benchmark interest rate by half a percentage point, citing a cooling labor market and inflation trending toward the 2% target.',
    why_it_matters: 'This marks the end of the historic tightening cycle, fundamentally lowering the cost of capital for startups and shifting asset allocations.',
    category: 'Finance',
    subcategory: 'Central Banks',
    event_time: subDays(new Date(), 15).toISOString(),
    first_seen: subDays(new Date(), 15).toISOString(),
    last_updated: subDays(new Date(), 15).toISOString(),
    importance_score: 100,
    entities: { list: ['Federal Reserve'] },
    is_published: true,
    image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?q=80&w=800&auto=format&fit=crop',
  },
  {
    id: '301',
    headline: 'xAI Raises $6 Billion Series B',
    summary: 'Elon Musk\'s xAI has raised $6 billion in a Series B funding round, valuing the company at $24 billion pre-money.',
    why_it_matters: 'Provides massive capital required to purchase compute and compete directly with OpenAI and Anthropic at the frontier model level.',
    category: 'Startups',
    subcategory: 'Funding',
    event_time: subDays(new Date(), 20).toISOString(),
    first_seen: subDays(new Date(), 20).toISOString(),
    last_updated: subDays(new Date(), 20).toISOString(),
    importance_score: 96,
    entities: { list: ['xAI', 'Elon Musk'] },
    is_published: true,
  },
  {
    id: '302',
    headline: 'Microsoft and BlackRock Launch $30B AI Infrastructure Fund',
    summary: 'A coalition led by Microsoft and BlackRock has launched a $30 billion fund to invest in data centers and energy infrastructure for AI.',
    why_it_matters: 'Highlights the staggering physical infrastructure and energy requirements bottlenecking global AI development.',
    category: 'Technology',
    subcategory: 'Infrastructure',
    event_time: subDays(new Date(), 25).toISOString(),
    first_seen: subDays(new Date(), 25).toISOString(),
    last_updated: subDays(new Date(), 25).toISOString(),
    importance_score: 94,
    entities: { list: ['Microsoft', 'BlackRock'] },
    is_published: true,
  },
  {
    id: '303',
    headline: 'US Bans Kaspersky Lab Software',
    summary: 'The Biden administration has announced a complete ban on the sale and use of Kaspersky Lab antivirus software in the United States, citing national security risks.',
    why_it_matters: 'An unprecedented move that will force thousands of enterprise and government entities to rapidly rip-and-replace their security stacks.',
    category: 'Technology',
    subcategory: 'Cybersecurity',
    event_time: subDays(new Date(), 28).toISOString(),
    first_seen: subDays(new Date(), 28).toISOString(),
    last_updated: subDays(new Date(), 28).toISOString(),
    importance_score: 90,
    entities: { list: ['Kaspersky Lab', 'US Government'] },
    is_published: true,
  },
  {
    id: '304',
    headline: 'Physical Intelligence Raises $400M at $2B Valuation',
    summary: 'Robotics foundation model startup Physical Intelligence has raised a massive $400 million seed round led by Jeff Bezos and OpenAI.',
    why_it_matters: 'Shows that capital is rapidly moving from purely digital LLMs into embodied AI and foundational models for robotics.',
    category: 'Startups',
    subcategory: 'Funding',
    event_time: subDays(new Date(), 26).toISOString(),
    first_seen: subDays(new Date(), 26).toISOString(),
    last_updated: subDays(new Date(), 26).toISOString(),
    importance_score: 83,
    entities: { list: ['Physical Intelligence', 'OpenAI', 'Jeff Bezos'] },
    is_published: true,
  },
  {
    id: '305',
    headline: 'UK CMA Clears Microsoft-Inflection Deal',
    summary: 'The UK Competition and Markets Authority has officially cleared Microsoft\'s hiring of Inflection AI founders and its licensing deal.',
    why_it_matters: 'Sets a regulatory precedent allowing big tech to "acquihire" AI startups without triggering formal merger blocks.',
    category: 'Technology',
    subcategory: 'Regulation',
    event_time: subDays(new Date(), 29).toISOString(),
    first_seen: subDays(new Date(), 29).toISOString(),
    last_updated: subDays(new Date(), 29).toISOString(),
    importance_score: 86,
    entities: { list: ['Microsoft', 'Inflection AI', 'CMA'] },
    is_published: true,
  }
];

type FilterRange = 'latest' | '7d' | '30d' | '3m' | '1y';

export default function HomePage() {
  const [filter, setFilter] = useState<FilterRange>('latest');

  // Filter and sort logic based on requirements
  const displayedEvents = useMemo(() => {
    const now = new Date();

    if (filter === 'latest') {
      // Latest: Events from the last 48 hours, limited to top 7
      return mockEvents
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 2)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 7);
    }
    
    if (filter === '7d') {
      // Last Week: Events from the last 7 days, top 7 most important
      return mockEvents
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 7)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 7);
    }
    
    if (filter === '30d') {
      // Last Month: Events from the last 30 days, top 10 most important
      return mockEvents
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 30)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10);
    }

    // Default fallback for 3m, 1y (just show all available in mock sorted by importance)
    return mockEvents
      .sort((a, b) => b.importance_score - a.importance_score)
      .slice(0, 15);
      
  }, [filter]);

  return (
    <div className="space-y-8">
      {/* Header / Status section */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6 mt-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 mb-2 tracking-tight">What's New</h1>
          <p className="text-sm text-gray-500 font-medium">
            Since your last visit — <span className="font-semibold text-gray-900">{displayedEvents.length} new developments</span>
          </p>
        </div>
        <div className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#065F46] animate-pulse"></span>
          Updated just now
        </div>
      </section>

      {/* Filters */}
      <section className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
        <button 
          onClick={() => setFilter('latest')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === 'latest' 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-200 text-gray-600 hover:text-[#065F46] hover:border-[#065F46]'
          }`}
        >
          Latest
        </button>
        <button 
          onClick={() => setFilter('7d')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '7d' 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-200 text-gray-600 hover:text-[#065F46] hover:border-[#065F46]'
          }`}
        >
          Last 7 Days
        </button>
        <button 
          onClick={() => setFilter('30d')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '30d' 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-200 text-gray-600 hover:text-[#065F46] hover:border-[#065F46]'
          }`}
        >
          Last 30 Days
        </button>
        <button 
          onClick={() => setFilter('3m')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '3m' 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-200 text-gray-600 hover:text-[#065F46] hover:border-[#065F46]'
          }`}
        >
          3 Months
        </button>
        <button 
          onClick={() => setFilter('1y')}
          className={`px-5 py-2 text-xs uppercase tracking-wider font-bold rounded-sm whitespace-nowrap transition-colors ${
            filter === '1y' 
              ? 'bg-black text-white' 
              : 'bg-white border border-gray-200 text-gray-600 hover:text-[#065F46] hover:border-[#065F46]'
          }`}
        >
          1 Year
        </button>
      </section>

      {/* Feed */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedEvents.length > 0 ? (
          displayedEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500 font-medium">
            No major developments found for this time period.
          </div>
        )}
      </section>
    </div>
  );
}
