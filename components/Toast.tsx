import React, { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'warning' | 'item';
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const colors = {
    info: 'border-cyan-500 text-cyan-300 bg-cyan-950/80',
    warning: 'border-red-500 text-red-300 bg-red-950/80',
    item: 'border-amber-500 text-amber-300 bg-amber-950/80',
  };

  return (
    <div className={`
      pointer-events-none fixed top-24 right-4 md:right-8 z-50 
      flex items-center gap-3 p-3 min-w-[200px] border-l-4 
      shadow-[0_0_15px_rgba(0,0,0,0.5)] backdrop-blur-md
      font-['Share_Tech_Mono'] animate-in slide-in-from-right-10 fade-in duration-300
      ${colors[type]}
    `}>
      <div className={`w-2 h-2 rounded-full animate-pulse ${
        type === 'warning' ? 'bg-red-500' : type === 'item' ? 'bg-amber-500' : 'bg-cyan-500'
      }`}></div>
      <span>{message}</span>
    </div>
  );
};

export default Toast;