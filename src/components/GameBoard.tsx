import React from 'react';
import { useGameStore } from '../game/engine/gameStore';
import { SpellTrapZone } from './SpellTrapZone';
import { CreatureZone } from './CreatureZone';
import { Hand } from './Hand';
import { AIPlayer } from '../game/ai/aiPlayer';

const aiPlayer = new AIPlayer('p2');

export const GameBoard: React.FC = () => {
  const { 
    turn, 
    currentPlayerId, 
    phase, 
    gameOver,
    initializeGame, 
    dispatch,
    getCurrentPlayer,
    getOpponent 
  } = useGameStore();

  const currentPlayer = getCurrentPlayer();
  const opponent = getOpponent();

  React.useEffect(() => {
    if (!currentPlayerId) {
      initializeGame(['Player 1', 'AI Opponent']);
    }
  }, []);

  // Auto draw at start of draw phase
  React.useEffect(() => {
    if (currentPlayerId && phase === 'draw' && !gameOver) {
      const delay = setTimeout(() => {
        dispatch({ type: 'DRAW_CARD', playerId: currentPlayerId });
        dispatch({ type: 'NEXT_PHASE' });
      }, 500);
      return () => clearTimeout(delay);
    }
  }, [currentPlayerId, phase, gameOver, dispatch]);

  // AI Turn
  React.useEffect(() => {
    if (currentPlayerId === 'p2' && !gameOver) {
      const state = useGameStore.getState();
      const action = aiPlayer.makeDecision(state);
      
      if (action) {
        const delay = setTimeout(() => {
          dispatch(action);
        }, 1000); // 1 second delay for AI actions
        return () => clearTimeout(delay);
      }
    }
  }, [currentPlayerId, phase, turn, gameOver, dispatch]);

  const handleNextPhase = () => {
    dispatch({ type: 'NEXT_PHASE' });
  };

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const handleCardClick = (card: import('../types/card').CardInstance) => {
    if (phase !== 'main') return;

    switch (card.type) {
      case 'creature': {
        const emptyPosition = currentPlayer.creatureZone.findIndex(c => c === null);
        if (emptyPosition !== -1) {
          dispatch({ type: 'SUMMON_CREATURE', playerId: currentPlayer.id, cardId: card.instanceId, position: emptyPosition });
        }
        break;
      }
      case 'normalSpell':
      case 'continuousSpell':
      case 'equipSpell':
        dispatch({ type: 'CAST_SPELL', playerId: currentPlayer.id, cardId: card.instanceId });
        break;
      case 'trap': {
        const emptySlot = currentPlayer.spellTrapZone.findIndex(s => !s.isOccupied);
        if (emptySlot !== -1) {
          dispatch({ type: 'SET_TRAP', playerId: currentPlayer.id, cardId: card.instanceId, position: emptySlot });
        }
        break;
      }
    }
  };

  if (!currentPlayerId) {
    return <div className="loading">Loading...</div>;
  }

  if (gameOver) {
    const winnerName = currentPlayerId === 'p1' ? currentPlayer.name : opponent.name;
    const isPlayerWinner = useGameStore.getState().winner === 'p1';
    return (
      <div className="game-over">
        <h1>GAME OVER</h1>
        <p>{winnerName} wins!</p>
        <p>{isPlayerWinner ? '🎉 You won!' : '😢 AI won!'}</p>
        <button onClick={() => window.location.reload()}>Play Again</button>
      </div>
    );
  }

  return (
    <div className="game-board">
      {/* Opponent Area */}
      <div className="opponent-area">
        <div className="player-info">
          <span className="player-name">{opponent.name}</span>
          <span className="player-hp">HP: {opponent.hp}</span>
          <span className="player-mana">Mana: {opponent.mana}</span>
          <span className="deck-count">Deck: {opponent.deck.length}</span>
        </div>
        <Hand cards={opponent.hand} hidden={true} />
        <SpellTrapZone 
          zones={opponent.spellTrapZone} 
          isOwner={false}
        />
        <CreatureZone 
          creatures={opponent.creatureZone} 
          isOwner={false}
        />
      </div>

      {/* Battle Info */}
      <div className="battle-info">
        <div className="turn-info">
          <span>Turn {turn}</span>
          <span>Phase: {phase.toUpperCase()}</span>
          <span>Current: {currentPlayer.name}</span>
        </div>
        <div className="phase-controls">
          <button onClick={handleNextPhase}>Next Phase</button>
          <button onClick={handleEndTurn}>End Turn</button>
        </div>
      </div>

      {/* Current Player Area */}
      <div className="current-player-area">
        <CreatureZone 
          creatures={currentPlayer.creatureZone} 
          isOwner={true}
        />
        <SpellTrapZone 
          zones={currentPlayer.spellTrapZone} 
          isOwner={true}
          onCardActivate={(card) => {
            dispatch({ type: 'ACTIVATE_TRAP', playerId: currentPlayer.id, cardId: card.instanceId });
          }}
        />
        <Hand cards={currentPlayer.hand} onCardClick={handleCardClick} />
        <div className="player-info">
          <span className="player-name">{currentPlayer.name}</span>
          <span className="player-hp">HP: {currentPlayer.hp}</span>
          <span className="player-mana">Mana: {currentPlayer.mana}/{currentPlayer.maxMana}</span>
          <span className="deck-count">Deck: {currentPlayer.deck.length}</span>
        </div>
      </div>
    </div>
  );
};
