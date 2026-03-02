// services/imageGenService.ts
// NanoBanana 图像生成服务 — 单引擎，用户自带 API Key

import type { ImageGenRequest, ImageGenResult } from '../types';
import { DEFAULT_BASE_URL, NANO_MODEL_PATH, OPTIMIZE_MODEL, IMAGE_OPTIMIZE_PRESETS, STYLE_PRESETS } from '../constants';
import { GoogleGenAI } from '@google/genai';

// ── 通用工具 ──────────────────────────────────────────────

const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

async function fetchWithRetry(
  url: string,
  init: RequestInit,
  maxRetries = 2,
  signal?: AbortSignal,
): Promise<Response> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');
    try {
      const res = await fetch(url, { ...init, signal });
      if (res.ok || !RETRYABLE_STATUS.has(res.status)) return res;
      lastError = new Error(`HTTP ${res.status}: ${await res.text()}`);
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e;
      lastError = e instanceof Error ? e : new Error(String(e));
    }
    if (attempt < maxRetries) {
      const delay = Math.min(2 ** attempt * 1000, 30000);
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw lastError ?? new Error('Request failed after retries');
}

// ── 提示词优化 ────────────────────────────────────────────

export async function optimizePrompt(
  apiKey: string,
  rawPrompt: string,
  presetId: string,
  signal?: AbortSignal,
): Promise<string> {
  const preset = IMAGE_OPTIMIZE_PRESETS.find(p => p.id === presetId) ?? IMAGE_OPTIMIZE_PRESETS[0];

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: { baseUrl: DEFAULT_BASE_URL },
  });

  const response = await ai.models.generateContent({
    model: OPTIMIZE_MODEL,
    contents: [{ role: 'user', parts: [{ text: `${preset.instruction}${rawPrompt}` }] }],
  });

  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError');

  const text = response.text?.trim();
  if (!text) throw new Error('提示词优化返回为空');
  return text;
}

// ── 图片生成 ──────────────────────────────────────────────

export async function generateImage(
  apiKey: string,
  req: ImageGenRequest,
  signal?: AbortSignal,
): Promise<ImageGenResult> {
  const start = Date.now();

  // 1. 提示词优化（如果开启）
  let finalPrompt = req.prompt;
  let optimizedPrompt: string | undefined;

  // 风格前缀
  const style = STYLE_PRESETS.find(s => s.id !== 'none' && req.prompt.length > 0) ? undefined : undefined;
  // 由前端在提交前拼接风格前缀，这里不额外处理

  if (req.optimizePrompt && req.optimizePresetId) {
    try {
      optimizedPrompt = await optimizePrompt(apiKey, finalPrompt, req.optimizePresetId, signal);
      finalPrompt = optimizedPrompt;
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === 'AbortError') throw e;
      // 优化失败时使用原始提示词
      console.warn('[NanoBanana] 提示词优化失败，使用原始提示词:', e);
    }
  }

  // 2. 构建请求体
  const parts: Array<Record<string, unknown>> = [{ text: finalPrompt }];

  if (req.mode === 'img2img' && req.inputImage) {
    let base64 = req.inputImage;
    let mimeType = req.inputImageMimeType ?? 'image/jpeg';
    if (base64.startsWith('data:')) {
      const [header, data] = base64.split(',');
      const match = header.match(/data:(image\/\w+);base64/);
      if (match) mimeType = match[1];
      base64 = data;
    }
    parts.push({
      inline_data: { mime_type: mimeType, data: base64 },
    });
  }

  const imageConfig: Record<string, string> = {
    aspectRatio: req.aspectRatio || '1:1',
  };
  if (req.mode !== 'img2img' && req.size) {
    imageConfig.image_size = req.size;
  }

  const body = JSON.stringify({
    contents: [{ parts }],
    generationConfig: {
      responseModalities: ['IMAGE'],
      imageConfig,
    },
  });

  // 3. 调用 API
  const url = `${DEFAULT_BASE_URL}${NANO_MODEL_PATH}`;
  const timeoutMs = req.size === '4K' ? 1200000 : req.size === '1K' ? 360000 : 600000;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  const combinedSignal = signal
    ? (AbortSignal as unknown as { any?: (signals: AbortSignal[]) => AbortSignal }).any?.([signal, controller.signal]) ?? controller.signal
    : controller.signal;

  try {
    const res = await fetchWithRetry(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body,
      },
      2,
      combinedSignal,
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errText = await res.text();
      return {
        success: false,
        elapsed: Date.now() - start,
        error: `API 错误 ${res.status}: ${errText}`,
      };
    }

    const json = await res.json();
    const inlineData = json?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
    if (!inlineData?.data) {
      return {
        success: false,
        elapsed: Date.now() - start,
        error: '响应中无图片数据',
      };
    }

    const mimeType = inlineData.mimeType || 'image/png';
    const dataUri = `data:${mimeType};base64,${inlineData.data}`;

    return {
      success: true,
      imageData: dataUri,
      elapsed: Date.now() - start,
      optimizedPrompt,
    };
  } catch (e: unknown) {
    clearTimeout(timeout);
    if (e instanceof DOMException && e.name === 'AbortError' && signal?.aborted) throw e;
    return {
      success: false,
      elapsed: Date.now() - start,
      error: `生成失败: ${e instanceof Error ? e.message : String(e)}`,
    };
  }
}
