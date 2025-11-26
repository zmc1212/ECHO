
import React, { useState, useEffect } from 'react';
import { CharacterPreset } from '../types';
import { audioService } from '../services/audioService';

interface CharacterSelectionProps {
  onSelect: (character: CharacterPreset) => void;
}

const CHARACTERS: CharacterPreset[] = [
  {
    id: 'char_youth',
    name: '李明 (Li Ming)',
    role: '活力青年',
    description: '充满好奇心的大学生。体能充沛，但性格有些急躁。来九真山是为了打卡拍照。',
    color: 'text-cyan-500 border-cyan-500/50 bg-cyan-950/30',
    stats: { health: 120, sanity: 80 },
    inventory: [{ id: 'itm_camera', name: '单反相机', quantity: 1 }],
    lore: [
       "秘密: 他的相机里其实只有一张照片，是他前女友的背影。",
       "状态: 昨晚只睡了3小时，靠功能饮料维持清醒。",
       "目标: 只要能拍到一张爆款照片发朋友圈，怎么都行。"
    ]
  },
  {
    id: 'char_pro',
    name: '王强 (Mr. Wang)',
    role: '沉稳职员',
    description: '长期加班的企业高管。身体亚健康，但处事冷静。希望能在这里寻找养生之道。',
    color: 'text-amber-500 border-amber-500/50 bg-amber-950/30',
    stats: { health: 70, sanity: 110 },
    inventory: [{ id: 'itm_thermos', name: '保温杯', quantity: 1 }],
    lore: [
      "习惯: 每隔15分钟就会下意识地看一眼手腕，即使没戴表。",
      "背包: 保温杯里装的不是茶，而是高浓度的黑咖啡。",
      "恐惧: 最怕听到的声音是手机默认的来电铃声。"
    ]
  },
  {
    id: 'char_elder',
    name: '张老 (Grandpa)',
    role: '和蔼长者',
    description: '退休的大学教授。博古通今，身体虽弱但精神矍铄。对道家文化颇有研究。',
    color: 'text-green-500 border-green-500/50 bg-green-950/30',
    stats: { health: 60, sanity: 140 },
    inventory: [{ id: 'itm_stick', name: '登山杖', quantity: 1 }],
    lore: [
      "传闻: 据说他年轻时曾登上过昆仑山的无人区。",
      "收藏: 随身带着一本发黄的《道德经》，上面写满了批注。",
      "体质: 虽然看着瘦弱，但走起山路来比年轻人还稳。"
    ]
  }
];

