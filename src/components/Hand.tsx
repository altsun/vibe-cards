import React from 'react';
import { CardInstance } from '../types/card';
import { Card } from './Card';

interface HandProps {
  cards: CardInstance[];
  onCardClick?: (card: CardInstance) => void;
}

export const Hand: React.FC<HandProps> = ({ cards, onCardClick }) => {
  return (
    <div className="hand">
      <div className="zone-label">Hand ({cards.length})</div>
      <div className="hand-cards">
        {cards.map((card) => (
          <div key={card.instanceId} className="hand-card">
            <Card
              card={card}
              isOwner={true}
              compact={true}
              onClick={() => onCardClick?.(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
