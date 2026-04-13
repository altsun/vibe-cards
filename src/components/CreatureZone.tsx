import React from 'react';
import { CardInstance } from '../types/card';
import { Card } from './Card';

interface CreatureZoneProps {
  creatures: (CardInstance | null)[];
  isOwner: boolean;
  onPositionClick?: (position: number) => void;
  onCreatureClick?: (creature: CardInstance) => void;
}

export const CreatureZone: React.FC<CreatureZoneProps> = ({
  creatures,
  isOwner,
  onPositionClick,
  onCreatureClick,
}) => {
  return (
    <div className="creature-zone">
      <div className="zone-label">Creature Zone</div>
      <div className="zone-slots">
        {creatures.map((creature, index) => (
          <div
            key={index}
            className={`zone-slot ${creature ? 'occupied' : 'empty'}`}
            onClick={() => creature ? onCreatureClick?.(creature) : onPositionClick?.(index)}
          >
            {creature ? (
              <Card
                card={creature}
                isOwner={isOwner}
                onClick={() => onCreatureClick?.(creature)}
              />
            ) : (
              <div className="empty-slot" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
