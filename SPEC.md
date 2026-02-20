# Casino Simulation - Project Specification

## 1. Project Overview

**Project Name:** Lucky Palace Casino
**Type:** Web Application (Single Page Application)
**Core Functionality:** A fully-featured online casino simulation with multiple games, user accounts, virtual currency, leaderboards, and achievements. Uses virtual credits only - no real money.
**Target Users:** Casual players seeking entertainment, game developers learning casino mechanics

---

## 2. Technical Stack

- **Frontend:** React 18 with Vite
- **Styling:** CSS Modules with custom properties
- **State Management:** React Context + useReducer
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Animations:** CSS transitions + keyframes
- **Data Persistence:** localStorage (no backend required)

---

## 3. UI/UX Specification

### Color Palette

| Role | Color | Hex |
|------|-------|-----|
| Background (Dark) | Rich Black | `#0a0a0f` |
| Background (Card) | Dark Purple | `#1a1a2e` |
| Primary | Gold | `#ffd700` |
| Primary Hover | Bright Gold | `#ffed4a` |
| Secondary | Ruby | `#e0115f` |
| Accent | Emerald | `#50c878` |
| Text Primary | White | `#ffffff` |
| Text Secondary | Silver | `#b8b8b8` |
| Danger/Loss | Crimson | `#dc143c` |
| Success/Win | Lime | `#32cd32` |

### Typography

- **Primary Font:** "Playfair Display" (headings) - elegant casino feel
- **Secondary Font:** "Outfit" (body) - clean, modern readability
- **Heading Sizes:** H1: 3rem, H2: 2rem, H3: 1.5rem
- **Body Size:** 1rem (16px)
- **Small Text:** 0.875rem

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│  HEADER: Logo | Navigation | Balance | Profile        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│                    MAIN CONTENT                        │
│              (Game Floor / Game View)                  │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  FOOTER: Quick Links | Version                        │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Visual Effects
- Card hover: lift with gold glow
- Button press: scale(0.98)
- Win animations: particle burst + gold flash
- Loss: subtle red pulse
- Smooth page transitions (300ms)

---

## 4. Core Features

### 4.1 User System
- **Registration:** Username, password (stored hashed in localStorage)
- **Login/Logout:** Session management
- **Profile:** Username, avatar selection, join date, stats
- **Initial Balance:** 10,000 virtual credits on signup

### 4.2 Virtual Currency
- **Starting Credits:** 10,000
- **Daily Bonus:** +1,000 credits every 24 hours
- **Display:** Formatted with commas (e.g., 100,000)
- **Transactions:** Full history with timestamps

### 4.3 Games

#### Slot Machines (3 varieties)
1. **Classic Slots** - 3 reels, traditional symbols (BAR, 7s, cherries)
2. **Video Slots** - 5 reels, 20 paylines, wilds, scatters
3. **Progressive Slots** - 5 reels, growing jackpot

**Slot Mechanics:**
- Bet range: 10 - 1,000 credits
- Multiple paylines (1, 5, 10, 20)
- Wild symbols substitute for others
- Scatter triggers free spins
- Bonus rounds for big wins

#### Table Games
1. **Blackjack** - Classic 21 with dealer
2. **Roulette** - European style (single zero)
3. **Baccarat** - Player/Banker/Tie betting
4. **Poker** - Video poker style (Jacks or Better)

**Table Game Mechanics:**
- Proper game rules and payouts
- Hit/Stand/Double/Split for blackjack
- Inside/Outside bets for roulette
- Card animations
- Dealer AI

### 4.4 Leaderboards
- **Categories:** Highest win, most games played, biggest jackpot
- **Time Filters:** All-time, weekly, daily
- **Top 10 display** with usernames and scores

### 4.5 Achievements
| Achievement | Requirement |
|-------------|-------------|
| First Spin | Play first slot spin |
| First Deal | Play first hand of blackjack |
| Lucky Streak | Win 5 bets in a row |
| Big Winner | Win 10,000+ in single bet |
| High Roller | Bet 1,000+ credits |
| VIP Member | Play 100 games |
| Fortune Builder | Accumulate 50,000 credits |
| Slot Master | Win on all 3 slot machines |

### 4.6 Game History
- Last 50 bets/games
- Win/Loss tracking
- Timestamp for each

---

## 5. Page Structure

### Pages
1. **Lobby** (`/`) - Game selection floor
2. **Slots** (`/slots`) - Slot machine gallery
3. **Table Games** (`/tables`) - Table game selection
4. **Profile** (`/profile`) - User stats and settings
5. **Leaderboards** (`/leaderboards`) - Rankings
6. **Login** (`/login`) - Auth page
7. **Register** (`/register`) - Sign up

### Game Views
- Each game has its own route (e.g., `/game/slots/classic`)

---

## 6. Game Rules & Payouts

### Slot Payouts (Classic)
| Symbol | 3 Reels |
|--------|---------|
| 7 (Triple) | 100x |
| BAR | 50x |
| Cherries | 20x |
| Any 7 | 10x |

### Blackjack
- Blackjack pays 3:2
- Dealer stands on 17
- Blackjack pays 3:2
- Insurance available

### Roulette (European)
- Single number: 35:1
- Split: 17:1
- Street: 11:1
- Corner: 8:1
- Red/Black: 1:1
- Even/Odd: 1:1
- Dozens: 2:1

### Baccarat
- Player win: 1:1
- Banker win: 0.95:1 (5% commission)
- Tie: 8## 7.:1

---

 Acceptance Criteria

### Must Have
- [ ] User can register and login
- [ ] Virtual balance displays correctly
- [ ] All 7 games functional with proper rules
- [ ] Betting system works (deduct credits, add winnings)
- [ ] Leaderboards display and update
- [ ] Achievements unlock and display
- [ ] Responsive on mobile/tablet/desktop
- [ ] Smooth animations and transitions
- [ ] Game history tracks bets

### Visual Checkpoints
- [ ] Gold/black casino theme consistent
- [ ] Slot animations spin smoothly
- [ ] Card dealing has animation
- [ ] Roulette wheel spins
- [ ] Win celebrations feel rewarding
- [ ] Dark theme easy on eyes

### Performance
- [ ] Initial load < 3 seconds
- [ ] Game interactions instant (<100ms)
- [ ] No memory leaks during extended play
