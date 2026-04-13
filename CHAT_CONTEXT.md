# Chat Context - Vibe Cards Project

## Project Overview
**Vibe Cards** - Strategic card battle game (Yu-Gi-Oh! inspired)
- **Tech**: React + TypeScript + Vite + Zustand
- **Player**: 1 player vs AI
- **Status**: Core mechanics implemented, playable

## Current Implementation (Last Updated: 2026-04-13)

### Completed Features
- ✅ 5 Card Types: Creature, Normal Spell, Continuous Spell, Equip Spell, Trap
- ✅ Mana system (gain 1 per turn, max 10)
- ✅ Turn phases: Draw → Resource → Main → Battle → End
- ✅ AI opponent with strategic decision making
- ✅ Combat system (ATK vs DEF, direct attack)
- ✅ Spell & Trap Zone (5 slots, Yu-Gi-Oh! style)
- ✅ Trap set/activate logic
- ✅ Hidden opponent hand (card back display)
- ✅ Game over detection
- ✅ Starter deck (16 cards)

### Card Database (16 cards)
**Creatures (4)**: Fire Dragon, Stone Golem, Shadow Assassin, Skeleton Warrior
**Normal Spells (3)**: Fireball, Healing Light, Dark Flare
**Continuous Spells (2)**: Mystic Plasma Zone, Fortress Shield
**Equip Spells (2)**: Sword of Flames, Armor of Light
**Traps (4)**: Mirror Force, Magic Cylinder, Solemn Warning, Trap Hole

### Keywords Implemented
- Charge, Taunt, Stealth, Deathrattle

### Known Issues / TODO
- [ ] Deathrattle effects not fully implemented
- [ ] Trap trigger system incomplete (no actual trigger check)
- [ ] No card images (using placeholders)
- [ ] No animations
- [ ] No sound effects
- [ ] Equip spells don't actually attach to creatures yet
- [ ] Continuous spell effects not applied in combat

### Architecture Decisions
- **State**: Zustand store with dispatch pattern for actions
- **AI**: Simple priority-based decision making
- **UI**: Dark fantasy theme, card back for hidden cards
- **Zone Layout**: 5-slot Spell & Trap Zone (shared)

### Next Session Ideas
1. Add card images/artwork system
2. Implement Framer Motion animations
3. Complete trap trigger system
4. Add deck builder UI
5. Add sound effects
6. Implement equip spell attachment logic
7. Add more cards (expand database)
8. Add game log/history

## Development Notes

### Running the Game
```bash
cd G:\Work\vibe-cards
npm run dev
# Open http://localhost:5173/
```

### Key Files to Know
- `src/game/engine/gameStore.ts` - Main game logic
- `src/game/ai/aiPlayer.ts` - AI decision making
- `src/game/cards/cardDatabase.ts` - Card definitions
- `src/components/GameBoard.tsx` - Main UI
- `src/types/game.ts` - TypeScript interfaces

### Git Repository
- Origin: https://github.com/altsun/vibe-cards.git
- Main branch: main
