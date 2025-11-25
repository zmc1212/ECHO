import React, { useState } from 'react';
import { CharacterPreset } from '../types';
import { audioService } from '../services/audioService';

interface CharacterSelectionProps {
  onSelect: (character: CharacterPreset) => void;
}

const CHARACTERS: CharacterPreset[] = [
  {
    id: 'char_security',
    name: '雷诺 (Raynor)',
    role: '安保主管',
    description: '前殖民地防暴部队指挥官。擅长战斗，但因过去的创伤容易精神不稳定。',
    color: 'text-red-500 border-red-500/50 bg-red-950/30',
    stats: { health: 120, sanity: 70 },
    inventory: [{ id: 'wpn_baton', name: '高压电击棍', quantity: 1 }]
  },
  {
    id: 'char_science',
    name: '艾琳 (Erin)',
    role: '异种生物学家',
    description: '对未知生物有极高的理解力。精神韧性极强，但身体素质较弱。',
    color: 'text-cyan-500 border-cyan-500/50 bg-cyan-950/30',
    stats: { health: 80, sanity: 120 },
    inventory: [{ id: 'itm_scanner', name: '生物扫描仪', quantity: 1 }]
  },
  {
    id: 'char_eng',
    name: '也就是 (Isaac)',
    role: '高级工程师',
    description: '空间站维护技师。能够修理机械设备，拥有均衡的各项指标。',
    color: 'text-amber-500 border-amber-500/50 bg-amber-950/30',
    stats: { health: 100, sanity: 100 },
    inventory: [{ id: 'itm_tool', name: '万能维修钳', quantity: 1 }]
  }
];

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCardClick = (char: CharacterPreset) => {
    if (!revealed[char.id]) {
      audioService.playCardFlip();
      // Delay the "reveal" visual slightly for effect
      setTimeout(() => {
        setRevealed(prev => ({ ...prev, [char.id]: true }));
        audioService.playReveal();
      }, 300);
    } else {
      setSelectedId(char.id);
      audioService.playSelect();
    }
  };

  const confirmSelection = () => {
    const char = CHARACTERS.find(c => c.id === selectedId);
    if (char) {
      audioService.playBoot();
      onSelect(char);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full w-full z-20">
      
      <div className="text-center mb-8 animate-in fade-in zoom-in duration-1000">
        <h2 className="text-3xl font-['Share_Tech_Mono'] text-white tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          IDENTITY_RECONSTRUCTION
        </h2>
        <div className="text-amber-600 font-['Noto_Serif_SC'] text-sm">
          检测到意识碎片... 请选择载体进行同步
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center justify-center w-full max-w-5xl px-4">
        {CHARACTERS.map((char, index) => {
          const isRevealed = revealed[char.id];
          const isSelected = selectedId === char.id;
          
          return (
            <div 
              key={char.id}
              className={`relative group cursor-pointer perspective-1000 w-full md:w-64 h-80 transition-all duration-300 ${isSelected ? 'scale-105 z-30' : 'hover:scale-105 z-10'}`}
              onClick={() => handleCardClick(char)}
            >
              <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isRevealed ? 'rotate-y-180' : ''}`}>
                
                {/* BACK OF CARD (Encrypted State) */}
                <div className="absolute inset-0 backface-hidden w-full h-full bg-black border-2 border-gray-800 flex flex-col items-center justify-center p-4 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)]">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(50,50,50,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite]"></div>
                  <div className="w-16 h-16 border-2 border-dashed border-gray-600 rounded-full animate-spin-slow mb-4 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-800 rotate-45"></div>
                  </div>
                  <div className="font-['Share_Tech_Mono'] text-gray-500 text-lg animate-pulse">ENCRYPTED</div>
                  <div className="font-['Share_Tech_Mono'] text-gray-700 text-xs mt-2">DATA_BLOCK_0{index + 1}</div>
                </div>

                {/* FRONT OF CARD (Revealed State) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-black border-2 flex flex-col p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${char.color} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}>
                   {/* Holographic overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20"></div>
                   
                   <div className="relative z-10 flex-1 flex flex-col">
                      <div className="text-xs font-['Share_Tech_Mono'] opacity-70 mb-1">CLASS: {char.role}</div>
                      <h3 className="text-2xl font-['Noto_Serif_SC'] font-bold mb-4 border-b border-current pb-2">{char.name}</h3>
                      
                      <div className="flex-1 text-sm font-['Noto_Serif_SC'] opacity-90 leading-relaxed">
                        {char.description}
                      </div>

                      <div className="mt-4 space-y-2 text-xs font-['Share_Tech_Mono']">
                        <div className="flex justify-between border-b border-current/30 pb-1">
                          <span>HP</span>
                          <span>{char.stats.health}</span>
                        </div>
                         <div className="flex justify-between border-b border-current/30 pb-1">
                          <span>SAN</span>
                          <span>{char.stats.sanity}</span>
                        </div>
                        <div className="pt-1 truncate">
                          ITEM: {char.inventory[0].name}
                        </div>
                      </div>
                   </div>
                   
                   {isSelected && (
                     <div className="absolute bottom-2 right-2 text-white animate-pulse">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                     </div>
                   )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {selectedId && (
        <button 
          onClick={confirmSelection}
          className="mt-12 px-8 py-3 bg-amber-600 hover:bg-amber-500 text-black font-['Share_Tech_Mono'] font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-30 animate-in slide-in-from-bottom-4"
        >
          INITIALIZE_SYNC &gt;&gt;
        </button>
      )}

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
        .animate-spin-slow { animation: spin 4s linear infinite; }
      `}</style>
    </div>
  );
};

export default CharacterSelection;
