'use client';

import React, { useState } from 'react';
import {
  Calendar,
  Copy,
  Check,
  ExternalLink,
  MessageSquare
} from 'lucide-react';
import { AccessLensAnalysis } from '@/lib/types';
import { downloadIcsFile } from '@/lib/calendar-export';

interface ActionToolbarProps {
  analysis: AccessLensAnalysis;
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({ analysis }) => {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const handleCopyMarkdown = () => {
    const md = `### ${analysis.eventDetails.title || 'Campus Notice Summary'}
*Extracted via AccessLens with Gemma 4 Vision*

**Summary:** ${analysis.headlineSummary}

**Date & Time:** ${analysis.eventDetails.date || 'N/A'} (${analysis.eventDetails.time || 'N/A'})
**Venue:** ${analysis.eventDetails.venue || 'N/A'}
**Organizer:** ${analysis.eventDetails.organizer || 'N/A'}

**Key Deadlines & Actions:**
${analysis.actionItems.map((act) => `- [ ] ${act.description}${act.deadline ? ` (Due: ${act.deadline})` : ''}`).join('\n')}

${analysis.uncertainties.length > 0 ? `**Unclear / Torn Areas:**\n${analysis.uncertainties.map((u) => `- ⚠️ ${u.field}: ${u.observation}`).join('\n')}` : ''}
`;

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportCalendar = () => {
    downloadIcsFile(analysis.eventDetails, analysis.headlineSummary);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `📌 *${analysis.eventDetails.title || 'Campus Notice'}*\n\n` +
      `${analysis.headlineSummary}\n\n` +
      `📅 *Date:* ${analysis.eventDetails.date || 'See notice'}\n` +
      `📍 *Venue:* ${analysis.eventDetails.venue || 'Campus'}\n` +
      (analysis.actionItems[0]?.deadline ? `⏳ *Deadline:* ${analysis.actionItems[0].deadline}\n\n` : '\n') +
      `_Parsed using AccessLens with Gemma 4_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-800 text-xs">
      {/* Add to Calendar */}
      {analysis.eventDetails.date && (
        <button
          type="button"
          onClick={handleExportCalendar}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium transition-colors shadow-sm"
        >
          <Calendar className="w-3.5 h-3.5" />
          Add to Calendar (.ics)
        </button>
      )}

      {/* Copy Summary */}
      <button
        type="button"
        onClick={handleCopyMarkdown}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-zinc-200 border border-zinc-700 transition-colors"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
        {copied ? 'Copied Markdown!' : 'Copy Summary'}
      </button>

      {/* Share to WhatsApp */}
      <button
        type="button"
        onClick={handleWhatsAppShare}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-800 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {shared ? 'Shared!' : 'Share to WhatsApp Group'}
      </button>

      {/* Direct Registration Link */}
      {analysis.eventDetails.registrationUrlOrEmail && (
        <a
          href={
            analysis.eventDetails.registrationUrlOrEmail.startsWith('http')
              ? analysis.eventDetails.registrationUrlOrEmail
              : `https://${analysis.eventDetails.registrationUrlOrEmail}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-750 text-sky-400 border border-zinc-700 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Open Link
        </a>
      )}
    </div>
  );
};
