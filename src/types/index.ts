export interface User {
  id: string;
  email: string;
  name: string;
  picture: string;
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
}

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
