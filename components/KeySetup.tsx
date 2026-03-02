// components/KeySetup.tsx — API Key 输入引导界面（响应式）

import React, { useState } from 'react';
import type { Theme } from '../types';
import { KeyIcon } from './Icons';

interface KeySetupProps {
  theme: Theme;
  onSubmit: (key: string) => void;
}

const KeySetup: React.FC<KeySetupProps> = ({ theme, onSubmit }) => {
  const [key, setKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = key.trim();
    if (!trimmed) {
      setError('请输入 API Key');
      return;
    }
    setError('');
    onSubmit(trimmed);
  };

  const isDark = theme === 'dark';

  return (
    <div className="h-full flex items-center justify-center p-4 sm:p-6">
      <div className={`w-full max-w-md rounded-2xl p-6 sm:p-8 shadow-2xl animate-fadeIn ${
        isDark ? 'bg-[#2a2a28] border border-gray-700/50' : 'bg-white border border-gray-200'
      }`}>
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-3 sm:mb-4 shadow-lg">
            <span className="text-2xl sm:text-3xl">🍌</span>
          </div>
          <h1 className={`text-xl sm:text-2xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            NanoBanana Studio
          </h1>
          <p className={`mt-1.5 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Gemini 3 Pro 图像生成工作室
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
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

          <button
            type="submit"
            className="w-full py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium text-sm hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]"
          >
            开始创作
          </button>

          <div className={`text-center text-[11px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <p>默认厂商: api.ikuncode.cc</p>
            <p className="mt-1">Key 仅存储在浏览器本地，不会上传至任何服务器</p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KeySetup;
