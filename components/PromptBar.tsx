// components/PromptBar.tsx — 底部输入栏 + 控制面板（响应式）

import React, { useState, useRef, useCallback } from 'react';
import type { Theme, ImageGenMode } from '../types';
import { ASPECT_RATIOS, SIZE_OPTIONS, STYLE_PRESETS, IMAGE_OPTIMIZE_PRESETS } from '../constants';
import { SparklesIcon, SendIcon, PhotoIcon, XMarkIcon, PaintBrushIcon, StopIcon, ArrowUpTrayIcon } from './Icons';
import CustomDropdown from './CustomDropdown';

interface PromptBarProps {
  theme: Theme;
  isGenerating: boolean;
  onGenerate: (params: {
    prompt: string;
    mode: ImageGenMode;
    aspectRatio: string;
    size: string;
    styleId: string;
    optimizePrompt: boolean;
    optimizePresetId: string;
    inputImage?: string;
    inputImageMimeType?: string;
  }) => void;
  onCancel: () => void;
}

const PromptBar: React.FC<PromptBarProps> = ({ theme, isGenerating, onGenerate, onCancel }) => {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<ImageGenMode>('text2img');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [size, setSize] = useState('2K');
  const [styleId, setStyleId] = useState('none');
  const [optimizeEnabled, setOptimizeEnabled] = useState(true);
  const [optimizePresetId, setOptimizePresetId] = useState('default');
  const [inputImage, setInputImage] = useState<string | undefined>();
  const [inputImageMimeType, setInputImageMimeType] = useState<string | undefined>();
  const [showOptimizePresets, setShowOptimizePresets] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isDark = theme === 'dark';

  const handleSubmit = useCallback(() => {
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;
    onGenerate({
      prompt: trimmed,
      mode,
      aspectRatio,
      size,
      styleId,
      optimizePrompt: optimizeEnabled,
      optimizePresetId,
      inputImage,
      inputImageMimeType,
    });
    setPrompt('');
    setInputImage(undefined);
    setInputImageMimeType(undefined);
  }, [prompt, isGenerating, onGenerate, mode, aspectRatio, size, styleId, optimizeEnabled, optimizePresetId, inputImage, inputImageMimeType]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !(e as unknown as { isComposing: boolean }).isComposing && e.keyCode !== 229) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setInputImageMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setInputImage(reader.result as string);
      setMode('img2img');
    };
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeInputImage = () => {
    setInputImage(undefined);
    setInputImageMimeType(undefined);
    setMode('text2img');
  };

  const activeStyle = STYLE_PRESETS.find(s => s.id === styleId);
  const activeOptPreset = IMAGE_OPTIMIZE_PRESETS.find(p => p.id === optimizePresetId);

  const aspectOptions = ASPECT_RATIOS.map(r => ({ id: r, name: r }));
  const sizeOptions = SIZE_OPTIONS.map(s => ({ id: s, name: s }));
  const styleOptions = STYLE_PRESETS.map(s => ({ id: s.id, name: s.name }));

  return (
    <div className={`border-t flex-shrink-0 safe-bottom ${isDark ? 'bg-[#1e1e1c] border-gray-700/50' : 'bg-white border-gray-200'}`}>
      {/* 上传的图片预览 */}
      {inputImage && (
        <div className="px-3 sm:px-4 pt-2.5 sm:pt-3">
          <div className="relative inline-block">
            <img
              src={inputImage}
              alt="参考图"
              className="h-14 w-14 sm:h-16 sm:w-16 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
            />
            <button
              onClick={removeInputImage}
              className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 active:bg-red-700"
            >
              <XMarkIcon className="w-3 h-3" />
            </button>
            <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 text-[9px] px-1.5 py-0.5 rounded-full whitespace-nowrap ${
              isDark ? 'bg-blue-900/50 text-blue-300' : 'bg-blue-100 text-blue-600'
            }`}>
              图生图
            </span>
          </div>
        </div>
      )}

      {/* 控制栏 — 移动端横向滚动 */}
      <div className="px-3 sm:px-4 pt-2.5 sm:pt-3 pb-1.5 sm:pb-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
          {/* 风格选择 */}
          <CustomDropdown
            options={styleOptions}
            selectedValue={styleId}
            onChange={setStyleId}
            theme={theme}
            ariaLabel="选择风格"
            direction="up"
            buttonText={activeStyle?.name || '风格'}
          />

          {/* 比例选择 */}
          <CustomDropdown
            options={aspectOptions}
            selectedValue={aspectRatio}
            onChange={setAspectRatio}
            theme={theme}
            ariaLabel="选择宽高比"
            direction="up"
          />

          {/* 分辨率选择 */}
          <CustomDropdown
            options={sizeOptions}
            selectedValue={size}
            onChange={setSize}
            theme={theme}
            ariaLabel="选择分辨率"
            direction="up"
          />

          {/* 提示词优化开关 */}
          <div className="relative">
            <button
              onClick={() => setOptimizeEnabled(!optimizeEnabled)}
              onContextMenu={(e) => { e.preventDefault(); setShowOptimizePresets(!showOptimizePresets); }}
              className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                optimizeEnabled
                  ? (isDark ? 'bg-amber-900/40 text-amber-300 hover:bg-amber-900/60' : 'bg-amber-100 text-amber-700 hover:bg-amber-200')
                  : (isDark ? 'bg-transparent text-gray-500 hover:bg-[#3a3a38]' : 'bg-transparent text-gray-400 hover:bg-gray-100')
              }`}
              title={`AI 优化: ${optimizeEnabled ? '开启' : '关闭'} (长按切换预设)`}
            >
              <SparklesIcon className="w-3.5 h-3.5" />
              <span>{activeOptPreset?.name || '优化'}</span>
            </button>

            {/* 优化预设弹出 */}
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
                        setOptimizeEnabled(true);
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
            placeholder="描述你想要的图片..."
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

        {/* 发送/取消按钮 */}
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
