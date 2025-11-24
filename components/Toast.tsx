
import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckIcon, XMarkIcon, ArrowPathIcon } from './Icons';

type ToastType = 'success' | 'error' | 'loading';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  updateToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('');
  const [type, setType] = useState<ToastType>('success');

  const showToast = useCallback((msg: string, t: ToastType = 'success', duration = 3000) => {
    setMessage(msg);
    setType(t);
    setVisible(true);
    if (t !== 'loading' && duration > 0) {
      setTimeout(() => setVisible(false), duration);
    }
  }, []);

  const updateToast = useCallback((msg: string, t: ToastType) => {
    setMessage(msg);
    setType(t);
    if (t !== 'loading') {
      setTimeout(() => setVisible(false), 3000);
    }
  }, []);

  const hideToast = useCallback(() => setVisible(false), []);

  return (
    <ToastContext.Provider value={{ showToast, updateToast, hideToast }}>
      {children}
      {/* Toast UI - Instagram-like smooth animations */}
      <div
        className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ease-out transform ${visible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-8 opacity-0 scale-90 pointer-events-none'
          }`}
        style={{
          transitionTimingFunction: visible ? 'cubic-bezier(0.175, 0.885, 0.32, 1.275)' : 'cubic-bezier(0.4, 0, 0.2, 1)'
        }}
      >
        <div className={`flex items-center gap-3 px-5 py-3 rounded-full shadow-2xl border backdrop-blur-md min-w-[200px] max-w-[90vw] animate-subtle-bounce
          ${type === 'success' ? 'bg-gray-900/95 dark:bg-white/95 text-white dark:text-black border-transparent' : ''}
          ${type === 'error' ? 'bg-red-500/95 text-white border-red-600' : ''}
          ${type === 'loading' ? 'bg-gray-800/95 text-white border-gray-700' : ''}
        `}>
          {type === 'loading' && <ArrowPathIcon className="w-5 h-5 animate-spin" />}
          {type === 'success' && (
            <div className="relative">
              <CheckIcon className="w-5 h-5 animate-scale-in" />
              <div className="absolute inset-0 bg-white/20 rounded-full animate-ping-once"></div>
            </div>
          )}
          {type === 'error' && <XMarkIcon className="w-5 h-5 animate-shake" />}

          <span className="text-sm font-bold truncate">{message}</span>
        </div>
      </div>
    </ToastContext.Provider>
  );
};
