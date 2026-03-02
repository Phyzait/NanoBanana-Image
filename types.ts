// types.ts — NanoBanana Studio 类型定义

export type Theme = 'light' | 'dark';
export type ImageGenMode = 'text2img' | 'img2img';

export interface ImageGenRequest {
  mode: ImageGenMode;
  prompt: string;
  aspectRatio: string;
  size?: string;              // '1K' | '2K' | '4K'
  inputImage?: string;        // img2img: base64 data URI
  inputImageMimeType?: string;
  optimizePrompt?: boolean;
  optimizePresetId?: string;
}

export interface ImageGenResult {
  success: boolean;
  imageData?: string;         // base64 data URI
  elapsed: number;
  error?: string;
  optimizedPrompt?: string;
}

export interface ImageOptimizePreset {
  id: string;
  name: string;
  description: string;
  instruction: string;
}

/** 一条图片生成记录（展示在画廊中） */
export interface GalleryItem {
  id: string;
  timestamp: number;
  prompt: string;
  optimizedPrompt?: string;
  aspectRatio: string;
  size: string;
  mode: ImageGenMode;
  /** IndexedDB 引用或 base64 data URI */
  imageRef: string;
  elapsed: number;
  /** 输入图片引用（img2img） */
  inputImageRef?: string;
}
