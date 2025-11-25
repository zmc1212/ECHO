import React, { useState, useEffect } from 'react';
import CRTLayer from './components/CRTLayer';
import TerminalOutput from './components/TerminalOutput';
import StatusPanel from './components/StatusPanel';
import ChoicePanel from './components/ChoicePanel';
import CharacterSelection from './components/CharacterSelection';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';
import { Message, GameStatus, PlayerStats, InventoryItem, CharacterPreset } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  // Start in Character Selection Mode
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.CHARACTER_SELECT);
  
  const [stats, setStats] = useState<PlayerStats>({
    name: 'Unknown',
    role: 'None',
    health: 100,
    sanity: 100,
    credits: 0,
    location: '低温休眠仓'
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  // Boot Sequence Logic (triggered after character selection)
  const runBootSequence = async () => {
    setGameStatus(GameStatus.BOOTING);
    const bootLines = [
      "BIOS 自检... 通过",
      "加载神经连接接口... 完成",
      "正在建立上行链路...",
      "警告：检测到记忆碎片丢失",
      "系统重置完成。"
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
    // Start game automatically
    handleAction("启动唤醒程序");
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

  const handleAction = async (actionText: string) => {
    // 1. Play sound & UI update
    if (gameStatus === GameStatus.RUNNING) {
      // audioService.playBoot(); // Removed redundant call
    }
    setIsProcessing(true);
    setChoices([]); // Clear previous choices

    // 2. Add User Message (if not initial boot)
    if (actionText !== "启动唤醒程序") {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'user',
        text: actionText,
        timestamp: new Date().toLocaleTimeString('zh-CN')
      }]);
    }

    try {
      // 3. Call AI
      const response = await geminiService.sendAction(actionText);

      // 4. Update Stats if present
      if (response.stats_update) {
        setStats(prev => ({ ...prev, ...response.stats_update }));
        if (response.stats_update.health && response.stats_update.health < stats.health) {
          audioService.playAlert();
        }
      }

      // 5. Update Inventory if present
      if (response.item_update) {
        setInventory(prev => {
          const newInv = [...prev];
          response.item_update?.forEach(newItem => {
            const existing = newInv.find(i => i.name === newItem.name);
            if (existing) {
              existing.quantity += newItem.quantity;
            } else {
              newInv.push(newItem);
            }
          });
          return newInv;
        });
      }

      // 6. Type out narrative
      await typeWriterEffect(response.narrative, Math.random().toString());

      // 7. Show Choices
      setChoices(response.choices);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'system',
        text: "严重错误: 信号丢失。正在尝试重连...",
        timestamp: new Date().toLocaleTimeString('zh-CN')
      }]);
      setChoices([{ id: 'retry', text: '重新连接', type: 'action' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CRTLayer>
      {gameStatus === GameStatus.CHARACTER_SELECT ? (
        <CharacterSelection onSelect={handleCharacterSelect} />
      ) : (
        <div className="flex h-full gap-6 select-none animate-in fade-in duration-1000">
          
          {/* Main Interface */}
          <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative">
            
            {/* Header */}
            <header className="border-b-2 border-amber-500/50 mb-2 pb-2 flex justify-between items-end shrink-0">
              <div>
                <h1 className="text-3xl md:text-4xl text-amber-500 font-['Noto_Serif_SC'] font-bold tracking-widest drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
                  协议：回声
                </h1>
                <span className="text-xs text-amber-800 font-['Share_Tech_Mono']">PROJECT_ECHO // V.2.1.0</span>
              </div>
              
              <div className="flex flex-col items-end gap-1 text-xs font-['Share_Tech_Mono'] text-amber-700">
                <span className={isProcessing || isTyping ? "animate-pulse text-amber-400" : ""}>
                  STATUS: {isProcessing ? "数据演算中..." : isTyping ? "接收传输..." : "待机"}
                </span>
                <span>UPLINK: <span className="text-green-600">STABLE</span></span>
              </div>
            </header>

            {/* Terminal Output */}
            <div className="flex-1 flex flex-col min-h-0 relative">
               {/* Gradient fade at top */}
               <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black to-transparent pointer-events-none z-10"></div>
               
               <TerminalOutput messages={messages} />
            </div>

            {/* Interaction Area (Choices) */}
            <div className="shrink-0 pt-4 pb-2 min-h-[160px]">
              {isProcessing || isTyping ? (
                 <div className="h-full flex flex-col items-center justify-center text-amber-900/50 font-['Share_Tech_Mono'] animate-pulse gap-2">
                   <div className="w-12 h-1 bg-amber-900/50 animate-[scanline_1s_infinite]"></div>
                   <span>{isProcessing ? "CALCULATING PROBABILITIES..." : "DECRYPTING..."}</span>
                 </div>
              ) : (
                 <ChoicePanel 
                   choices={choices} 
                   onSelect={handleAction} 
                   disabled={isProcessing} 
                 />
              )}
            </div>
          </div>

          {/* Side Panel (Desktop only) */}
          <StatusPanel stats={stats} inventory={inventory} />
        </div>
      )}
      
      {/* Mobile Stats Floating (Only in game) */}
      {gameStatus !== GameStatus.CHARACTER_SELECT && (
        <div className="lg:hidden absolute top-4 right-4 text-amber-500 font-['Share_Tech_Mono'] text-xs border border-amber-500 bg-black/80 px-2 py-1 z-50">
          HP: {stats.health}%
        </div>
      )}

    </CRTLayer>
  );
};

export default App;