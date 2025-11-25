import React, { useEffect, useRef } from 'react';
import { Message } from '../types';

interface TerminalOutputProps {
  messages: Message[];
}

const TerminalOutput: React.FC<TerminalOutputProps> = ({ messages }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatText = (text: string) => {
    return text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <div className="flex-1 overflow-y-auto pr-2 mb-4 font-['VT323'] text-xl md:text-2xl leading-relaxed tracking-wide">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`mb-6 ${msg.role === 'user' ? 'text-cyan-400 text-right' : 'text-amber-500 text-left'}`}
        >
          <div className="text-xs opacity-50 mb-1 font-['Share_Tech_Mono']">
            {msg.role === 'user' ? '>> USER_INPUT' : `<< SYS_RESPONSE [${msg.timestamp}]`}
          </div>
          <div className={`p-2 ${msg.role === 'user' ? 'border-r-4 border-cyan-400 bg-cyan-950/20' : 'text-glow'}`}>
            {formatText(msg.text)}
            {msg.isTyping && <span className="inline-block w-3 h-6 bg-amber-500 ml-1 cursor-blink align-middle"></span>}
          </div>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
};

export default TerminalOutput;