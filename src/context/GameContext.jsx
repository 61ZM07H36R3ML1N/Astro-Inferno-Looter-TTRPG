import React, { createContext, useState, useContext } from 'react';
    
    const GameContext = createContext();
    
    export const useGame = () => useContext(GameContext);
    
    export const GameProvider = ({ children }) => {
const initializeCombat = (units) => {
    setGameState(prev => {
      const sortedUnits = [...units].sort((a, b) => (b.speed || 10) - (a.speed || 10));
    const order = sortedUnits;
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
  });

  const endTurn = () => {
   setGameState(prev => {
    const hasTurnOrder = prev.turnOrder && prev.turnOrder.length > 0;
    const nextIndex = hasTurnOrder ? (prev.currentTurnIndex + 1) % prev.turnOrder.length : 0;
    let newPhase = prev.phase;
    let newActionsRemaining = prev.actionsRemaining; // Default to current

    if (hasTurnOrder) {
      const nextUnit = prev.turnOrder[nextIndex]; 
      
      if (nextUnit.isEnemy && prev.phase === 'PLAYER_TURN') {
        newPhase = 'ENEMY_TURN';
        newActionsRemaining = 1; // Or however many actions enemies get
      } else if (!nextUnit.isEnemy && prev.phase === 'ENEMY_TURN') {
        newPhase = 'PLAYER_TURN';
        newActionsRemaining = 2; // Player actions
      } else if (nextIndex === 0 && prev.phase === 'ENEMY_TURN' && !nextUnit.isEnemy) { // Cycled back to player after enemy turn
        newPhase = 'PLAYER_TURN';
        newActionsRemaining = 2;
      } else {
         // If phase doesn't change, reset actions based on current/new phase
         newActionsRemaining = newPhase === 'PLAYER_TURN' ? 2 : 1;
      }
      
      return {
        ...prev,
        currentTurnIndex: nextIndex,
        activeUnitId: prev.turnOrder[nextIndex].id,
        actionsRemaining: newActionsRemaining,
        phase: newPhase
      };

    } else {
      // No turn order, maybe reset to defaults
      return {
        ...prev,
        currentTurnIndex: 0,
        activeUnitId: null,
        actionsRemaining: 2,
        phase: 'PLAYER_TURN'
// ... end of state logic
// ... after the 'else' block inside endTurn
      return { ...prev, currentTurnIndex: nextIndex, activeUnitId: prev.turnOrder[nextIndex].id, actionsRemaining: newActionsRemaining, phase: newPhase };
    } else {
      return { ...prev, currentTurnIndex: 0, activeUnitId: null, actionsRemaining: 2, phase: 'PLAYER_TURN' };
    }
  }); 
};

const value = {
  gameState,
  setGameState,
  endTurn,
  initializeCombat
};
  return (
    <GameContext.Provider value={value}>
      {children}
    </GameContext.Provider>
  );
};
export default GameContext;
