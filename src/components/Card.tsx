import React from 'react';
import { CardInstance, CardType } from '../types/card';

interface CardProps {
  card: CardInstance;
  faceDown?: boolean;
  isSet?: boolean;
  isOwner?: boolean;
  compact?: boolean;
  isAttacking?: boolean;
  onClick?: () => void;
}

const getCardTypeLabel = (type: CardType): string => {
  const labels: Record<CardType, string> = {
    creature: 'Creature',
    normalSpell: 'Spell',
    continuousSpell: 'Cont. Spell',
    equipSpell: 'Equip',
    trap: 'Trap',
  };
  return labels[type];
};

const getCardTypeColor = (type: CardType): string => {
  const colors: Record<CardType, string> = {
    creature: '#8B4513',
    normalSpell: '#2E8B57',
    continuousSpell: '#228B22',
    equipSpell: '#4682B4',
    trap: '#8B008B',
  };
  return colors[type];
};

export const Card: React.FC<CardProps> = ({
  card,
  faceDown = false,
  isSet = false,
  isOwner = true,
  compact = false,
  isAttacking = false,
  onClick,
}) => {
  // Show card back if face down and not owner
  if (faceDown && !isOwner) {
    return (
      <div className={`card card-back ${compact ? 'compact' : ''}`} onClick={onClick}>
        <div className="card-pattern" />
      </div>
    );
  }

  // Show set card (face down, only owner knows what it is)
  if (faceDown && isOwner) {
    return (
      <div className={`card card-set ${compact ? 'compact' : ''}`} onClick={onClick}>
        <div className="card-set-indicator">SET</div>
        <div className="card-mini-info">{card.name}</div>
      </div>
    );
  }

  return (
    <div
      className={`card ${compact ? 'compact' : ''} ${isAttacking ? 'attacking' : ''} ${isSet ? 'just-set' : ''}`}
      style={{ borderColor: getCardTypeColor(card.type) }}
      onClick={onClick}
    >
      {isSet && <div className="set-badge">SET</div>}
      <div className="card-header" style={{ backgroundColor: getCardTypeColor(card.type) }}>
        <div className="card-cost">{card.cost}</div>
        <div className="card-name">{card.name}</div>
        <div className="card-type">{getCardTypeLabel(card.type)}</div>
      </div>

      <div className="card-image">
        {card.image ? (
          <img src={card.image} alt={card.name} />
        ) : (
          <div className="placeholder-image">{card.name[0]}</div>
        )}
      </div>

      <div className="card-body">
        {card.type === 'creature' && (
          <div className="creature-stats">
            <span className="stat atk">{card.attack}</span>
            <span className="stat hp">{card.remainingHp ?? card.hp}/{card.hp}</span>
          </div>
        )}
        
        {card.keywords && card.keywords.length > 0 && (
          <div className="keywords">
            {card.keywords.map(k => (
              <span key={k} className="keyword">{k}</span>
            ))}
          </div>
        )}

        <div className="card-description">{card.description}</div>
      </div>
    </div>
  );
};
