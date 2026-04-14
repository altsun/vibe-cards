import React from 'react';
import { CardInstance } from '../types/card';
import { Card } from './Card';

interface CreatureZoneProps {
  creatures: (CardInstance | null)[];
  isOwner: boolean;
  onPositionClick?: (position: number) => void;
  onCreatureClick?: (creature: CardInstance) => void;
  attackingCreatureId?: string | null;
  isTargetZone?: boolean;
  onTargetClick?: (creature: CardInstance) => void;
}

export const CreatureZone: React.FC<CreatureZoneProps> = ({
  creatures,
  isOwner,
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
