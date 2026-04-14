// components/Modal.tsx — 通用模态框（替代浏览器原生 alert / confirm）

import React, { useEffect } from 'react';
import type { Theme } from '../types';

export interface ModalConfig {
  title: string;
  message: string;
  variant?: 'info' | 'warning' | 'error';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
}

interface ModalProps {
  open: boolean;
  theme: Theme;
  config: ModalConfig;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ open, theme, config, onClose }) => {
  const { title, message, variant = 'info', confirmText = '确定', cancelText = '取消', onConfirm } = config;
  const isDark = theme === 'dark';
  const isConfirm = !!onConfirm;

  useEffect(() => {
    if (!open) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handle);
    return () => window.removeEventListener('keydown', handle);
  }, [open, onClose]);

  if (!open) return null;

  const handleConfirm = () => {
    onConfirm?.();
    onClose();
  };

  const isError = variant === 'error';

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4" onClick={onClose}>
      <div
        className={`w-full max-w-[340px] rounded-2xl shadow-2xl animate-modalIn overflow-hidden ${isDark ? 'bg-[#2a2a28]' : 'bg-white'}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center pt-6 pb-2">
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            isError ? (isDark ? 'bg-red-500/15' : 'bg-red-50') : (isDark ? 'bg-amber-500/15' : 'bg-amber-50')
          }`}>
            {isError ? (
              <svg className={`w-5 h-5 ${isDark ? 'text-red-400' : 'text-red-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            ) : (
              <svg className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            )}
          </div>
        </div>

        {/* Text */}
        <div className="px-6 pb-5 text-center">
          <h3 className={`text-sm font-semibold mb-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>{title}</h3>
          <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{message}</p>
        </div>

        {/* Actions */}
        <div className={`flex border-t ${isDark ? 'border-gray-700/50' : 'border-gray-100'}`}>
          {isConfirm && (
            <button
              onClick={onClose}
              className={`flex-1 py-3 text-xs font-medium transition-colors ${
                isDark ? 'text-gray-400 hover:bg-[#333331] active:bg-[#3a3a38]' : 'text-gray-500 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {cancelText}
            </button>
          )}
          {isConfirm && <div className={`w-px ${isDark ? 'bg-gray-700/50' : 'bg-gray-100'}`} />}
          <button
            onClick={isConfirm ? handleConfirm : onClose}
            className={`flex-1 py-3 text-xs font-semibold transition-colors ${
              isError
                ? (isDark ? 'text-red-400 hover:bg-red-500/10 active:bg-red-500/20' : 'text-red-500 hover:bg-red-50 active:bg-red-100')
                : (isDark ? 'text-amber-400 hover:bg-amber-500/10 active:bg-amber-500/20' : 'text-amber-600 hover:bg-amber-50 active:bg-amber-100')
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
