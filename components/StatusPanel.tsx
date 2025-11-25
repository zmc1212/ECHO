import React from 'react';
import { PlayerStats, InventoryItem } from '../types';

interface StatusPanelProps {
  stats: PlayerStats;
  inventory: InventoryItem[];
}

const StatusPanel: React.FC<StatusPanelProps> = ({ stats, inventory }) => {
  // Helper for progress bars
  const Bar = ({ value, color, label }: { value: number; color: string; label: string }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-['Share_Tech_Mono'] uppercase mb-1">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-4 w-full bg-gray-900 border border-gray-700 p-[2px]">
        <div 
          className={`h-full ${color}`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
    </div>
  );

  return (
    <div className="hidden lg:flex flex-col w-80 border-l-2 border-amber-900/50 pl-6 bg-black/40">
      
      {/* Decorative Header */}
      <div className="border-b-2 border-amber-500 pb-2 mb-6">
        <h2 className="text-amber-500 font-['Share_Tech_Mono'] text-2xl uppercase tracking-widest">Sys_Monitor</h2>
        <div className="text-xs text-amber-700 font-['VT323']">ID: SUBJ-8921 // ORBITAL</div>
      </div>

      {/* Stats */}
      <div className="mb-8">
        <Bar value={stats.health} color="bg-amber-500" label="Vitals" />
        <Bar value={stats.sanity} color="bg-cyan-500" label="Neural Stability" />
        
        <div className="mt-4 border border-amber-800 p-2 bg-amber-900/10">
          <div className="text-xs text-amber-600 font-['Share_Tech_Mono'] uppercase">Current Location</div>
          <div className="text-amber-400 font-['VT323'] text-xl blink">{stats.location}</div>
        </div>
      </div>

      {/* Inventory */}
      <div className="flex-1">
        <h3 className="text-amber-500 font-['Share_Tech_Mono'] text-lg uppercase mb-2 border-b border-amber-800/50">Inventory</h3>
        <ul className="space-y-2 font-['VT323'] text-lg text-amber-300/80">
          {inventory.length === 0 ? (
            <li className="italic opacity-50">Empty...</li>
          ) : (
            inventory.map(item => (
              <li key={item.id} className="flex justify-between hover:bg-amber-900/20 px-1 cursor-default">
                <span>{item.name}</span>
                <span>x{item.quantity}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Decorative Footer Graph */}
      <div className="h-32 border border-amber-900/50 mt-4 relative overflow-hidden opacity-50">
        <div className="absolute inset-0 flex items-end justify-between px-1">
           {Array.from({ length: 20 }).map((_, i) => (
             <div 
                key={i} 
                className="w-2 bg-amber-700/50 animate-pulse"
                style={{ 
                  height: `${Math.random() * 100}%`,
                  animationDuration: `${0.5 + Math.random()}s`
                }} 
              />
           ))}
        </div>
        <div className="absolute top-1 left-1 text-[10px] text-amber-800 font-['Share_Tech_Mono']">
          BACKGROUND_RADIATION
        </div>
      </div>
    </div>
  );
};

export default StatusPanel;