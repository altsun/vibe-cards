export type CardType = 'creature' | 'normalSpell' | 'continuousSpell' | 'equipSpell' | 'trap';
export type TrapType = 'normal' | 'continuous' | 'counter';
export type Keyword = 'taunt' | 'charge' | 'deathrattle' | 'stealth' | 'divineShield';

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  description: string;
  cost: number;
  image?: string;
  
  // Creature stats
  attack?: number;
  defense?: number;
  keywords?: Keyword[];
  
  // Spell/Trap specific
  trapType?: TrapType;
  
  // Effects
  onSummon?: Effect;
  onAttack?: Effect;
  onDeath?: Effect;
  onActivate?: Effect;
  continuousEffect?: ContinuousEffect;
  equipEffect?: EquipEffect;
  triggerCondition?: TriggerCondition;
}

export interface Effect {
  type: 'damage' | 'heal' | 'draw' | 'destroy' | 'buff' | 'debuff' | 'search' | 'negate';
  value?: number;
  target?: 'self' | 'opponent' | 'creature' | 'allCreatures' | 'select';
}

export interface ContinuousEffect {
  type: 'globalBuff' | 'fieldControl' | 'resourceBonus';
  stat?: 'attack' | 'defense';
  value?: number;
  condition?: string;
}

export interface EquipEffect {
  stat: 'attack' | 'defense';
  value: number;
  onUnequip?: Effect;
}

export interface TriggerCondition {
  type: 'onAttackDeclared' | 'onCardPlayed' | 'onCreatureSummoned' | 'onDamageTaken' | 'onPhaseChange' | 'manual';
  phase?: string;
}

export interface CardInstance extends CardDefinition {
  instanceId: string;
  ownerId: string;
  isFaceDown: boolean;
  isSet: boolean;
  equipTarget?: string;
  remainingHealth?: number;
}

export interface SpellTrapZoneSlot {
  index: number;
  card: CardInstance | null;
  isOccupied: boolean;
}
