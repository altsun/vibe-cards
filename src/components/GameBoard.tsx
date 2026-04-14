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
    players,
    attackDeclaration,
    initializeGame, 
    dispatch
  } = useGameStore();
  
  // State to trigger AI continuous decisions
  const [aiPending, setAiPending] = React.useState(0);

  // Fixed positions: Player (p1) always at bottom, AI (p2) always at top
  const player = players.p1;
  const ai = players.p2;
  const isPlayerTurn = currentPlayerId === 'p1';

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

  // AI Turn - continuously makes decisions until end turn
  React.useEffect(() => {
    if (currentPlayerId === 'p2' && !gameOver) {
      const state = useGameStore.getState();
      const action = aiPlayer.makeDecision(state);
      
      if (action) {
        const delay = setTimeout(() => {
          dispatch(action);
          // Continue AI decisions after action completes
          if (action.type !== 'END_TURN') {
            setAiPending(prev => prev + 1);
          }
        }, 1000);
        return () => clearTimeout(delay);
      }
    }
  }, [currentPlayerId, phase, turn, gameOver, dispatch, aiPending]);

  const handleNextPhase = () => {
    dispatch({ type: 'NEXT_PHASE' });
  };

  const handleEndTurn = () => {
    dispatch({ type: 'END_TURN' });
  };

  const handleCardClick = (card: import('../types/card').CardInstance) => {
    if (phase !== 'main' || !isPlayerTurn) return;

    switch (card.type) {
      case 'creature': {
        const emptyPosition = player.creatureZone.findIndex((c: any) => c === null);
        if (emptyPosition !== -1) {
          dispatch({ type: 'SUMMON_CREATURE', playerId: player.id, cardId: card.instanceId, position: emptyPosition });
        }
        break;
      }
      case 'normalSpell':
      case 'continuousSpell':
      case 'equipSpell':
        dispatch({ type: 'CAST_SPELL', playerId: player.id, cardId: card.instanceId });
        break;
      case 'trap': {
        const emptySlot = player.spellTrapZone.findIndex((s: any) => !s.isOccupied);
        if (emptySlot !== -1) {
          dispatch({ type: 'SET_TRAP', playerId: player.id, cardId: card.instanceId, position: emptySlot });
        }
        break;
      }
    }
  };

  if (!currentPlayerId) {
    return <div className="loading">Loading...</div>;
  }

  if (gameOver) {
    const winnerName = useGameStore.getState().winner === 'p1' ? player.name : ai.name;
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
      {/* AI Area (always at top) */}
      <div className="opponent-area">
        <div className="player-info">
          <span className="player-name">{ai.name}</span>
          <span className="player-hp">HP: {ai.hp}</span>
          <span className="player-mana">Mana: {ai.mana}</span>
          <span className="deck-count">Deck: {ai.deck.length}</span>
        </div>
        <Hand cards={ai.hand} hidden={true} />
        <SpellTrapZone 
          zones={ai.spellTrapZone} 
          isOwner={false}
        />
        <CreatureZone 
          creatures={ai.creatureZone} 
          isOwner={false}
          attackingCreatureId={attackDeclaration?.attacker}
        />
      </div>

      {/* Battle Info */}
      <div className="battle-info">
        <div className="turn-info">
          <span>Turn {turn}</span>
          <span>Phase: {phase.toUpperCase()}</span>
          <span>Current: {isPlayerTurn ? player.name : ai.name}</span>
        </div>
        <div className="phase-controls">
          <button onClick={handleNextPhase} disabled={!isPlayerTurn}>Next Phase</button>
          <button onClick={handleEndTurn} disabled={!isPlayerTurn}>End Turn</button>
        </div>
      </div>

      {/* Player Area (always at bottom) */}
      <div className="current-player-area">
        <CreatureZone 
          creatures={player.creatureZone} 
          isOwner={true}
          attackingCreatureId={attackDeclaration?.attacker}
        />
        <SpellTrapZone 
          zones={player.spellTrapZone} 
          isOwner={true}
          onCardActivate={(card) => {
            dispatch({ type: 'ACTIVATE_TRAP', playerId: player.id, cardId: card.instanceId });
          }}
        />
        <Hand cards={player.hand} onCardClick={handleCardClick} />
        <div className="player-info">
          <span className="player-name">{player.name}</span>
          <span className="player-hp">HP: {player.hp}</span>
          <span className="player-mana">Mana: {player.mana}/{player.maxMana}</span>
          <span className="deck-count">Deck: {player.deck.length}</span>
        </div>
      </div>
    </div>
  );
};
