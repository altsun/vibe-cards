import { create } from 'zustand';
import { GameState, Phase, Player, GameAction } from '../../types/game';
import { CardInstance, SpellTrapZoneSlot } from '../../types/card';
import { cardDatabase, createCardInstance } from '../cards/cardDatabase';

interface GameStore extends GameState {
  initializeGame: (playerNames: [string, string]) => void;
  dispatch: (action: GameAction) => void;
  getCurrentPlayer: () => Player;
  getOpponent: () => Player;
}

const createInitialPlayer = (id: string, name: string): Player => ({
  id,
  name,
  hp: 4000,
  maxHp: 4000,
  resources: 0,
  maxResources: 0,
  deck: [],
  hand: [],
  graveyard: [],
  creatureZone: Array(5).fill(null),
  spellTrapZone: Array(5).fill(null).map((_, i) => ({ index: i, card: null, isOccupied: false })),
});

export const useGameStore = create<GameStore>((set, get) => ({
  turn: 1,
  currentPlayerId: '',
  phase: 'draw',
  players: {},
  attackDeclaration: null,
  chainStack: [],
  gameOver: false,
  winner: null,

  initializeGame: (playerNames) => {
    const player1 = createInitialPlayer('p1', playerNames[0]);
    const player2 = createInitialPlayer('p2', playerNames[1]);

    // Create starter decks
    const starterDeckIds = ['c001', 'c002', 'c003', 'c004', 's001', 's002', 'cs001', 'eq001', 't001', 't002'];
    
    player1.deck = starterDeckIds.map(id => {
      const def = cardDatabase.find(c => c.id === id)!;
      return createCardInstance(def, 'p1');
    }).sort(() => Math.random() - 0.5);

    player2.deck = starterDeckIds.map(id => {
      const def = cardDatabase.find(c => c.id === id)!;
      return createCardInstance(def, 'p2');
    }).sort(() => Math.random() - 0.5);

    // Draw 5 cards each
    player1.hand = player1.deck.splice(0, 5);
    player2.hand = player2.deck.splice(0, 5);

    set({
      turn: 1,
      currentPlayerId: 'p1',
      phase: 'draw',
      players: { p1: player1, p2: player2 },
      attackDeclaration: null,
      chainStack: [],
      gameOver: false,
      winner: null,
    });
  },

  getCurrentPlayer: () => get().players[get().currentPlayerId],
  getOpponent: () => {
    const id = get().currentPlayerId === 'p1' ? 'p2' : 'p1';
    return get().players[id];
  },

  dispatch: (action) => {
    const state = get();
    if (state.gameOver) return;

    switch (action.type) {
      case 'DRAW_CARD': {
        const player = state.players[action.playerId];
        if (player.deck.length > 0) {
          const card = player.deck.shift()!;
          player.hand.push(card);
          set({ players: { ...state.players, [action.playerId]: player } });
        }
        break;
      }

      case 'SUMMON_CREATURE': {
        const player = state.players[action.playerId];
        const cardIndex = player.hand.findIndex(c => c.instanceId === action.cardId);
        if (cardIndex === -1) break;

        const card = player.hand.splice(cardIndex, 1)[0];
        if (card.cost > player.resources) {
          player.hand.splice(cardIndex, 0, card);
          break;
        }

        player.resources -= card.cost;
        player.creatureZone[action.position] = card;
        
        set({ players: { ...state.players, [action.playerId]: player } });
        break;
      }

      case 'CAST_SPELL': {
        const player = state.players[action.playerId];
        const cardIndex = player.hand.findIndex(c => c.instanceId === action.cardId);
        if (cardIndex === -1) break;

        const card = player.hand.splice(cardIndex, 1)[0];
        if (card.cost > player.resources) {
          player.hand.splice(cardIndex, 0, card);
          break;
        }

        player.resources -= card.cost;

        // Normal spell goes to graveyard immediately
        if (card.type === 'normalSpell') {
          player.graveyard.push(card);
        } else if (card.type === 'continuousSpell' || card.type === 'equipSpell') {
          // Find empty slot in spell/trap zone
          const emptySlot = player.spellTrapZone.findIndex(s => !s.isOccupied);
          if (emptySlot !== -1) {
            player.spellTrapZone[emptySlot].card = card;
            player.spellTrapZone[emptySlot].isOccupied = true;
          } else {
            player.graveyard.push(card); // No space
          }
        }

        set({ players: { ...state.players, [action.playerId]: player } });
        break;
      }

      case 'SET_TRAP': {
        const player = state.players[action.playerId];
        const cardIndex = player.hand.findIndex(c => c.instanceId === action.cardId);
        if (cardIndex === -1) break;

        const card = player.hand.splice(cardIndex, 1)[0];
        
        const emptySlot = player.spellTrapZone.findIndex(s => !s.isOccupied);
        if (emptySlot !== -1) {
          card.isFaceDown = true;
          card.isSet = true;
          player.spellTrapZone[emptySlot].card = card;
          player.spellTrapZone[emptySlot].isOccupied = true;
        }

        set({ players: { ...state.players, [action.playerId]: player } });
        break;
      }

      case 'ACTIVATE_TRAP': {
        const player = state.players[action.playerId];
        const slot = player.spellTrapZone.find(s => s.card?.instanceId === action.cardId);
        if (!slot?.card) break;

        slot.card.isFaceDown = false;
        slot.card.isSet = false;

        // Normal trap goes to graveyard after activation
        if (slot.card.trapType === 'normal') {
          player.graveyard.push(slot.card);
          slot.card = null;
          slot.isOccupied = false;
        }

        set({ players: { ...state.players, [action.playerId]: player } });
        break;
      }

      case 'NEXT_PHASE': {
        const phases: Phase[] = ['draw', 'resource', 'main', 'battle', 'end'];
        const currentIndex = phases.indexOf(state.phase);
        const nextPhase = phases[(currentIndex + 1) % phases.length];
        
        let updates: Partial<GameState> = { phase: nextPhase };

        if (nextPhase === 'draw') {
          // New turn
          const nextPlayerId = state.currentPlayerId === 'p1' ? 'p2' : 'p1';
          const nextPlayer = state.players[nextPlayerId];
          
          // Reset set traps
          nextPlayer.spellTrapZone.forEach(slot => {
            if (slot.card?.isSet) slot.card.isSet = false;
          });

          updates = {
            turn: state.turn + 1,
            currentPlayerId: nextPlayerId,
            phase: 'draw',
            attackDeclaration: null,
          };
        } else if (nextPhase === 'resource') {
          const currentPlayer = state.players[state.currentPlayerId];
          currentPlayer.maxResources = Math.min(currentPlayer.maxResources + 1, 10);
          currentPlayer.resources = currentPlayer.maxResources;
          updates.players = { ...state.players, [state.currentPlayerId]: currentPlayer };
        }

        set({ ...state, ...updates });
        break;
      }

      case 'END_TURN': {
        const nextPlayerId = state.currentPlayerId === 'p1' ? 'p2' : 'p1';
        const nextPlayer = state.players[nextPlayerId];
        
        nextPlayer.spellTrapZone.forEach(slot => {
          if (slot.card?.isSet) slot.card.isSet = false;
        });

        set({
          turn: state.turn + 1,
          currentPlayerId: nextPlayerId,
          phase: 'draw',
          attackDeclaration: null,
          players: { ...state.players, [nextPlayerId]: nextPlayer },
        });
        break;
      }
    }
  },
}));
