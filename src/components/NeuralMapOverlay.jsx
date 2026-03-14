import React, { useState } from 'react';
import Map from './Map';
import { X, Activity } from 'lucide-react';
const NeuralMapOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Minimized Neural Node */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(!isOpen)}
  className="fixed bottom-24 right-6 z-[9999] p-4 rounded-full 
             bg-slate-900 border-2 border-cyan-500/50 
             text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]
             hover:scale-110 active:scale-95 transition-all duration-200"
>
  <Activity size={24} />
        </button>
      )}

      {/* Expanded Map Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="relative w-full max-w-5xl h-[80vh] bg-zinc-900 border-2 border-cyan-900 rounded-2xl overflow-hidden shadow-2xl">
            
            {/* Exit/Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 bg-red-900/20 text-red-500 border border-red-500 rounded-full hover:bg-red-500 hover:text-white transition-colors z-[110]"
            >
              <X size={24} />
            </button>

            {/* Map Component */}
            <div className="w-full h-full p-2">
              <Map />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NeuralMapOverlay;
