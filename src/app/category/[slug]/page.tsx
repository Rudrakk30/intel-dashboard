import { EventCard } from '@/components/events/EventCard';
import type { Event } from '@/types';

// Using the same mock data structure to demonstrate the category layout
const mockCategoryEvents: Record<string, Event[]> = {
  ai: [
    {
      id: '1',
      headline: 'Anthropic Releases Claude 3.5 Sonnet',
      summary: 'Anthropic has announced the release of Claude 3.5 Sonnet, matching or exceeding competitor models on a wide range of benchmarks while operating at twice the speed of Claude 3 Opus.',
      why_it_matters: 'This shift puts pressure on OpenAI and Google to release their next-generation models, fundamentally altering the price-to-performance ratio in the enterprise AI market.',
      category: 'AI',
      subcategory: 'Foundation Models',
      event_time: new Date().toISOString(),
      first_seen: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      importance_score: 95,
      entities: { list: ['Anthropic', 'OpenAI', 'Google'] },
      is_published: true,
      image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?q=80&w=800&auto=format&fit=crop',
      primary_url: 'https://www.anthropic.com/news/claude-3-5-sonnet'
    }
  ],
  fintech: [
    {
      id: '2',
      headline: 'Stripe Acquires Bridge for $1.1 Billion',
      summary: 'Stripe has completed its acquisition of Bridge, a stablecoin platform, in a deal valued at $1.1 billion. This marks Stripe\'s largest acquisition to date.',
      why_it_matters: 'This strongly signals Stripe\'s commitment to embedding stablecoins directly into the global financial infrastructure, potentially bypassing traditional card networks for cross-border B2B payments.',
      category: 'Fintech',
      subcategory: 'M&A',
      event_time: new Date(Date.now() - 86400000).toISOString(),
      first_seen: new Date().toISOString(),
      last_updated: new Date().toISOString(),
      importance_score: 85,
      entities: { list: ['Stripe', 'Bridge'] },
      is_published: true,
      image_url: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop',
      primary_url: 'https://stripe.com/newsroom'
    }
  ]
};

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;
  
  // Title case the slug
  const title = slug.charAt(0).toUpperCase() + slug.slice(1);
  const events = mockCategoryEvents[slug.toLowerCase()] || [];

  return (
    <div className="space-y-8">
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6 mt-4">
        <div>
          <h1 className="text-4xl font-serif font-black text-gray-900 mb-2 tracking-tight">{title}</h1>
          <p className="text-sm text-gray-500 font-medium">
            Showing all recent developments in {title}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
