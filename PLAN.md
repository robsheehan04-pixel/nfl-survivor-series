# Multi-Sport Series Implementation Plan

## Overview
Extend the app to support different sports and series types:

### Sports & Competitions
1. **NFL (American Football)**
   - Regular Season Survivor
   - Playoff Pool

2. **Soccer/Football**
   - Last Man Standing (Survivor)
   - Competitions: English Premier League, World Cup 2026

---

## Phase 1: Type System & Data Model Updates

### New Types (src/types/index.ts)

```typescript
// Sport types
export type Sport = 'nfl' | 'soccer';

// Competition types per sport
export type NFLCompetition = 'regular_season' | 'playoffs';
export type SoccerCompetition = 'premier_league' | 'world_cup_2026';
export type Competition = NFLCompetition | SoccerCompetition;

// Series types per sport
export type NFLSeriesType = 'survivor' | 'playoff_pool';
export type SoccerSeriesType = 'last_man_standing';
export type SeriesType = NFLSeriesType | SoccerSeriesType;

// Updated Series interface
export interface Series {
  id: string;
  name: string;
  description: string;
  sport: Sport;                    // NEW
  competition: Competition;        // NEW
  seriesType: SeriesType;          // NEW
  createdBy: string;
  createdAt: Date;
  currentWeek: number;             // Can represent matchweek for soccer
  season: number;
  isActive: boolean;
  members: SeriesMember[];
  invitations: Invitation[];
  prizeValue?: number;
  showPrizeValue?: boolean;
  settings?: SeriesSettings;
}

// Sport-specific settings
export interface NFLSeriesSettings extends SeriesSettings {
  // Existing NFL settings already work
}

export interface SoccerSeriesSettings extends SeriesSettings {
  // Soccer-specific - might need different fields later
}
```

### Generic Team Interface

```typescript
// Generic team interface that works for any sport
export interface Team {
  id: string;
  name: string;
  shortName: string;        // e.g., "MUN", "BUF"
  logo: string;
  sport: Sport;
  competition: Competition;
}
```

---

## Phase 2: Data Files for Soccer Teams

### New File: src/data/soccerTeams.ts

```typescript
export interface SoccerTeam {
  id: string;
  name: string;
  shortName: string;
  logo: string;
  competition: 'premier_league' | 'world_cup_2026';
}

// Premier League Teams (20 teams)
export const premierLeagueTeams: SoccerTeam[] = [
  { id: 'arsenal', name: 'Arsenal', shortName: 'ARS', logo: '...', competition: 'premier_league' },
  { id: 'manchester_united', name: 'Manchester United', shortName: 'MUN', logo: '...', competition: 'premier_league' },
  // ... all 20 teams
];

// World Cup 2026 Teams (48 teams - qualified nations)
export const worldCup2026Teams: SoccerTeam[] = [
  // Will be populated as teams qualify
];
```

---

## Phase 3: Database Schema Updates

### Supabase Migration

```sql
-- Add new columns to series table
ALTER TABLE series
ADD COLUMN sport TEXT DEFAULT 'nfl' CHECK (sport IN ('nfl', 'soccer')),
ADD COLUMN competition TEXT DEFAULT 'regular_season',
ADD COLUMN series_type TEXT DEFAULT 'survivor';

-- Update existing series to have correct values
UPDATE series SET sport = 'nfl', competition = 'regular_season', series_type = 'survivor';
```

---

## Phase 4: Update CreateSeriesModal

### New Flow:
1. **Step 1: Select Sport** (NFL or Soccer)
2. **Step 2: Select Competition** (based on sport)
   - NFL: Regular Season, Playoffs
   - Soccer: Premier League, World Cup 2026
3. **Step 3: Select Series Type** (based on sport)
   - NFL: Survivor, Playoff Pool
   - Soccer: Last Man Standing
4. **Step 4: Name & Description**
5. **Step 5: Settings** (sport-specific settings)

### UI Mockup
```
┌─────────────────────────────────────┐
│  Create New Series                  │
├─────────────────────────────────────┤
│                                     │
│  Select Sport:                      │
│  ┌──────────┐  ┌──────────────┐     │
│  │   🏈     │  │     ⚽       │     │
│  │   NFL    │  │   Soccer     │     │
│  └──────────┘  └──────────────┘     │
│                                     │
│  [If NFL selected:]                 │
│  Competition:                       │
│  ○ Regular Season (Weeks 1-18)      │
│  ○ Playoffs                         │
│                                     │
│  Series Type:                       │
│  ○ Survivor (pick winners weekly)   │
│  ○ Playoff Pool (bracket picks)     │
│                                     │
│  [If Soccer selected:]              │
│  Competition:                       │
│  ○ English Premier League           │
│  ○ World Cup 2026                   │
│                                     │
│  Series Type:                       │
│  ○ Last Man Standing               │
│                                     │
└─────────────────────────────────────┘
```

---

## Phase 5: Component Updates

### Files to Update:
1. **CreateSeriesModal.tsx** - Add sport/competition/type selection
2. **WeeklyPicker.tsx** - Load correct teams based on series sport/competition
3. **Standings.tsx** - Generic display (already flexible)
4. **SeriesDetail.tsx** - Show sport icon, correct labels
5. **Sidebar.tsx** - Add sport icons to series list

### New Utility Functions:
```typescript
// src/lib/teams.ts
export function getTeamsForSeries(series: Series): Team[] {
  if (series.sport === 'nfl') {
    return nflTeams;
  }
  if (series.sport === 'soccer') {
    if (series.competition === 'premier_league') {
      return premierLeagueTeams;
    }
    if (series.competition === 'world_cup_2026') {
      return worldCup2026Teams;
    }
  }
  return [];
}

export function getWeekLabel(series: Series): string {
  if (series.sport === 'soccer') {
    return `Matchweek ${series.currentWeek}`;
  }
  return `Week ${series.currentWeek}`;
}
```

---

## Phase 6: Future Considerations (Not in Initial Scope)

1. **Playoff Pool Rules** - Different mechanics (bracket picking vs survivor)
2. **Soccer Fixtures API** - Real fixture data for EPL/World Cup
3. **More Competitions** - Champions League, La Liga, etc.
4. **More Sports** - NBA, MLB, etc.

---

## Implementation Order

1. ✅ Update types (src/types/index.ts)
2. ✅ Create soccer teams data file (src/data/soccerTeams.ts)
3. ✅ Create teams utility (src/lib/teams.ts)
4. ✅ Update database schema (Supabase migration)
5. ✅ Update CreateSeriesModal with sport selection
6. ✅ Update WeeklyPicker to use generic teams
7. ✅ Update Sidebar to show sport icons
8. ✅ Update SeriesDetail for sport-specific labels
9. ✅ Test with new series creation

---

## Questions for User

Before implementing, I need clarification on:

1. **Playoff Pool mechanics** - How does this differ from Survivor? Is it bracket-style picking?
2. **Soccer schedule data** - Should I hardcode a sample schedule, or just allow team picking without real fixtures for now?
3. **World Cup 2026** - Since teams aren't all qualified yet, should I include current qualified teams or wait?
