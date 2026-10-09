import { NextRequest, NextResponse } from 'next/server';
import { analyzeNoticeImage } from '@/lib/gemma-client';
import { AnalysisRequest } from '@/lib/types';

export const maxDuration = 60; // 60 seconds max timeout for multimodal inference

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as AnalysisRequest;

    if (!body || !body.imageBase64) {
      return NextResponse.json(
        { error: 'Missing imageBase64 payload in request.' },
        { status: 400 }
      );
    }

    const mimeType = body.mimeType || 'image/jpeg';
    const focusMode = body.focusMode || 'full';

    const result = await analyzeNoticeImage(body.imageBase64, mimeType, focusMode);

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('[API /api/analyze] Error processing image:', error);

    return NextResponse.json(
      {
        error: message,
        hint: 'Ensure GEMINI_API_KEY is configured in .env.local or use one of the built-in demo sample posters.'
      },
      { status: 500 }
    );
  }
}
