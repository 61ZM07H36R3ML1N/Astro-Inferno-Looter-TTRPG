import React, { useState } from 'react';
import Map from './Map';
import { X, Map as MapIcon } from 'lucide-react';

const NeuralMapOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Minimized Neural Node */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-black border-2 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.6)] flex items-center justify-center text-cyan-500 hover:scale-110 transition-transform z-50"
          title="Open Neural Map"
        >
          <MapIcon size={28} />
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
