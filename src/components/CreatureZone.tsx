import React from 'react';
import { CardInstance } from '../types/card';
import { Player } from '../types/game';
import { Card } from './Card';
import { getEffectiveStats } from '../game/engine/gameStore';

interface CreatureZoneProps {
  creatures: (CardInstance | null)[];
  isOwner: boolean;
  player?: Player;
  onPositionClick?: (position: number) => void;
  onCreatureClick?: (creature: CardInstance) => void;
  attackingCreatureId?: string | null;
  isTargetZone?: boolean;
  onTargetClick?: (creature: CardInstance) => void;
}

export const CreatureZone: React.FC<CreatureZoneProps> = ({
  creatures,
  isOwner,
  player,
  onPositionClick,
  onCreatureClick,
  attackingCreatureId,
  isTargetZone,
  onTargetClick,
}) => {
  return (
    <div className="creature-zone">
      <div className="zone-label">Creature Zone</div>
      <div className="zone-slots">
        {creatures.map((creature, index) => {
          const isAttacking = creature?.instanceId === attackingCreatureId;
          const isTargetable = isTargetZone && creature && !creature.isFaceDown;
          
          // Calculate effective stats if player is provided
          let effectiveAttack: number | undefined;
          let effectiveHp: number | undefined;
          if (creature && player) {
            const stats = getEffectiveStats(creature, player);
            effectiveAttack = stats.attack;
            effectiveHp = stats.hp;
          }
          
          return (
            <div
              key={index}
              className={`zone-slot ${creature ? 'occupied' : 'empty'} ${isTargetable ? 'targetable' : ''}`}
              onClick={() => {
                if (isTargetable && onTargetClick) {
                  onTargetClick(creature);
                } else if (creature) {
                  onCreatureClick?.(creature);
                } else {
                  onPositionClick?.(index);
                }
              }}
            >
              {creature ? (
                <Card
                  card={creature}
                  isOwner={isOwner}
                  isAttacking={isAttacking}
                  effectiveAttack={effectiveAttack}
                  effectiveHp={effectiveHp}
                  onClick={() => {
                    if (isTargetable && onTargetClick) {
                      onTargetClick(creature);
                    } else {
                      onCreatureClick?.(creature);
                    }
                  }}
                />
              ) : (
                <div className="empty-slot" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
