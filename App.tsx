// App.tsx — NanoBanana Studio 根组件

import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { Theme, GalleryItem, ImageGenMode } from './types';
import { LS_API_KEY, LS_THEME, LS_GALLERY, STYLE_PRESETS } from './constants';
import { generateImage } from './services/imageGenService';
import { saveImage } from './services/imageStore';
import KeySetup from './components/KeySetup';
import Header from './components/Header';
import ImageGallery from './components/ImageGallery';
import PromptBar from './components/PromptBar';

const App: React.FC = () => {
  // ── State ──────────────────────────────────────────────
  const [apiKey, setApiKey] = useState<string | null>(() => localStorage.getItem(LS_API_KEY));
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(LS_THEME) as Theme) || 'dark');
  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const raw = localStorage.getItem(LS_GALLERY);
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>();
  const abortRef = useRef<AbortController | null>(null);

  // ── Theme sync ─────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_THEME, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // ── Gallery persistence ────────────────────────────────
  useEffect(() => {
    localStorage.setItem(LS_GALLERY, JSON.stringify(gallery));
  }, [gallery]);

  // ── Handlers ───────────────────────────────────────────

  const handleSetApiKey = useCallback((key: string) => {
    localStorage.setItem(LS_API_KEY, key);
    setApiKey(key);
  }, []);

  const handleChangeKey = useCallback(() => {
    localStorage.removeItem(LS_API_KEY);
    setApiKey(null);
  }, []);

  const handleToggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  const handleClearGallery = useCallback(() => {
    if (confirm('确定要清空所有历史记录吗？此操作不可撤销。')) {
      setGallery([]);
    }
  }, []);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsGenerating(false);
    setCurrentPrompt(undefined);
  }, []);

  const handleGenerate = useCallback(async (params: {
    prompt: string;
    mode: ImageGenMode;
    aspectRatio: string;
    size: string;
    styleId: string;
    optimizePrompt: boolean;
    optimizePresetId: string;
    inputImage?: string;
    inputImageMimeType?: string;
  }) => {
    if (!apiKey || isGenerating) return;

    // 拼接风格前缀
    const style = STYLE_PRESETS.find(s => s.id === params.styleId);
    const prefix = style?.prefix || '';
    const fullPrompt = prefix ? `${prefix}${params.prompt}` : params.prompt;

    setIsGenerating(true);
    setCurrentPrompt(params.prompt);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      // 保存输入图片到 IndexedDB
      let inputImageRef: string | undefined;
      if (params.inputImage) {
        inputImageRef = await saveImage(params.inputImage);
      }

      const result = await generateImage(
        apiKey,
        {
          mode: params.mode,
          prompt: fullPrompt,
          aspectRatio: params.aspectRatio,
          size: params.size,
          inputImage: params.inputImage,
          inputImageMimeType: params.inputImageMimeType,
          optimizePrompt: params.optimizePrompt,
          optimizePresetId: params.optimizePresetId,
        },
        controller.signal,
      );

      if (result.success && result.imageData) {
        const imageRef = await saveImage(result.imageData);
        const item: GalleryItem = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          timestamp: Date.now(),
          prompt: params.prompt,
          optimizedPrompt: result.optimizedPrompt,
          aspectRatio: params.aspectRatio,
          size: params.size,
          mode: params.mode,
          imageRef,
          elapsed: result.elapsed,
          inputImageRef,
        };
        setGallery(prev => [...prev, item]);
      } else {
        alert(`生成失败: ${result.error || '未知错误'}`);
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      alert(`生成出错: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setIsGenerating(false);
      setCurrentPrompt(undefined);
      abortRef.current = null;
    }
  }, [apiKey, isGenerating]);

  // ── Render ─────────────────────────────────────────────

  // 未设置 API Key → 显示引导界面
  if (!apiKey) {
    return (
      <div className="h-full">
        <KeySetup theme={theme} onSubmit={handleSetApiKey} />
      </div>
    );
  }

  // 主界面
  return (
    <div className="h-full flex flex-col">
      <Header
        theme={theme}
        onToggleTheme={handleToggleTheme}
        onChangeKey={handleChangeKey}
        onClearGallery={handleClearGallery}
      />
      <ImageGallery
        theme={theme}
        items={gallery}
        isGenerating={isGenerating}
        currentPrompt={currentPrompt}
      />
      <PromptBar
        theme={theme}
        isGenerating={isGenerating}
        onGenerate={handleGenerate}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default App;
