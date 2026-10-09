'use client';

import React, { useRef, useState } from 'react';
import { Upload, Camera, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import { SAMPLE_POSTERS } from '@/lib/sample-data';
import { SamplePoster } from '@/lib/types';

interface ImageUploaderProps {
  onImageSelected: (base64: string, previewUrl: string, sampleData?: SamplePoster) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP, SVG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedSampleId(null);
      onImageSelected(base64, URL.createObjectURL(file));
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample: SamplePoster) => {
    setSelectedSampleId(sample.id);
    fetch(sample.thumbnailPath)
      .then((res) => res.text())
      .then((svgText) => {
        const base64 = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgText)))}`;
        onImageSelected(base64, sample.thumbnailPath, sample);
      })
      .catch(() => {
        onImageSelected('', sample.thumbnailPath, sample);
      });
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-xl p-8 sm:p-10 text-center transition-all cursor-pointer select-none ${
          dragActive
            ? 'border-sky-500 bg-sky-950/20 shadow-lg shadow-sky-950/30'
            : 'border-zinc-800 hover:border-zinc-700 bg-zinc-900/60 hover:bg-zinc-900'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-zinc-800/80 border border-zinc-700 flex items-center justify-center text-sky-400 group-hover:scale-105 transition-transform">
            <Upload className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-semibold text-zinc-100">
              Drop your campus notice photo here, or browse
            </h3>
            <p className="text-sm text-zinc-400">
              Supports posters, whiteboard notices, flyers, and circulars (PNG, JPG, WEBP)
            </p>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3 text-xs text-zinc-400">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700">
              <Camera className="w-3.5 h-3.5 text-zinc-300" /> Mobile Camera Supported
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-zinc-800/80 border border-zinc-700">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Gemma 4 Vision
            </span>
          </div>
        </div>
      </div>

      {/* Preset Campus Samples */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-zinc-400 uppercase">
          <span className="flex items-center gap-1.5">
            <ImageIcon className="w-3.5 h-3.5 text-sky-400" />
            Try instant campus test posters
          </span>
          <span className="text-[11px] text-zinc-400 font-mono">1-Click Test</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {SAMPLE_POSTERS.map((sample) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <button
                key={sample.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelectSample(sample)}
                className={`text-left p-3.5 rounded-lg border transition-all text-sm flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-950/30 text-zinc-100 ring-1 ring-sky-500'
                    : 'border-zinc-800/80 bg-zinc-900/40 hover:bg-zinc-850 hover:border-zinc-700 text-zinc-300'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-1 mb-1.5">
                    <span className="font-semibold text-zinc-100 text-xs leading-snug">
                      {sample.title}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                    {sample.subtitle}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-400">
                  <span className="capitalize">{sample.category.replace('_', ' ')}</span>
                  <span className="text-sky-400 font-mono">Run analysis →</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
