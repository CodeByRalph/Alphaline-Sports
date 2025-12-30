import { NextRequest, NextResponse } from 'next/server';
import { runStressTest } from '@/app/lib/stress-test/service';
import { StressTestRequest } from '@/app/lib/stress-test/types';

export const maxDuration = 60; // Set timeout to 60s for Vercel/Next (if allowed)

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const request = body as StressTestRequest;

        // Validation
        if (!request.propId || !request.snapshotId || !request.pick) {
            return NextResponse.json(
                { status: 'error', message: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Run Logic
        const result = await runStressTest(request);

        return NextResponse.json({
            status: 'success',
            data: result
        });

    } catch (error: any) {
        console.error('Stress Test API Error:', error);
        return NextResponse.json(
            { status: 'error', message: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
