import { createClient } from '@supabase/supabase-js';

// These environment variables will be securely accessed on the server.
// If using client components, NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.
// For our secure backend-only architecture, we use the service role key internally.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

if (supabaseUrl === 'https://placeholder.supabase.co') {
  console.warn('Supabase credentials are not fully configured in environment variables.');
}

// Global supabase client to avoid creating multiple instances in development
export const supabase = createClient(supabaseUrl, supabaseKey);
