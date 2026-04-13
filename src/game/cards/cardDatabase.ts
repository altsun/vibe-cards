import { CardDefinition } from '../../types/card';

export const cardDatabase: CardDefinition[] = [
  // CREATURES
  {
    id: 'c001',
    name: 'Fire Dragon',
    type: 'creature',
    description: 'A fierce dragon born from flames. Charge: Can attack on the turn it was summoned.',
    cost: 4,
    attack: 1500,
    defense: 1000,
    keywords: ['charge'],
  },
  {
    id: 'c002',
    name: 'Stone Golem',
    type: 'creature',
    description: 'An ancient guardian with high defense. Taunt: Enemies must attack this creature first.',
    cost: 3,
    attack: 800,
    defense: 2000,
    keywords: ['taunt'],
  },
  {
    id: 'c003',
    name: 'Shadow Assassin',
    type: 'creature',
    description: 'Strikes from the darkness. Stealth: Cannot be targeted for attacks until it attacks.',
    cost: 2,
    attack: 1200,
    defense: 400,
    keywords: ['stealth'],
  },
  {
    id: 'c004',
    name: 'Skeleton Warrior',
    type: 'creature',
    description: 'Rises again after death. Deathrattle: Summon a 1/1 Skeleton token.',
    cost: 2,
    attack: 900,
    defense: 600,
    keywords: ['deathrattle'],
    onDeath: { type: 'search', value: 1 },
  },

  // NORMAL SPELLS
  {
    id: 's001',
    name: 'Fireball',
    type: 'normalSpell',
    description: 'Deal 500 damage to one target.',
    cost: 2,
    onActivate: { type: 'damage', value: 500, target: 'select' },
  },
  {
    id: 's002',
    name: 'Healing Light',
    type: 'normalSpell',
    description: 'Restore 800 HP to yourself.',
    cost: 2,
    onActivate: { type: 'heal', value: 800, target: 'self' },
  },
  {
    id: 's003',
    name: 'Dark Flare',
    type: 'normalSpell',
    description: 'Destroy one creature with 1000 or less attack.',
    cost: 3,
    onActivate: { type: 'destroy', target: 'creature' },
  },

  // CONTINUOUS SPELLS
  {
    id: 'cs001',
    name: 'Mystic Plasma Zone',
    type: 'continuousSpell',
    description: 'All your creatures gain 300 ATK.',
    cost: 3,
    continuousEffect: { type: 'globalBuff', stat: 'attack', value: 300, condition: 'ownCreatures' },
  },
  {
    id: 'cs002',
    name: 'Fortress Shield',
    type: 'continuousSpell',
    description: 'All your creatures gain 200 DEF.',
    cost: 2,
    continuousEffect: { type: 'globalBuff', stat: 'defense', value: 200, condition: 'ownCreatures' },
  },

  // EQUIP SPELLS
  {
    id: 'eq001',
    name: 'Sword of Flames',
    type: 'equipSpell',
    description: 'Equipped creature gains 500 ATK. When this card leaves the field, deal 300 damage.',
    cost: 2,
    equipEffect: { stat: 'attack', value: 500, onUnequip: { type: 'damage', value: 300, target: 'opponent' } },
  },
  {
    id: 'eq002',
    name: 'Armor of Light',
    type: 'equipSpell',
    description: 'Equipped creature gains 400 DEF and Divine Shield (first damage is nullified).',
    cost: 2,
    equipEffect: { stat: 'defense', value: 400 },
  },

  // TRAPS
  {
    id: 't001',
    name: 'Mirror Force',
    type: 'trap',
    trapType: 'normal',
    description: 'When an opponent creature attacks: Destroy all attacking creatures.',
    cost: 0,
    triggerCondition: { type: 'onAttackDeclared' },
    onActivate: { type: 'destroy', target: 'allCreatures' },
  },
  {
    id: 't002',
    name: 'Magic Cylinder',
    type: 'trap',
    trapType: 'normal',
    description: 'When an opponent creature attacks: Negate the attack and deal damage equal to the attacker ATK.',
    cost: 0,
    triggerCondition: { type: 'onAttackDeclared' },
    onActivate: { type: 'damage', target: 'opponent' },
  },
  {
    id: 't003',
    name: 'Solemn Warning',
    type: 'trap',
    trapType: 'counter',
    description: 'When opponent summons a creature or activates a spell/trap: Pay 500 HP to negate it.',
    cost: 0,
    triggerCondition: { type: 'onCardPlayed' },
    onActivate: { type: 'negate' },
  },
  {
    id: 't004',
    name: 'Trap Hole',
    type: 'trap',
    trapType: 'normal',
    description: 'When opponent summons a creature with 1000+ ATK: Destroy that creature.',
    cost: 0,
    triggerCondition: { type: 'onCreatureSummoned' },
    onActivate: { type: 'destroy', target: 'creature' },
  },
];

export function getCardById(id: string): CardDefinition | undefined {
  return cardDatabase.find(card => card.id === id);
}

export function createCardInstance(def: CardDefinition, ownerId: string): import('../../types/card').CardInstance {
  return {
    ...def,
    instanceId: `${def.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ownerId,
    isFaceDown: false,
    isSet: false,
    remainingHealth: def.defense,
  };
}
