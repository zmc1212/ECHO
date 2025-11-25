import React, { useState, useEffect, useCallback, useRef } from 'react';
import CRTLayer from './components/CRTLayer';
import TerminalOutput from './components/TerminalOutput';
import StatusPanel from './components/StatusPanel';
import ChoicePanel from './components/ChoicePanel';
import { geminiService } from './services/geminiService';
import { audioService } from './services/audioService';
import { Message, GameStatus, PlayerStats, InventoryItem } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [choices, setChoices] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.BOOTING);
  
  const [stats, setStats] = useState<PlayerStats>({
    health: 100,
    sanity: 100,
    credits: 50,
    location: 'CRYO_STASIS'
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'Identity Chip', quantity: 1 }
  ]);

  // Initial Boot Sequence
  useEffect(() => {
    const bootSequence = async () => {
      // Audio needs user interaction usually, but we prepare structure
      const bootLines = [
        "BIOS CHECK... OK",
        "LOADING NEURAL INTERFACE...",
        "ESTABLISHING UPLINK..."
      ];

      for (const line of bootLines) {
        setMessages(prev => [...prev, {
          id: Math.random().toString(),
          role: 'system',
          text: line,
          timestamp: new Date().toLocaleTimeString()
        }]);
        await new Promise(r => setTimeout(r, 800));
      }

      setGameStatus(GameStatus.RUNNING);
      // Start game automatically
      handleAction("INITIATE_WAKEUP_SEQUENCE");
    };

    bootSequence();
  }, []);

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
      timestamp: new Date().toLocaleTimeString()
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
      audioService.playBoot(); // Ensure audio context is unlocked
    }
    setIsProcessing(true);
    setChoices([]); // Clear previous choices

    // 2. Add User Message (if not initial boot)
    if (actionText !== "INITIATE_WAKEUP_SEQUENCE") {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'user',
        text: actionText,
        timestamp: new Date().toLocaleTimeString()
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

      // 5. Type out narrative
      await typeWriterEffect(response.narrative, Math.random().toString());

      // 6. Show Choices
      setChoices(response.choices);

    } catch (error) {
      setMessages(prev => [...prev, {
        id: Math.random().toString(),
        role: 'system',
        text: "CRITICAL FAILURE: LINK LOST.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <CRTLayer>
      <div className="flex h-full gap-6 select-none">
        
        {/* Main Interface */}
        <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative">
          
          {/* Header */}
          <header className="border-b-2 border-amber-500/50 mb-2 pb-2 flex justify-between items-end shrink-0">
            <h1 className="text-3xl md:text-4xl text-amber-500 font-['Share_Tech_Mono'] tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
              Protocol: ECHO
            </h1>
            <div className="flex gap-4 text-xs font-['Share_Tech_Mono'] text-amber-700">
              <span className={isProcessing || isTyping ? "animate-pulse text-amber-400" : ""}>
                {isProcessing ? "PROCESSING..." : isTyping ? "RECEIVING..." : "IDLE"}
              </span>
              <span>UPLINK: STABLE</span>
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
               <div className="h-full flex items-center justify-center text-amber-900/50 font-['Share_Tech_Mono'] animate-pulse">
                 {isProcessing ? "Calculating probabilities..." : "Decryption in progress..."}
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
      
      {/* Mobile Stats Floating (Click to see more could be added later) */}
      <div className="lg:hidden absolute top-4 right-4 text-amber-500 font-['Share_Tech_Mono'] text-xs border border-amber-500 bg-black/80 px-2 py-1 z-50">
        HP: {stats.health}%
      </div>

    </CRTLayer>
  );
};

export default App;