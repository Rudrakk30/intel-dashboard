import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types';

// Mock data to demonstrate the category layout
const mockCategoryEvents: Record<string, Event[]> = {
  ai: [
    {
      
    {
      id: '101', headline: 'Hugging Face Hits 1 Million Models', summary: 'The open-source AI platform has crossed a massive milestone in user-uploaded models.', category: 'AI', event_time: new Date(Date.now() - 50000000).toISOString(), importance_score: 60, is_published: true, primary_url: 'https://techcrunch.com/huggingface'
    },
    {
      id: '102', headline: 'Google DeepMind Open Sources Gemma 2', summary: 'Google has released the weights for its newest open-weight LLM.', category: 'AI', event_time: new Date(Date.now() - 100000000).toISOString(), importance_score: 78, is_published: true, primary_url: 'https://theverge.com/gemma'
    },
    {
      id: '1', headline: 'Anthropic Releases Claude 3.5 Sonnet', summary: 'Anthropic has announced the release of Claude 3.5 Sonnet.', category: 'AI', event_time: new Date().toISOString(), importance_score: 95, is_published: true, primary_url: 'https://techcrunch.com/2024/06/20/anthropic-releases-claude-3-5-sonnet/'
    }
  ],
  fintech: [
    {
      
    {
      id: '201', headline: 'Robinhood Unveils Gold Credit Card', summary: 'Robinhood is expanding into traditional finance with a 3% cash back credit card.', category: 'Fintech', event_time: new Date(Date.now() - 43200000).toISOString(), importance_score: 65, is_published: true, primary_url: 'https://techcrunch.com/robinhood'
    },
    {
      id: '202', headline: 'Monzo Reports First Annual Profit', summary: 'The UK challenger bank has officially turned profitable after years of growth.', category: 'Fintech', event_time: new Date(Date.now() - 172800000).toISOString(), importance_score: 72, is_published: true, primary_url: 'https://cnbc.com/monzo'
    },
    {
      id: '203', headline: 'Coinbase Launches Smart Wallets', summary: 'Coinbase has released a new wallet designed to abstract away seed phrases.', category: 'Fintech', event_time: new Date(Date.now() - 259200000).toISOString(), importance_score: 68, is_published: true, primary_url: 'https://bloomberg.com/coinbase'
    },
    {
      id: '204', headline: 'Plaid Introduces Identity Verification Network', summary: 'Plaid is moving deeper into identity verification with its new shared network.', category: 'Fintech', event_time: new Date(Date.now() - 345600000).toISOString(), importance_score: 55, is_published: true, primary_url: 'https://wsj.com/plaid'
    },
    {
      id: '2', headline: 'Stripe Acquires Bridge for $1.1 Billion', summary: 'Stripe has completed its acquisition of Bridge.', category: 'Fintech', event_time: new Date().toISOString(), importance_score: 85, is_published: true, primary_url: 'https://www.wsj.com/tech/stripe-acquires-bridge-1-1-billion/'
    }
  ],
  technology: [
    {
      id: '3', headline: 'Nvidia Blackwell Production Reaches Full Capacity', summary: 'Nvidia has reportedly overcome its packaging bottlenecks.', category: 'Technology', event_time: new Date().toISOString(), importance_score: 97, is_published: true, primary_url: 'https://www.cnbc.com/2024/05/22/nvidia-blackwell-production-capacity/'
    },
    {
      id: '4', headline: 'Apple Intelligence Rolling out to EU Devices', summary: 'After months of regulatory delays, Apple is beginning a phased rollout.', category: 'Technology', event_time: new Date(Date.now() - 86400000).toISOString(), importance_score: 89, is_published: true, primary_url: 'https://9to5mac.com/2024/06/21/apple-intelligence-eu-rollout/'
    }
  ],
  finance: [
    {
      id: '5', headline: 'Federal Reserve Cuts Interest Rates by 50 bps', summary: 'The Federal Reserve has aggressively cut its benchmark interest rate.', category: 'Finance', event_time: new Date().toISOString(), importance_score: 100, is_published: true, primary_url: 'https://www.wsj.com/economy/central-banking/federal-reserve-cuts-interest-rates-50-bps/'
    },
    {
      id: '6', headline: 'Klarna Files Confidentially for US IPO', summary: 'The Swedish buy-now-pay-later giant has confidentially submitted a draft.', category: 'Finance', event_time: new Date(Date.now() - 172800000).toISOString(), importance_score: 93, is_published: true, primary_url: 'https://www.ft.com/content/klarna-files-confidentially-for-us-ipo/'
    }
  ],
  startups: [
    {
      id: '7', headline: 'Y Combinator Winter Batch Shows 70% AI Focus', summary: 'Analysis of the latest YC batch reveals that over 70% of participating startups are AI focused.', category: 'Startups', event_time: new Date().toISOString(), importance_score: 80, is_published: true, primary_url: 'https://techcrunch.com/2024/03/10/yc-winter-batch-ai-focus/'
    },
    {
      id: '8', headline: 'Physical Intelligence Raises $400M at $2B Valuation', summary: 'Robotics foundation model startup Physical Intelligence has raised a massive $400 million seed round.', category: 'Startups', event_time: new Date(Date.now() - 86400000).toISOString(), importance_score: 83, is_published: true, primary_url: 'https://techcrunch.com'
    }
  ]
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  const events = mockCategoryEvents[slug.toLowerCase()] || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6 mt-8">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 dark:text-white mb-2 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 font-medium">
            Showing all recent developments in {title}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-12">
        {events.length > 0 ? (
          events.map(event => <EventCard key={event.id} event={event} />)
        ) : (
          <div className="col-span-full py-12 text-center text-gray-500">
            No recent events found for {title}.
          </div>
        )}
      </section>
    </div>
  );
}
