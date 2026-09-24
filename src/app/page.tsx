"use client";

import { useState, useMemo } from 'react';
import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types';
import { subDays, isAfter } from 'date-fns';

// Extensive mock data
const mockEvents: Event[] = [
  {
    id: '1', headline: 'Anthropic Releases Claude 3.5 Sonnet', summary: 'Anthropic has announced the release of Claude 3.5 Sonnet, matching or exceeding competitor models on a wide range of benchmarks while operating at twice the speed.', why_it_matters: 'This puts massive pressure on OpenAI and Google.', category: 'AI', subcategory: 'Foundation Models', event_time: new Date().toISOString(), importance_score: 95, entities: { list: ['Anthropic', 'OpenAI', 'Google'] }, is_published: true, primary_url: 'https://techcrunch.com/2024/06/20/anthropic-releases-claude-3-5-sonnet/'
  },
  {
    id: '101', headline: 'OpenAI Unveils Sora Updates', summary: 'OpenAI has quietly rolled out structural updates to its Sora video generation model.', category: 'AI', subcategory: 'Generative Video', event_time: new Date().toISOString(), importance_score: 88, entities: { list: ['OpenAI'] }, is_published: true, primary_url: 'https://www.theverge.com/2024/02/15/openai-sora-video-generation/'
  },
  {
    id: '102', headline: 'EU Finalizes AI Act Implementation Framework', summary: 'European regulators have released the final technical framework for enforcing the AI act.', category: 'Technology', subcategory: 'Regulation', event_time: subDays(new Date(), 1).toISOString(), importance_score: 92, entities: { list: ['European Union'] }, is_published: true, primary_url: 'https://www.reuters.com/technology/eu-finalizes-ai-act-implementation-framework/'
  },
  {
    id: '103', headline: 'Y Combinator Winter Batch Shows 70% AI Focus', summary: 'Analysis of the latest YC batch reveals that over 70% of participating startups are building around LLMs.', category: 'Startups', subcategory: 'Venture Capital', event_time: subDays(new Date(), 1).toISOString(), importance_score: 80, entities: { list: ['Y Combinator'] }, is_published: true, primary_url: 'https://techcrunch.com/2024/03/10/yc-winter-batch-ai-focus/'
  },
  {
    id: '104', headline: 'Revolut Valuation Hits $45 Billion', summary: 'Fintech giant Revolut has allowed employees to sell shares in a secondary round.', category: 'Fintech', subcategory: 'Valuation', event_time: new Date().toISOString(), importance_score: 91, entities: { list: ['Revolut'] }, is_published: true, primary_url: 'https://www.bloomberg.com/news/articles/2024-04-12/revolut-valuation-hits-45-billion/'
  },
  {
    id: '105', headline: 'Nvidia Blackwell Production Reaches Full Capacity', summary: 'Nvidia has reportedly overcome its packaging bottlenecks.', category: 'Technology', subcategory: 'Semiconductors', event_time: new Date().toISOString(), importance_score: 97, entities: { list: ['Nvidia', 'TSMC'] }, is_published: true, primary_url: 'https://www.cnbc.com/2024/05/22/nvidia-blackwell-production-capacity/'
  },
  {
    id: '106', headline: 'Apple Intelligence Rolling out to EU Devices', summary: 'After months of regulatory delays, Apple is beginning a phased rollout.', category: 'Technology', subcategory: 'Consumer Tech', event_time: subDays(new Date(), 1).toISOString(), importance_score: 89, entities: { list: ['Apple'] }, is_published: true, primary_url: 'https://9to5mac.com/2024/06/21/apple-intelligence-eu-rollout/'
  },
  {
    id: '2', headline: 'Stripe Acquires Bridge for $1.1 Billion', summary: 'Stripe has completed its acquisition of Bridge, a stablecoin platform.', category: 'Fintech', subcategory: 'M&A', event_time: subDays(new Date(), 4).toISOString(), importance_score: 85, entities: { list: ['Stripe', 'Bridge'] }, is_published: true, primary_url: 'https://www.wsj.com/tech/stripe-acquires-bridge-1-1-billion/'
  },
  {
    id: '201', headline: 'Klarna Files Confidentially for US IPO', summary: 'The Swedish buy-now-pay-later giant has confidentially submitted a draft registration.', category: 'Finance', subcategory: 'IPO', event_time: subDays(new Date(), 5).toISOString(), importance_score: 93, entities: { list: ['Klarna'] }, is_published: true, primary_url: 'https://www.ft.com/content/klarna-files-confidentially-for-us-ipo/'
  },
  {
    id: '202', headline: 'Google Merges Android and Hardware Teams', summary: 'Sundar Pichai announced a massive reorganization, merging Android engineering with Pixel.', category: 'Technology', subcategory: 'Corporate Strategy', event_time: subDays(new Date(), 6).toISOString(), importance_score: 87, entities: { list: ['Google'] }, is_published: true, primary_url: 'https://www.theverge.com/2024/04/18/google-merges-android-and-hardware-teams/'
  },
  {
    id: '3', headline: 'Federal Reserve Cuts Interest Rates by 50 bps', summary: 'The Federal Reserve has aggressively cut its benchmark interest rate.', category: 'Finance', subcategory: 'Central Banks', event_time: subDays(new Date(), 15).toISOString(), importance_score: 100, entities: { list: ['Federal Reserve'] }, is_published: true, primary_url: 'https://www.wsj.com/economy/central-banking/federal-reserve-cuts-interest-rates-50-bps/'
  },
  {
    id: '301', headline: 'xAI Raises $6 Billion Series B', summary: 'Elon Musk\'s xAI has raised $6 billion.', category: 'Startups', subcategory: 'Funding', event_time: subDays(new Date(), 20).toISOString(), importance_score: 96, entities: { list: ['xAI'] }, is_published: true, primary_url: 'https://techcrunch.com/2024/05/26/elon-musks-xai-raises-6-billion-series-b/'
  },
  {
    id: '302', headline: 'Microsoft and BlackRock Launch $30B AI Fund', summary: 'A coalition led by Microsoft has launched a massive infrastructure fund.', category: 'Technology', subcategory: 'Infrastructure', event_time: subDays(new Date(), 25).toISOString(), importance_score: 94, entities: { list: ['Microsoft', 'BlackRock'] }, is_published: true, primary_url: 'https://www.bloomberg.com/news/articles/2024-06-05/microsoft-blackrock-launch-30b-ai-fund/'
  },
  {
    id: '303', headline: 'US Bans Kaspersky Lab Software', summary: 'The Biden administration has announced a complete ban.', category: 'Technology', subcategory: 'Cybersecurity', event_time: subDays(new Date(), 28).toISOString(), importance_score: 90, entities: { list: ['Kaspersky Lab'] }, is_published: true, primary_url: 'https://www.reuters.com/technology/us-bans-kaspersky-lab-software/'
  },
  {
    id: '401', headline: 'DeepMind AlphaFold 3 Released', summary: 'Google DeepMind has released AlphaFold 3, predicting structures for all of life\'s molecules.', category: 'AI', subcategory: 'Biotech', event_time: subDays(new Date(), 120).toISOString(), importance_score: 99, entities: { list: ['Google DeepMind'] }, is_published: true, primary_url: 'https://www.nature.com/articles/d41586-024-01383-z'
  }
];

