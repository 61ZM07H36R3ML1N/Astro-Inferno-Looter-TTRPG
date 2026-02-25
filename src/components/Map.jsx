import React, { useState, useEffect, useRef } from 'react';

const GRID_SIZE = 12;

// Act II Hull Breach Coordinates
const BREACH_ZONES = [
  { x: 7, y: 4 }, { x: 7, y: 5 },
  { x: 8, y: 4 }, { x: 8, y: 5 }
];

const isHazardZone = (x, y) => {
  return BREACH_ZONES.some(zone => zone.x === x && zone.y === y);
};

const Map = () => {
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
  
  // THE FIX: useRef stops the infinite loop instantly
  const isProcessingHazard = useRef(false);

  // --- LOGIC: VACUUM PULL ---
  const handleVacuumPull = () => {
    const breachCenter = { x: 7.5, y: 4.5 };
    
    setPlayerPosition(prev => {
      const dx = prev.x < breachCenter.x ? 1 : prev.x > breachCenter.x ? -1 : 0;
      const dy = prev.y < breachCenter.y ? 1 : prev.y > breachCenter.y ? -1 : 0;

      return {
        x: Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx)),
        y: Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy))
      };
    });
  };

  // --- EFFECT: HAZARD DETECTION ---
  useEffect(() => {
    // Check if player is in hazard and lock is OFF
    if (isHazardZone(playerPosition.x, playerPosition.y) && !isProcessingHazard.current) {
      
      // 1. ENGAGE LOCK
      isProcessingHazard.current = true; 

      // 2. TRIGGER ALERT
      console.warn('CRITICAL: Atmospheric Pull detected.');
      alert("⚠️ The hull screams! The vacuum of space claws at your suit.");
      
      // 3. ASYNC MOVEMENT (Fixes the "Cascading Render" Error)
      // Moving this inside a timeout tells React to finish the current render first.
      setTimeout(() => {
        handleVacuumPull();
        
        // 4. RELEASE LOCK AFTER DELAY
        setTimeout(() => {
          isProcessingHazard.current = false;
        }, 1000);
      }, 10); // Smallest possible delay to break the synchronous chain
    }
  }, [playerPosition.x, playerPosition.y]); 

  // --- LOGIC: MOVEMENT ---
  const movePlayer = (dx, dy) => {
    setPlayerPosition(prev => ({
      x: Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx)),
      y: Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy))
    }));
  };

  // --- RENDER: GRID CELLS ---
  const renderGrid = () => {
    const grid = [];
    for (let y = 0; y < GRID_SIZE; y++) {
      const row = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        const isHazard = isHazardZone(x, y);
        const isPlayerHere = playerPosition.x === x && playerPosition.y === y;

        row.push(
          <div 
            key={`${x}-${y}`} 
            className={`w-12 h-12 border border-slate-700 flex items-center justify-center transition-all
              ${isHazard ? 'bg-purple-900/40 border-orange-600 shadow-[inset_0_0_15px_rgba(255,69,0,0.5)] animate-pulse' : 'bg-slate-900 hover:bg-slate-800'} 
              ${isPlayerHere ? 'relative' : ''}`}
          >
            {isPlayerHere && (
              <div className="w-8 h-8 bg-blue-500 rounded-full absolute shadow-lg shadow-blue-500/50 z-10"></div>
            )}
            <span className="text-[8px] text-slate-600 select-none">{x},{y}</span>
          </div>
        );
      }
      grid.push(<div key={y} className="flex">{row}</div>);
    }
    return grid;
  };

  return (
    <div className="flex flex-col items-center p-4 bg-black text-white min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-orange-500 tracking-tighter uppercase">Tactical HUD: Sector 7-B</h2>
      
      <div className="border-2 border-slate-800 mb-4 shadow-2xl bg-slate-900">
        {renderGrid()}
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="grid grid-cols-3 gap-2">
          <div />
          <button className="p-4 bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 active:bg-blue-900" onClick={() => movePlayer(0, -1)}>▲</button>
          <div />
          <button className="p-4 bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 active:bg-blue-900" onClick={() => movePlayer(-1, 0)}>◀</button>
          <button className="p-4 bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 active:bg-blue-900" onClick={() => movePlayer(0, 1)}>▼</button>
          <button className="p-4 bg-slate-800 rounded hover:bg-slate-700 border border-slate-600 active:bg-blue-900" onClick={() => movePlayer(1, 0)}>▶</button>
        </div>

        <div className="mt-4 font-mono text-sm text-green-500 bg-slate-900/50 p-2 border border-green-900/30 rounded">
          PLAYER_LOC: [{playerPosition.x}, {playerPosition.y}]
        </div>
      </div>
    </div>
  );
};

export default Map;