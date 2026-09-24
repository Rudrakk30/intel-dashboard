import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { runIngestion } from '@/lib/ingestion';

// Force dynamic execution for API routes
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // 1. Verify Authentication
    // The CRON_SECRET_TOKEN protects this route from being called publicly.
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_TOKEN;

    if (!cronSecret) {
      console.warn('CRON_SECRET_TOKEN is not configured.');
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const authBuffer = Buffer.from(authHeader || '');
    const expectedBuffer = Buffer.from(expectedHeader);

    if (authBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(authBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Run Pipeline
    const result = await runIngestion();

    if (!result.success) {
      return NextResponse.json({ error: 'Ingestion failed' }, { status: 500 });
    }

    // 3. Return Success
    return NextResponse.json({ 
      success: true, 
      message: `Ingestion completed. ${result.articlesIngested} articles ingested.`
    });

  } catch (error) {
    console.error('Unhandled error in ingest route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
