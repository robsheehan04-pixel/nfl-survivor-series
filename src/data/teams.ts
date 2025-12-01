import { Sport, Competition } from '../types';
import { nflTeams, NFLTeam, getTeamById as getNFLTeamById } from './nflTeams';
import { premierLeagueTeams, worldCup2026Teams, SoccerTeam, getSoccerTeamById } from './soccerTeams';

// Unified team interface for cross-sport compatibility
export interface Team {
  id: string;
  name: string;
  displayName: string; // e.g., "Buffalo Bills" or "Arsenal"
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
}

// Convert NFL team to unified Team format
const nflTeamToTeam = (team: NFLTeam): Team => ({
  id: team.id,
  name: team.name,
  displayName: `${team.city} ${team.name}`,
  abbreviation: team.abbreviation,
  primaryColor: team.primaryColor,
  secondaryColor: team.secondaryColor,
  logo: team.logo,
});

// Convert Soccer team to unified Team format
const soccerTeamToTeam = (team: SoccerTeam): Team => ({
  id: team.id,
  name: team.name,
  displayName: team.name,
  abbreviation: team.abbreviation,
  primaryColor: team.primaryColor,
  secondaryColor: team.secondaryColor,
  logo: team.logo,
});

// Get all teams for a given sport and competition
export const getTeamsForSeries = (sport: Sport, competition: Competition): Team[] => {
  if (sport === 'nfl') {
    // NFL uses the same teams for both regular season and playoffs
    return nflTeams.map(nflTeamToTeam);
  }

  if (sport === 'soccer') {
    if (competition === 'premier_league') {
      return premierLeagueTeams.map(soccerTeamToTeam);
    }
    if (competition === 'world_cup_2026') {
      return worldCup2026Teams.map(soccerTeamToTeam);
    }
  }

  return [];
};

// Get a specific team by ID, searching across all sports
export const getTeamById = (teamId: string, sport?: Sport): Team | undefined => {
  // If sport is specified, search that sport's teams first
  if (sport === 'nfl') {
    const nflTeam = getNFLTeamById(teamId);
    if (nflTeam) return nflTeamToTeam(nflTeam);
  }

  if (sport === 'soccer') {
    const soccerTeam = getSoccerTeamById(teamId);
    if (soccerTeam) return soccerTeamToTeam(soccerTeam);
  }

  // If no sport specified or not found, search all
  const nflTeam = getNFLTeamById(teamId);
  if (nflTeam) return nflTeamToTeam(nflTeam);

  const soccerTeam = getSoccerTeamById(teamId);
  if (soccerTeam) return soccerTeamToTeam(soccerTeam);

  return undefined;
};

// Get the week/round label for a sport
export const getWeekLabel = (sport: Sport, competition: Competition): string => {
  if (sport === 'nfl') {
    return competition === 'playoffs' ? 'Round' : 'Week';
  }
  if (sport === 'soccer') {
    return 'Matchweek';
  }
  return 'Week';
};

// Get total weeks/rounds for a competition
export const getTotalWeeks = (sport: Sport, competition: Competition): number => {
  if (sport === 'nfl') {
    return competition === 'playoffs' ? 4 : 18;
  }
  if (sport === 'soccer') {
    if (competition === 'premier_league') return 38;
    if (competition === 'world_cup_2026') return 7; // Group stage (3) + knockout (4)
  }
  return 18;
};
