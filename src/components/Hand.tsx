import React from 'react';
import { CardInstance } from '../types/card';
import { Card } from './Card';

interface HandProps {
  cards: CardInstance[];
  onCardClick?: (card: CardInstance) => void;
  hidden?: boolean;
}

export const Hand: React.FC<HandProps> = ({ cards, onCardClick, hidden = false }) => {
  return (
    <div className="hand">
      <div className="zone-label">Hand ({cards.length})</div>
      <div className="hand-cards">
        {cards.map((card) => (
          <div key={card.instanceId} className="hand-card">
            {hidden ? (
              <div className="card card-back compact">
                <div className="card-pattern" />
              </div>
            ) : (
              <Card
                card={card}
                isOwner={true}
                compact={true}
                onClick={() => onCardClick?.(card)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
