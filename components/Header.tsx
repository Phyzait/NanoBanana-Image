// components/Header.tsx — 顶部导航栏（响应式）

import React, { useState } from 'react';
import type { Theme } from '../types';
import { SunIcon, MoonIcon, CogIcon, KeyIcon, TrashIcon } from './Icons';

interface HeaderProps {
  theme: Theme;
  onToggleTheme: () => void;
  onChangeKey: () => void;
  onClearGallery: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, onToggleTheme, onChangeKey, onClearGallery }) => {
  const [showMenu, setShowMenu] = useState(false);
  const isDark = theme === 'dark';

  return (
    <header className={`flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 border-b flex-shrink-0 ${
      isDark ? 'bg-[#1e1e1c] border-gray-700/50' : 'bg-white border-gray-200'
    }`}>
      {/* Logo & Title */}
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-lg sm:text-xl flex-shrink-0">🍌</span>
        <h1 className={`text-sm sm:text-base font-semibold truncate ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
          NanoBanana Studio
        </h1>
        <span className={`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
          isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
        }`}>
          Gemini 3 Pro
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
        {/* Theme Toggle */}
        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'hover:bg-[#3a3a38] text-gray-400 active:bg-[#3a3a38]' : 'hover:bg-gray-100 text-gray-500 active:bg-gray-100'
          }`}
          title={isDark ? '切换亮色模式' : '切换暗色模式'}
        >
          {isDark ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
        </button>

        {/* Settings Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3a3a38] text-gray-400 active:bg-[#3a3a38]' : 'hover:bg-gray-100 text-gray-500 active:bg-gray-100'
            }`}
            title="设置"
          >
            <CogIcon className="w-[18px] h-[18px]" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
              <div className={`absolute right-0 top-full mt-2 z-50 w-48 rounded-xl shadow-xl border py-1 ${
                isDark ? 'bg-[#2e2e2c] border-gray-700/80' : 'bg-white border-gray-200'
              }`}>
                <button
                  onClick={() => { onChangeKey(); setShowMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                    isDark ? 'text-gray-300 hover:bg-[#3a3a38]' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <KeyIcon className="w-3.5 h-3.5" />
                  修改 API Key
                </button>
                <button
                  onClick={() => { onClearGallery(); setShowMenu(false); }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                    isDark ? 'text-red-400 hover:bg-[#3a3a38]' : 'text-red-500 hover:bg-gray-50'
                  }`}
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                  清空历史记录
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
