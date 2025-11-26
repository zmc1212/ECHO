
import React from 'react';
import { audioService } from '../services/audioService';

interface ScanModalProps {
  title: string;
  content: string;
  onClose: () => void;
}

const ScanModal: React.FC<ScanModalProps> = ({ title, content, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Window */}
      <div className="relative w-full max-w-lg bg-black/90 border-2 border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-in zoom-in-95 duration-300 overflow-hidden">
        
        {/* Animated Scanline Background */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_50%,transparent_50%)] bg-[length:100%_4px] pointer-events-none"></div>
        
        {/* Header */}
        <div className="flex items-center justify-between bg-cyan-950/40 p-3 border-b border-cyan-500/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
            <h3 className="font-['Share_Tech_Mono'] text-cyan-400 text-lg tracking-widest uppercase">
              SCAN_RESULT // {title}
            </h3>
          </div>
          <button 
            onClick={() => {
              audioService.playSelect();
              onClose();
            }}
            className="text-cyan-600 hover:text-cyan-300 transition-colors font-['Share_Tech_Mono']"
          >
            [CLOSE]
          </button>
        </div>

        {/* Content */}
        <div className="p-6 font-['Noto_Serif_SC'] text-cyan-100 text-lg leading-relaxed relative z-10">
           {/* Decorative corner markers */}
           <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/30"></div>
           <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/30"></div>
           <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/30"></div>
           <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/30"></div>

           {content}
        </div>

        {/* Footer */}
        <div className="bg-cyan-950/20 p-2 border-t border-cyan-500/30 flex justify-between items-center text-[10px] font-['Share_Tech_Mono'] text-cyan-700">
           <span>DATA_INTEGRITY: 100%</span>
           <span className="animate-pulse">ANALYSIS_COMPLETE</span>
        </div>
      </div>
    </div>
  );
};

export default ScanModal;
