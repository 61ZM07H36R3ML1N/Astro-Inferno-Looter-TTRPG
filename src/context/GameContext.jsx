import React, { createContext, useState, useContext } from 'react';
    
    const GameContext = createContext();
    
    export const useGame = () => useContext(GameContext);
    
    export const GameProvider = ({ children }) => {
      // State and functions related to turns and actions (like activePlayerId, actionsUsed, endTurn)
      // were NOT found in /src/App.jsx as of the last review.
      // You may need to implement them here or locate them elsewhere if they exist.
    
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
    endTurn
  };

  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
