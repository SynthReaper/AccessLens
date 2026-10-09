'use client';

import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Building,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Info,
  HelpCircle,
  Users
} from 'lucide-react';
import { AccessLensAnalysis } from '@/lib/types';
import { ActionToolbar } from './ActionToolbar';
import { ModelBadge } from './ModelBadge';

interface StructuredResultCardProps {
  analysis: AccessLensAnalysis;
}

export const StructuredResultCard: React.FC<StructuredResultCardProps> = ({ analysis }) => {
  const { eventDetails, actionItems, uncertainties, keyTakeaways } = analysis;

  return (
    <div className="flex flex-col h-full rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6 space-y-6 overflow-y-auto">
      {/* Header metadata */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-4">
        <div>
          <span className="text-[11px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-sky-950/70 border border-sky-800/80 text-sky-300">
            {analysis.category.replace('_', ' ')}
          </span>
          <h2 className="text-xl font-bold text-zinc-100 mt-2 leading-tight">
            {eventDetails.title || 'Campus Notice Details'}
          </h2>
        </div>
        <ModelBadge
          modelName={analysis.modelUsed}
          isFallbackDemo={analysis.isFallbackDemo}
          processingTimeMs={analysis.processingTimeMs}
        />
      </div>

      {/* Plain Language Executive Summary */}
      <div className="p-4 rounded-lg bg-zinc-950/60 border border-zinc-800 space-y-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
          <Info className="w-3.5 h-3.5 text-sky-400" />
          <span>Plain-Language Summary</span>
        </div>
        <p className="text-sm text-zinc-200 leading-relaxed">
          {analysis.headlineSummary}
        </p>
      </div>

      {/* Key Takeaways */}
      {keyTakeaways && keyTakeaways.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Key Information At A Glance
          </h3>
          <ul className="grid grid-cols-1 gap-2 text-xs">
            {keyTakeaways.map((item, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 p-2.5 rounded-lg bg-zinc-950/40 border border-zinc-850 text-zinc-300"
              >
                <span className="text-sky-400 font-mono mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Event Details Grid */}
      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
          <Building className="w-3.5 h-3.5 text-sky-400" />
          Logistics &amp; Scheduling
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Date */}
          <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-zinc-400 block">Date</span>
              <span className="font-semibold text-zinc-100">
                {eventDetails.date || <span className="text-zinc-500 italic">Not specified on poster</span>}
              </span>
            </div>
          </div>

          {/* Time */}
          <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-start gap-2.5">
            <Clock className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-zinc-400 block">Time</span>
              <span className="font-semibold text-zinc-100">
                {eventDetails.time || <span className="text-zinc-500 italic">Not specified</span>}
              </span>
            </div>
          </div>

          {/* Venue */}
          <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-zinc-400 block">Venue / Room</span>
              <span className="font-semibold text-zinc-100">
                {eventDetails.venue || <span className="text-zinc-500 italic">Check department board</span>}
              </span>
            </div>
          </div>

          {/* Organizer */}
          <div className="p-3 rounded-lg bg-zinc-950/50 border border-zinc-800 flex items-start gap-2.5">
            <Users className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-[11px] text-zinc-400 block">Organizer</span>
              <span className="font-semibold text-zinc-100">
                {eventDetails.organizer || <span className="text-zinc-500 italic">University Unit</span>}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items & Deadlines */}
      {actionItems && actionItems.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
            <ListTodo className="w-3.5 h-3.5 text-amber-400" />
            Required Student Actions &amp; Deadlines
          </h3>
          <div className="space-y-2">
            {actionItems.map((act) => (
              <div
                key={act.id}
                className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                  act.isUrgent
                    ? 'bg-rose-950/20 border-rose-800/60 text-rose-200'
                    : 'bg-zinc-950/40 border-zinc-800 text-zinc-300'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {act.isUrgent && (
                      <span className="px-1.5 py-0.5 rounded bg-rose-900/80 text-[10px] font-bold text-rose-300 uppercase">
                        Urgent Deadline
                      </span>
                    )}
                    <span className="font-medium">{act.description}</span>
                  </div>
                  {act.targetAudience && (
                    <span className="text-[11px] text-zinc-400 block">
                      Target: {act.targetAudience}
                    </span>
                  )}
                </div>
                {act.deadline && (
                  <span className="shrink-0 font-mono text-[11px] px-2 py-1 rounded bg-zinc-900 border border-zinc-700 text-amber-300">
                    {act.deadline}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty & Cropped Text Handling (Key PRD Acceptance Criteria) */}
      {uncertainties && uncertainties.length > 0 ? (
        <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-800/60 space-y-2 text-xs">
          <div className="flex items-center gap-1.5 text-amber-300 font-semibold">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Uncertain / Cropped / Low-Clarity Text Detected</span>
          </div>
          <p className="text-[11px] text-amber-200/80">
            Gemma flagged the following details as ambiguous or partially cut off. The model strictly avoided inventing information:
          </p>
          <ul className="space-y-1.5 pt-1">
            {uncertainties.map((unc, idx) => (
              <li
                key={idx}
                className="p-2 rounded bg-amber-950/40 border border-amber-900/60 text-[11px] text-amber-200"
              >
                <span className="font-mono font-semibold capitalize text-amber-400">
                  [{unc.field} - {unc.reason}]:
                </span>{' '}
                {unc.observation}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="p-2.5 rounded-lg bg-zinc-950/30 border border-zinc-850 flex items-center gap-2 text-[11px] text-zinc-400">
          <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>No visual occlusions detected. Text parsed with high confidence.</span>
        </div>
      )}

      {/* Confidence Disclaimer */}
      <p className="text-[11px] text-zinc-400 italic">
        ⚠️ {analysis.confidenceDisclaimer}
      </p>

      {/* Action Toolbar */}
      <ActionToolbar analysis={analysis} />
    </div>
  );
};
