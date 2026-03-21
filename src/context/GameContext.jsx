 import React, { createContext, useState, useContext } from 'react';

const GameContext = createContext();

export const useGame = () => useContext(GameContext);

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState({
    activeUnitId: null,
    turnOrder: [],
    currentTurnIndex: 0,
    actionsRemaining: 2,
    phase: 'PLAYER_TURN',
  });

  const initializeCombat = (units) => {
    setGameState(prev => {
      const sortedUnits = [...units].sort((a, b) => (b.speed || 10) - (a.speed || 10));
      return {
        ...prev,
        turnOrder: sortedUnits,
        currentTurnIndex: 0,
        activeUnitId: sortedUnits[0]?.id || null,
        actionsRemaining: 2
      };
    });
  };

  const endTurn = () => {
    setGameState(prev => {
      const hasTurnOrder = prev.turnOrder && prev.turnOrder.length > 0;
      if (!hasTurnOrder) {
        return { ...prev, currentTurnIndex: 0, activeUnitId: null, actionsRemaining: 2, phase: 'PLAYER_TURN' };
      }

      const nextIndex = (prev.currentTurnIndex + 1) % prev.turnOrder.length;
      const nextUnit = prev.turnOrder[nextIndex];
      
      let newPhase = prev.phase;
      let newActionsRemaining = prev.actionsRemaining;

      if (nextUnit.isEnemy && prev.phase === 'PLAYER_TURN') {
        newPhase = 'ENEMY_TURN';
        newActionsRemaining = 1;
      } else if (!nextUnit.isEnemy && prev.phase === 'ENEMY_TURN') {
        newPhase = 'PLAYER_TURN';
        newActionsRemaining = 2;
      } else {
        newActionsRemaining = newPhase === 'PLAYER_TURN' ? 2 : 1;
      }

      return {
        ...prev,
        currentTurnIndex: nextIndex,
        activeUnitId: nextUnit.id,
        actionsRemaining: newActionsRemaining,
        phase: newPhase
      };
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
