export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
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
