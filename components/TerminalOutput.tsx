import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface TerminalOutputProps {
  messages: Message[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, messages.length]); // Scroll when messages change

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 font-['VT323'] text-xl md:text-2xl leading-relaxed tracking-wide scrollbar-hide">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
            msg.role === 'user' ? 'text-cyan-400 text-right opacity-80' : 'text-amber-500 text-left'
          }`}
        >
          <div className="text-xs opacity-50 mb-1 font-['Share_Tech_Mono'] flex items-center gap-2 justify-end">
            {msg.role === 'user' 
              ? <><span className="text-[10px]">USER_INPUT</span> <span>&gt;&gt;</span></>
              : <><span className="text-[10px]">SYSTEM_RESPONSE</span> <span>&lt;&lt;</span></>
            }
          </div>
          
          <div className={`p-3 inline-block max-w-[95%] relative group ${
            msg.role === 'user' 
              ? 'border-r-2 border-cyan-400 bg-cyan-950/20 text-shadow-cyan' 
              : 'border-l-2 border-amber-500/50 bg-amber-950/10 text-glow'
          }`}>
            {/* Scanline decoration for message bubble */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50"></div>
            
            <div className="font-['Noto_Serif_SC'] relative z-10 text-lg md:text-xl">
               {formatText(msg.text)}
            </div>
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalOutput;