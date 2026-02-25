import React, { useState, useEffect } from 'react';
    
    const GRID_SIZE = 12;
    const hazardZones = [
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 3, y: 2 },
      { x: 3, y: 3 },
      { x: 8, y: 8 },
      { x: 9, y: 8 },
      { x: 8, y: 9 },
      { x: 9, y: 9 },
    ];
    
    const isHazardZone = (x, y) => {
      return hazardZones.some(zone => zone.x === x && zone.y === y);
    };
    
    const Map = () => {
      const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 });
    
      useEffect(() => {
        if (isHazardZone(playerPosition.x, playerPosition.y)) {
          console.log('Atmospheric Pull detected! Player at:', playerPosition);
        }
      }, [playerPosition]);
    
      const movePlayer = (dx, dy) => {
        setPlayerPosition(prev => {
          const newX = Math.max(0, Math.min(GRID_SIZE - 1, prev.x + dx));
          const newY = Math.max(0, Math.min(GRID_SIZE - 1, prev.y + dy));
          return { x: newX, y: newY };
        });
      };
    
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
                className={`w-12 h-12 border border-gray-400 flex items-center justify-center ${
                  isHazard ? 'bg-red-500' : 'bg-gray-100'
                } ${isPlayerHere ? 'relative' : ''}`}
                onClick={() => console.log(`Clicked cell: ${x}, ${y}`)}
              >
                {isPlayerHere && (
                  <div className="w-8 h-8 bg-blue-500 rounded-full absolute"></div>
                )}
                {/* {`(${x},${y})`} */}
              </div>
            );
          }
          grid.push(
            <div key={y} className="flex">
              {row}
            </div>
          );
        }
        return grid;
      };
    
      return (
        <div className="flex flex-col items-center p-4">
          <h2 className="text-2xl font-bold mb-4">Tactical Map</h2>
          <div className="grid border border-black mb-4">{renderGrid()}</div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => movePlayer(0, -1)}>Up</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => movePlayer(0, 1)}>Down</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => movePlayer(-1, 0)}>Left</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={() => movePlayer(1, 0)}>Right</button>
          </div>
          <div className="mt-2">Player Position: ({playerPosition.x}, {playerPosition.y})</div>
        </div>
      );
    };
    
    export default Map;
    
