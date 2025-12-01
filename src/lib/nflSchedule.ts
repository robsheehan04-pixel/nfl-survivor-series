// NFL Schedule and Odds Service
// This provides matchup data, bye weeks, and Vegas odds for the current week

export type OddsFormat = 'american' | 'decimal' | 'fractional';

export interface GameMatchup {
  homeTeam: string;
  awayTeam: string;
  gameTime: Date;
  homeSpread: number; // negative means favored
  overUnder: number;
  homeMoneyline: number;
  awayMoneyline: number;
  isComplete: boolean;
  homeScore?: number;
  awayScore?: number;
}

export interface WeekSchedule {
  week: number;
  season: number;
  games: GameMatchup[];
  byeTeams: string[];
}

// 2024 NFL Bye Weeks - uses lowercase team IDs matching nflTeams.ts
const NFL_BYE_WEEKS_2024: Record<number, string[]> = {
  5: ['det', 'lac'],
  6: ['kc', 'lar', 'mia', 'min'],
  7: ['chi', 'dal'],
  9: ['cle', 'gb', 'lv', 'sea'],
  10: ['bal', 'cin', 'jax', 'nyj', 'ten', 'hou'],
  11: ['ari', 'car', 'nyg', 'tb'],
  12: ['atl', 'buf', 'ind', 'no'],
  13: ['den', 'phi', 'pit', 'sf', 'ne', 'was'],
  14: [],
};

// Sample Vegas odds for demo (in production, fetch from API like ESPN or odds API)
// Spread: negative = favored by that many points
// Uses lowercase team IDs to match nflTeams.ts
const SAMPLE_WEEK_DATA: WeekSchedule = {
  week: 13,
  season: 2024,
  byeTeams: ['den', 'phi', 'pit', 'sf', 'ne', 'was'],
  games: [
    { homeTeam: 'dal', awayTeam: 'nyg', gameTime: new Date('2024-11-28T16:30:00'), homeSpread: -4.5, overUnder: 44.5, homeMoneyline: -200, awayMoneyline: 168, isComplete: false },
    { homeTeam: 'det', awayTeam: 'chi', gameTime: new Date('2024-11-28T12:30:00'), homeSpread: -10.5, overUnder: 49.5, homeMoneyline: -500, awayMoneyline: 380, isComplete: false },
    { homeTeam: 'gb', awayTeam: 'mia', gameTime: new Date('2024-11-28T20:20:00'), homeSpread: -3.5, overUnder: 47.5, homeMoneyline: -175, awayMoneyline: 148, isComplete: false },
    { homeTeam: 'kc', awayTeam: 'lv', gameTime: new Date('2024-11-29T15:00:00'), homeSpread: -13, overUnder: 43.5, homeMoneyline: -700, awayMoneyline: 500, isComplete: false },
    { homeTeam: 'atl', awayTeam: 'lac', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: 1.5, overUnder: 47.5, homeMoneyline: 105, awayMoneyline: -125, isComplete: false },
    { homeTeam: 'buf', awayTeam: 'sf', gameTime: new Date('2024-12-01T20:20:00'), homeSpread: -5.5, overUnder: 45.5, homeMoneyline: -235, awayMoneyline: 192, isComplete: false },
    { homeTeam: 'cin', awayTeam: 'pit', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: -2.5, overUnder: 47, homeMoneyline: -138, awayMoneyline: 118, isComplete: false },
    { homeTeam: 'hou', awayTeam: 'jax', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: -5.5, overUnder: 43.5, homeMoneyline: -235, awayMoneyline: 192, isComplete: false },
    { homeTeam: 'ind', awayTeam: 'ne', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: -4, overUnder: 42.5, homeMoneyline: -190, awayMoneyline: 160, isComplete: false },
    { homeTeam: 'min', awayTeam: 'ari', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: -3.5, overUnder: 45.5, homeMoneyline: -175, awayMoneyline: 148, isComplete: false },
    { homeTeam: 'no', awayTeam: 'lar', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: 3.5, overUnder: 49.5, homeMoneyline: 148, awayMoneyline: -175, isComplete: false },
    { homeTeam: 'nyj', awayTeam: 'sea', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: 2, overUnder: 42.5, homeMoneyline: 112, awayMoneyline: -132, isComplete: false },
    { homeTeam: 'ten', awayTeam: 'was', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: 5.5, overUnder: 44.5, homeMoneyline: 198, awayMoneyline: -240, isComplete: false },
    { homeTeam: 'tb', awayTeam: 'car', gameTime: new Date('2024-12-01T13:00:00'), homeSpread: -6.5, overUnder: 46.5, homeMoneyline: -275, awayMoneyline: 222, isComplete: false },
    { homeTeam: 'bal', awayTeam: 'phi', gameTime: new Date('2024-12-01T16:25:00'), homeSpread: -2.5, overUnder: 51, homeMoneyline: -138, awayMoneyline: 118, isComplete: false },
    { homeTeam: 'cle', awayTeam: 'den', gameTime: new Date('2024-12-02T20:15:00'), homeSpread: 5.5, overUnder: 41.5, homeMoneyline: 205, awayMoneyline: -250, isComplete: false },
  ],
};

// Get current NFL week (approximate calculation)
export function getCurrentNFLWeek(): number {
  const seasonStart = new Date('2024-09-05'); // 2024 season start
  const now = new Date();
  const daysSinceStart = Math.floor((now.getTime() - seasonStart.getTime()) / (1000 * 60 * 60 * 24));
  const week = Math.min(18, Math.max(1, Math.ceil((daysSinceStart + 1) / 7)));
  return week;
}

