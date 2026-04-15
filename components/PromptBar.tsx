// components/PromptBar.tsx — 底部输入栏（支持拖拽 / 粘贴 / 上传图片）

import React, { useState, useRef, useCallback } from 'react';
import type { Theme, ImageGenMode, ImageModel, OptimizeConfig } from '../types';
import { ASPECT_RATIOS, SIZE_OPTIONS, STYLE_PRESETS, IMAGE_OPTIMIZE_PRESETS, IMAGE_MODELS } from '../constants';
import { optimizePrompt } from '../services/imageGenService';
import { SparklesIcon, SendIcon, PhotoIcon, XMarkIcon, PaintBrushIcon, StopIcon, ArrowUpTrayIcon } from './Icons';
import CustomDropdown from './CustomDropdown';

interface PromptBarProps {
  theme: Theme;
  isGenerating: boolean;
  model: ImageModel;
  optimizeConfig: OptimizeConfig;
  onModelChange: (model: string) => void;
  onGenerate: (params: {
    prompt: string;
    mode: ImageGenMode;
    aspectRatio: string;
    size: string;
    styleId: string;
    inputImages?: Array<{ data: string; mimeType: string }>;
  }) => void;
  onCancel: () => void;
  onMessage: (title: string, message: string, variant?: 'info' | 'warning' | 'error') => void;
}

