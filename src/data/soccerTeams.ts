export interface SoccerTeam {
  id: string;
  name: string;
  shortName: string;
  abbreviation: string;
  primaryColor: string;
  secondaryColor: string;
  logo: string;
  competition: 'premier_league' | 'world_cup_2026';
}

// Using ESPN's CDN for Premier League team logos
const getPremierLeagueLogo = (id: string) =>
  `https://a.espncdn.com/i/teamlogos/soccer/500/${id}.png`;

export const premierLeagueTeams: SoccerTeam[] = [
  {
    id: 'ars',
    name: 'Arsenal',
    shortName: 'Arsenal',
    abbreviation: 'ARS',
    primaryColor: '#EF0107',
    secondaryColor: '#063672',
    logo: getPremierLeagueLogo('359'),
    competition: 'premier_league',
  },
  {
    id: 'avl',
    name: 'Aston Villa',
    shortName: 'Aston Villa',
    abbreviation: 'AVL',
    primaryColor: '#670E36',
    secondaryColor: '#95BFE5',
    logo: getPremierLeagueLogo('362'),
    competition: 'premier_league',
  },
  {
    id: 'bou',
    name: 'AFC Bournemouth',
    shortName: 'Bournemouth',
    abbreviation: 'BOU',
    primaryColor: '#DA291C',
    secondaryColor: '#000000',
    logo: getPremierLeagueLogo('349'),
    competition: 'premier_league',
  },
  {
    id: 'bre',
    name: 'Brentford',
    shortName: 'Brentford',
    abbreviation: 'BRE',
    primaryColor: '#E30613',
    secondaryColor: '#FFB81C',
    logo: getPremierLeagueLogo('337'),
    competition: 'premier_league',
  },
  {
    id: 'bha',
    name: 'Brighton & Hove Albion',
    shortName: 'Brighton',
    abbreviation: 'BHA',
    primaryColor: '#0057B8',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('331'),
    competition: 'premier_league',
  },
  {
    id: 'che',
    name: 'Chelsea',
    shortName: 'Chelsea',
    abbreviation: 'CHE',
    primaryColor: '#034694',
    secondaryColor: '#DBA111',
    logo: getPremierLeagueLogo('363'),
    competition: 'premier_league',
  },
  {
    id: 'cry',
    name: 'Crystal Palace',
    shortName: 'Crystal Palace',
    abbreviation: 'CRY',
    primaryColor: '#1B458F',
    secondaryColor: '#C4122E',
    logo: getPremierLeagueLogo('384'),
    competition: 'premier_league',
  },
  {
    id: 'eve',
    name: 'Everton',
    shortName: 'Everton',
    abbreviation: 'EVE',
    primaryColor: '#003399',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('368'),
    competition: 'premier_league',
  },
  {
    id: 'ful',
    name: 'Fulham',
    shortName: 'Fulham',
    abbreviation: 'FUL',
    primaryColor: '#000000',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('370'),
    competition: 'premier_league',
  },
  {
    id: 'ips',
    name: 'Ipswich Town',
    shortName: 'Ipswich',
    abbreviation: 'IPS',
    primaryColor: '#0044AA',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('373'),
    competition: 'premier_league',
  },
  {
    id: 'lei',
    name: 'Leicester City',
    shortName: 'Leicester',
    abbreviation: 'LEI',
    primaryColor: '#003090',
    secondaryColor: '#FDBE11',
    logo: getPremierLeagueLogo('375'),
    competition: 'premier_league',
  },
  {
    id: 'liv',
    name: 'Liverpool',
    shortName: 'Liverpool',
    abbreviation: 'LIV',
    primaryColor: '#C8102E',
    secondaryColor: '#00B2A9',
    logo: getPremierLeagueLogo('364'),
    competition: 'premier_league',
  },
  {
    id: 'mci',
    name: 'Manchester City',
    shortName: 'Man City',
    abbreviation: 'MCI',
    primaryColor: '#6CABDD',
    secondaryColor: '#1C2C5B',
    logo: getPremierLeagueLogo('382'),
    competition: 'premier_league',
  },
  {
    id: 'mun',
    name: 'Manchester United',
    shortName: 'Man Utd',
    abbreviation: 'MUN',
    primaryColor: '#DA291C',
    secondaryColor: '#FBE122',
    logo: getPremierLeagueLogo('360'),
    competition: 'premier_league',
  },
  {
    id: 'new',
    name: 'Newcastle United',
    shortName: 'Newcastle',
    abbreviation: 'NEW',
    primaryColor: '#241F20',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('361'),
    competition: 'premier_league',
  },
  {
    id: 'nfo',
    name: 'Nottingham Forest',
    shortName: "Nott'm Forest",
    abbreviation: 'NFO',
    primaryColor: '#DD0000',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('393'),
    competition: 'premier_league',
  },
  {
    id: 'sou',
    name: 'Southampton',
    shortName: 'Southampton',
    abbreviation: 'SOU',
    primaryColor: '#D71920',
    secondaryColor: '#130C0E',
    logo: getPremierLeagueLogo('376'),
    competition: 'premier_league',
  },
  {
    id: 'tot',
    name: 'Tottenham Hotspur',
    shortName: 'Spurs',
    abbreviation: 'TOT',
    primaryColor: '#132257',
    secondaryColor: '#FFFFFF',
    logo: getPremierLeagueLogo('367'),
    competition: 'premier_league',
  },
  {
    id: 'whu',
    name: 'West Ham United',
    shortName: 'West Ham',
    abbreviation: 'WHU',
    primaryColor: '#7A263A',
    secondaryColor: '#1BB1E7',
    logo: getPremierLeagueLogo('371'),
    competition: 'premier_league',
  },
  {
    id: 'wol',
    name: 'Wolverhampton Wanderers',
    shortName: 'Wolves',
    abbreviation: 'WOL',
    primaryColor: '#FDB913',
    secondaryColor: '#231F20',
    logo: getPremierLeagueLogo('380'),
    competition: 'premier_league',
  },
];

// World Cup 2026 teams - placeholder for now (will be updated as teams qualify)
export const worldCup2026Teams: SoccerTeam[] = [
  // Host nations (automatic qualifiers)
  {
    id: 'usa',
    name: 'United States',
    shortName: 'USA',
    abbreviation: 'USA',
    primaryColor: '#002868',
    secondaryColor: '#BF0A30',
    logo: 'https://a.espncdn.com/i/teamlogos/countries/500/usa.png',
    competition: 'world_cup_2026',
  },
  {
    id: 'mex',
    name: 'Mexico',
    shortName: 'Mexico',
    abbreviation: 'MEX',
    primaryColor: '#006847',
    secondaryColor: '#CE1126',
    logo: 'https://a.espncdn.com/i/teamlogos/countries/500/mex.png',
    competition: 'world_cup_2026',
  },
  {
    id: 'can',
    name: 'Canada',
    shortName: 'Canada',
    abbreviation: 'CAN',
    primaryColor: '#FF0000',
    secondaryColor: '#FFFFFF',
    logo: 'https://a.espncdn.com/i/teamlogos/countries/500/can.png',
    competition: 'world_cup_2026',
  },
];

// Helper functions
export const getSoccerTeamById = (id: string): SoccerTeam | undefined =>
  [...premierLeagueTeams, ...worldCup2026Teams].find(team => team.id === id);

export const getTeamsByCompetition = (competition: 'premier_league' | 'world_cup_2026'): SoccerTeam[] => {
  if (competition === 'premier_league') return premierLeagueTeams;
  return worldCup2026Teams;
};