const CharacterSelection: React.FC<CharacterSelectionProps> = ({ onSelect }) => {
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loreIndex, setLoreIndex] = useState(0);

  useEffect(() => {
    // Randomize which lore snippet is shown per session
    setLoreIndex(Math.floor(Math.random() * 3));
  }, []);

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
    <div className="flex flex-col items-center justify-center h-full w-full z-20 overflow-hidden relative pb-safe-bottom">
      
      {/* Header */}
      <div className="text-center mb-4 md:mb-8 animate-in fade-in zoom-in duration-1000 shrink-0 mt-4 md:mt-0">
        <h2 className="text-2xl md:text-3xl font-['Share_Tech_Mono'] text-white tracking-[0.2em] mb-1 md:mb-2 drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
          SIMULATION_INIT
        </h2>
        <div className="text-amber-600 font-['Noto_Serif_SC'] text-xs md:text-sm">
          互动小说体验：《九真仙境》 // 请选择您的体验身份
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-8 items-center justify-center w-full max-w-5xl px-4 flex-1 md:flex-initial min-h-0 overflow-y-auto md:overflow-visible py-2">
        {CHARACTERS.map((char, index) => {
          const isRevealed = revealed[char.id];
          const isSelected = selectedId === char.id;
          
          return (
            <div 
              key={char.id}
              className={`
                relative group cursor-pointer perspective-1000 transition-all duration-300 shrink-0
                w-full md:w-64 
                h-24 md:h-96 
                ${isSelected ? 'scale-[1.02] md:scale-105 z-30 ring-1 ring-white/50' : 'hover:scale-[1.01] md:hover:scale-105 z-10'}
              `}
              onClick={() => handleCardClick(char)}
            >
              <div className={`relative w-full h-full duration-700 preserve-3d transition-transform ${isRevealed ? 'rotate-y-180' : ''}`}>
                
                {/* BACK OF CARD (Encrypted State) */}
                <div className="absolute inset-0 backface-hidden w-full h-full bg-black border-2 border-gray-800 flex md:flex-col items-center justify-center md:justify-center p-4 overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] gap-4 md:gap-0">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(50,50,50,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[shine_3s_infinite]"></div>
                  
                  {/* Icon */}
                  <div className="w-10 h-10 md:w-16 md:h-16 border-2 border-dashed border-gray-600 rounded-full animate-spin-slow flex items-center justify-center shrink-0">
                    <div className="w-6 h-6 md:w-10 md:h-10 bg-gray-800 rotate-45"></div>
                  </div>
                  
                  {/* Text */}
                  <div className="flex flex-col items-start md:items-center">
                    <div className="font-['Share_Tech_Mono'] text-gray-500 text-lg animate-pulse">LOADING</div>
                    <div className="font-['Share_Tech_Mono'] text-gray-700 text-xs mt-0 md:mt-2">USER_PROFILE_0{index + 1}</div>
                  </div>

                   {/* Hover Secret (Desktop only) */}
                  <div className="hidden md:block absolute bottom-4 text-[10px] font-['Share_Tech_Mono'] text-red-900 opacity-0 group-hover:opacity-100 transition-opacity">
                      DATA_LEAK: SEGMENT_{loreIndex + 1}
                  </div>
                </div>

                {/* FRONT OF CARD (Revealed State) */}
                <div className={`absolute inset-0 backface-hidden rotate-y-180 w-full h-full bg-black border-2 flex flex-row md:flex-col p-3 md:p-4 shadow-[0_0_30px_rgba(0,0,0,0.5)] ${char.color} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-black' : ''}`}>
                   {/* Holographic overlay */}
                   <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0)_100%)] bg-[length:100%_4px] pointer-events-none z-0 opacity-20"></div>
                   
                   <div className="relative z-10 flex-1 flex flex-row md:flex-col justify-between md:justify-start items-center md:items-stretch gap-4 md:gap-0 min-h-0">
                      
                      {/* Left Side (Mobile) / Top (Desktop) */}
                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="text-[10px] md:text-xs font-['Share_Tech_Mono'] opacity-70 mb-0 md:mb-1">ARCHETYPE: {char.role}</div>
                        <h3 className="text-lg md:text-2xl font-['Noto_Serif_SC'] font-bold mb-1 md:mb-4 border-b border-current/30 md:border-current pb-1 md:pb-2 truncate">{char.name}</h3>
                        
                        {/* Description */}
                        <div className="hidden md:block flex-1 text-sm font-['Noto_Serif_SC'] opacity-90 leading-relaxed overflow-y-auto scrollbar-none">
                          {char.description}
                        </div>

                        {/* Lore Snippet (Visible on hover/reveal) */}
                        <div className="hidden md:block mt-4 p-2 bg-black/20 border border-dashed border-current/30 text-xs font-['Noto_Serif_SC'] italic opacity-80">
                           <span className="font-['Share_Tech_Mono'] text-[10px] opacity-50 block mb-1">SECRET_NOTE //</span>
                           "{char.lore?.[loreIndex]}"
                        </div>
                      </div>

                      {/* Right Side (Mobile) / Bottom (Desktop) */}
                      <div className="md:mt-4 space-y-1 md:space-y-2 text-[10px] md:text-xs font-['Share_Tech_Mono'] shrink-0 min-w-[80px] md:min-w-0 text-right md:text-left">
                        <div className="flex flex-col md:flex-row justify-between border-b md:border-b border-current/30 pb-1">
                          <span>PHY (体能)</span>
                          <span>{char.stats.health}</span>
                        </div>
                         <div className="flex flex-col md:flex-row justify-between border-b md:border-b border-current/30 pb-1">
                          <span>MNT (精神)</span>
                          <span>{char.stats.sanity}</span>
                        </div>
                        <div className="pt-1 truncate max-w-[100px] md:max-w-none">
                          {char.inventory[0].name}
                        </div>
                      </div>
                   </div>
                   
                   {isSelected && (
                     <div className="absolute bottom-2 right-2 text-white animate-pulse hidden md:block">
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

      {/* Confirm Button */}
      <div className="shrink-0 mt-2 md:mt-8 mb-4 min-h-[60px] flex items-center">
        {selectedId ? (
          <button 
            onClick={confirmSelection}
            className="px-6 md:px-8 py-2 md:py-3 bg-amber-600 hover:bg-amber-500 text-black font-['Share_Tech_Mono'] font-bold tracking-widest uppercase transition-all hover:scale-105 active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.5)] z-30 animate-in slide-in-from-bottom-4 text-sm md:text-base"
          >
            START_STORY &gt;&gt;
          </button>
        ) : (
          <div className="text-gray-600 font-['Share_Tech_Mono'] text-xs animate-pulse">
            [ WAITING FOR SELECTION ]
          </div>
        )}
      </div>

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
