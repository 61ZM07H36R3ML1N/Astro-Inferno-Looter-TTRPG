import { useState } from 'react';


function App() {
  const [view, setView] = useState('welcome');

  return (
    <div className="scanlines flex min-h-screen flex-col items-center justify-center bg-black font-mono">
      
      {/* Background Grid (Thematic) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

      {/* Main Title Section */}
      <div className="relative z-10 text-center">
        <h1 className="text-7xl md:text-9xl font-black italic tracking-tighter text-brand-red drop-shadow-[0_0_25px_rgba(220,38,38,0.6)] uppercase select-none">
          Astro Inferno
        </h1>
        
        {/* Animated Sub-header */}
        <div className="mt-4 flex justify-center items-center gap-2">
          <p className="text-gray-500 font-mono text-xs uppercase tracking-[0.3em] animate-pulse">
            Establishing Uplink...
          </p>
          <div className="h-1 w-12 bg-brand-red animate-bounce"></div>
        </div>
      </div>

      {/* Interactive Navigation */}
      <div className="relative z-10 mt-20 flex flex-col gap-6 w-full max-w-sm">
        <button 
          onClick={() => setView('select')}
          className="group relative overflow-hidden border-2 border-brand-red px-8 py-5 transition-all hover:bg-brand-red"
        >
          <div className="relative z-10 flex items-center justify-between">
            <span className="font-black uppercase tracking-[.2em] text-brand-red group-hover:text-white">Initialize Unit</span>
            <span className="text-brand-red group-hover:text-white"></span>
          </div>
          {/* Glitch Overlay on Hover */}
          <div className="absolute inset-0 z-0 translate-y-full bg-white/10 transition-transform group-hover:translate-y-0"></div>
        </button>

        <button className="group border border-white/10 px-8 py-4 text-gray-500 transition-all hover:border-white/40 hover:text-white">
          <span className="text-[10px] uppercase tracking-[.5em]">Neural Link Archive</span>
        </button>
      </div>

      {/* System Readout (Bottom Right) */}
      <div className="absolute bottom-6 right-6 text-right font-mono text-[9px] text-gray-700 leading-tight uppercase">
        <p>OS: V25.NODE_STABLE</p>
        <p>MEM: 512MB_CLEARED</p>
        <p>USER: B_JAMIEL</p>
      </div>
    </div>
  );
}

export default App;