const PromptBar: React.FC<PromptBarProps> = ({ theme, isGenerating, model, optimizeConfig, onModelChange, onGenerate, onCancel, onMessage }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<ImageGenMode>('text2img');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('2K');
  const [styleId, setStyleId] = useState('none');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizePresetId, setOptimizePresetId] = useState('default');
  const [inputImages, setInputImages] = useState<Array<{ data: string; mimeType: string }>>([]);
  const [showOptimizePresets, setShowOptimizePresets] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === 'dark';

  // ── 图片处理通用方法 ─────────────────────────────
  const processImageFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const mimeType = file.type;
    const reader = new FileReader();
    reader.onload = () => {
      setInputImages(prev => [...prev, { data: reader.result as string, mimeType }]);
      setMode('img2img');
    };
    reader.readAsDataURL(file);
  }, []);

  // ── 拖放处理 ─────────────────────────────────────
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.types.includes('Files')) setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  }, [processImageFile]);

  // ── 粘贴处理 ─────────────────────────────────────
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.type.startsWith('image/')) {
        e.preventDefault();
        const file = item.getAsFile();
        if (file) processImageFile(file);
        return;
      }
    }
  }, [processImageFile]);

  // ── 文件上传 ─────────────────────────────────────
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [processImageFile]);

  // ── 提交 / 优化 / 清空 ──────────────────────────
  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;
    onGenerate({
      prompt: trimmed,
      mode,
      aspectRatio,
      size,
      styleId,
      inputImages: inputImages.length > 0 ? inputImages : undefined,
    });
    setPrompt('');
    setInputImages([]);
  }, [prompt, isGenerating, onGenerate, mode, aspectRatio, size, styleId, inputImages]);

  const handleOptimize = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || isOptimizing || isGenerating) return;
    if (!optimizeConfig.apiKey) {
      onMessage('配置缺失', '请先在设置中配置提示词优化 API Key', 'warning');
      return;
    }
    setIsOptimizing(true);
    try {
      const result = await optimizePrompt(optimizeConfig, trimmed, optimizePresetId);
      setPrompt(result);
      requestAnimationFrame(() => {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 112)}px`;
        }
      });
    } catch (e: unknown) {
      onMessage('优化失败', e instanceof Error ? e.message : String(e), 'error');
    } finally {
      setIsOptimizing(false);
    }
  }, [prompt, isOptimizing, isGenerating, optimizeConfig, optimizePresetId, onMessage]);

  const handleClear = useCallback(() => {
    setPrompt('');
    setInputImages([]);
    setMode('text2img');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !(e as unknown as { isComposing: boolean }).isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const removeInputImage = (index: number) => {
    setInputImages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setMode('text2img');
      return next;
    });
  };

  const activeStyle = STYLE_PRESETS.find(s => s.id === styleId);
  const activeOptPreset = IMAGE_OPTIMIZE_PRESETS.find(p => p.id === optimizePresetId);

  const modelOptions = IMAGE_MODELS.map(m => ({ id: m.id, name: m.name, description: m.description }));
  const aspectOptions = ASPECT_RATIOS.map(r => ({ id: r, name: r }));
  const sizeOptions = SIZE_OPTIONS.map(s => ({ id: s, name: s }));
  const styleOptions = STYLE_PRESETS.map(s => ({ id: s.id, name: s.name }));

  return (
    <div
      className={`relative border-t flex-shrink-0 safe-bottom ${isDark ? 'bg-[#1e1e1c] border-gray-700/50' : 'bg-white border-gray-200'}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 拖拽悬浮指示 */}
      {isDragging && (
        <div className={`absolute inset-0 z-10 flex items-center justify-center border-2 border-dashed rounded-t-xl animate-dropPulse ${
          isDark ? 'bg-amber-500/5 border-amber-500/50' : 'bg-amber-50/80 border-amber-400/50'
        }`}>
          <div className="flex flex-col items-center gap-1.5">
            <PhotoIcon className={`w-8 h-8 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} />
            <span className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-600'}`}>拖放图片到这里</span>
            <span className={`text-[11px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>支持 JPG、PNG、WebP</span>
          </div>
        </div>
      )}

      {/* 上传的图片预览 */}
      {inputImages.length > 0 && (
        <div className="px-3 sm:px-4 pt-2.5 sm:pt-3">
          <div className="flex gap-2 overflow-x-auto">
            {inputImages.map((img, idx) => (
              <div key={idx} className={`relative flex-shrink-0 rounded-xl overflow-hidden border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}>
                <img src={img.data} alt={`参考图 ${idx + 1}`} className="h-24 sm:h-32 max-w-[220px] sm:max-w-[280px] object-cover" />
                <button
                  onClick={() => removeInputImage(idx)}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <XMarkIcon className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/60 to-transparent">
                  <span className="text-[10px] text-white/80 font-medium">参考图 {inputImages.length > 1 ? idx + 1 : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 控制栏 */}
      <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1.5 sm:pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          <CustomDropdown options={modelOptions} selectedValue={model} onChange={onModelChange} theme={theme} ariaLabel="选择模型" direction="up" />
          <CustomDropdown options={styleOptions} selectedValue={styleId} onChange={setStyleId} theme={theme} ariaLabel="选择风格" direction="up" buttonText={activeStyle?.name || '风格'} />
          <CustomDropdown options={aspectOptions} selectedValue={aspectRatio} onChange={setAspectRatio} theme={theme} ariaLabel="选择宽高比" direction="up" />
          <CustomDropdown options={sizeOptions} selectedValue={size} onChange={setSize} theme={theme} ariaLabel="选择分辨率" direction="up" />

          {/* 提示词优化按钮 */}
          <div className="relative">
            <button
              onClick={handleOptimize}
              onContextMenu={(e) => { e.preventDefault(); setShowOptimizePresets(!showOptimizePresets); }}
              disabled={!prompt.trim() || isOptimizing || isGenerating}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                isOptimizing
                  ? (isDark ? 'bg-amber-900/50 text-amber-300 animate-pulse' : 'bg-amber-200 text-amber-700 animate-pulse')
                  : prompt.trim() && !isGenerating
                    ? (isDark ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60' : 'bg-amber-100 text-amber-700 hover:bg-amber-200')
                    : (isDark ? 'bg-transparent text-gray-600 cursor-not-allowed' : 'bg-transparent text-gray-300 cursor-not-allowed')
              }`}
              title="点击优化提示词（右键选择预设）"
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{isOptimizing ? '优化中...' : '优化'}</span>
            </button>

            {showOptimizePresets && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowOptimizePresets(false)} />
                <div className={`absolute left-0 bottom-full mb-2 z-50 w-56 rounded-xl shadow-xl border py-1 max-h-[50vh] overflow-y-auto ${
                  isDark ? 'bg-[#2e2e2c] border-gray-700/80' : 'bg-white border-gray-200'
                }`}>
                  <div className={`px-3 py-1.5 text-[10px] font-medium ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    优化预设
                  </div>
                  {IMAGE_OPTIMIZE_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        setOptimizePresetId(preset.id);
                        setShowOptimizePresets(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        preset.id === optimizePresetId
                          ? (isDark ? 'bg-amber-900/30 text-amber-300' : 'bg-amber-50 text-amber-700')
                          : (isDark ? 'text-gray-300 hover:bg-[#3a3a38]' : 'text-gray-700 hover:bg-gray-50')
                      }`}
                    >
                      <span className="font-medium">{preset.name}</span>
                      <span className={`ml-1.5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{preset.description}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* 上传图片按钮 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className={`p-1.5 rounded-lg transition-colors flex-shrink-0 ${
              isDark ? 'text-gray-400 hover:bg-[#3a3a38] hover:text-gray-200 active:bg-[#3a3a38]' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600 active:bg-gray-100'
            }`}
            title="上传参考图（图生图）"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* 清空按钮 */}
      {(prompt.trim() || inputImages.length > 0) && (
        <div className="px-3 sm:px-4 pb-1 flex justify-end">
          <button
            onClick={handleClear}
            className={`text-[11px] px-2 py-0.5 rounded-md transition-colors ${
              isDark ? 'text-gray-500 hover:text-gray-300 hover:bg-[#3a3a38]' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
          >
            清空
          </button>
        </div>
      )}

      {/* 输入栏 */}
      <div className="px-3 sm:px-4 pb-3 sm:pb-4 flex items-end gap-2">
        <div className={`flex-1 relative rounded-2xl border transition-colors ${
          isDark
            ? 'bg-[#2a2a28] border-gray-600 focus-within:border-amber-500/50'
            : 'bg-gray-50 border-gray-200 focus-within:border-amber-500/50'
        }`}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder={inputImages.length > 0 ? '描述你想要的修改...' : '描述你想要的图片，支持粘贴图片...'}
            rows={1}
            className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13px] sm:text-sm resize-none bg-transparent focus:outline-none max-h-28 sm:max-h-32 ${
              isDark ? 'text-gray-100 placeholder:text-gray-500' : 'text-gray-900 placeholder:text-gray-400'
            }`}
            style={{ minHeight: '40px' }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 112)}px`;
            }}
            disabled={isGenerating}
          />
        </div>

        {isGenerating ? (
          <button
            onClick={onCancel}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center transition-colors"
            title="取消生成"
          >
            <StopIcon className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim()}
            className={`flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
              prompt.trim()
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
                : (isDark ? 'bg-[#3a3a38] text-gray-600' : 'bg-gray-200 text-gray-400')
            }`}
            title="生成图片"
          >
            <PaintBrushIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default PromptBar;
