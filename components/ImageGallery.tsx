// components/ImageGallery.tsx — 图片消息流展示（响应式）

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Theme, GalleryItem } from '../types';
import { loadImage } from '../services/imageStore';
import { ArrowDownTrayIcon } from './Icons';

interface ImageGalleryProps {
  theme: Theme;
  items: GalleryItem[];
  isGenerating: boolean;
  currentPrompt?: string;
}

/** 单个图片卡片 */
const GalleryCard: React.FC<{ item: GalleryItem; theme: Theme }> = ({ item, theme }) => {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const isDark = theme === 'dark';

  useEffect(() => {
    loadImage(item.imageRef).then(src => setImgSrc(src));
  }, [item.imageRef]);

  const handleDownload = useCallback(() => {
    if (!imgSrc) return;
    const a = document.createElement('a');
    a.href = imgSrc;
    const ext = imgSrc.startsWith('data:image/png') ? 'png' : 'jpg';
    a.download = `nanoBanana_${item.id}.${ext}`;
    a.click();
  }, [imgSrc, item.id]);

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
          <div className={`flex items-center gap-2 mt-1 sm:mt-1.5 text-[10px] ${isDark ? 'text-amber-400/60' : 'text-amber-600/60'}`}>
            <span>{item.aspectRatio}</span>
            <span>{item.size}</span>
            {item.mode === 'img2img' && <span>图生图</span>}
          </div>
        </div>
      </div>

      {/* 优化后的提示词（如果有） */}
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

      {/* AI 生成的图片 */}
      <div className="flex justify-start mb-4">
        <div className={`max-w-[90%] sm:max-w-[85%] rounded-2xl rounded-tl-md overflow-hidden shadow-lg ${
          isDark ? 'bg-[#2a2a28]' : 'bg-white'
        }`}>
          {imgSrc ? (
            <div className="relative group">
              <img
                src={imgSrc}
                alt={item.prompt}
                className="w-full max-h-[60vh] sm:max-h-[500px] object-contain"
                loading="lazy"
              />
              {/* Download button — 移动端始终可见 */}
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
          {/* Meta info */}
          <div className={`px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10px] flex items-center gap-1.5 sm:gap-2 ${
            isDark ? 'text-gray-500 border-t border-gray-700/30' : 'text-gray-400 border-t border-gray-100'
          }`}>
            <span>耗时 {elapsedStr}</span>
            <span>·</span>
            <span>{item.aspectRatio}</span>
            <span>·</span>
            <span>{item.size}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ImageGallery: React.FC<ImageGalleryProps> = ({ theme, items, isGenerating, currentPrompt }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDark = theme === 'dark';

  // 自动滚动到底部
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items.length, isGenerating]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6"
    >
      <div className="max-w-2xl mx-auto">
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
          <GalleryCard key={item.id} item={item} theme={theme} />
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
                </div>
              </div>
            )}
            <div className="flex justify-start mb-4">
              <div className={`rounded-2xl rounded-tl-md px-4 sm:px-6 py-3 sm:py-4 ${
                isDark ? 'bg-[#2a2a28]' : 'bg-white shadow-sm'
              }`}>
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulseDot" style={{ animationDelay: '0ms' }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulseDot" style={{ animationDelay: '300ms' }} />
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-500 animate-pulseDot" style={{ animationDelay: '600ms' }} />
                  </div>
                  <span className={`text-[11px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    正在生成图片...
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageGallery;
