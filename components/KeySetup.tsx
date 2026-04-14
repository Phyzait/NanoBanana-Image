// components/KeySetup.tsx — API Key 输入引导界面（响应式）

import React, { useState } from 'react';
import type { Theme } from '../types';
import { DEFAULT_BASE_URL, normalizeBaseUrl } from '../constants';
import { KeyIcon } from './Icons';

interface KeySetupProps {
  theme: Theme;
  initialKey?: string;
  initialBaseUrl?: string;
  onSubmit: (key: string, baseUrl: string) => void;
  onCancel?: () => void;
}

const KeySetup: React.FC<KeySetupProps> = ({
  theme,
  initialKey = '',
  initialBaseUrl = DEFAULT_BASE_URL,
  onSubmit,
  onCancel,
}) => {
  const [key, setKey] = useState(initialKey);
  const [baseUrl, setBaseUrl] = useState(initialBaseUrl);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    const trimmedBaseUrl = baseUrl.trim();

    if (!trimmed) {
      setError('请输入 API Key');
      return;
    }

    if (trimmedBaseUrl && !/^https?:\/\//i.test(trimmedBaseUrl)) {
      setError('API URL 需要以 http:// 或 https:// 开头');
      return;
    }

    setError('');
    onSubmit(trimmed, normalizeBaseUrl(trimmedBaseUrl));
  };

  const isDark = theme === 'dark';

  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn ${
        isDark ? 'bg-[#2a2a28] border border-gray-700/50' : 'bg-white border border-gray-200'
      }`}>
        {/* Logo + 品牌 */}
        <div className="text-center mb-6 sm:mb-8">
          <img src="/logo.jpeg" alt="IkunImage" className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-3 sm:mb-4 shadow-lg object-cover" />
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            NanoBanana Studio
          </h1>
          <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gemini 3 Pro 图像生成工作室
          </p>
          <p className="mt-2 text-xs">
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}>默认由 </span>
            <a href="https://api.ikuncode.cc/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 hover:underline font-medium">IKunCode</a>
            <span className={isDark ? 'text-gray-500' : 'text-gray-400'}> 提供 API 服务，也可改成你自己的兼容地址</span>
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              API URL
            </label>
            <input
              type="text"
              value={baseUrl}
              onChange={e => setBaseUrl(e.target.value)}
              placeholder={DEFAULT_BASE_URL}
              className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark
                  ? 'bg-[#1a1a1a] border border-gray-600 text-gray-100 placeholder:text-gray-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
            />
            <p className={`mt-1.5 text-[11px] leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              只填接口前缀即可，例如 {DEFAULT_BASE_URL}
            </p>
          </div>

          <div>
            <label className={`block text-xs sm:text-sm font-medium mb-1.5 sm:mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              <KeyIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 inline mr-1.5 -mt-0.5" />
              API Key
            </label>
            <input
              type="password"
              value={key}
              onChange={e => setKey(e.target.value)}
              placeholder="输入你的 API Key..."
              className={`w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
                isDark
                  ? 'bg-[#1a1a1a] border border-gray-600 text-gray-100 placeholder:text-gray-500'
                  : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
              }`}
              autoFocus
            />
            {error && <p className="mt-1.5 text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex gap-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={`flex-1 py-2.5 sm:py-3 rounded-xl text-sm font-medium transition-colors ${
                  isDark ? 'bg-[#3a3a38] text-gray-300 hover:bg-[#444]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                取消
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
            >
              保存并开始
            </button>
          </div>

          <div className={`text-center text-[11px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>
              还没有 Key？
              <a href="https://api.ikuncode.cc/console/token" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:text-amber-400 hover:underline ml-1">前往获取令牌</a>
            </p>
            <p className="mt-1.5">Key 与 URL 仅存储在浏览器本地，不会上传至任何服务器</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KeySetup;
