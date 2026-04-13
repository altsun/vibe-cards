import { CardInstance, SpellTrapZoneSlot } from './card';

export type Phase = 'draw' | 'resource' | 'main' | 'battle' | 'end';

export interface Player {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  mana: number;
  maxMana: number;
  deck: CardInstance[];
  hand: CardInstance[];
  graveyard: CardInstance[];
  creatureZone: (CardInstance | null)[]; // 5 slots
  spellTrapZone: SpellTrapZoneSlot[]; // 5 slots
}

export interface GameState {
  turn: number;
  currentPlayerId: string;
  phase: Phase;
  players: Record<string, Player>;
  attackDeclaration: {
    attacker: string | null;
    target: string | null;
  } | null;
  chainStack: ChainLink[];
  gameOver: boolean;
  winner: string | null;
}

export interface ChainLink {
  cardId: string;
  playerId: string;
  effect: string;
  target?: string;
}

export type GameAction = 
  | { type: 'DRAW_CARD'; playerId: string }
  | { type: 'SUMMON_CREATURE'; playerId: string; cardId: string; position: number }
  | { type: 'CAST_SPELL'; playerId: string; cardId: string; target?: string }
  | { type: 'ACTIVATE_TRAP'; playerId: string; cardId: string; target?: string }
  | { type: 'SET_TRAP'; playerId: string; cardId: string; position: number }
  | { type: 'DECLARE_ATTACK'; playerId: string; attackerId: string; targetId: string | 'direct' }
  | { type: 'NEXT_PHASE' }
  | { type: 'END_TURN' };
