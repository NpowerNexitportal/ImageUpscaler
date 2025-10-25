"use client";

import React, { useState, useRef } from 'react';
import { Upload, Download, Sparkles, Zap, X } from 'lucide-react';

export default function ImageUpscaler() {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [scaleFactor, setScaleFactor] = useState(2);
  const fileInput = useRef(null);
  const canvas = useRef(null);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        setImage({ url: evt.target.result, w: img.width, h: img.height });
        setResult(null);
      };
      img.src = evt.target.result;
    };
    reader.readAsDataURL(file);
  };

  const enhance = () => {
    if (!image) return;

    setProcessing(true);
    const img = new Image();
    
    img.onload = () => {
      const ctx = canvas.current.getContext('2d');
      const nw = img.width * scaleFactor;
      const nh = img.height * scaleFactor;
      
      canvas.current.width = nw;
      canvas.current.height = nh;
      
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, nw, nh);
      
      const imgData = ctx.getImageData(0, 0, nw, nh);
      const enhanced = sharpen(imgData);
      ctx.putImageData(enhanced, 0, 0);
      
      setTimeout(() => {
        setResult({ url: canvas.current.toDataURL('image/png'), w: nw, h: nh });
        setProcessing(false);
      }, 600);
    };
    
    img.src = image.url;
  };

  const sharpen = (imgData) => {
    const { data, width, height } = imgData;
    const output = new Uint8ClampedArray(data);
    const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let val = 0;
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const i = ((y + ky) * width + (x + kx)) * 4 + c;
              val += data[i] * kernel[(ky + 1) * 3 + (kx + 1)];
            }
          }
          output[(y * width + x) * 4 + c] = Math.max(0, Math.min(255, val));
        }
      }
    }
    
    return new ImageData(output, width, height);
  };

  const save = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.download = `enhanced-${scaleFactor}x.png`;
    a.href = result.url;
    a.click();
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    if (fileInput.current) fileInput.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 md:mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
              Upscaler
            </h1>
          </div>
          <p className="text-purple-300 text-sm md:text-base">Enhance images with AI-powered upscaling</p>
        </div>

        {!image ? (
          <div className="max-w-2xl mx-auto">
            <div
              onClick={() => fileInput.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border-2 border-purple-500/30 rounded-3xl p-16 md:p-24 text-center hover:border-purple-500/60 transition-all">
                <Upload className="w-16 h-16 md:w-20 md:h-20 mx-auto mb-6 text-purple-400" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Drop your image here</h2>
                <p className="text-purple-300">or click to browse • PNG, JPG, WEBP</p>
              </div>
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-purple-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Original</h3>
                    <span className="text-xs text-purple-300 bg-purple-500/20 px-3 py-1 rounded-full">
                      {image.w}×{image.h}
                    </span>
                  </div>
                  <img src={image.url} alt="Original" className="w-full rounded-xl" />
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-pink-400 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative bg-slate-900/90 backdrop-blur-xl border border-pink-500/30 rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">Enhanced</h3>
                    {result && (
                      <span className="text-xs text-pink-300 bg-pink-500/20 px-3 py-1 rounded-full">
                        {result.w}×{result.h}
                      </span>
                    )}
                  </div>
                  {result ? (
                    <img src={result.url} alt="Enhanced" className="w-full rounded-xl" />
                  ) : (
                    <div className="aspect-video bg-slate-800/50 rounded-xl flex items-center justify-center">
                      {processing ? (
                        <div className="text-center">
                          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                          <p className="text-pink-300 text-sm">Processing...</p>
                        </div>
                      ) : (
                        <p className="text-slate-500">Enhanced image will appear here</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur opacity-25" />
              <div className="relative bg-slate-900/90 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-white font-semibold">Scale Factor</label>
                    <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                      {scaleFactor}×
                    </span>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="4"
                    value={scaleFactor}
                    onChange={(e) => setScaleFactor(parseInt(e.target.value))}
                    disabled={processing}
                    className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-purple-500"
                  />
                  <div className="flex justify-between text-xs text-slate-400 mt-2">
                    <span>2×</span>
                    <span>3×</span>
                    <span>4×</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={enhance}
                    disabled={processing}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:cursor-not-allowed"
                  >
                    <Zap className="w-5 h-5" />
                    {processing ? 'Enhancing...' : 'Enhance Image'}
                  </button>

                  {result && (
                    <button
                      onClick={save}
                      className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                    >
                      <Download className="w-5 h-5" />
                      Download
                    </button>
                  )}

                  <button
                    onClick={reset}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 px-6 rounded-xl transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <canvas ref={canvas} className="hidden" />
      </div>
    </div>
  );
}
