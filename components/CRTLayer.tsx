import React from 'react';

interface CRTLayerProps {
  children: React.ReactNode;
  className?: string;
}

const CRTLayer: React.FC<CRTLayerProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative w-full h-screen bg-black overflow-hidden scanlines ${className}`}>
      {/* Screen Curvature Vignette */}
      <div className="absolute inset-0 z-40 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 w-full h-full p-4 md:p-8 flex flex-col crt-flicker">
        {children}
      </div>
      
      {/* Screen Glare (Subtle) */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/5 to-transparent z-50 pointer-events-none"></div>
    </div>
  );
};

export default CRTLayer;