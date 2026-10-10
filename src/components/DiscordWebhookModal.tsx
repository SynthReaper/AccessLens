'use client';

import React, { useState } from 'react';
import { Send, Check, AlertCircle, MessageSquare, X } from 'lucide-react';

interface DiscordWebhookModalProps {
  title: string | null;
  summary: string;
  date: string | null;
  venue: string | null;
  onClose: () => void;
}

export const DiscordWebhookModal: React.FC<DiscordWebhookModalProps> = ({
  title,
  summary,
  date,
  venue,
  onClose
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookUrl.trim() || loading) return;

    setLoading(true);
    setStatus('idle');
    setErrorMessage('');

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl,
          targetPlatform: 'discord',
          title: title || 'Campus Notice',
          summary,
          date,
          venue
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to dispatch webhook');
      }

      setStatus('success');
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err: unknown) {
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Broadcast failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1e1b19]/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-[#faf2ee] border-3 border-[#1e1b19] rounded-2xl shadow-press-xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#1e1b19] bg-[#ffffff]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#5865F2]" />
            <span className="font-mono text-xs font-bold text-[#1e1b19] uppercase tracking-wider">
              Discord / Webhook Dispatch
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg border border-[#1e1b19] bg-[#faf2ee] hover:bg-[#e9e1dd]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleBroadcast} className="p-6 space-y-4">
          <p className="font-serif text-sm text-[#594139] leading-relaxed">
            Broadcast this verified notice digest to your student council or batch Discord server channel via incoming webhook.
          </p>

          <div className="space-y-1">
            <label className="font-mono text-[11px] font-bold text-[#1e1b19] uppercase block">
              Discord Webhook URL
            </label>
            <input
              type="url"
              required
              placeholder="https://discord.com/api/webhooks/..."
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-white border-2 border-[#1e1b19] rounded-lg focus:outline-none"
            />
          </div>

          <div className="p-3 bg-white border border-[#1e1b19]/40 rounded-lg font-mono text-[11px] space-y-1">
            <span className="text-[#a73400] font-bold block">Preview Payload:</span>
            <p className="font-sans font-bold text-xs text-[#1e1b19]">{title || 'Campus Notice'}</p>
            <p className="text-[#594139] text-[11px] line-clamp-2">{summary}</p>
          </div>

          {status === 'success' && (
            <div className="p-2.5 bg-[#c8ecca] border border-[#46664b] rounded text-[#03210c] text-xs font-mono font-bold flex items-center gap-1.5">
              <Check className="w-4 h-4 text-[#46664b]" />
              <span>Broadcast dispatched successfully!</span>
            </div>
          )}

          {status === 'error' && (
            <div className="p-2.5 bg-[#ffdbcf] border border-[#a73400] rounded text-[#a73400] text-xs font-mono font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-2 font-mono text-xs">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#1e1b19] rounded-lg font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press-sm active:translate-x-0.5 active:translate-y-0.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{loading ? 'Sending...' : 'Broadcast'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
