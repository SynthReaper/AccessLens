import { NextResponse } from 'next/server';

export async function GET() {
  const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim().length > 0);
  const primaryModel = process.env.GEMMA_PRIMARY_MODEL || 'gemma-4-31b-it';
  const fallbackModel = process.env.GEMMA_FALLBACK_MODEL || 'gemma-3-27b-it';

  return NextResponse.json({
    status: 'online',
    appName: 'AccessLens',
    track: 'Hacktoberfest 2026 x MUJ - Best Use of Gemma 4',
    configuredModel: primaryModel,
    fallbackModel: fallbackModel,
    geminiApiKeyPresent: hasKey,
    timestamp: new Date().toISOString()
  });
}
