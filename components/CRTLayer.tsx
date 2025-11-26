import React from 'react';

interface CRTLayerProps {
  children: React.ReactNode;
  className?: string;
}

const CRTLayer: React.FC<CRTLayerProps> = ({ children, className = '' }) => {
  return (
    <div className={`fixed inset-0 bg-[#020202] flex items-center justify-center overflow-hidden ${className}`}>
      {/* 
        Monitor Casing / Curvature Effect 
        Using inset shadow to create a "bulge" illusion without heavy 3D transforms that distort text interactions
      */}
      <div className="relative w-full h-full max-w-[100vw] max-h-[100vh] overflow-hidden shadow-[inset_0_0_8rem_rgba(0,0,0,0.75)] rounded-[0px] md:rounded-[12px]">
        
        {/* Static Noise Layer */}
        <div className="noise-overlay"></div>

   
        
        {/* Fine fixed scanlines for detail */}
        <div className="absolute inset-0 z-50 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_3px,3px_100%] opacity-20"></div>

        {/* Screen Glare (Glass Reflection) */}
        <div className="absolute top-0 right-0 w-[60%] h-[40%] bg-gradient-to-bl from-white/5 to-transparent z-40 pointer-events-none rounded-tr-[12px] opacity-30 blur-2xl"></div>
        <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.4)_90%,rgba(0,0,0,0.8)_100%)]"></div>

        {/* Content Container */}
        <div className="relative z-10 w-full h-full p-4 md:p-8 flex flex-col crt-flicker phosphor-bloom ghost-effect">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CRTLayer;