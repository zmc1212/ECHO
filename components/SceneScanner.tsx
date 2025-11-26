
import React from 'react';
import { SceneObject } from '../types';
import { audioService } from '../services/audioService';

interface SceneScannerProps {
  objects: SceneObject[];
  onScan: (obj: SceneObject) => void;
  disabled: boolean;
}

const SceneScanner: React.FC<SceneScannerProps> = ({ objects, onScan, disabled }) => {
  if (!objects || objects.length === 0) return null;

  return (
    <div className="mb-4 animate-in fade-in slide-in-from-right duration-700">
      <div className="flex items-center gap-2 mb-2">
         <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
         <span className="text-[10px] font-['Share_Tech_Mono'] text-amber-700 uppercase tracking-widest">
            AR_SCANNER // 环境扫描
         </span>
         <div className="h-[1px] flex-1 bg-amber-900/30"></div>
      </div>
      
      <div className="flex flex-wrap gap-3">
        {objects.map((obj, index) => (
          <button
            key={obj.id + index}
            disabled={disabled}
            onClick={() => {
                audioService.playReveal();
                onScan(obj);
            }}
            className={`
              relative group flex items-center gap-2 px-3 py-1.5 
              border border-dashed transition-all duration-300
              ${obj.type === 'clue' 
                 ? 'border-cyan-700/50 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-900/30' 
                 : obj.type === 'item'
                 ? 'border-amber-700/50 hover:border-amber-400 bg-amber-950/20 hover:bg-amber-900/30'
                 : 'border-gray-700/50 hover:border-gray-400 bg-gray-900/20 hover:bg-gray-800/30'
              }
              disabled:opacity-50 disabled:cursor-not-allowed
            `}
          >
             {/* Reticle Corners */}
             <span className="absolute -top-[1px] -left-[1px] w-1.5 h-1.5 border-t border-l border-current opacity-70"></span>
             <span className="absolute -bottom-[1px] -right-[1px] w-1.5 h-1.5 border-b border-r border-current opacity-70"></span>

             <span className={`text-xs md:text-sm font-['Noto_Serif_SC'] ${
                obj.type === 'clue' ? 'text-cyan-400' : obj.type === 'item' ? 'text-amber-400' : 'text-gray-400'
             }`}>
                {obj.name}
             </span>
             
             {/* Icon based on type */}
             <span className="text-[10px] opacity-60 font-['Share_Tech_Mono'] group-hover:opacity-100">
                {obj.type === 'clue' ? '[?]' : obj.type === 'item' ? '[+]' : '[O]'}
             </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default SceneScanner;
