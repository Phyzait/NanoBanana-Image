// components/Header.tsx — 顶部导航栏 + 设置面板

import React, { useState } from 'react';
import type { Theme, ImageModel, OptimizeConfig } from '../types';
import { IMAGE_MODELS } from '../constants';
import { SunIcon, MoonIcon, KeyIcon, TrashIcon, SparklesIcon, Bars3Icon, CogIcon, ClockIcon } from './Icons';

interface HeaderProps {
  theme: Theme;
  model: ImageModel;
  optimizeConfig: OptimizeConfig;
  showSettingsMenu: boolean;
  onToggleTheme: () => void;
  onOpenApiSetup: () => void;
  onClearGallery: () => void;
  onOptimizeConfigChange: (config: OptimizeConfig) => void;
  onToggleSidebar: () => void;
  onToggleSettings: () => void;
  onCloseSettings: () => void;
  onShowHistory: () => void;
}

const Header: React.FC<HeaderProps> = ({
  theme, model, optimizeConfig, showSettingsMenu,
  onToggleTheme, onOpenApiSetup, onClearGallery, onOptimizeConfigChange,
  onToggleSidebar, onToggleSettings, onCloseSettings, onShowHistory,
}) => {
  const [showOptPanel, setShowOptPanel] = useState(false);
  const [tempConfig, setTempConfig] = useState<OptimizeConfig>(optimizeConfig);
  const isDark = theme === 'dark';

  const modelName = IMAGE_MODELS.find(m => m.id === model)?.name || 'NanoBanana Pro';

  const openOptPanel = () => {
    setTempConfig(optimizeConfig);
    setShowOptPanel(true);
    onCloseSettings();
  };

  const saveOptConfig = () => {
    onOptimizeConfigChange(tempConfig);
    setShowOptPanel(false);
  };

  const inputClass = `w-full px-3 py-2 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-amber-500/50 ${
    isDark
      ? 'bg-[#1a1a1a] border border-gray-600 text-gray-100 placeholder:text-gray-500'
      : 'bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400'
  }`;

  return (
    <>
      <header className={`flex items-center justify-between px-3 sm:px-4 h-14 border-b flex-shrink-0 ${
        isDark ? 'bg-[#1e1e1c] border-gray-700/50' : 'bg-white border-gray-200'
      }`}>
        {/* 左侧：汉堡菜单(mobile) + 模型名 */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={onToggleSidebar}
            className={`md:hidden p-1.5 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3a3a38] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="菜单"
          >
            <Bars3Icon className="w-5 h-5" />
          </button>
          <span className={`text-xs sm:text-sm font-medium truncate ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {modelName}
          </span>
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full flex-shrink-0 ${
            isDark ? 'bg-amber-900/30 text-amber-400' : 'bg-amber-100 text-amber-700'
          }`}>
            创建图
          </span>
        </div>

        {/* 右侧：操作按钮 */}
        <div className="flex items-center gap-0.5 sm:gap-1 flex-shrink-0">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3a3a38] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title={isDark ? '切换亮色模式' : '切换暗色模式'}
          >
            {isDark ? <SunIcon className="w-[18px] h-[18px]" /> : <MoonIcon className="w-[18px] h-[18px]" />}
          </button>

          {/* 历史图片 */}
          <button
            onClick={onShowHistory}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3a3a38] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            title="历史图片"
          >
            <ClockIcon className="w-[18px] h-[18px]" />
          </button>

          {/* 清除对话 */}
          <button
            onClick={onClearGallery}
            className={`p-2 rounded-lg transition-colors ${
              isDark ? 'hover:bg-[#3a3a38] text-gray-400 hover:text-red-400' : 'hover:bg-gray-100 text-gray-500 hover:text-red-500'
            }`}
            title="清除对话内容"
          >
            <TrashIcon className="w-[18px] h-[18px]" />
          </button>

          {/* 设置菜单 */}
          <div className="relative">
            <button
              onClick={onToggleSettings}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-[#3a3a38] text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              title="设置"
            >
              <CogIcon className="w-[18px] h-[18px]" />
            </button>

            {showSettingsMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={onCloseSettings} />
                <div className={`absolute right-0 top-full mt-2 z-50 w-52 rounded-xl shadow-xl border py-1 ${
                  isDark ? 'bg-[#2e2e2c] border-gray-700/80' : 'bg-white border-gray-200'
                }`}>
                  <button
                    onClick={openOptPanel}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-[#3a3a38]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    提示词优化设置
                  </button>
                  <button
                    onClick={() => { onOpenApiSetup(); onCloseSettings(); }}
                    className={`w-full flex items-center gap-2 px-3 py-2.5 text-xs transition-colors ${
                      isDark ? 'text-gray-300 hover:bg-[#3a3a38]' : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <KeyIcon className="w-3.5 h-3.5" />
                    API 服务设置
                  </button>
                  <button
                    onClick={() => { onClearGallery(); onCloseSettings(); }}
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

      {/* 提示词优化 API 设置面板 */}
      {showOptPanel && (
        <>
          <div className="fixed inset-0 z-40 bg-black/30" onClick={() => setShowOptPanel(false)} />
          <div className={`fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-80 max-w-[90vw] rounded-2xl p-5 shadow-2xl animate-fadeIn ${
            isDark ? 'bg-[#2a2a28] border border-gray-700/50' : 'bg-white border border-gray-200'
          }`}>
            <h3 className={`text-sm font-semibold mb-4 flex items-center gap-2 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
              <SparklesIcon className="w-4 h-4 text-amber-500" />
              提示词优化 API 设置
            </h3>
            <p className={`text-[11px] mb-4 leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
              配置 OpenAI 兼容格式的 API 用于提示词优化。留空则关闭优化功能。
            </p>
            <div className="space-y-3">
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Base URL</label>
                <input type="text" value={tempConfig.baseUrl} onChange={e => setTempConfig(prev => ({ ...prev, baseUrl: e.target.value }))} placeholder="https://api.openai.com/v1" className={inputClass} />
              </div>
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>API Key</label>
                <input type="password" value={tempConfig.apiKey} onChange={e => setTempConfig(prev => ({ ...prev, apiKey: e.target.value }))} placeholder="sk-..." className={inputClass} />
              </div>
              <div>
                <label className={`block text-[11px] font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>模型名称</label>
                <input type="text" value={tempConfig.model} onChange={e => setTempConfig(prev => ({ ...prev, model: e.target.value }))} placeholder="gpt-4o-mini" className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setShowOptPanel(false)} className={`flex-1 py-2 rounded-xl text-xs font-medium transition-colors ${isDark ? 'bg-[#3a3a38] text-gray-300 hover:bg-[#444]' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>取消</button>
              <button onClick={saveOptConfig} className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-medium hover:from-amber-600 hover:to-orange-600 transition-all shadow-lg shadow-amber-500/25 active:scale-[0.98]">保存</button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default Header;
