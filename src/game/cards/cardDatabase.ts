import { CardDefinition } from '../../types/card';

export const cardDatabase: CardDefinition[] = [
  // CREATURES - ATK and HP range: 1-10
  {
    id: 'c001',
    name: 'Fire Dragon',
    type: 'creature',
    description: 'A fierce dragon born from flames. Charge: Can attack on the turn it was summoned.',
    cost: 4,
    attack: 8,
    hp: 6,
    maxHp: 6,
    keywords: ['charge'],
  },
  {
    id: 'c002',
    name: 'Stone Golem',
    type: 'creature',
    description: 'An ancient guardian with high HP. Taunt: Enemies must attack this creature first.',
    cost: 3,
    attack: 4,
    hp: 10,
    maxHp: 10,
    keywords: ['taunt'],
  },
  {
    id: 'c003',
    name: 'Shadow Assassin',
    type: 'creature',
    description: 'Strikes from the darkness. Stealth: Cannot be targeted for attacks until it attacks.',
    cost: 2,
    attack: 6,
    hp: 3,
    maxHp: 3,
    keywords: ['stealth'],
  },
  {
    id: 'c004',
    name: 'Skeleton Warrior',
    type: 'creature',
    description: 'Rises again after death. Deathrattle: Summon a 1/1 Skeleton token.',
    cost: 2,
    attack: 5,
    hp: 4,
    maxHp: 4,
    keywords: ['deathrattle'],
    onDeath: { type: 'search', value: 1 },
  },

  // NORMAL SPELLS
  {
    id: 's001',
    name: 'Fireball',
    type: 'normalSpell',
    description: 'Deal 3 damage to one target.',
    cost: 2,
    onActivate: { type: 'damage', value: 3, target: 'select' },
  },
  {
    id: 's002',
    name: 'Healing Light',
    type: 'normalSpell',
    description: 'Restore 4 HP to yourself.',
    cost: 2,
    onActivate: { type: 'heal', value: 4, target: 'self' },
  },
  {
    id: 's003',
    name: 'Dark Flare',
    type: 'normalSpell',
    description: 'Destroy one creature with 4 or less attack.',
    cost: 3,
    onActivate: { type: 'destroy', target: 'creature' },
  },

  // CONTINUOUS SPELLS
  {
    id: 'cs001',
    name: 'Mystic Plasma Zone',
    type: 'continuousSpell',
    description: 'All your creatures gain 2 ATK.',
    cost: 3,
    continuousEffect: { type: 'globalBuff', stat: 'attack', value: 2, condition: 'ownCreatures' },
  },
  {
    id: 'cs002',
    name: 'Fortress Shield',
    type: 'continuousSpell',
    description: 'All your creatures gain 2 HP.',
    cost: 2,
    continuousEffect: { type: 'globalBuff', stat: 'hp', value: 2, condition: 'ownCreatures' },
  },

  // EQUIP SPELLS
  {
    id: 'eq001',
    name: 'Sword of Flames',
    type: 'equipSpell',
    description: 'Equipped creature gains 3 ATK. When this card leaves the field, deal 2 damage.',
    cost: 2,
    equipEffect: { stat: 'attack', value: 3, onUnequip: { type: 'damage', value: 2, target: 'opponent' } },
  },
  {
    id: 'eq002',
    name: 'Armor of Light',
    type: 'equipSpell',
    description: 'Equipped creature gains 3 HP and Divine Shield (first damage is nullified).',
    cost: 2,
    equipEffect: { stat: 'hp', value: 3 },
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
    description: 'When opponent summons a creature with 6+ ATK: Destroy that creature.',
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
    remainingHp: def.hp,
  };
}
