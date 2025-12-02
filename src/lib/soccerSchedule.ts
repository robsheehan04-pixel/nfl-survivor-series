// Premier League Schedule and Fixtures Service
// Provides matchup data for the current matchweek

export interface SoccerMatchup {
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  isComplete: boolean;
  homeScore?: number;
  awayScore?: number;
}

export interface MatchweekSchedule {
  matchweek: number;
  season: string;
  games: SoccerMatchup[];
}

// Premier League 2024-25 fixtures
// Current matchweek is 14 (as of December 2024)
const MATCHWEEK_DATA: Record<number, SoccerMatchup[]> = {
  // Matchweek 14 - December 7-8, 2024
  14: [
    { homeTeam: 'eve', awayTeam: 'liv', gameTime: new Date('2024-12-07T12:30:00'), isComplete: true, homeScore: 0, awayScore: 0 },
    { homeTeam: 'avl', awayTeam: 'sou', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 1, awayScore: 0 },
    { homeTeam: 'bou', awayTeam: 'whu', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 1, awayScore: 1 },
    { homeTeam: 'cry', awayTeam: 'mci', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 2, awayScore: 2 },
    { homeTeam: 'ful', awayTeam: 'ars', gameTime: new Date('2024-12-08T14:00:00'), isComplete: true, homeScore: 1, awayScore: 1 },
    { homeTeam: 'lei', awayTeam: 'bha', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 2, awayScore: 2 },
    { homeTeam: 'mun', awayTeam: 'nfo', gameTime: new Date('2024-12-07T17:30:00'), isComplete: true, homeScore: 3, awayScore: 2 },
    { homeTeam: 'tot', awayTeam: 'che', gameTime: new Date('2024-12-08T16:30:00'), isComplete: true, homeScore: 3, awayScore: 4 },
    { homeTeam: 'wol', awayTeam: 'ips', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 0, awayScore: 2 },
    { homeTeam: 'new', awayTeam: 'bre', gameTime: new Date('2024-12-07T15:00:00'), isComplete: true, homeScore: 3, awayScore: 3 },
  ],
  // Matchweek 15 - December 14-15, 2024
  15: [
    { homeTeam: 'ars', awayTeam: 'eve', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'bha', awayTeam: 'cry', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'che', awayTeam: 'bre', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'ips', awayTeam: 'bou', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'liv', awayTeam: 'ful', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'mci', awayTeam: 'mun', gameTime: new Date('2024-12-15T16:30:00'), isComplete: false },
    { homeTeam: 'nfo', awayTeam: 'avl', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'sou', awayTeam: 'tot', gameTime: new Date('2024-12-15T14:00:00'), isComplete: false },
    { homeTeam: 'whu', awayTeam: 'wol', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
    { homeTeam: 'lei', awayTeam: 'new', gameTime: new Date('2024-12-14T15:00:00'), isComplete: false },
  ],
  // Matchweek 16 - December 21-22, 2024
  16: [
    { homeTeam: 'avl', awayTeam: 'mci', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'bou', awayTeam: 'cry', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'bre', awayTeam: 'nfo', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'eve', awayTeam: 'che', gameTime: new Date('2024-12-22T14:00:00'), isComplete: false },
    { homeTeam: 'ful', awayTeam: 'sou', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'liv', awayTeam: 'tot', gameTime: new Date('2024-12-22T16:30:00'), isComplete: false },
    { homeTeam: 'mun', awayTeam: 'bou', gameTime: new Date('2024-12-22T14:00:00'), isComplete: false },
    { homeTeam: 'new', awayTeam: 'ips', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'whu', awayTeam: 'bha', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
    { homeTeam: 'wol', awayTeam: 'lei', gameTime: new Date('2024-12-21T15:00:00'), isComplete: false },
  ],
  // Matchweek 17 - December 26, 2024 (Boxing Day)
  17: [
    { homeTeam: 'ars', awayTeam: 'ips', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'bha', awayTeam: 'bre', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'che', awayTeam: 'ful', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'cry', awayTeam: 'sou', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'lei', awayTeam: 'liv', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'mci', awayTeam: 'eve', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'nfo', awayTeam: 'wol', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'tot', awayTeam: 'bou', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'whu', awayTeam: 'new', gameTime: new Date('2024-12-26T15:00:00'), isComplete: false },
    { homeTeam: 'avl', awayTeam: 'mun', gameTime: new Date('2024-12-26T20:00:00'), isComplete: false },
  ],
  // Matchweek 18 - December 29, 2024
  18: [
    { homeTeam: 'bou', awayTeam: 'cry', gameTime: new Date('2024-12-29T15:00:00'), isComplete: false },
    { homeTeam: 'bre', awayTeam: 'ars', gameTime: new Date('2024-12-29T14:00:00'), isComplete: false },
    { homeTeam: 'eve', awayTeam: 'nfo', gameTime: new Date('2024-12-29T15:00:00'), isComplete: false },
    { homeTeam: 'ful', awayTeam: 'ips', gameTime: new Date('2024-12-29T15:00:00'), isComplete: false },
    { homeTeam: 'lei', awayTeam: 'mci', gameTime: new Date('2024-12-29T16:30:00'), isComplete: false },
    { homeTeam: 'liv', awayTeam: 'whu', gameTime: new Date('2024-12-29T17:15:00'), isComplete: false },
    { homeTeam: 'mun', awayTeam: 'new', gameTime: new Date('2024-12-30T20:00:00'), isComplete: false },
    { homeTeam: 'sou', awayTeam: 'bha', gameTime: new Date('2024-12-29T15:00:00'), isComplete: false },
    { homeTeam: 'tot', awayTeam: 'wol', gameTime: new Date('2024-12-29T15:00:00'), isComplete: false },
    { homeTeam: 'che', awayTeam: 'avl', gameTime: new Date('2024-12-29T14:30:00'), isComplete: false },
  ],
  // Matchweek 19 - January 4-5, 2025
  19: [
    { homeTeam: 'ars', awayTeam: 'bha', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'avl', awayTeam: 'lei', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'cry', awayTeam: 'che', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'ips', awayTeam: 'bre', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'mci', awayTeam: 'whu', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'new', awayTeam: 'tot', gameTime: new Date('2025-01-04T17:30:00'), isComplete: false },
    { homeTeam: 'nfo', awayTeam: 'ful', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'sou', awayTeam: 'liv', gameTime: new Date('2025-01-05T14:00:00'), isComplete: false },
    { homeTeam: 'wol', awayTeam: 'eve', gameTime: new Date('2025-01-04T15:00:00'), isComplete: false },
    { homeTeam: 'bou', awayTeam: 'mun', gameTime: new Date('2025-01-05T16:30:00'), isComplete: false },
  ],
  // Matchweek 20 - January 14-15, 2025
  20: [
    { homeTeam: 'bha', awayTeam: 'ips', gameTime: new Date('2025-01-14T19:30:00'), isComplete: false },
    { homeTeam: 'bre', awayTeam: 'mci', gameTime: new Date('2025-01-14T20:00:00'), isComplete: false },
    { homeTeam: 'che', awayTeam: 'bou', gameTime: new Date('2025-01-14T19:30:00'), isComplete: false },
    { homeTeam: 'eve', awayTeam: 'avl', gameTime: new Date('2025-01-15T20:00:00'), isComplete: false },
    { homeTeam: 'ful', awayTeam: 'wol', gameTime: new Date('2025-01-14T19:30:00'), isComplete: false },
    { homeTeam: 'lei', awayTeam: 'cry', gameTime: new Date('2025-01-14T19:30:00'), isComplete: false },
    { homeTeam: 'liv', awayTeam: 'nfo', gameTime: new Date('2025-01-14T20:00:00'), isComplete: false },
    { homeTeam: 'mun', awayTeam: 'sou', gameTime: new Date('2025-01-16T20:00:00'), isComplete: false },
    { homeTeam: 'tot', awayTeam: 'ars', gameTime: new Date('2025-01-15T20:00:00'), isComplete: false },
    { homeTeam: 'whu', awayTeam: 'new', gameTime: new Date('2025-01-14T19:30:00'), isComplete: false },
  ],
};

// Get current Premier League matchweek
export function getCurrentMatchweek(): number {
  // Current matchweek as of December 2024 is 14
  // This should be updated weekly or fetched from an API
  const now = new Date();

  // Matchweek date ranges for 2024-25 season
  const matchweekDates: { start: Date; end: Date; week: number }[] = [
    { start: new Date('2024-12-07'), end: new Date('2024-12-13'), week: 14 },
    { start: new Date('2024-12-14'), end: new Date('2024-12-20'), week: 15 },
    { start: new Date('2024-12-21'), end: new Date('2024-12-25'), week: 16 },
    { start: new Date('2024-12-26'), end: new Date('2024-12-28'), week: 17 },
    { start: new Date('2024-12-29'), end: new Date('2025-01-03'), week: 18 },
    { start: new Date('2025-01-04'), end: new Date('2025-01-13'), week: 19 },
    { start: new Date('2025-01-14'), end: new Date('2025-01-20'), week: 20 },
  ];

  for (const mw of matchweekDates) {
    if (now >= mw.start && now <= mw.end) {
      return mw.week;
    }
  }

  // Default to matchweek 14 if date not found
  return 14;
}

// Get schedule for a specific matchweek
export function getMatchweekSchedule(matchweek: number): MatchweekSchedule {
  // Return data if available, otherwise generate placeholder
  const games = MATCHWEEK_DATA[matchweek] || generatePlaceholderFixtures(matchweek);

  return {
    matchweek,
    season: '2024-25',
    games,
  };
}

// Generate placeholder fixtures when we don't have real data
function generatePlaceholderFixtures(matchweek: number): SoccerMatchup[] {
  // Premier League teams paired up for sample matchweek
  const pairings = [
    ['ars', 'che'],
    ['liv', 'mun'],
    ['mci', 'tot'],
    ['new', 'avl'],
    ['bha', 'cry'],
    ['eve', 'whu'],
    ['lei', 'nfo'],
    ['wol', 'bou'],
    ['ful', 'bre'],
    ['ips', 'sou'],
  ];

  // Alternate home/away based on matchweek
  return pairings.map(([team1, team2]) => {
    const homeTeam = matchweek % 2 === 0 ? team1 : team2;
    const awayTeam = matchweek % 2 === 0 ? team2 : team1;

    return {
      homeTeam,
      awayTeam,
      gameTime: new Date(),
      isComplete: false,
    };
  });
}

// Get matchup info for a specific team
export function getSoccerTeamMatchup(teamId: string, matchweek: number): SoccerMatchup | null {
  const schedule = getMatchweekSchedule(matchweek);
  const id = teamId.toLowerCase();
  return schedule.games.find(g => g.homeTeam === id || g.awayTeam === id) || null;
}

// Get opponent for a team
export function getSoccerOpponent(teamId: string, matchweek: number): { opponent: string; isHome: boolean } | null {
  const matchup = getSoccerTeamMatchup(teamId, matchweek);
  if (!matchup) return null;

  const id = teamId.toLowerCase();
  if (matchup.homeTeam === id) {
    return { opponent: matchup.awayTeam, isHome: true };
  }
  return { opponent: matchup.homeTeam, isHome: false };
}

// Get full matchup info for a team (for display)
export function getSoccerMatchupInfo(teamId: string, matchweek: number): { opponent: string; isHome: boolean } | null {
  return getSoccerOpponent(teamId, matchweek);
}

// Get all matchup info for all teams in a matchweek
export function getAllSoccerMatchups(matchweek: number): Record<string, { opponent: string; isHome: boolean } | null> {
  const schedule = getMatchweekSchedule(matchweek);
  const matchups: Record<string, { opponent: string; isHome: boolean } | null> = {};

  schedule.games.forEach(game => {
    matchups[game.homeTeam] = { opponent: game.awayTeam, isHome: true };
    matchups[game.awayTeam] = { opponent: game.homeTeam, isHome: false };
  });

  return matchups;
}
