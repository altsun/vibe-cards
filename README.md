# Vibe Cards

A strategic card battle game inspired by Yu-Gi-Oh!, built with React + TypeScript + Vite.

![Game Screenshot](placeholder-screenshot.png)

## Features

### Game Mechanics
- **5 Card Types**: Creature, Normal Spell, Continuous Spell, Equip Spell, Trap
- **Mana System**: Gain 1 mana per turn (max 10) to play cards
- **Combat System**: ATK vs HP (simultaneous damage)
- **AI Opponent**: Strategic AI with effective stat calculation
- **Trap System**: Manual activation with full effect support
- **Card Tooltip**: Hover to see full card details
- **Summoning Sickness**: Creatures can't attack on summon turn

### Card Types

| Type | Description | Example |
|------|-------------|---------|
| **Creature** | Battle units with ATK/HP | Fire Dragon (7 ATK / 5 HP) |
| **Normal Spell** | Instant effect, goes to graveyard | Fireball (500 damage) |
| **Continuous Spell** | Stays on field, ongoing buff | Mystic Plasma Zone (+2 ATK) |
| **Equip Spell** | Attach to creature for buffs | Sword of Flames (+2 ATK) |
| **Trap** | Set face-down, trigger on conditions | Mirror Force (destroy attackers) |

### Keywords
- **Charge**: Can attack the turn it's summoned (ignores summoning sickness)
- **Taunt**: Enemies must attack this creature first
- **Stealth**: Can't be targeted until it attacks
- **Deathrattle**: Effect triggers when creature dies

### Game Rules
- **Summoning Sickness**: Creatures can't attack on the turn they're summoned (unless they have Charge)
- **Continuous Spells**: Buffs apply immediately and affect all valid creatures
- **Trap Activation**: Click your face-down trap to activate it during opponent's turn
- **Combat Damage**: Both creatures deal damage to each other's HP simultaneously

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand
- **Styling**: CSS (custom dark fantasy theme)
- **Animation**: Framer Motion (ready for implementation)

## Getting Started

### Prerequisites
- Node.js 20+ or 24+
- npm

### Installation

```bash
# Clone repository
git clone https://github.com/altsun/vibe-cards.git
cd vibe-cards

# Install dependencies
npm install

# Run development server
npm run dev
```

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── types/
│   ├── card.ts          # Card type definitions
│   └── game.ts          # Game state types
├── game/
│   ├── cards/
│   │   └── cardDatabase.ts    # Card definitions (16 cards)
│   ├── engine/
│   │   └── gameStore.ts        # Zustand store + game logic
│   └── ai/
│       └── aiPlayer.ts         # AI decision making
├── components/
│   ├── Card.tsx                # Card component
│   ├── CreatureZone.tsx        # Creature zone (5 slots)
│   ├── SpellTrapZone.tsx      # Spell & Trap zone (5 slots)
│   ├── Hand.tsx                # Hand display
│   └── GameBoard.tsx           # Main game board
└── App.tsx
```

## Game Flow

1. **Draw Phase**: Auto-draw 1 card
2. **Resource Phase**: Mana +1 (max 10), refill to max
3. **Main Phase**: Summon creatures, cast spells, set traps
4. **Battle Phase**: Declare attacks
5. **End Phase**: Turn ends, switch player

## AI Strategy

The AI opponent follows this priority:
1. Summon strongest creature available
2. Set traps in empty slots
3. Cast continuous spells for buffs
4. Cast damage spells
5. Attack weakest enemy creature (or direct attack)
6. Respects summoning sickness rules

## Future Improvements

- [ ] Card images/artwork
- [ ] Animation system (Framer Motion)
- [ ] Sound effects
- [ ] Deck builder
- [ ] Save/load game state
- [ ] Multiplayer support
- [ ] More cards and abilities
- [x] Trap card effects (Mirror Force, Magic Cylinder, etc.)
- [ ] Trap auto-trigger system (currently manual activation)
- [x] Continuous spell buffs in combat
- [x] Summoning sickness mechanic

## License

MIT

## Credits

Built by [altsun](https://github.com/altsun)
