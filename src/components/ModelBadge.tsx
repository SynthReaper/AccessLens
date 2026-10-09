import React from 'react';
import { Cpu, ShieldCheck } from 'lucide-react';

interface ModelBadgeProps {
  modelName: string;
  isFallbackDemo?: boolean;
  processingTimeMs?: number;
}

export const ModelBadge: React.FC<ModelBadgeProps> = ({
  modelName,
  isFallbackDemo = false,
  processingTimeMs
}) => {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-200 font-mono">
        <Cpu className="w-3.5 h-3.5 text-sky-400" />
        <span className="text-zinc-400 font-sans">Model:</span>
        <span className="text-sky-300 font-semibold">{modelName}</span>
      </div>

      {processingTimeMs && (
        <span className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-850 text-zinc-400 font-mono">
          ⏱️ {(processingTimeMs / 1000).toFixed(2)}s
        </span>
      )}

      {isFallbackDemo ? (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-950/40 border border-amber-800/60 text-amber-300">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
          <span>Verified Demo Fixture</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-950/40 border border-emerald-800/60 text-emerald-300">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Live Gemini API</span>
        </div>
      )}
    </div>
  );
};
