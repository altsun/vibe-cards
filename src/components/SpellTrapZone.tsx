import React from 'react';
import { SpellTrapZoneSlot, CardInstance } from '../types/card';
import { Card } from './Card';

interface SpellTrapZoneProps {
  zones: SpellTrapZoneSlot[];
  isOwner: boolean;
  onZoneClick?: (index: number) => void;
  onCardActivate?: (card: CardInstance) => void;
}

export const SpellTrapZone: React.FC<SpellTrapZoneProps> = ({
  zones,
  isOwner,
  onZoneClick,
  onCardActivate,
}) => {
  return (
    <div className="spell-trap-zone">
      <div className="zone-label">Spell & Trap Zone</div>
      <div className="zone-slots">
        {zones.map((slot) => (
          <div
            key={slot.index}
            className={`zone-slot ${slot.isOccupied ? 'occupied' : 'empty'}`}
            onClick={() => onZoneClick?.(slot.index)}
          >
            {slot.card ? (
              <Card
                card={slot.card}
                faceDown={slot.card.isFaceDown}
                isSet={slot.card.isSet}
                isOwner={isOwner}
                onClick={() => !slot.card!.isFaceDown && onCardActivate?.(slot.card!)}
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
