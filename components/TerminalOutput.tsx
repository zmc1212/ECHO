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
          <div className="text-xs opacity-50 mb-1 font-['Share_Tech_Mono']">
            {msg.role === 'user' ? '>> CMD_LOG' : `<< SYS_LOG [${msg.timestamp}]`}
          </div>
          <div className={`p-2 inline-block max-w-[90%] ${
            msg.role === 'user' 
              ? 'border-r-2 border-cyan-400 bg-cyan-950/20' 
              : 'text-glow border-l-2 border-amber-500/50 bg-amber-950/10'
          }`}>
            {formatText(msg.text)}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalOutput;