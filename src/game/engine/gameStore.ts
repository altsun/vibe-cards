import { create } from 'zustand';
import { GameState, Phase, Player, GameAction } from '../../types/game';
import { CardInstance } from '../../types/card';
import { cardDatabase, createCardInstance } from '../cards/cardDatabase';

// Calculate effective stats for a creature including continuous spell buffs
export function getEffectiveStats(creature: CardInstance, player: Player): { attack: number; hp: number } {
  let attackBonus = 0;
  let hpBonus = 0;
  
  // Check all continuous spells in player's spell/trap zone
  player.spellTrapZone.forEach(slot => {
    const card = slot.card;
    if (card && card.type === 'continuousSpell' && card.continuousEffect) {
      const effect = card.continuousEffect;
      if (effect.type === 'globalBuff' && effect.condition === 'ownCreatures') {
        if (effect.stat === 'attack') {
          attackBonus += effect.value || 0;
        } else if (effect.stat === 'hp') {
          hpBonus += effect.value || 0;
        }
      }
    }
  });
  
  return {
    attack: (creature.attack || 0) + attackBonus,
    hp: (creature.hp || 0) + hpBonus,
  };
}

interface GameStore extends GameState {
  initializeGame: (playerNames: [string, string]) => void;
  dispatch: (action: GameAction) => void;
  getCurrentPlayer: () => Player;
  getOpponent: () => Player;
}

const createInitialPlayer = (id: string, name: string): Player => ({
  id,
  name,
  hp: 20,
  maxHp: 20,
  mana: 0,
  maxMana: 0,
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
        if (card.cost > player.mana) {
          player.hand.splice(cardIndex, 0, card);
          break;
        }

        player.mana -= card.cost;
        player.creatureZone[action.position] = card;
        
        // Track when creature was summoned (for summoning sickness)
        card.turnSummoned = state.turn;
        
        set({ players: { ...state.players, [action.playerId]: player } });
        break;
      }

      case 'CAST_SPELL': {
        const player = state.players[action.playerId];
        const cardIndex = player.hand.findIndex(c => c.instanceId === action.cardId);
        if (cardIndex === -1) break;

        const card = player.hand.splice(cardIndex, 1)[0];
        if (card.cost > player.mana) {
          player.hand.splice(cardIndex, 0, card);
          break;
        }

        player.mana -= card.cost;

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

        // Execute trap effect
        const effect = slot.card.onActivate;
        const opponent = state.players[action.playerId === 'p1' ? 'p2' : 'p1'];
        
        if (effect) {
          switch (effect.type) {
            case 'destroy': {
              if (effect.target === 'allCreatures') {
                // Destroy all creatures on field
                player.creatureZone.forEach((c, i) => {
                  if (c) {
                    player.graveyard.push(c);
                    player.creatureZone[i] = null;
                  }
                });
                opponent.creatureZone.forEach((c, i) => {
                  if (c) {
                    opponent.graveyard.push(c);
                    opponent.creatureZone[i] = null;
                  }
                });
              } else if (effect.target === 'creature' && action.target) {
                // Destroy specific creature
                const targetPlayer = action.target?.startsWith('p1') ? state.players['p1'] : opponent;
                const targetIndex = targetPlayer.creatureZone.findIndex(c => c?.instanceId === action.target);
                if (targetIndex !== -1 && targetPlayer.creatureZone[targetIndex]) {
                  const target = targetPlayer.creatureZone[targetIndex]!;
                  targetPlayer.graveyard.push(target);
                  targetPlayer.creatureZone[targetIndex] = null;
                }
              }
              break;
            }
            case 'damage': {
              if (effect.target === 'opponent') {
                // Deal damage equal to attacker's ATK (from attackDeclaration)
                if (state.attackDeclaration) {
                  const attackerId = state.attackDeclaration.attacker;
                  const attacker = opponent.creatureZone.find(c => c?.instanceId === attackerId);
                  if (attacker) {
                    const damage = attacker.attack || 0;
                    opponent.hp = Math.max(0, opponent.hp - damage);
                  }
                }
              }
              break;
            }
            case 'negate': {
              // Negate the current action (handled by cancelling attack or summon)
              // Clear attack declaration to negate attack
              state.attackDeclaration = null;
              break;
            }
          }
        }

        // Normal trap goes to graveyard after activation
        if (slot.card.trapType === 'normal') {
          player.graveyard.push(slot.card);
          slot.card = null;
          slot.isOccupied = false;
        }

        set({ 
          players: { ...state.players, [action.playerId]: player, [action.playerId === 'p1' ? 'p2' : 'p1']: opponent },
          attackDeclaration: state.attackDeclaration 
        });
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
          const currentPlayer = state.players[state.currentPlayerId];
          
          // Reset set traps
          nextPlayer.spellTrapZone.forEach(slot => {
            if (slot.card?.isSet) slot.card.isSet = false;
          });
          
          // Reset hasAttacked for current player creatures
          currentPlayer.creatureZone.forEach(creature => {
            if (creature) creature.hasAttacked = false;
          });

          updates = {
            turn: state.turn + 1,
            currentPlayerId: nextPlayerId,
            phase: 'draw',
            attackDeclaration: null,
            players: { ...state.players, [nextPlayerId]: nextPlayer, [state.currentPlayerId]: currentPlayer },
          };
        } else if (nextPhase === 'resource') {
          const currentPlayer = state.players[state.currentPlayerId];
          currentPlayer.maxMana = Math.min(currentPlayer.maxMana + 1, 10);
          currentPlayer.mana = currentPlayer.maxMana;
          updates.players = { ...state.players, [state.currentPlayerId]: currentPlayer };
        }

        set({ ...state, ...updates });
        break;
      }

      case 'DECLARE_ATTACK': {
        const player = state.players[action.playerId];
        const opponent = state.players[action.playerId === 'p1' ? 'p2' : 'p1'];
        
        // Find attacker
        const attackerIndex = player.creatureZone.findIndex(c => c?.instanceId === action.attackerId);
        if (attackerIndex === -1) break;
        const attacker = player.creatureZone[attackerIndex]!;
        
        // Check if already attacked this turn
        if (attacker.hasAttacked) break;
        
        // Check summoning sickness (cannot attack on turn it was summoned)
        // Exception: creatures with "charge" keyword can attack immediately
        const isSummoningSickness = attacker.turnSummoned === state.turn;
        const hasCharge = attacker.keywords?.includes('charge');
        if (isSummoningSickness && !hasCharge) break;

        // Get effective stats including continuous spell buffs
        const attackerStats = getEffectiveStats(attacker, player);
        
        if (action.targetId === 'direct') {
          // Direct attack - deal damage to opponent player
          const damage = attackerStats.attack;
          opponent.hp = Math.max(0, opponent.hp - damage);
        } else {
          // Attack a creature - ATK vs HP system
          const targetIndex = opponent.creatureZone.findIndex(c => c?.instanceId === action.targetId);
          if (targetIndex === -1) break;
          
          const target = opponent.creatureZone[targetIndex]!;
          // Get target's effective stats
          const targetStats = getEffectiveStats(target, opponent);
          
          const attackerAtk = attackerStats.attack;
          const targetAtk = targetStats.attack;

          // Both creatures deal damage to each other's HP simultaneously
          // Attacker deals its ATK as damage to target's HP
          const targetRemainingHp = (target.remainingHp ?? target.hp ?? 0) - attackerAtk;
          // Target deals its ATK as damage to attacker's HP
          const attackerRemainingHp = (attacker.remainingHp ?? attacker.hp ?? 0) - targetAtk;
          
          // Apply damage to target
          if (targetRemainingHp <= 0) {
            // Target destroyed
            opponent.graveyard.push(target);
            opponent.creatureZone[targetIndex] = null;
            
            // Check for deathrattle
            if (target.keywords?.includes('deathrattle') && target.onDeath) {
              // TODO: Handle deathrattle effects
            }
          } else {
            target.remainingHp = targetRemainingHp;
          }
          
          // Apply damage to attacker
          if (attackerRemainingHp <= 0) {
            // Attacker destroyed
            player.graveyard.push(attacker);
            player.creatureZone[attackerIndex] = null;
            
            // Check for deathrattle
            if (attacker.keywords?.includes('deathrattle') && attacker.onDeath) {
              // TODO: Handle deathrattle effects
            }
          } else {
            attacker.remainingHp = attackerRemainingHp;
          }
        }
        
        // Mark as attacked
        attacker.hasAttacked = true;

        // Check for game over
        let gameOver = false;
        let winner: string | null = null;
        if (opponent.hp <= 0) {
          gameOver = true;
          winner = player.id;
        }

        set({
          players: { ...state.players, [action.playerId]: player, [opponent.id]: opponent },
          attackDeclaration: {
            attacker: action.attackerId,
            target: action.targetId,
          },
          gameOver,
          winner,
        });
        break;
      }

      case 'END_TURN': {
        const nextPlayerId = state.currentPlayerId === 'p1' ? 'p2' : 'p1';
        const nextPlayer = state.players[nextPlayerId];
        const currentPlayer = state.players[state.currentPlayerId];
        
        // Reset hasAttacked for all creatures of current player
        currentPlayer.creatureZone.forEach(creature => {
          if (creature) creature.hasAttacked = false;
        });
        
        // Clear attack declaration
        nextPlayer.creatureZone.forEach(creature => {
          if (creature) creature.hasAttacked = false;
        });
        
        nextPlayer.spellTrapZone.forEach(slot => {
          if (slot.card?.isSet) slot.card.isSet = false;
        });

        set({
          turn: state.turn + 1,
          currentPlayerId: nextPlayerId,
          phase: 'draw',
          attackDeclaration: null,
          players: { ...state.players, [nextPlayerId]: nextPlayer, [state.currentPlayerId]: currentPlayer },
        });
        break;
      }
    }
  },
}));
