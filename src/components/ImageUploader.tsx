'use client';

import React, { useRef, useState, useEffect } from 'react';
import { Camera, FolderOpen, X, RotateCcw, AlertCircle } from 'lucide-react';
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
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState(false);

  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const startCameraStream = async (facing: 'environment' | 'user') => {
    stopCameraStream();
    setIsCameraLoading(true);
    setCameraError(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment.');
      }

      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: facing },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          },
          audio: false
        });
      } catch {
        // Fallback to basic video constraint
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unable to connect to camera device';
      setCameraError(msg);
    } finally {
      setIsCameraLoading(false);
    }
  };

  const handleOpenLiveCamera = () => {
    setIsCameraOpen(true);
    startCameraStream(cameraFacing);
  };

  const handleCloseCamera = () => {
    stopCameraStream();
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const handleFlipCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    startCameraStream(nextFacing);
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');

    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, width, height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCameraStream();
    setIsCameraOpen(false);
    setSelectedSampleId(null);
    onImageSelected(dataUrl, dataUrl);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

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
      {/* Tactile Pinned Drop Deck */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`group relative border-2 border-[#1e1b19] rounded-xl p-8 sm:p-10 text-left cursor-pointer transition-all bg-[#faf2ee] shadow-press-lg ${
          dragActive
            ? 'bg-[#ffdbcf]/50 scale-[1.005]'
            : 'hover:bg-[#fff8f5]'
        }`}
      >
        {/* Dedicated File Picker Input (NO capture) */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {/* Dedicated Mobile Camera Input (Direct capture fallback) */}
        <input
          ref={cameraInputRef}
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

        {/* Washi tape header */}
        <div className="absolute -top-3.5 left-8 px-3.5 py-1 washi-tape-secondary -rotate-2 rounded-xs border-2 border-[#1e1b19] flex items-center justify-center shadow-press-sm pointer-events-none whitespace-nowrap z-10">
          <span className="font-mono text-[10px] uppercase tracking-wider text-[#03210c] font-bold">
            DROP &amp; PIN APERTURE
          </span>
        </div>

        {/* Pushpins */}
        <div className="absolute top-3 right-4 pushpin-primary" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-2">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold text-[#a73400] uppercase tracking-wider">
              <span>🍁 Stage 01: Capture Campus Physical Paper</span>
            </div>
            <h3 className="font-display font-extrabold text-2xl text-[#1e1b19] tracking-tight">
              Snap a notice photo, or drop poster scan
            </h3>
            <p className="font-serif text-sm text-[#594139] max-w-lg leading-relaxed">
              Whiteboard scribbles, taped elevator circulars, or quad fest flyers.
              Gemma 4 projects highlighters directly onto the paper with zero hallucination.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 font-mono text-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#ffffff] hover:bg-[#f4ece8] border-2 border-[#1e1b19] text-[#1e1b19] font-bold rounded-lg shadow-press active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <FolderOpen className="w-4 h-4 text-[#a73400]" />
              <span>Browse File</span>
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenLiveCamera();
              }}
              className="inline-flex items-center gap-2 px-4 py-3 bg-[#a73400] hover:bg-[#cb4914] text-white font-bold rounded-lg border-2 border-[#1e1b19] shadow-press active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              <Camera className="w-4 h-4" />
              <span>Camera</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Camera Viewfinder Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 bg-[#1e1b19]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-[#faf2ee] border-2 border-[#1e1b19] rounded-2xl shadow-press-xl overflow-hidden flex flex-col">
            {/* Viewfinder Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b-2 border-[#1e1b19] bg-[#ffffff]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#cb4914] animate-ping" />
                <span className="font-mono text-xs font-bold text-[#1e1b19] uppercase tracking-wider">
                  Live Viewfinder • Gemma 4 Aperture
                </span>
              </div>
              <button
                type="button"
                onClick={handleCloseCamera}
                className="p-1.5 rounded-lg border-2 border-[#1e1b19] bg-[#faf2ee] hover:bg-[#cb4914] hover:text-white transition-colors"
                title="Close camera"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Viewport */}
            <div className="relative bg-[#1e1b19] min-h-[360px] sm:min-h-[440px] flex items-center justify-center overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full max-h-[480px] object-cover"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Viewfinder Corner Overlays (Targeting Reticle) */}
              <div className="absolute inset-8 pointer-events-none flex flex-col justify-between">
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-t-4 border-l-4 border-[#ffdbcf] rounded-tl-sm" />
                  <div className="w-8 h-8 border-t-4 border-r-4 border-[#ffdbcf] rounded-tr-sm" />
                </div>
                <div className="flex justify-center">
                  <span className="font-mono text-[11px] font-bold text-white/90 bg-[#1e1b19]/70 px-3 py-1 rounded border border-white/20">
                    ALIGN NOTICE WITHIN RETICLE
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="w-8 h-8 border-b-4 border-l-4 border-[#ffdbcf] rounded-bl-sm" />
                  <div className="w-8 h-8 border-b-4 border-r-4 border-[#ffdbcf] rounded-br-sm" />
                </div>
              </div>

              {/* Camera Loading Overlay */}
              {isCameraLoading && (
                <div className="absolute inset-0 bg-[#1e1b19]/90 flex flex-col items-center justify-center text-white gap-3 font-mono text-xs">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>INITIALIZING CAMERA SENSOR...</span>
                </div>
              )}

              {/* Camera Error Overlay with Native Fallback */}
              {cameraError && (
                <div className="absolute inset-0 bg-[#1e1b19]/95 flex flex-col items-center justify-center text-center p-6 text-white gap-4">
                  <AlertCircle className="w-10 h-10 text-[#cb4914]" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm">Camera Stream Unavailable</p>
                    <p className="text-xs text-white/70 max-w-md">{cameraError}</p>
                  </div>
                  <div className="flex items-center gap-3 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseCamera();
                        cameraInputRef.current?.click();
                      }}
                      className="px-4 py-2 bg-[#cb4914] hover:bg-[#e05820] text-white font-bold rounded-lg border border-white/30"
                    >
                      Open Native Camera App
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseCamera}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold rounded-lg"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Viewfinder Footer Controls */}
            <div className="p-4 sm:p-5 border-t-2 border-[#1e1b19] bg-[#faf2ee] flex items-center justify-between gap-4 font-mono text-xs">
              <button
                type="button"
                onClick={handleFlipCamera}
                className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-[#1e1b19] rounded-lg font-bold shadow-press-sm hover:bg-[#f4ece8] active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#1e1b19]"
                title="Switch front/back camera"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Flip Camera</span>
              </button>

              <button
                type="button"
                onClick={handleCapturePhoto}
                disabled={isCameraLoading || !!cameraError}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#a73400] hover:bg-[#cb4914] disabled:opacity-50 text-white font-bold rounded-xl border-2 border-[#1e1b19] shadow-press-md active:translate-x-0.5 active:translate-y-0.5 transition-all text-sm tracking-wide"
              >
                <Camera className="w-5 h-5" />
                <span>SNAP NOTICE PHOTO</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  handleCloseCamera();
                  cameraInputRef.current?.click();
                }}
                className="inline-flex items-center gap-1 text-[11px] text-[#594139] hover:text-[#1e1b19] underline font-bold"
              >
                Native Cam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hand-Drawn Washi Sample Tapes */}
      <div className="border-2 border-[#1e1b19] bg-[#ffffff] rounded-xl shadow-press overflow-hidden">
        <div className="px-5 py-3 border-b-2 border-[#1e1b19] flex items-center justify-between bg-[#faf2ee]">
          <div className="flex items-center gap-2 font-mono text-xs text-[#1e1b19]">
            <span className="text-[#a73400] text-sm">📌</span>
            <span className="font-bold">VERIFIED SAMPLE TAPES</span>
            <span className="text-[#8d7168] hidden sm:inline">• 1-click test posters from around campus</span>
          </div>
          <span className="font-mono text-[10px] font-bold px-2.5 py-0.5 bg-[#c8ecca] text-[#03210c] border border-[#46664b] rounded shadow-press-sm -rotate-1">
            Gemma 4 Benchmark
          </span>
        </div>

        <div className="divide-y-2 divide-[#1e1b19]">
          {SAMPLE_POSTERS.map((sample, idx) => {
            const isSelected = selectedSampleId === sample.id;
            return (
              <div
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-[#ffdbcf]/40 border-l-4 border-l-[#a73400]'
                    : 'hover:bg-[#faf2ee]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <span className="font-mono text-sm font-bold text-[#a73400] mt-0.5 bg-[#faf2ee] w-8 h-8 rounded-lg border-2 border-[#1e1b19] flex items-center justify-center shrink-0 shadow-press-sm">
                    0{idx + 1}
                  </span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-base text-[#1e1b19]">
                        {sample.title}
                      </span>
                      <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#fff8f5] border border-[#1e1b19] text-[#594139] shadow-press-sm">
                        {sample.category.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="font-serif text-sm text-[#594139] mt-1 leading-relaxed">
                      {sample.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 font-mono text-xs">
                  <span className="px-2 py-1 bg-[#faf2ee] border border-[#1e1b19] rounded text-[11px] text-[#594139] font-bold shadow-press-sm">
                    🎯 {sample.cachedResult.hotspots.length} Markers
                  </span>
                  <button
                    type="button"
                    disabled={isLoading}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#ffffff] hover:bg-[#a73400] hover:text-white border-2 border-[#1e1b19] rounded-lg font-bold shadow-press-sm active:translate-x-0.5 active:translate-y-0.5 transition-all text-[#1e1b19]"
                  >
                    <span>Inspect Notice</span>
                    <span>→</span>
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
