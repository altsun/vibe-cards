import { GameState, GameAction, Player } from '../../types/game';
import { CardInstance } from '../../types/card';

export class AIPlayer {
  private playerId: string;

  constructor(playerId: string) {
    this.playerId = playerId;
  }

  public makeDecision(state: GameState): GameAction | null {
    const player = state.players[this.playerId];
    const opponent = this.getOpponent(state);

    switch (state.phase) {
      case 'draw':
        return { type: 'NEXT_PHASE' };

      case 'resource':
        return { type: 'NEXT_PHASE' };

      case 'main':
        return this.decideMainPhase(player, opponent);

      case 'battle':
        return this.decideBattlePhase(player, opponent);

      case 'end':
        return { type: 'END_TURN' };

      default:
        return null;
    }
  }

  private getOpponent(state: GameState): Player {
    const opponentId = this.playerId === 'p1' ? 'p2' : 'p1';
    return state.players[opponentId];
  }

  private decideMainPhase(player: Player, opponent: Player): GameAction | null {
    // Priority 1: Summon creatures with highest attack
    const creatures = player.hand.filter(c => c.type === 'creature');
    if (creatures.length > 0) {
      // Sort by attack (highest first)
      creatures.sort((a, b) => (b.attack || 0) - (a.attack || 0));

      for (const creature of creatures) {
        if (creature.cost <= player.mana) {
          const emptyPosition = player.creatureZone.findIndex(c => c === null);
          if (emptyPosition !== -1) {
            return {
              type: 'SUMMON_CREATURE',
              playerId: this.playerId,
              cardId: creature.instanceId,
              position: emptyPosition
            };
          }
        }
      }
    }

    // Priority 2: Set traps
    const traps = player.hand.filter(c => c.type === 'trap');
    if (traps.length > 0) {
      for (const trap of traps) {
        const emptySlot = player.spellTrapZone.findIndex(s => !s.isOccupied);
        if (emptySlot !== -1) {
          return {
            type: 'SET_TRAP',
            playerId: this.playerId,
            cardId: trap.instanceId,
            position: emptySlot
          };
        }
      }
    }

    // Priority 3: Cast continuous spells for buffs
    const continuousSpells = player.hand.filter(c => c.type === 'continuousSpell');
    if (continuousSpells.length > 0) {
      for (const spell of continuousSpells) {
        if (spell.cost <= player.mana) {
          return {
            type: 'CAST_SPELL',
            playerId: this.playerId,
            cardId: spell.instanceId
          };
        }
      }
    }

    // Priority 4: Cast damage spells on opponent
    const damageSpells = player.hand.filter(c => 
      c.type === 'normalSpell' && c.onActivate?.type === 'damage'
    );
    if (damageSpells.length > 0 && opponent.creatureZone.some(c => c !== null)) {
      for (const spell of damageSpells) {
        if (spell.cost <= player.mana) {
          return {
            type: 'CAST_SPELL',
            playerId: this.playerId,
            cardId: spell.instanceId
          };
        }
      }
    }

    // No more actions, go to battle phase
    return { type: 'NEXT_PHASE' };
  }

  private decideBattlePhase(player: Player, opponent: Player): GameAction | null {
    // Find creatures that can attack
    const attackingCreatures = player.creatureZone.filter(c => 
      c !== null && c.attack && c.attack > 0
    ) as CardInstance[];

    if (attackingCreatures.length === 0) {
      return { type: 'NEXT_PHASE' };
    }

    // Find opponent creatures
    const opponentCreatures = opponent.creatureZone.filter(c => c !== null) as CardInstance[];

    // If opponent has creatures, attack the weakest one
    if (opponentCreatures.length > 0) {
      opponentCreatures.sort((a, b) => (a.defense || 0) - (b.defense || 0));
      const target = opponentCreatures[0];

      // Find strongest attacker
      attackingCreatures.sort((a, b) => (b.attack || 0) - (a.attack || 0));
      const attacker = attackingCreatures[0];

      return {
        type: 'DECLARE_ATTACK',
        playerId: this.playerId,
        attackerId: attacker.instanceId,
        targetId: target.instanceId
      };
    }

    // No opponent creatures, attack directly
    const attacker = attackingCreatures[0];
    return {
      type: 'DECLARE_ATTACK',
      playerId: this.playerId,
      attackerId: attacker.instanceId,
      targetId: 'direct' // Special target for direct attack
    };
  }
}
