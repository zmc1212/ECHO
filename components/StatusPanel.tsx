import React from 'react';
import { PlayerStats, InventoryItem } from '../types';
import { audioService } from '../services/audioService';

interface StatusPanelProps {
  stats: PlayerStats;
  inventory: InventoryItem[];
  isOpen?: boolean;     // For mobile toggle
  onClose?: () => void; // For mobile toggle
  onUseItem?: (item: InventoryItem) => void; // New prop for handling item usage
  disabled?: boolean;
}

const StatusPanel: React.FC<StatusPanelProps> = ({ stats, inventory, isOpen = false, onClose, onUseItem, disabled }) => {
  // Helper for progress bars
  const Bar = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <div className="mb-4 group">
      <div className="flex justify-between text-sm font-['Noto_Serif_SC'] text-amber-700 group-hover:text-amber-500 transition-colors mb-1">
        <span>{label}</span>
        <span className="font-['Share_Tech_Mono']">{value}%</span>
      </div>
      <div className="h-3 w-full bg-gray-900 border border-gray-800 p-[1px] relative overflow-hidden">
        {/* Grid background for bar */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_20%,rgba(0,0,0,0.8)_21%)] bg-[length:4px_100%] z-10 pointer-events-none"></div>
        <div 
          className={`h-full ${color} transition-all duration-700 ease-out`} 
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Main Panel */}
      <div className={`
        fixed lg:static inset-y-0 right-0 z-50 w-80 
        border-l-2 border-amber-900/30 bg-black/95 lg:bg-black/40 lg:backdrop-blur-sm
        transform transition-transform duration-300 ease-in-out
        flex flex-col pl-6 pr-4 py-6
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
      `}>
        
        {/* Mobile Close Button */}
        <div className="lg:hidden absolute top-4 right-4">
          <button onClick={onClose} className="text-amber-700 hover:text-amber-500 font-['Share_Tech_Mono']">
            [CLOSE_PANEL]
          </button>
        </div>

        {/* Decorative Header */}
        <div className="border-b border-amber-800/50 pb-4 mb-6 relative mt-6 lg:mt-0">
          <h2 className="text-amber-500 font-['Share_Tech_Mono'] text-xl uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-amber-500 animate-pulse"></span>
            BIO_MONITOR
          </h2>
          <div className="text-xs text-amber-700 font-['Noto_Serif_SC'] mt-1">生体监测终端 // 在线</div>
        </div>

        {/* Character Info */}
        <div className="mb-6 p-3 bg-amber-950/20 border border-amber-900/40 relative overflow-hidden">
           <div className="absolute -right-4 -top-4 text-6xl text-amber-900/20 font-['Share_Tech_Mono'] rotate-12 select-none">ID</div>
           
           <div className="space-y-2 relative z-10">
             <div>
               <div className="text-[10px] text-amber-700 uppercase tracking-wider">SUBJECT NAME / 姓名</div>
               <div className="text-amber-400 font-['Noto_Serif_SC'] text-lg border-b border-dashed border-amber-800/50 pb-1">
                 {stats.name}
               </div>
             </div>
             <div>
               <div className="text-[10px] text-amber-700 uppercase tracking-wider">CURRENT LOC / 位置</div>
               <div className="text-amber-300 font-['Noto_Serif_SC'] animate-pulse">
                 {stats.location}
               </div>
             </div>
           </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <Bar value={stats.health} color="bg-gradient-to-r from-amber-600 to-amber-400" label="生命体征 (HP)" />
          <Bar value={stats.sanity} color="bg-gradient-to-r from-cyan-700 to-cyan-400" label="精神阈值 (SAN)" />
        </div>

        {/* Inventory */}
        <div className="flex-1 flex flex-col min-h-0">
          <h3 className="text-amber-600 font-['Share_Tech_Mono'] text-sm uppercase mb-3 flex items-center justify-between border-b border-amber-800/30 pb-1">
            <span>INVENTORY / 物品</span>
            <span className="text-[10px]">{inventory.length} ITEMS</span>
          </h3>
          
          <div className="overflow-y-auto pr-2 space-y-2 scrollbar-thin scrollbar-thumb-amber-900/50 h-full">
            {inventory.length === 0 ? (
              <div className="text-amber-900 italic text-sm text-center py-4 border border-dashed border-amber-900/30">
                [ 容器为空 ]
              </div>
            ) : (
              inventory.map((item, idx) => (
                <div 
                  key={item.id + idx} 
                  className="relative flex justify-between items-center p-2 bg-amber-900/10 border border-amber-800/30 hover:border-amber-500/50 hover:bg-amber-900/20 transition-all group overflow-hidden"
                >
                  <div className="flex items-center gap-2 relative z-10">
                    <div className="w-1 h-3 bg-amber-700/50 group-hover:bg-amber-400 transition-colors"></div>
                    <span className="font-['Noto_Serif_SC'] text-amber-300/90 text-sm">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2 relative z-10">
                    <span className="font-['Share_Tech_Mono'] text-amber-600 text-xs bg-black/50 px-1 border border-amber-900/50">
                      x{item.quantity}
                    </span>
                    
                    {/* USE Button - Appears on hover or always accessible */}
                    <button
                      disabled={disabled}
                      onClick={() => {
                        if (onUseItem) {
                          audioService.playSelect();
                          onUseItem(item);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 disabled:opacity-0 focus:opacity-100 transition-opacity bg-amber-600 text-black text-[10px] font-bold font-['Share_Tech_Mono'] px-2 py-0.5 hover:bg-amber-400 uppercase"
                    >
                      USE
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer Visual */}
        <div className="mt-4 pt-2 border-t border-amber-900/30">
          <div className="flex justify-between text-[10px] text-amber-800 font-['Share_Tech_Mono'] mb-1">
             <span>RADIATION</span>
             <span>0.004 mSv</span>
          </div>
          <div className="flex gap-[2px] h-4">
             {Array.from({ length: 30 }).map((_, i) => (
               <div 
                  key={i} 
                  className={`flex-1 ${Math.random() > 0.7 ? 'bg-amber-600' : 'bg-amber-900/30'} animate-pulse`}
                  style={{ animationDelay: `${Math.random()}s` }}
               />
             ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default StatusPanel;