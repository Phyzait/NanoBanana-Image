// components/ImageGallery.tsx — 图片消息流展示（响应式 + 灯箱预览）

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Theme, GalleryItem } from '../types';
import { IMAGE_MODELS } from '../constants';
import { loadImage } from '../services/imageStore';
import { ArrowDownTrayIcon, XMarkIcon } from './Icons';

interface ImageGalleryProps {
  theme: Theme;
  items: GalleryItem[];
  isGenerating: boolean;
  currentPrompt?: string;
  currentInputImage?: string;
}

/* ── 成功小动画 — 对勾弹出 + 星星粒子 ──────── */

const SuccessSparkle: React.FC<{ isDark: boolean }> = ({ isDark }) => (
  <span className="relative inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
    <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5 animate-successPop" fill="none">
      <circle cx="10" cy="10" r="9" className={isDark ? 'fill-amber-500/20' : 'fill-amber-100'} />
      <path d="M6 10.5 L8.5 13 L14 7" stroke={isDark ? '#f59e0b' : '#d97706'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="animate-drawCheck" />
    </svg>
    <span className="absolute animate-sparkleOut" style={{ top: '-2px', left: '50%' }}>
      <span className={`block w-1 h-1 rounded-full ${isDark ? 'bg-amber-400' : 'bg-amber-500'}`} />
    </span>
    <span className="absolute animate-sparkleOut" style={{ bottom: '-2px', left: '50%', animationDelay: '120ms' }}>
      <span className={`block w-0.5 h-0.5 rounded-full ${isDark ? 'bg-orange-400' : 'bg-orange-500'}`} />
    </span>
    <span className="absolute animate-sparkleOut" style={{ top: '50%', left: '-2px', animationDelay: '60ms' }}>
      <span className={`block w-0.5 h-0.5 rounded-full ${isDark ? 'bg-yellow-300' : 'bg-yellow-500'}`} />
    </span>
    <span className="absolute animate-sparkleOut" style={{ top: '50%', right: '-2px', animationDelay: '180ms' }}>
      <span className={`block w-1 h-1 rounded-full ${isDark ? 'bg-amber-300' : 'bg-amber-400'}`} />
    </span>
  </span>
);

/* ── 图片灯箱预览 ──────────────────────────── */

const ImageLightbox: React.FC<{ src: string | null; onClose: () => void }> = ({ src, onClose }) => {
  useEffect(() => {
    if (!src) return;
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [src, onClose]);

  if (!src) return null;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = src;
    const ext = src.startsWith('data:image/png') ? 'png' : 'jpg';
    a.download = `nanoBanana_${Date.now()}.${ext}`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/80 backdrop-blur-md" onClick={onClose}>
      <img
        src={src}
        alt="预览"
        className="max-w-[95vw] max-h-[90vh] object-contain rounded-lg shadow-2xl animate-modalIn"
        onClick={e => e.stopPropagation()}
      />
      <div className="absolute top-4 right-4 flex gap-2">
        <button
          onClick={e => { e.stopPropagation(); handleDownload(); }}
          className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          title="下载"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
        </button>
        <button
          onClick={e => { e.stopPropagation(); onClose(); }}
          className="p-2.5 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors backdrop-blur-sm"
          title="关闭"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

/* ── 单个图片卡片 ──────────────────────────── */

const GalleryCard: React.FC<{ item: GalleryItem; theme: Theme; onPreview: (src: string) => void }> = ({ item, theme, onPreview }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [inputImgSrc, setInputImgSrc] = useState<string | null>(null);
  const isDark = theme === 'dark';
  const isError = !!item.error;

  useEffect(() => {
    if (item.imageRef) loadImage(item.imageRef).then(setImgSrc);
  }, [item.imageRef]);

  useEffect(() => {
    if (item.inputImageRef) loadImage(item.inputImageRef).then(setInputImgSrc);
  }, [item.inputImageRef]);

  const handleDownload = useCallback(() => {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    const ext = imgSrc.startsWith('data:image/png') ? 'png' : 'jpg';
    a.download = `nanoBanana_${item.id}.${ext}`;
    a.click();
  }, [imgSrc, item.id]);

  const modelName = IMAGE_MODELS.find(m => m.id === item.model)?.name || 'NanoBanana Pro';
  const elapsedStr = item.elapsed < 1000
    ? `${item.elapsed}ms`
    : `${(item.elapsed / 1000).toFixed(1)}s`;

  return (
    <div className="animate-fadeIn">
      {/* 用户消息气泡 */}
      <div className="flex justify-end mb-2">
        <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tr-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm ${
          isDark ? 'bg-amber-900/30 text-amber-100' : 'bg-amber-50 text-amber-900'
        }`}>
          <p className="whitespace-pre-wrap break-words">{item.prompt}</p>
          {/* img2img 输入图展示 */}
          {inputImgSrc && (
            <div className="mt-2">
              <img
                src={inputImgSrc}
                alt="参考图"
                className="h-20 sm:h-24 rounded-lg object-cover cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => onPreview(inputImgSrc)}
              />
              <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-amber-400/50' : 'text-amber-600/50'}`}>参考图</span>
            </div>
          )}
          <div className={`flex items-center gap-2 mt-1 sm:mt-1.5 text-[10px] ${isDark ? 'text-amber-400/60' : 'text-amber-600/60'}`}>
            <span>{item.aspectRatio}</span>
            <span>{item.size}</span>
            {item.mode === 'img2img' && <span>图生图</span>}
          </div>
        </div>
      </div>

      {/* 优化后的提示词 */}
      {item.optimizedPrompt && item.optimizedPrompt !== item.prompt && (
        <div className="flex justify-start mb-2">
          <details className={`max-w-[90%] sm:max-w-[85%] rounded-xl px-3 py-2 text-[11px] sm:text-xs ${
            isDark ? 'bg-[#2a2a28] text-gray-400' : 'bg-gray-50 text-gray-500'
          }`}>
            <summary className="cursor-pointer select-none">AI 优化后的提示词</summary>
            <p className="mt-1.5 whitespace-pre-wrap break-words leading-relaxed">{item.optimizedPrompt}</p>
          </details>
        </div>
      )}

      {/* 生成结果头部 — 模型 | 渠道 + 完成状态 */}
      <div className="flex justify-start mb-1.5">
        <div className="flex items-center gap-2">
          {isError ? (
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0">
              <svg viewBox="0 0 20 20" className="w-4 h-4 sm:w-5 sm:h-5" fill="none">
                <circle cx="10" cy="10" r="9" className={isDark ? 'fill-red-500/20' : 'fill-red-100'} />
                <path d="M7 7 L13 13 M13 7 L7 13" stroke={isDark ? '#ef4444' : '#dc2626'} strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
          ) : (
            <SuccessSparkle isDark={isDark} />
          )}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm">
              <span className={`font-medium ${isError ? (isDark ? 'text-red-400' : 'text-red-600') : (isDark ? 'text-amber-400' : 'text-amber-600')}`}>{modelName}</span>
              <span className={isDark ? 'text-gray-600' : 'text-gray-300'}>|</span>
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>IkunCode</span>
            </div>
            <span className={`text-[11px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              {isError ? '生成失败' : '图片生成完成'}
              {!isError && (
                <span className={`ml-1.5 tabular-nums ${isDark ? 'text-amber-400/60' : 'text-amber-600/60'}`}>({elapsedStr})</span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* AI 生成的图片 / 错误信息 */}
      <div className="flex justify-start mb-4">
        {isError ? (
          <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-md px-4 py-3 ${
            isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200'
          }`}>
            <p className={`text-xs sm:text-sm ${isDark ? 'text-red-300' : 'text-red-600'}`}>{item.error}</p>
          </div>
        ) : (
        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-md overflow-hidden shadow-lg ${
          isDark ? 'bg-[#2a2a28]' : 'bg-white'
        }`}>
          {imgSrc ? (
            <div className="relative group">
              <img
                src={imgSrc}
                alt={item.prompt}
                className="w-full max-h-[60vh] sm:max-h-[500px] object-contain cursor-pointer"
                loading="lazy"
                onClick={() => onPreview(imgSrc)}
              />
              <button
                onClick={handleDownload}
                className="absolute top-2 right-2 p-2 rounded-lg bg-black/50 text-white opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity hover:bg-black/70 active:bg-black/80"
                title="下载图片"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className={`w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center text-xs ${isDark ? 'text-gray-600' : 'text-gray-300'}`}>
              加载中...
            </div>
          )}
          <div className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] flex items-center gap-1.5 sm:gap-2 ${
            isDark ? 'text-gray-500 border-t border-gray-700/30' : 'text-gray-400 border-t border-gray-100'
          }`}>
            <span>{modelName}</span>
            <span>·</span>
            <span>{item.mode === 'img2img' ? '图生图' : '文生图'}</span>
            <span>·</span>
            <span>{item.aspectRatio}</span>
            <span>·</span>
            <span>{item.size}</span>
            <span>·</span>
            <span>{elapsedStr}</span>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

/* ── 主组件 ────────────────────────────────── */

const ImageGallery: React.FC<ImageGalleryProps> = ({ theme, items, isGenerating, currentPrompt, currentInputImage }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);

  // ── 实时计时器
  const [elapsedTime, setElapsedTime] = useState(0);
  const timerRef = useRef<number>(0);

  useEffect(() => {
    if (isGenerating) {
      setElapsedTime(0);
      const startTime = performance.now();
      timerRef.current = window.setInterval(() => {
        setElapsedTime(performance.now() - startTime);
      }, 100);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = 0;
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isGenerating]);

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items.length, isGenerating]);

  return (
    <>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="max-w-5xl mx-auto">
          {/* 空状态 */}
          {items.length === 0 && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-center pt-12 sm:pt-20">
              <div className="text-5xl sm:text-6xl mb-3 sm:mb-4">🍌</div>
              <h2 className={`text-base sm:text-lg font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                开始创作
              </h2>
              <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm max-w-xs px-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                在下方输入提示词，选择风格和参数，即可生成图片
              </p>
              <div className={`mt-4 sm:mt-6 grid grid-cols-2 gap-1.5 sm:gap-2 text-[11px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <div className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg ${isDark ? 'bg-[#2a2a28]' : 'bg-gray-50'}`}>10 种宽高比</div>
                <div className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg ${isDark ? 'bg-[#2a2a28]' : 'bg-gray-50'}`}>1K / 2K / 4K</div>
                <div className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg ${isDark ? 'bg-[#2a2a28]' : 'bg-gray-50'}`}>8 种风格预设</div>
                <div className={`px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg ${isDark ? 'bg-[#2a2a28]' : 'bg-gray-50'}`}>AI 提示词优化</div>
              </div>
            </div>
          )}

          {/* 图片列表 */}
          {items.map(item => (
            <GalleryCard key={item.id} item={item} theme={theme} onPreview={setPreviewSrc} />
          ))}

          {/* 生成中状态 */}
          {isGenerating && (
            <div className="animate-fadeIn">
              {currentPrompt && (
                <div className="flex justify-end mb-2">
                  <div className={`max-w-[85%] sm:max-w-[80%] rounded-2xl rounded-tr-md px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm ${
                    isDark ? 'bg-amber-900/30 text-amber-100' : 'bg-amber-50 text-amber-900'
                  }`}>
                    {currentPrompt}
                    {currentInputImage && (
                      <div className="mt-2">
                        <img src={currentInputImage} alt="参考图" className="h-20 sm:h-24 rounded-lg object-cover" />
                        <span className={`text-[10px] mt-0.5 block ${isDark ? 'text-amber-400/50' : 'text-amber-600/50'}`}>参考图</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-start mb-4">
                <div className={`rounded-2xl rounded-tl-md px-4 sm:px-6 py-4 sm:py-5 ${
                  isDark ? 'bg-[#2a2a28]' : 'bg-white shadow-sm'
                }`}>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                      <svg viewBox="0 0 48 48" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <linearGradient id="nb-banana-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#f59e0b" />
                            <stop offset="50%" stopColor="#f97316" />
                            <stop offset="100%" stopColor="#ef4444" />
                          </linearGradient>
                          <linearGradient id="nb-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.6" />
                            <stop offset="50%" stopColor="#f97316" stopOpacity="0" />
                            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.6" />
                          </linearGradient>
                        </defs>
                        <circle cx="24" cy="24" r="22" fill="none" stroke="url(#nb-glow-grad)" strokeWidth="1.5" strokeDasharray="8 6" className="animate-rotateGlow" />
                        <circle cx="24" cy="24" r="16" fill={isDark ? 'rgba(251,191,36,0.08)' : 'rgba(251,191,36,0.12)'} className="animate-breathe" />
                        <path d="M14 30 C14 24, 18 14, 24 14 C30 14, 34 18, 34 24 C34 28, 30 32, 26 30" fill="none" stroke="url(#nb-banana-grad)" strokeWidth="2.5" strokeLinecap="round" className="animate-drawBanana" />
                        <circle cx="18" cy="18" r="1.2" fill="#fbbf24" className="animate-sparkle" style={{ animationDelay: '0ms' }} />
                        <circle cx="32" cy="22" r="1" fill="#f97316" className="animate-sparkle" style={{ animationDelay: '400ms' }} />
                        <circle cx="22" cy="34" r="0.8" fill="#fbbf24" className="animate-sparkle" style={{ animationDelay: '800ms' }} />
                        <circle cx="30" cy="14" r="1" fill="#ef4444" className="animate-sparkle" style={{ animationDelay: '1200ms' }} />
                      </svg>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        正在生成图片...
                      </span>
                      <span className={`text-[11px] sm:text-xs tabular-nums ${isDark ? 'text-amber-400/70' : 'text-amber-600/70'}`}>
                        {(elapsedTime / 1000).toFixed(1)}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 灯箱预览 */}
      <ImageLightbox src={previewSrc} onClose={() => setPreviewSrc(null)} />
    </>
  );
};

export default ImageGallery;
