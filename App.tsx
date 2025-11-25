import React, { useState, useEffect, useCallback, useRef } from 'react';
import CRTLayer from './components/CRTLayer';
import TerminalOutput from './components/TerminalOutput';
import StatusPanel from './components/StatusPanel';
import { geminiService } from './services/geminiService';
import { Message, GameStatus, PlayerStats, InventoryItem } from './types';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [gameStatus, setGameStatus] = useState<GameStatus>(GameStatus.BOOTING);
  
  // Mock Stats - In a real app, the LLM could be prompted to return JSON to update these
  const [stats, setStats] = useState<PlayerStats>({
    health: 84,
    sanity: 92,
    credits: 0,
    location: 'CRYO_BAY_04'
  });
  
  const [inventory, setInventory] = useState<InventoryItem[]>([
    { id: '1', name: 'ID Card (Expired)', quantity: 1 }
  ]);

  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Game
  useEffect(() => {
    const bootSequence = async () => {
      // Simulate boot text
      const bootText = [
        "INITIALIZING PROTOCOL: ECHO...",
        "LOADING KERNEL... OK",
        "MOUNTING DRIVES... OK",
        "CONNECTING TO MAINFRAME... SUCCESS",
        "--- INCOMING TRANSMISSION ---"
      ];

      for (const line of bootText) {
        await new Promise(r => setTimeout(r, 600));
        setMessages(prev => [
          ...prev, 
          { 
            id: Math.random().toString(36), 
            role: 'system', 
            text: line, 
            timestamp: new Date().toLocaleTimeString() 
          }
        ]);
      }

      setGameStatus(GameStatus.RUNNING);
      
      // Initial Prompt to AI
      handleAIResponse("Start the simulation. The user just woke up.");
    };

    if (gameStatus === GameStatus.BOOTING) {
      bootSequence();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once

  // Focus input on click
  const focusInput = () => {
    inputRef.current?.focus();
  };

  const handleAIResponse = async (prompt: string) => {
    setIsProcessing(true);
    const newMessageId = Math.random().toString(36);
    
    // Add placeholder message for AI
    setMessages(prev => [
      ...prev,
      {
        id: newMessageId,
        role: 'model',
        text: '',
        timestamp: new Date().toLocaleTimeString(),
        isTyping: true
      }
    ]);

    try {
      const stream = await geminiService.sendMessageStream(prompt);
      let fullText = '';

      for await (const chunk of stream) {
        fullText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === newMessageId 
            ? { ...msg, text: fullText } 
            : msg
        ));
      }

      // Finalize message
      setMessages(prev => prev.map(msg => 
        msg.id === newMessageId 
          ? { ...msg, isTyping: false } 
          : msg
      ));
      
      // Simple heuristic updates for the mock UI stats (just for flavor)
      if (fullText.includes("damage") || fullText.includes("伤害")) {
        setStats(prev => ({ ...prev, health: Math.max(0, prev.health - 10) }));
      }
      if (fullText.includes("fear") || fullText.includes("恐怖")) {
        setStats(prev => ({ ...prev, sanity: Math.max(0, prev.sanity - 5) }));
      }

    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36),
          role: 'system',
          text: `ERROR: CONNECTION SEVERED. ${error}`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setIsProcessing(false);
      // Re-focus input after response
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleSendMessage = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isProcessing) return;

    const userText = inputValue;
    setInputValue('');

    // Add user message
    setMessages(prev => [
      ...prev,
      {
        id: Math.random().toString(36),
        role: 'user',
        text: userText,
        timestamp: new Date().toLocaleTimeString()
      }
    ]);

    // Send to AI
    handleAIResponse(userText);
  }, [inputValue, isProcessing]);

  return (
    <CRTLayer>
      <div className="flex h-full gap-6" onClick={focusInput}>
        
        {/* Main Terminal Area */}
        <div className="flex-1 flex flex-col h-full max-w-4xl mx-auto w-full relative">
          
          {/* Header */}
          <header className="border-b-2 border-amber-500/50 mb-4 pb-2 flex justify-between items-end shrink-0">
            <h1 className="text-4xl text-amber-500 font-['Share_Tech_Mono'] tracking-tighter uppercase drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]">
              Protocol: ECHO
            </h1>
            <div className="flex gap-4 text-xs font-['Share_Tech_Mono'] text-amber-700">
              <span className={isProcessing ? "animate-pulse text-amber-400" : ""}>
                {isProcessing ? "PROCESSING_DATA..." : "AWAITING_INPUT"}
              </span>
              <span>MEM: 64KB OK</span>
            </div>
          </header>

          {/* Chat Output */}
          <TerminalOutput messages={messages} />

          {/* Input Area */}
          <div className="shrink-0 mt-2 bg-black/80 border-2 border-amber-600/50 p-4 shadow-[0_0_15px_rgba(180,83,9,0.2)]">
            <form onSubmit={handleSendMessage} className="flex items-center gap-2">
              <span className="text-amber-500 font-['VT323'] text-2xl animate-pulse">{'>'}</span>
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isProcessing || gameStatus === GameStatus.BOOTING}
                className="w-full bg-transparent border-none outline-none text-amber-500 font-['VT323'] text-2xl placeholder-amber-900/50"
                placeholder={gameStatus === GameStatus.BOOTING ? "INITIALIZING..." : "Enter command..."}
                autoFocus
                autoComplete="off"
              />
              <button 
                type="submit"
                disabled={isProcessing || !inputValue.trim()}
                className="px-4 py-1 border border-amber-500 text-amber-500 font-['Share_Tech_Mono'] hover:bg-amber-500 hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase text-sm"
              >
                Send
              </button>
            </form>
          </div>
        </div>

        {/* Side Panel (Desktop only) */}
        <StatusPanel stats={stats} inventory={inventory} />

      </div>
      
      {/* Mobile Stats Toggle (Simplified visual only) */}
      <div className="lg:hidden absolute top-4 right-4 text-amber-500 font-['Share_Tech_Mono'] text-xs border border-amber-500 p-1">
        HP: {stats.health}%
      </div>

    </CRTLayer>
  );
};

export default App;