type FilterRange = 'latest' | '7d' | '30d' | '6m';

export default function HomePage() {
  const [filter, setFilter] = useState<FilterRange>('latest');

  // Filter and sort logic based on requirements
  const displayedEvents = useMemo(() => {
    const now = new Date();
    let filtered = [...mockEvents];

    if (filter === 'latest') {
      filtered = filtered.filter(e => isAfter(new Date(e.event_time), subDays(now, 2)));
    } else if (filter === '7d') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 7)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10); // Top 10 in last 7 days
    } else if (filter === '30d') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 30)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 10); // Top 10 in last 30 days
    } else if (filter === '6m') {
      filtered = filtered
        .filter(e => isAfter(new Date(e.event_time), subDays(now, 180)))
        .sort((a, b) => b.importance_score - a.importance_score)
        .slice(0, 20); // Top 20 major news in 6 months
    }

    // Always sort the final output ascending new to old (descending chronological)
    return filtered.sort((a, b) => new Date(b.event_time).getTime() - new Date(a.event_time).getTime());
      
  }, [filter]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mt-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight">What's New</h1>
          <p className="text-sm text-gray-500 font-medium">
            Since your last visit — <span className="font-semibold text-gray-900 dark:text-gray-300">{displayedEvents.length} developments</span>
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
            No major developments found for this time period.
          </div>
        )}
      </section>
    </div>
  );
}
