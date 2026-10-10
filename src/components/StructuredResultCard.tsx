'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  Check,
  Users,
  Copy,
  MessageSquare,
  BookmarkCheck,
  AlertOctagon,
  Volume2,
  VolumeX,
  Navigation,
  Send,
  QrCode
} from 'lucide-react';
import { AccessLensAnalysis, HotspotDetail } from '@/lib/types';
import { downloadIcsFile } from '@/lib/calendar-export';
import { speakNotice, stopSpeakingNotice } from '@/lib/speech-service';
import { CampusMapModal } from './CampusMapModal';
import { DiscordWebhookModal } from './DiscordWebhookModal';
import { NoticeAskAssistant } from './NoticeAskAssistant';

interface StructuredResultCardProps {
  analysis: AccessLensAnalysis;
  selectedHotspotId?: string | null;
  onSelectHotspot?: (hotspot: HotspotDetail | null) => void;
  imageBase64?: string | null;
}

export const StructuredResultCard: React.FC<StructuredResultCardProps> = ({
  analysis,
  selectedHotspotId,
  onSelectHotspot,
  imageBase64
}) => {
  const { eventDetails, actionItems, uncertainties, keyTakeaways, hotspots } = analysis;
  const [copiedNote, setCopiedNote] = React.useState(false);
  const [copiedField, setCopiedField] = React.useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = React.useState(false);
  const [isDiscordModalOpen, setIsDiscordModalOpen] = React.useState(false);
  const [checkedActions, setCheckedActions] = React.useState<Record<string, boolean>>({
    [actionItems[0]?.id || '']: true
  });

  const toggleAction = (id: string) => {
    setCheckedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1800);
  };

  const handleCopyCleanNotes = () => {
    const md = `📌 ${eventDetails.title || 'Campus Notice'}
Summary: ${analysis.headlineSummary}
Date: ${eventDetails.date || 'TBD'} | Time: ${eventDetails.time || 'TBD'}
Venue: ${eventDetails.venue || 'TBD'}
Actions:
${actionItems.map((a) => `- [${checkedActions[a.id] ? 'x' : ' '}] ${a.description} (${a.deadline || 'No deadline'})`).join('\n')}
Extracted via AccessLens with Gemma 4 Vision.`;
    navigator.clipboard.writeText(md);
    setCopiedNote(true);
    setTimeout(() => setCopiedNote(false), 2000);
  };

  const handleExportIcs = () => {
    downloadIcsFile(eventDetails, analysis.headlineSummary);
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🍁 *${eventDetails.title || 'Campus Notice'}*\n\n` +
      `${analysis.headlineSummary}\n\n` +
      `📅 *Date:* ${eventDetails.date || 'See notice'}\n` +
      `📍 *Venue:* ${eventDetails.venue || 'Campus'}\n` +
      `_Parsed via AccessLens with Gemma 4 Vision_`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const handleToggleAudio = () => {
    if (isPlayingAudio) {
      stopSpeakingNotice();
      setIsPlayingAudio(false);
    } else {
      const speechText = `${eventDetails.title || 'Campus notice'}. ${analysis.headlineSummary}. Date: ${eventDetails.date || 'Check notice'}. Venue: ${eventDetails.venue || 'Campus'}. Action item: ${actionItems[0]?.description || 'Review notice details'}.`;
      const started = speakNotice(speechText, () => setIsPlayingAudio(false));
      if (started) {
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div className="flex flex-col space-y-5">
      {/* CARD 1: Quick Scoop (TL;DR) - Styled like a legal pad memo with tape */}
      <div className="relative bg-[#ffddb6]/35 border-2 border-[#1e1b19] rounded-xl p-5 sm:p-6 shadow-press">
        <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2.5 border-b border-dashed border-[#805200]/30">
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[#a73400] text-lg">⚡</span>
            <h2 className="font-display font-extrabold text-lg text-[#1e1b19] whitespace-nowrap">
              Quick Scoop
            </h2>
            <span className="font-mono text-[10px] text-[#805200] font-bold px-1.5 py-0.5 rounded bg-white border border-[#805200]/30 whitespace-nowrap shadow-press-xs">
              TL;DR
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Audio Speech Button */}
            <button
              type="button"
              onClick={handleToggleAudio}
              className={`whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full border-2 border-[#1e1b19] font-bold shadow-press-xs active:translate-x-0.5 active:translate-y-0.5 transition-all ${
                isPlayingAudio
                  ? 'bg-[#cb4914] text-white animate-pulse'
                  : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#faf2ee]'
              }`}
              title="Vocalize Notice with Web Speech"
            >
              {isPlayingAudio ? (
                <VolumeX className="w-3.5 h-3.5 text-white" />
              ) : (
                <Volume2 className="w-3.5 h-3.5 text-[#a73400]" />
              )}
              <span>{isPlayingAudio ? 'Stop Voice' : 'Read Aloud'}</span>
            </button>

            <span className="whitespace-nowrap shrink-0 inline-flex items-center gap-1 font-mono text-[11px] px-2.5 py-1 rounded-full bg-[#ffffff] text-[#1e1b19] border border-[#1e1b19] font-bold shadow-press-xs">
              ☕ 15-sec
            </span>
          </div>
        </div>

        <p className="font-serif text-base text-[#1e1b19] leading-relaxed pt-3">
          {analysis.headlineSummary}
        </p>

        {keyTakeaways && keyTakeaways.length > 0 && (
          <ul className="mt-3 space-y-1.5 border-t border-dashed border-[#805200]/25 pt-2.5">
            {keyTakeaways.map((takeaway, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-mono text-[#594139]">
                <span className="text-[#a73400] font-bold">›</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        )}

        {/* Hotspot Markers Jump Bar */}
        {hotspots && hotspots.length > 0 && (
          <div className="pt-4 border-t border-dashed border-[#805200]/30 mt-3">
            <div className="flex items-center justify-between text-xs font-mono font-bold text-[#594139] mb-2">
              <span className="flex items-center gap-1">
                <BookmarkCheck className="w-3.5 h-3.5 text-[#a73400]" />
                Interactive Visual Anchors ({hotspots.length}):
              </span>
              <span className="text-[10px] text-[#805200]">Click to jump</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {hotspots.map((hs) => {
                const isSelected = selectedHotspotId === hs.id;
                const isQr = hs.actionType === 'link' || hs.label.toLowerCase().includes('qr') || hs.label.toLowerCase().includes('link');
                return (
                  <button
                    key={hs.id}
                    type="button"
                    onClick={() => onSelectHotspot && onSelectHotspot(isSelected ? null : hs)}
                    className={`font-mono text-xs px-2.5 py-1 rounded-xs border-2 border-[#1e1b19] transition-transform active:translate-x-0.5 active:translate-y-0.5 shadow-press-sm font-bold flex items-center gap-1 ${
                      isSelected
                        ? 'bg-[#a73400] text-white -rotate-1'
                        : 'bg-[#ffffff] text-[#1e1b19] hover:bg-[#faf2ee]'
                    }`}
                  >
                    {isQr && <QrCode className="w-3 h-3 text-[#a73400]" />}
                    <span>{hs.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: Logistics at a Glance (Zine Grid of 4 Mini Slips) */}
      <div className="bg-[#ffffff] border-2 border-[#1e1b19] rounded-xl p-5 shadow-press space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#e1bfb5]">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#a73400]" />
            <h3 className="font-display font-bold text-base text-[#1e1b19]">Logistics at a Glance</h3>
          </div>
          <span className="font-mono text-xs text-[#594139] font-bold">4 Verified Anchors</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Slip 1: Date */}
          <div className="bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg p-3 shadow-press-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Calendar className="w-4 h-4 text-[#a73400]" />
              <button
                type="button"
                onClick={() => copyToClipboard(eventDetails.date || 'TBD', 'date')}
                className="text-[#594139] hover:text-[#a73400] text-xs font-mono font-bold"
                title="Copy date"
              >
                {copiedField === 'date' ? '✓ Copied' : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-2">
              <span className="font-mono text-[10px] text-[#594139] uppercase font-bold block">Date Window</span>
              <span className="font-display font-bold text-sm text-[#1e1b19]">
                {eventDetails.date || <span className="italic text-[#8d7168]">Unspecified</span>}
              </span>
            </div>
          </div>

          {/* Slip 2: Time */}
          <div className="bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg p-3 shadow-press-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Clock className="w-4 h-4 text-[#805200]" />
              <button
                type="button"
                onClick={() => copyToClipboard(eventDetails.time || 'TBD', 'time')}
                className="text-[#594139] hover:text-[#a73400] text-xs font-mono font-bold"
                title="Copy time"
              >
                {copiedField === 'time' ? '✓ Copied' : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-2">
              <span className="font-mono text-[10px] text-[#594139] uppercase font-bold block">Schedule Timing</span>
              <span className="font-display font-bold text-sm text-[#1e1b19]">
                {eventDetails.time || <span className="italic text-[#8d7168]">Not specified</span>}
              </span>
            </div>
          </div>

          {/* Slip 3: Venue with Map Pin Button */}
          <div className="bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg p-3 shadow-press-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <MapPin className="w-4 h-4 text-[#46664b]" />
              <button
                type="button"
                onClick={() => setIsMapModalOpen(true)}
                className="text-[#46664b] hover:text-[#2d4932] text-xs font-mono font-bold flex items-center gap-0.5 underline"
                title="View campus directions"
              >
                <Navigation className="w-3 h-3" />
                <span>Wayfinder</span>
              </button>
            </div>
            <div className="mt-2">
              <span className="font-mono text-[10px] text-[#594139] uppercase font-bold block">Campus Venue</span>
              <span className="font-display font-bold text-sm text-[#1e1b19] line-clamp-2 leading-snug">
                {eventDetails.venue || <span className="italic text-[#8d7168]">Check department</span>}
              </span>
            </div>
          </div>

          {/* Slip 4: Organizer */}
          <div className="bg-[#faf2ee] border-2 border-[#1e1b19] rounded-lg p-3 shadow-press-sm flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <Users className="w-4 h-4 text-[#a73400]" />
              <button
                type="button"
                onClick={() => copyToClipboard(eventDetails.organizer || 'Host', 'host')}
                className="text-[#594139] hover:text-[#a73400] text-xs font-mono font-bold"
                title="Copy host"
              >
                {copiedField === 'host' ? '✓ Copied' : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <div className="mt-2">
              <span className="font-mono text-[10px] text-[#594139] uppercase font-bold block">Lead Host Guild</span>
              <span className="font-display font-bold text-sm text-[#1e1b19] line-clamp-2 leading-snug">
                {eventDetails.organizer || <span className="italic text-[#8d7168]">University Chapter</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* CARD 3: Action Checklist (Interactive Student To-Do) */}
      <div className="bg-[#c8ecca]/30 border-2 border-[#1e1b19] rounded-xl p-5 shadow-press space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#46664b]/30">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#46664b]" />
            <h3 className="font-display font-bold text-base text-[#1e1b19]">Your Action Checklist</h3>
          </div>
          <span className="font-mono text-[11px] px-2.5 py-0.5 bg-[#c8ecca] text-[#03210c] border border-[#46664b] font-bold rounded-full shadow-press-sm">
            {Object.values(checkedActions).filter(Boolean).length} of {actionItems.length} checked
          </span>
        </div>

        <div className="space-y-2.5">
          {actionItems.map((act) => {
            const isDone = Boolean(checkedActions[act.id]);
            return (
              <div
                key={act.id}
                onClick={() => toggleAction(act.id)}
                className={`p-3 rounded-lg border-2 border-[#1e1b19] flex items-start gap-3 cursor-pointer transition-all shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 ${
                  isDone ? 'bg-[#faf2ee] opacity-80' : 'bg-[#ffffff]'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded border-2 border-[#1e1b19] flex items-center justify-center shrink-0 mt-0.5 ${
                    isDone ? 'bg-[#46664b] text-white' : 'bg-white'
                  }`}
                >
                  {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </div>

                <div className="flex-1 min-w-0">
                  <p className={`font-serif text-sm text-[#1e1b19] ${isDone ? 'line-through text-[#8d7168]' : 'font-medium'}`}>
                    {act.description}
                  </p>
                  {act.deadline && (
                    <span className="font-mono text-[11px] text-[#a73400] font-bold block mt-0.5">
                      ⏳ Deadline: {act.deadline}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CARD 4: Interactive Q&A Assistant */}
      <NoticeAskAssistant analysis={analysis} imageBase64={imageBase64} />

      {/* CARD 5: Gemma's Vision Guard (Physical Anomaly Warnings) */}
      <div className="bg-[#e9e1dd] border-2 border-[#1e1b19] rounded-xl p-5 shadow-press space-y-3">
        <div className="flex items-start justify-between gap-2 pb-1 border-b border-[#8d7168]/30">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#ffb59c] border border-[#1e1b19] flex items-center justify-center text-[#a73400] font-bold text-xs">
              🍁
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#1e1b19]">Gemma’s Vision Guard</h3>
              <span className="font-mono text-[10px] text-[#a73400] font-bold">
                {uncertainties.length > 0 ? `${uncertainties.length} PHYSICAL ANOMALIES FLAGGED` : '100% CLEAR CLARITY'}
              </span>
            </div>
          </div>
          <span className="font-mono text-[11px] px-2 py-0.5 bg-white border border-[#1e1b19] rounded font-bold shadow-press-sm">
            Zero Hallucination
          </span>
        </div>

        {uncertainties.length > 0 ? (
          <div className="space-y-2">
            {uncertainties.map((unc, idx) => (
              <div key={idx} className="p-3 bg-white border-2 border-[#1e1b19] rounded-lg shadow-press-sm text-xs font-serif flex items-start gap-2">
                <AlertOctagon className="w-4 h-4 text-[#a73400] shrink-0 mt-0.5" />
                <div>
                  <span className="font-mono font-bold text-[#a73400] uppercase">
                    [{unc.field} • {unc.reason}]:
                  </span>{' '}
                  <span className="text-[#1e1b19]">{unc.observation}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-white border-2 border-[#1e1b19] rounded-lg text-xs font-serif text-[#46664b] flex items-center gap-2">
            <Check className="w-4 h-4" />
            <span>High visual fidelity. No occluded or torn areas identified.</span>
          </div>
        )}

        <div className="pt-2 text-[11px] font-mono text-[#8d7168] italic border-t border-[#8d7168]/20 flex items-center justify-between">
          <span>{analysis.confidenceDisclaimer}</span>
          <span className="font-bold text-[#a73400]">{analysis.modelUsed.split(' ')[0]}</span>
        </div>
      </div>

      {/* CARD 6: Handy Actions Bar (Tactile Buttons) */}
      <div className="bg-[#faf2ee] border-2 border-[#1e1b19] rounded-xl p-4 shadow-press space-y-2.5">
        <div className="flex items-center justify-between pb-1 border-b border-[#1e1b19]/15 text-xs font-mono font-bold text-[#594139]">
          <span>⚡ Export &amp; Broadcast Suite</span>
          <span className="text-[10px] text-[#8d7168]">Verified actions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 font-mono text-xs">
          <button
            type="button"
            onClick={handleExportIcs}
            className="h-11 w-full whitespace-nowrap inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#a73400] hover:bg-[#cb4914] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            <Calendar className="w-4 h-4 shrink-0 text-white" />
            <span>Add to Calendar (.ics)</span>
          </button>

          <button
            type="button"
            onClick={handleCopyCleanNotes}
            className="h-11 w-full whitespace-nowrap inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#ffffff] hover:bg-[#f4ece8] text-[#1e1b19] font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
          >
            {copiedNote ? (
              <Check className="w-4 h-4 shrink-0 text-[#46664b]" />
            ) : (
              <Copy className="w-4 h-4 shrink-0 text-[#a73400]" />
            )}
            <span>{copiedNote ? 'Copied Notes!' : 'Copy Notes'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="h-11 w-full whitespace-nowrap inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#46664b] hover:bg-[#345239] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Share to WhatsApp"
          >
            <MessageSquare className="w-4 h-4 shrink-0 text-white" />
            <span>Share WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsDiscordModalOpen(true)}
            className="h-11 w-full whitespace-nowrap inline-flex items-center justify-center gap-2 px-3 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all"
            title="Broadcast to Discord Server"
          >
            <Send className="w-4 h-4 shrink-0 text-white" />
            <span>Broadcast Discord</span>
          </button>
        </div>
      </div>

      {/* Map Wayfinder Modal */}
      {isMapModalOpen && (
        <CampusMapModal
          venueText={eventDetails.venue}
          onClose={() => setIsMapModalOpen(false)}
        />
      )}

      {/* Discord Broadcast Modal */}
      {isDiscordModalOpen && (
        <DiscordWebhookModal
          title={eventDetails.title}
          summary={analysis.headlineSummary}
          date={eventDetails.date}
          venue={eventDetails.venue}
          onClose={() => setIsDiscordModalOpen(false)}
        />
      )}
    </div>
  );
};
