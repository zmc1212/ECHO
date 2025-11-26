import React from 'react';

interface GameOverProps {
  onRestart: () => void;
}

const GameOver: React.FC<GameOverProps> = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black text-red-600 animate-in fade-in duration-1000 font-['Share_Tech_Mono']">
      {/* Glitch Effect Container */}
      <div className="relative mb-8">
        <h1 className="text-6xl md:text-8xl font-['VT323'] animate-pulse tracking-widest text-red-500 text-shadow-red">
          SIGNAL LOST
        </h1>
        <div className="absolute inset-0 animate-[glitch_2s_infinite] opacity-50 text-red-800 mix-blend-screen translate-x-1">
          SIGNAL LOST
        </div>
      </div>

      <div className="text-xl md:text-2xl text-red-800 mb-12 tracking-widest uppercase border-t border-b border-red-900/30 py-2">
        Critical Failure // 生命体征归零
      </div>

      <div className="max-w-md text-center text-red-400/80 font-['Noto_Serif_SC'] mb-12 px-4">
        意识连接已断开。模拟体验因不可抗力终止。
        <br/>
        是否尝试重新建立神经链接？
      </div>

      <button 
        onClick={onRestart}
        className="group relative px-8 py-4 bg-red-950/20 border border-red-800 hover:bg-red-900/40 hover:border-red-500 transition-all duration-300"
      >
        <span className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,0,0,0.1)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shine_1s_infinite]"></span>
        <span className="relative z-10 text-red-500 group-hover:text-red-300 tracking-[0.2em] font-bold">
          SYSTEM_REBOOT // 重启系统
        </span>
      </button>

      <style>{`
        .text-shadow-red { text-shadow: 0 0 10px rgba(220, 38, 38, 0.8); }
        @keyframes glitch {
          0% { clip-path: inset(20% 0 80% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 50% 0); transform: translate(-2px, 2px); }
          60% { clip-path: inset(80% 0 5% 0); transform: translate(2px, -2px); }
          80% { clip-path: inset(10% 0 60% 0); transform: translate(-1px, 1px); }
          100% { clip-path: inset(30% 0 40% 0); transform: translate(1px, -1px); }
        }
      `}</style>
    </div>
  );
};

export default GameOver;