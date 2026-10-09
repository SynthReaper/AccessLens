'use client';

import React, { useRef, useState } from 'react';
import { Camera, ArrowUpRight, FolderOpen, FileText } from 'lucide-react';
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
      {/* Precision Drop & Capture Deck */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border transition-all cursor-pointer bg-[#0e1017] p-8 text-left ${
          dragActive
            ? 'border-[#f97316] ring-1 ring-[#f97316] bg-[#141724]'
            : 'border-[#1e2230] hover:border-[#38bdf8]/60 hover:bg-[#121520]'
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

        {/* Technical Corner Brackets */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-[#38bdf8]" />
        <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-[#38bdf8]" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-[#38bdf8]" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-[#38bdf8]" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 font-mono text-[11px] text-[#f97316] tracking-wider uppercase">
              <span className="w-1.5 h-1.5 bg-[#f97316]" />
              <span>Input Stage • Camera or High-Res Scan</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white">
              Drop poster photograph, or select file
            </h3>
            <p className="text-xs text-[#94a3b8] max-w-lg leading-relaxed">
              Accepts campus circulars, classroom flyers, and bulletin photos (JPG, PNG, SVG, WEBP).
              Model resolves spatial bounding boxes and extracts logistics automatically.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#181c28] hover:bg-[#202636] border border-[#2a3147] text-xs font-mono text-[#f8fafc] transition-colors"
            >
              <FolderOpen className="w-4 h-4 text-[#38bdf8]" />
              <span>Browse File</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#f97316] hover:bg-[#ea580c] text-black text-xs font-mono font-bold transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Structured Benchmark Presets */}
      <div className="border border-[#1e2230] bg-[#0e1017]">
        <div className="px-4 py-2.5 border-b border-[#1e2230] flex items-center justify-between bg-[#121520]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#94a3b8]">
            <FileText className="w-3.5 h-3.5 text-[#38bdf8]" />
            <span className="font-semibold text-white">VERIFIED CAMPUS NOTICE FIXTURES</span>
            <span className="text-[#64748b]">• Click to load instant spatial benchmarks</span>
          </div>
          <span className="text-[10px] font-mono text-[#f97316]">3 PRE-LOADED SAMPLES</span>
        </div>

        <div className="divide-y divide-[#1e2230]">
          {SAMPLE_POSTERS.map((sample, idx) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#181c2b] border-l-2 border-l-[#f97316]'
                    : 'hover:bg-[#131622]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-xs text-[#64748b] mt-0.5">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">
                        {sample.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-[#1e2230] text-[#94a3b8]">
                        {sample.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-[#94a3b8] mt-1 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <span className="text-[#64748b]">
                    {sample.cachedResult.hotspots.length} Hotspots
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex items-center gap-1 text-[#38bdf8] hover:text-white font-semibold"
                  >
                    <span>Run Evaluation</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
