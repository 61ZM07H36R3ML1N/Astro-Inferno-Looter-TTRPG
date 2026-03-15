import React, { createContext, useState, useContext } from 'react';
    
    const GameContext = createContext();
    
    export const useGame = () => useContext(GameContext);
    
    export const GameProvider = ({ children }) => {
const initializeCombat = (units) => {
    setGameState(prev => {
      const sortedUnits = [...units].sort((a, b) => (b.speed || 10) - (a.speed || 10));
      const order = sortedUnits.map(u => u.id);
      return {
        ...prev,
        turnOrder: order,
        currentTurnIndex: 0,
        activeUnitId: order[0] || null,
        actionsRemaining: 2
      };
    });
  };
    
const [gameState, setGameState] = useState({
    activeUnitId: null,
    turnOrder: [],
    currentTurnIndex: 0,
    actionsRemaining: 2,
    phase: 'PLAYER_TURN',
  }); // <--- State must end here

  const endTurn = () => {
    setGameState(prev => {
      // If no turn order exists, we still want to reset actions for the current player
      const hasTurnOrder = prev.turnOrder && prev.turnOrder.length > 0;
      const nextIndex = hasTurnOrder 
        ? (prev.currentTurnIndex + 1) % prev.turnOrder.length 
        : 0;
      
      return {
        ...prev,
        currentTurnIndex: nextIndex,
        activeUnitId: hasTurnOrder ? prev.turnOrder[nextIndex] : prev.activeUnitId,
        actionsRemaining: 2 // This forces the "2" to refresh
      };
    });
  };
const value = { 
    gameState, 
    setGameState, 
    endTurn, 
    initializeCombat // <--- Add this
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
