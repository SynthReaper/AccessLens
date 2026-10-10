import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { webhookUrl, title, summary, date, venue, targetPlatform } = await req.json();

    if (!webhookUrl) {
      return NextResponse.json(
        { error: 'webhookUrl is required for dispatch' },
        { status: 400 }
      );
    }

    if (targetPlatform === 'discord') {
      const discordPayload = {
        embeds: [
          {
            title: `🍁 ${title || 'Campus Notice Dispatch'}`,
            description: summary || 'No summary provided',
            color: 0xa73400,
            fields: [
              { name: '📅 Date Window', value: date || 'TBD', inline: true },
              { name: '📍 Campus Venue', value: venue || 'Campus', inline: true }
            ],
            footer: {
              text: 'Parsed & Verified via AccessLens • Gemma 4 Vision • MUJ'
            },
            timestamp: new Date().toISOString()
          }
        ]
      };

      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (!res.ok) {
        throw new Error(`Discord returned status ${res.status}`);
      }

      return NextResponse.json({ success: true, platform: 'discord' });
    }

    // Generic webhook / Slack
    const genericPayload = {
      text: `*🍁 ${title || 'Campus Notice Dispatch'}*\n${summary}\n📅 *Date:* ${date || 'TBD'} | 📍 *Venue:* ${venue || 'Campus'}\n_Sent via AccessLens_`
    };

    const res = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genericPayload)
    });

    return NextResponse.json({ success: res.ok, status: res.status });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Webhook dispatch failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