// Get schedule for a specific week
export function getWeekSchedule(week: number): WeekSchedule {
  // In production, this would fetch from an API
  // For now, return sample data with the requested week
  return {
    ...SAMPLE_WEEK_DATA,
    week,
    byeTeams: NFL_BYE_WEEKS_2024[week] || [],
  };
}

// Get matchup info for a specific team
export function getTeamMatchup(teamId: string, week: number): GameMatchup | null {
  const schedule = getWeekSchedule(week);
  const id = teamId.toLowerCase();
  return schedule.games.find(g => g.homeTeam === id || g.awayTeam === id) || null;
}

// Check if team is on bye
export function isTeamOnBye(teamId: string, week: number): boolean {
  const schedule = getWeekSchedule(week);
  return schedule.byeTeams.includes(teamId.toLowerCase());
}

// Get opponent for a team
export function getOpponent(teamId: string, week: number): { opponent: string; isHome: boolean } | null {
  const matchup = getTeamMatchup(teamId, week);
  if (!matchup) return null;

  const id = teamId.toLowerCase();
  if (matchup.homeTeam === id) {
    return { opponent: matchup.awayTeam, isHome: true };
  }
  return { opponent: matchup.homeTeam, isHome: false };
}

// Get Vegas spread for a team (negative = favored)
export function getTeamSpread(teamId: string, week: number): number | null {
  const matchup = getTeamMatchup(teamId, week);
  if (!matchup) return null;

  const id = teamId.toLowerCase();
  if (matchup.homeTeam === id) {
    return matchup.homeSpread;
  }
  // Away team spread is inverse of home spread
  return -matchup.homeSpread;
}

// Get team moneyline
export function getTeamMoneyline(teamId: string, week: number): number | null {
  const matchup = getTeamMatchup(teamId, week);
  if (!matchup) return null;

  const id = teamId.toLowerCase();
  if (matchup.homeTeam === id) {
    return matchup.homeMoneyline;
  }
  return matchup.awayMoneyline;
}

// Get full matchup info for a team (for TeamCard display)
export function getTeamMatchupInfo(teamId: string, week: number): { opponent: string; isHome: boolean; spread: number; moneyline: number } | null {
  const opponent = getOpponent(teamId, week);
  const spread = getTeamSpread(teamId, week);
  const moneyline = getTeamMoneyline(teamId, week);

  if (!opponent || spread === null || moneyline === null) return null;

  return {
    opponent: opponent.opponent,
    isHome: opponent.isHome,
    spread,
    moneyline,
  };
}

// Format spread for display
export function formatSpread(spread: number): string {
  if (spread === 0) return 'EVEN';
  return spread > 0 ? `+${spread}` : `${spread}`;
}

// Format moneyline for display
export function formatMoneyline(ml: number): string {
  return ml > 0 ? `+${ml}` : `${ml}`;
}

// Get team with best odds (most favored) that hasn't been used
export function getVegasFavorite(week: number, excludeTeams: string[]): string | null {
  const schedule = getWeekSchedule(week);
  const excludeLower = excludeTeams.map(t => t.toLowerCase());
  let bestTeam: string | null = null;
  let bestSpread = Infinity;

  for (const game of schedule.games) {
    // Check home team
    if (!excludeLower.includes(game.homeTeam) && !schedule.byeTeams.includes(game.homeTeam)) {
      if (game.homeSpread < bestSpread) {
        bestSpread = game.homeSpread;
        bestTeam = game.homeTeam;
      }
    }

    // Check away team (inverse spread)
    const awaySpread = -game.homeSpread;
    if (!excludeLower.includes(game.awayTeam) && !schedule.byeTeams.includes(game.awayTeam)) {
      if (awaySpread < bestSpread) {
        bestSpread = awaySpread;
        bestTeam = game.awayTeam;
      }
    }
  }

  return bestTeam;
}

// Calculate win probability from moneyline (approximate)
export function moneylineToWinProbability(ml: number): number {
  if (ml < 0) {
    return Math.abs(ml) / (Math.abs(ml) + 100);
  }
  return 100 / (ml + 100);
}

// Convert American odds to decimal odds
export function americanToDecimal(ml: number): number {
  if (ml < 0) {
    return 1 + (100 / Math.abs(ml));
  }
  return 1 + (ml / 100);
}

// Convert American odds to fractional odds
export function americanToFractional(ml: number): string {
  let numerator: number;
  let denominator: number;

  if (ml < 0) {
    numerator = 100;
    denominator = Math.abs(ml);
  } else {
    numerator = ml;
    denominator = 100;
  }

  // Simplify the fraction using GCD
  const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
  const divisor = gcd(numerator, denominator);
  numerator = numerator / divisor;
  denominator = denominator / divisor;

  return `${numerator}/${denominator}`;
}

// Format odds based on user preference
export function formatOdds(moneyline: number, format: OddsFormat): string {
  switch (format) {
    case 'american':
      return moneyline > 0 ? `+${moneyline}` : `${moneyline}`;
    case 'decimal':
      return americanToDecimal(moneyline).toFixed(2);
    case 'fractional':
      return americanToFractional(moneyline);
    default:
      return moneyline > 0 ? `+${moneyline}` : `${moneyline}`;
  }
}
