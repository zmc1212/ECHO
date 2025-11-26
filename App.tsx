import React, { useState, useEffect } from 'react';
import CRTLayer from './components/CRTLayer';
import TerminalOutput from './components/TerminalOutput';
import StatusPanel from './components/StatusPanel';
import ChoicePanel from './components/ChoicePanel';
import CharacterSelection from './components/CharacterSelection';
import GameOver from './components/GameOver';
import Toast from './components/Toast';
import SceneScanner from './components/SceneScanner'; // Import new component
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';
import { Message, GameStatus, PlayerStats, InventoryItem, CharacterPreset, SceneObject } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [sceneObjects, setSceneObjects] = useState<SceneObject[]>([]); // New state
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Visual Effects State
  const [isShaking, setIsShaking] = useState(false);
  const [showDamageOverlay, setShowDamageOverlay] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'info' | 'warning' | 'item'} | null>(null);

  // Mobile State
  const [isMobileStatsOpen, setIsMobileStatsOpen] = useState(false);

  // Start in Character Selection Mode
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.CHARACTER_SELECT);
  
  const [stats, setStats] = useState<PlayerStats>({
    name: 'Unknown',
    role: 'None',
    health: 100,
    sanity: 100,
    credits: 0,
    location: '虚拟大厅'
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Boot Sequence Logic (triggered after character selection)
  const runBootSequence = async () => {
    setGameStatus(GameStatus.BOOTING);
    setMessages([]); // Clear previous messages
    const bootLines = [
      "载入 VR 引擎... 100%",
      "正在连接《九真仙境》服务器...",
      "下载地形数据包 [JIUZHEN_MT_V4.2]... 完成",
      "同步感官反馈系统...",
      "警告：检测到局部气象数据异常 (预设剧情事件)",
      "模拟开始。祝您旅途愉快。"
    ];

    for (const line of bootLines) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'system',
        text: line,
        timestamp: new Date().toLocaleTimeString('zh-CN')
      }]);
      await new Promise(r => setTimeout(r, 600));
    }

    setGameStatus(GameStatus.RUNNING);
    // Start game automatically with scenic entry
    handleAction("进入九真山景区");
  };

  const handleCharacterSelect = (preset: CharacterPreset) => {
    setStats(prev => ({
      ...prev,
      name: preset.name,
      role: preset.role,
      health: preset.stats.health || 100,
      sanity: preset.stats.sanity || 100,
    }));
    setInventory(preset.inventory);
    
    runBootSequence();
  };

  const restartGame = () => {
    setGameStatus(GameStatus.CHARACTER_SELECT);
    setMessages([]);
    setChoices([]);
    setSceneObjects([]);
    setInventory([]);
    setIsMobileStatsOpen(false);
  };

  // Typewriter effect handler
  const typeWriterEffect = async (text: string, msgId: string) => {
    setIsTyping(true);
    let currentText = "";
    const chars = text.split("");
    
    // Create the message container first
    setMessages(prev => [...prev, {
      id: msgId,
      role: 'model',
      text: '',
      timestamp: new Date().toLocaleTimeString('zh-CN')
    }]);

    for (let i = 0; i < chars.length; i++) {
      currentText += chars[i];
      // Play sound every few chars
      if (i % 3 === 0) audioService.playTyping();
      
      setMessages(prev => prev.map(m => 
        m.id === msgId ? { ...m, text: currentText } : m
      ));
      
      // Variable speed for realism
      const delay = Math.random() * 20 + 10;
      await new Promise(r => setTimeout(r, delay));
    }
    setIsTyping(false);
  };

  const triggerDamageEffect = () => {
    setIsShaking(true);
    setShowDamageOverlay(true);
    audioService.playDamage();
    setTimeout(() => setIsShaking(false), 500); // Stop shaking
    setTimeout(() => setShowDamageOverlay(false), 800); // Fade out red
  };

  const handleScan = (obj: SceneObject) => {
     handleAction(`系统扫描目标：${obj.name}`);
  };

  const handleUseItem = (item: InventoryItem) => {
     handleAction(`使用道具：${item.name}`);
  };

  const handleAction = async (actionText: string) => {
    // 1. Play sound & UI update
    if (gameStatus === GameStatus.RUNNING) {
      // audioService.playBoot(); // Removed redundant call
    }
    setIsProcessing(true);
    setChoices([]); // Clear previous choices
    // Only clear scene objects if moving or taking major action, but usually safer to refresh
    setSceneObjects([]); 

    // 2. Add User Message (if not initial boot)
    if (actionText !== "进入九真山景区") {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'user',
        text: actionText,
        timestamp: new Date().toLocaleTimeString('zh-CN')
      }]);
    }

    try {
      // 3. Call AI - PASSING CURRENT CONTEXT (Stats + Inventory)
      const response = await geminiService.sendAction(actionText, { stats, inventory });

      // 4. Update Stats if present
      if (response.stats_update) {
        setStats(prev => {
          let newHealth = prev.health;
          
          // Check for damage
          if (response.stats_update?.health !== undefined) {
             newHealth = response.stats_update.health;
             if (newHealth < prev.health) {
                triggerDamageEffect();
             }
          }
          
          // CRITICAL: Check for death
          if (newHealth <= 0) {
            setGameStatus(GameStatus.TERMINATED);
            // We still update state to 0 for display
            return { ...prev, ...response.stats_update, health: 0 };
          }

          return { ...prev, ...response.stats_update };
        });
      }

      // If terminated, stop processing (don't show narrative/choices)
      if (gameStatus === GameStatus.TERMINATED) {
         setIsProcessing(false);
         return; 
      }

      // 5. Update Inventory if present
      if (response.item_update) {
        setInventory(prev => {
          const newInv = [...prev];
          response.item_update?.forEach(newItem => {
            const existing = newInv.find(i => i.name === newItem.name);
            
            // Check for item usage (negative quantity)
            if (newItem.quantity < 0) {
              setToast({ msg: `已消耗: ${newItem.name}`, type: 'item' });
              audioService.playItemUse();
            } else if (newItem.quantity > 0) {
              setToast({ msg: `获得道具: ${newItem.name}`, type: 'info' });
            }

            if (existing) {
              existing.quantity += newItem.quantity;
            } else {
              if (newItem.quantity > 0) newInv.push(newItem);
            }
          });
          // Filter out 0 quantity items
          return newInv.filter(i => i.quantity > 0);
        });
      }

      // 6. Update Scene Objects
      if (response.scene_objects) {
         setSceneObjects(response.scene_objects);
      }

      // 7. Type out narrative
      await typeWriterEffect(response.narrative, Math.random().toString());

      // 8. Show Choices
      setChoices(response.choices);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'system',
        text: "严重错误: 模拟数据流中断。正在尝试重连...",
        timestamp: new Date().toLocaleTimeString('zh-CN')
      }]);
      setChoices([{ id: 'retry', text: '重新连接', type: 'action' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CRTLayer className={isShaking ? "animate-shake" : ""}>
      
      {/* Damage Overlay (Blood Flash) */}
      {showDamageOverlay && (
        <div className="absolute inset-0 bg-red-900/40 pointer-events-none z-50 animate-blood-flash mix-blend-overlay"></div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.msg} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Render based on Game Status */}
      {gameStatus === GameStatus.CHARACTER_SELECT ? (
        <CharacterSelection onSelect={handleCharacterSelect} />
      ) : gameStatus === GameStatus.TERMINATED ? (
        <GameOver onRestart={restartGame} />
      ) : (
        <div className="flex h-full gap-6 select-none animate-in fade-in duration-1000 relative">
          
          {/* Main Interface */}
          <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative z-10">
            
            {/* Header */}
            <header className="border-b-2 border-amber-500/50 mb-2 pb-2 flex justify-between items-end shrink-0 gap-2">
              <div className="min-w-0">
                <h1 className="text-2xl md:text-4xl text-amber-500 font-['Noto_Serif_SC'] font-bold tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.8)] truncate">
                  九真仙境
                </h1>
                <span className="text-[10px] md:text-xs text-amber-800 font-['Share_Tech_Mono']">JIUZHEN_FAIRYLAND // V.4.2</span>
              </div>
              
              <div className="flex flex-col items-end gap-1 text-xs font-['Share_Tech_Mono'] text-amber-700 shrink-0">
                {/* Mobile Stats Toggle */}
                <button 
                   onClick={() => setIsMobileStatsOpen(true)}
                   className="lg:hidden text-amber-500 border border-amber-500/50 px-2 py-0.5 mb-1 bg-amber-950/30 hover:bg-amber-900/50 active:scale-95 transition-all"
                >
                   [状态栏]
                </button>

                <span className={`hidden md:inline ${isProcessing || isTyping ? "animate-pulse text-amber-400" : ""}`}>
                  STATUS: {isProcessing ? "PROCESSING..." : isTyping ? "STREAMING..." : "STANDBY"}
                </span>
                <span className="hidden md:inline">UPLINK: <span className="text-green-600">STABLE</span></span>
              </div>
            </header>

            {/* Terminal Output */}
            <div className="flex-1 flex flex-col min-h-0 relative">
               {/* Gradient fade at top */}
               <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"></div>
               
               <TerminalOutput messages={messages} />
            </div>

            {/* Interaction Area */}
            <div className="shrink-0 pt-4 pb-safe-bottom min-h-[180px]">
              {isProcessing || isTyping ? (
                 <div className="h-full flex flex-col items-center justify-center text-amber-900/50 font-['Share_Tech_Mono'] animate-pulse gap-2">
                   <div className="w-12 h-1 bg-amber-900/50 animate-[scanline_1s_infinite]"></div>
                   <span>{isProcessing ? "RENDERING ENVIRONMENT..." : "DECODING MYTHOLOGY..."}</span>
                 </div>
              ) : (
                <>
                 {/* Scene Scanner (AR HUD) */}
                 <SceneScanner 
                    objects={sceneObjects} 
                    onScan={handleScan} 
                    disabled={isProcessing} 
                 />
                 
                 {/* Action Choices */}
                 <ChoicePanel 
                   choices={choices} 
                   onSelect={handleAction} 
                   disabled={isProcessing} 
                 />
                </>
              )}
            </div>
          </div>

          {/* Side Panel (Desktop: Fixed / Mobile: Drawer) */}
          <StatusPanel 
            stats={stats} 
            inventory={inventory} 
            isOpen={isMobileStatsOpen}
            onClose={() => setIsMobileStatsOpen(false)}
            onUseItem={handleUseItem}
            disabled={isProcessing || isTyping}
          />
        </div>
      )}
      
      {/* Mobile Stats Floating Overlay (Quick View) */}
      {gameStatus === GameStatus.RUNNING && !isMobileStatsOpen && (
        <div className="lg:hidden absolute top-4 right-2 text-[10px] font-['Share_Tech_Mono'] flex flex-col items-end gap-1 z-0 pointer-events-none opacity-50">
           <span className="text-amber-600">HP: {stats.health}%</span>
           <span className="text-cyan-700">SAN: {stats.sanity}%</span>
        </div>
      )}

    </CRTLayer>
  );
};

export default App;