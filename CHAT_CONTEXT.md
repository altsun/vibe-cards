# Chat Context - Vibe Cards Project

## Project Overview
**Vibe Cards** - Strategic card battle game (Yu-Gi-Oh! inspired)
- **Tech**: React + TypeScript + Vite + Zustand
- **Player**: 1 player vs AI
- **Status**: Fully playable, core mechanics complete

## Current Implementation (Last Updated: 2026-04-14)

### Completed Features
- ✅ 5 Card Types: Creature, Normal Spell, Continuous Spell, Equip Spell, Trap
- ✅ Mana system (gain 1 per turn, max 10)
- ✅ Turn phases: Draw → Resource → Main → Battle → End
- ✅ AI opponent with strategic decision making
- ✅ Combat system: ATK vs HP (simultaneous damage, stats 1-10 range)
- ✅ Spell & Trap Zone (5 slots, Yu-Gi-Oh! style)
- ✅ Trap set/activate with full effect support
- ✅ Hidden opponent hand (card back display)
- ✅ Game over detection
- ✅ Starter deck (16 cards)
- ✅ **Player attack system** - Select attacker then target
- ✅ **Summoning sickness** - Creatures can't attack on summon turn (unless Charge)
- ✅ **Continuous spell buffs** - Effective stats calculation in combat
- ✅ **Card tooltip** - Hover to see full card info
- ✅ **Trap effects** - Mirror Force, Magic Cylinder, Solemn Warning, Trap Hole

### Card Database (16 cards)
**Creatures (4)**: Fire Dragon (7/5), Stone Golem (4/10), Shadow Assassin (6/3), Skeleton Warrior (5/4)
**Normal Spells (3)**: Fireball (3 damage), Healing Light (heal 3), Dark Flare
**Continuous Spells (2)**: Mystic Plasma Zone (+2 ATK), Fortress Shield (+2 HP)
**Equip Spells (2)**: Sword of Flames (+2 ATK), Armor of Light (+2 HP)
**Traps (4)**: Mirror Force, Magic Cylinder, Solemn Warning, Trap Hole

### Keywords Implemented
- **Charge** - Can attack immediately (ignores summoning sickness)
- **Taunt** - Enemies must attack this creature first
- **Stealth** - Can't be targeted until it attacks
- **Deathrattle** - Effect triggers when creature dies (not fully implemented)

### Game Rules
1. **Summoning Sickness**: Creatures summoned this turn cannot attack (unless has Charge keyword)
2. **Combat**: Both creatures deal damage equal to their ATK to each other's HP simultaneously
3. **Continuous Spells**: Apply buffs immediately, affect all valid creatures, show as golden text
4. **Traps**: Set face-down from hand, click to activate during opponent's turn
5. **Player Attack**: In Battle Phase, click your creature to select attacker, then click target or "Direct Attack" button

### Recent Major Changes (2026-04-14)
1. **Combat System Overhaul**: Changed from ATK/DEF to ATK/HP (creatures take damage to HP)
2. **Stat Scale Update**: All creature stats now in 1-10 range
3. **Summoning Sickness**: New mechanic preventing immediate attacks
4. **Continuous Spell Fix**: Buffs now properly calculated in combat via `getEffectiveStats()`
5. **Trap Effects**: Full implementation with destroy/damage/negate effects
6. **Player Combat**: Full attack system with attacker/target selection
7. **UI Improvements**: Card tooltip on hover, no more zone blinking, cleaner layout

### Known Issues / TODO
- [ ] Deathrattle effects not fully implemented
- [ ] Trap auto-trigger system (currently manual activation only)
- [ ] No card images (using placeholders)
- [ ] No animations
- [ ] No sound effects
- [ ] Equip spells don't actually attach to specific creatures yet
- [ ] Deck builder UI

### Architecture Decisions
- **State**: Zustand store with dispatch pattern for actions
- **AI**: Priority-based decision making with effective stat calculation
- **UI**: Dark fantasy theme, card back for hidden cards, hover tooltips
- **Zone Layout**: 5-slot Spell & Trap Zone (shared)
- **Combat**: Simultaneous damage to HP system

### Key Functions
- `getEffectiveStats(creature, player)` - Calculate buffed ATK/HP from continuous spells
- Creature selection in Battle Phase → target selection → attack dispatch

### Next Session Ideas
1. Add card images/artwork system
2. Implement Framer Motion animations
3. Add trap auto-trigger on conditions
4. Complete Deathrattle effects
5. Add deck builder UI
6. Add sound effects
7. Implement equip spell attachment to specific creatures
8. Add game log/history

## Development Notes

### Running the Game
```bash
cd G:\Work\vibe-cards
npm run dev
# Open http://localhost:5173/ (or 5174 if port in use)
```

### Key Files to Know
- `src/game/engine/gameStore.ts` - Main game logic, combat, effects
- `src/game/ai/aiPlayer.ts` - AI decision making
- `src/game/cards/cardDatabase.ts` - Card definitions (16 cards)
- `src/components/GameBoard.tsx` - Main UI, player attack handlers
- `src/components/Card.tsx` - Card display with tooltip
- `src/types/game.ts` - TypeScript interfaces
- `src/types/card.ts` - Card type definitions

### Git Repository
- Origin: https://github.com/altsun/vibe-cards.git
- Main branch: main
- Recent commits: Add-summoning-sickness-rule, Fix-trap-card-activation, etc.
