export type SourceType = 'rss' | 'api' | 'official_blog';
export type ProcessedStatus = 'pending' | 'clustered' | 'ignored';

export interface Source {
  id: string;
  name: string;
  url: string;
  feed_url: string | null;
  category: string;
  region: string;
  source_type: SourceType;
  reliability_score: number;
  is_active: boolean;
  last_fetched_at: string | null;
}

export interface Article {
  id?: string;
  source_id: string;
  title: string;
  url: string;
  description: string | null;
  image_url?: string;
  content_hash: string;
  published_at: string | null;
  discovered_at?: string;
  processed_status?: ProcessedStatus;
}

export interface Event {
  id: string;
  headline: string;
  summary: string;
  why_it_matters?: string | null;
  category: string;
  subcategory?: string | null;
  event_time: string;
  first_seen?: string;
  last_updated?: string;
  importance_score: number;
  entities?: Record<string, any> | null;
  is_published: boolean;
  image_url?: string;
  primary_url?: string;
}
