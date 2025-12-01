export type AppRole = 'owner' | 'user';
export type SeriesRole = 'admin' | 'member';

// Multi-sport types
export type Sport = 'nfl' | 'soccer';
export type NFLCompetition = 'regular_season' | 'playoffs';
export type SoccerCompetition = 'premier_league' | 'world_cup_2026';
export type Competition = NFLCompetition | SoccerCompetition;
export type NFLSeriesType = 'survivor' | 'playoff_pool';
export type SoccerSeriesType = 'last_man_standing';
export type SeriesType = NFLSeriesType | SoccerSeriesType;

// Helper to get valid competitions for a sport
export const getCompetitionsForSport = (sport: Sport): Competition[] => {
  if (sport === 'nfl') return ['regular_season', 'playoffs'];
  return ['premier_league', 'world_cup_2026'];
};

// Helper to get valid series types for a sport
export const getSeriesTypesForSport = (sport: Sport): SeriesType[] => {
  if (sport === 'nfl') return ['survivor', 'playoff_pool'];
  return ['last_man_standing'];
};

// Display names for sports, competitions, and series types
export const sportDisplayNames: Record<Sport, string> = {
  nfl: 'NFL',
  soccer: 'Soccer',
};

export const competitionDisplayNames: Record<Competition, string> = {
  regular_season: 'Regular Season',
  playoffs: 'Playoffs',
  premier_league: 'Premier League',
  world_cup_2026: 'World Cup 2026',
};

export const seriesTypeDisplayNames: Record<SeriesType, string> = {
  survivor: 'Survivor',
  playoff_pool: 'Playoff Pool',
  last_man_standing: 'Last Man Standing',
};

export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
  role: AppRole;
}

export interface SeriesSettings {
  startingWeek: number;           // Which week the series starts (1-18)
  tieCountsAsWin: boolean;        // Whether a tie game counts as a win
  maxTeamUses: number;            // How many times a team can be used (1 = once per season)
  livesPerPlayer: number;         // Number of losses before elimination (default 2)
  allowMultipleEntries: boolean;  // Whether players can have multiple entries
  maxEntriesPerPlayer: number;    // Max entries per player if multiple allowed
}

export interface Series {
  id: string;
  name: string;
  description: string;
  createdBy: string;
  createdAt: Date;
  currentWeek: number;
  season: number;
  isActive: boolean;
  members: SeriesMember[];
  invitations: Invitation[];
  prizeValue?: number;
  showPrizeValue?: boolean;
  settings?: SeriesSettings;
  // Multi-sport fields
  sport: Sport;
  competition: Competition;
  seriesType: SeriesType;
}

// Default settings for new series
export const defaultSeriesSettings: SeriesSettings = {
  startingWeek: 1,
  tieCountsAsWin: true,
  maxTeamUses: 1,
  livesPerPlayer: 2,
  allowMultipleEntries: false,
  maxEntriesPerPlayer: 1,
};

export interface SeriesMember {
  userId: string;
  userName: string;
  userPicture: string;
  livesRemaining: number;
  isEliminated: boolean;
  joinedAt: Date;
  picks: Pick[];
  role: SeriesRole;
}

export interface Pick {
  week: number;
  teamId: string;
  result: 'pending' | 'win' | 'loss';
  isAutoPick: boolean;
  pickedAt: Date;
}

export interface Invitation {
  id: string;
  email: string;
  invitedBy: string;
  invitedAt: Date;
  status: 'pending' | 'accepted' | 'declined';
}

export interface WeeklyMatchup {
  week: number;
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  gameTime: Date;
  isComplete: boolean;
  vegasFavorite?: string;
  vegasSpread?: number;
}

export interface UserSeriesStatus {
  seriesId: string;
  hasPickedThisWeek: boolean;
  currentPick?: Pick;
  usedTeams: string[];
  livesRemaining: number;
  isEliminated: boolean;
}
