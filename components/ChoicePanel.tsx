
import React from 'react';
import { audioService } from '../services/audioService';

interface Choice {
  id: string;
  text: string;
  type?: 'action' | 'investigate' | 'danger' | 'use_item';
}

interface ChoicePanelProps {
  choices: Choice[];
  onSelect: (choice: string) => void;
  disabled: boolean;
}

const ChoicePanel: React.FC<ChoicePanelProps> = ({ choices, onSelect, disabled }) => {
  if (choices.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 perspective-1000">
      {choices.map((choice, index) => (
        <button
          key={choice.id}
          disabled={disabled}
          onMouseEnter={() => !disabled && audioService.playHover()}
          onClick={() => {
            if (choice.type === 'use_item') {
              audioService.playItemUse();
            } else {
              audioService.playSelect();
            }
            onSelect(choice.text);
          }}
          className={`
            group relative z-20 overflow-hidden p-4 border-2 transition-all duration-300 ease-out transform cursor-pointer backdrop-blur-md
            hover:scale-[1.02] hover:-translate-y-1 active:scale-95 active:translate-y-0
            disabled:opacity-50 disabled:cursor-not-allowed
            opacity-0 animate-[slideUp_0.5s_ease-out_forwards]
            ${
              choice.type === 'danger' 
                ? 'border-red-600/60 hover:border-red-500 bg-red-950/40' 
                : choice.type === 'investigate'
                ? 'border-cyan-600/60 hover:border-cyan-400 bg-cyan-950/40'
                : choice.type === 'use_item'
                ? 'border-emerald-600/60 hover:border-emerald-400 bg-emerald-950/40'
                : 'border-amber-600/60 hover:border-amber-400 bg-amber-950/40'
            }
          `}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          {/* Background Scanline for button */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shine_1.5s_infinite]"></div>
          
          <div className="flex items-center justify-between relative z-30">
            <span className={`font-['VT323'] text-2xl uppercase tracking-wider ${
               choice.type === 'danger' ? 'text-red-400 group-hover:text-red-200' : 
               choice.type === 'investigate' ? 'text-cyan-400 group-hover:text-cyan-200' :
               choice.type === 'use_item' ? 'text-emerald-400 group-hover:text-emerald-200' :
               'text-amber-500 group-hover:text-amber-200'
            }`}>
              {choice.text}
            </span>
            <span className="font-['Share_Tech_Mono'] text-xs opacity-50 group-hover:opacity-100 transition-opacity">
              [CMD_{index + 1}]
            </span>
          </div>

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-current opacity-50"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-current opacity-50"></div>
        </button>
      ))}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shine {
          0% { background-position: 100% 0%; }
          100% { background-position: 0% 100%; }
        }
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default ChoicePanel;
