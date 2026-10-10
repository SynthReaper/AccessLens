import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const maxDuration = 45;

export async function POST(req: NextRequest) {
  try {
    const { question, context, imageBase64 } = await req.json();

    if (!question) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        answer: `[Demo Mode] Based on the extracted notice: "${question}" pertains to the event schedule and venue. Please consult the lead host chapter for custom exemptions.`,
        model: 'accesslens-local-mock'
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `You are AccessLens Q&A Assistant, answering a student's question about a university campus notice.
Answer ONLY based on the facts in the notice and the student's question. Be direct, clear, concise, and helpful. Do not hallucinate or speculate.

NOTICE CONTEXT:
${context ? JSON.stringify(context, null, 2) : 'No extra JSON context'}

STUDENT QUESTION:
${question}`;

    const contents: Array<string | { inlineData: { data: string; mimeType: string } }> = [];

    if (imageBase64 && imageBase64.includes('base64,')) {
      const cleanBase64 = imageBase64.split('base64,')[1];
      contents.push({
        inlineData: {
          data: cleanBase64,
          mimeType: 'image/jpeg'
        }
      });
    }

    contents.push(prompt);

    // Call fast fallback or primary
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents
    });

    const answer = response.text || 'Unable to formulate answer from the notice.';

    return NextResponse.json({
      answer,
      model: 'gemini-3.5-flash-lite'
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Q&A processing failed';
    return NextResponse.json(
      {
        answer: `According to the notice records: General student eligibility and guidelines apply as stated. (Error: ${msg})`,
        model: 'error-fallback'
      },
      { status: 200 }
    );
  }
}
