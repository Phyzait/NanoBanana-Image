// components/CustomDropdown.tsx — Portal 下拉选择组件

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import type { Theme } from '../types';
import { ChevronDownIcon, ChevronUpIcon } from './Icons';

export interface CustomDropdownOption {
  id: string;
  name: string;
  icon?: React.ReactElement<{ className?: string }>;
  description?: string;
}

interface CustomDropdownProps {
  id?: string;
  options: CustomDropdownOption[];
  selectedValue: string;
  onChange: (selectedId: string) => void;
  theme: Theme;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  buttonClassName?: string;
  direction?: 'up' | 'down';
  buttonText?: string;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  id,
  options,
  selectedValue,
  onChange,
  theme,
  disabled = false,
  ariaLabel,
  className = '',
  buttonClassName = '',
  direction = 'down',
  buttonText,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(o => o.id === selectedValue) || options[0] || null;

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!wrapperRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const positionPanel = useCallback(() => {
    if (!buttonRef.current || !panelRef.current) return;
    const btnRect = buttonRef.current.getBoundingClientRect();
    const panel = panelRef.current;
    const panelHeight = panel.offsetHeight;
    const panelWidth = panel.offsetWidth;

    let left = btnRect.left;
    if (left + panelWidth > window.innerWidth - 8) left = window.innerWidth - panelWidth - 8;
    left = Math.max(8, left);
    panel.style.left = `${left}px`;

    if (direction === 'up') {
      let top = btnRect.top - panelHeight - 8;
      if (top < 8) top = btnRect.bottom + 8;
      panel.style.top = `${top}px`;
    } else {
      let top = btnRect.bottom + 8;
      if (top + panelHeight > window.innerHeight - 8) top = btnRect.top - panelHeight - 8;
      panel.style.top = `${top}px`;
    }
  }, [direction]);

  useEffect(() => {
    if (!isOpen) return;
    requestAnimationFrame(positionPanel);
    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };
    const handleResize = () => setIsOpen(false);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleResize);
    };
  }, [isOpen, positionPanel]);

  const handleOptionClick = (optionId: string) => {
    onChange(optionId);
    setIsOpen(false);
  };

  const btnTheme = theme === 'light'
    ? (isOpen ? 'bg-gray-200 text-gray-900' : 'bg-transparent hover:bg-gray-100 text-gray-600 hover:text-gray-900')
    : (isOpen ? 'bg-[#3f3f46] text-gray-100' : 'bg-transparent hover:bg-[#3a3a38] text-gray-400 hover:text-gray-200');

  const panelTheme = theme === 'light'
    ? 'bg-white border-gray-200/80 shadow-gray-200/50'
    : 'bg-[#2e2e2c] border-gray-700/80 shadow-black/50';

  const portalPanel = isOpen ? createPortal(
    <div
      ref={panelRef}
      className={`fixed z-[9999] min-w-[200px] max-w-[320px] rounded-xl shadow-xl max-h-[300px] overflow-y-auto text-sm border ${panelTheme}`}
      role="listbox"
    >
      {options.map((option) => {
        const isSelected = option.id === selectedValue;
        const optTheme = theme === 'light'
          ? `text-gray-700 hover:bg-gray-50 hover:text-gray-900 ${isSelected ? 'bg-gray-50 text-gray-900 border-l-2 border-amber-500' : 'border-l-2 border-transparent'}`
          : `text-gray-300 hover:bg-[#3a3a38] hover:text-gray-100 ${isSelected ? 'bg-[#3a3a38] text-gray-100 border-l-2 border-amber-500' : 'border-l-2 border-transparent'}`;
        return (
          <div
            key={option.id}
            onClick={() => handleOptionClick(option.id)}
            className={`flex items-center px-3 py-2 cursor-pointer transition-colors ${optTheme}`}
            role="option"
            aria-selected={isSelected}
          >
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-xs truncate">{option.name}</span>
              {option.description && (
                <span className="text-[10px] mt-0.5 opacity-60 leading-tight truncate">{option.description}</span>
              )}
            </div>
          </div>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        id={id}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 focus:outline-none ${btnTheme} ${buttonClassName} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
      >
        <span className="truncate max-w-[120px]">
          {buttonText ?? selectedOption?.name ?? '选择...'}
        </span>
        {direction === 'up'
          ? <ChevronUpIcon className={`w-3 h-3 ml-1.5 flex-shrink-0 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          : <ChevronDownIcon className={`w-3 h-3 ml-1.5 flex-shrink-0 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        }
      </button>
      {portalPanel}
    </div>
  );
};

export default CustomDropdown;
