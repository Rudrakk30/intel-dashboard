import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { processPendingArticles } from '@/lib/events';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    // Verify CRON_SECRET_TOKEN
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET_TOKEN;

    if (!cronSecret) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    const expectedHeader = `Bearer ${cronSecret}`;
    const authBuffer = Buffer.from(authHeader || '');
    const expectedBuffer = Buffer.from(expectedHeader);

    if (authBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(authBuffer, expectedBuffer)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Run Event Engine Pipeline
    const result = await processPendingArticles();

    if (!result.success) {
      return NextResponse.json({ error: 'Event processing failed' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Processed ${result.processedCount} articles into ${result.eventsCreated} events.`
    });

  } catch (error) {
    console.error('Unhandled error in process route:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
