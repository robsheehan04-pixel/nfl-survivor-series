// NFL Playoff Pool Types
// Two-stage bracket prediction game with point-based scoring

export type PlayoffRound = 'wild_card' | 'divisional' | 'conference' | 'super_bowl';
export type PlayoffStage = 'stage_1' | 'stage_2'; // Stage 1 = Wild Card, Stage 2 = Rest of bracket

export interface PlayoffGame {
  id: string;
  round: PlayoffRound;
  conference: 'AFC' | 'NFC' | 'SUPER_BOWL';
  awayTeamId: string;  // Lower seed or TBD
  homeTeamId: string;  // Higher seed
  gameNumber: number;  // 1-6 for Wild Card, 1-4 for Divisional, 1-2 for Conference, 1 for SB
  gameTime?: Date;
  isComplete: boolean;
  homeScore?: number;
  awayScore?: number;
  winnerId?: string;
  // TBD fields for games that depend on previous results
  awayTeamSource?: { round: PlayoffRound; gameNumber: number; isWinner: boolean };
  homeTeamSource?: { round: PlayoffRound; gameNumber: number; isWinner: boolean };
}

export interface PlayoffBracketPick {
  gameId: string;
  round: PlayoffRound;
  pickedWinnerId: string;
  predictedMargin: number;  // Positive number representing predicted margin of victory
  pickedAt: Date;
}

export interface PlayoffBracketResult {
  gameId: string;
  pickedWinnerId: string;
  predictedMargin: number;
  actualWinnerId?: string;
  actualMargin?: number;
  winnerPoints: number;    // 5, 7, 9, or 11 based on round
  marginPoints: number;    // 0-5 based on proximity
  totalPoints: number;
}

export interface PlayoffPoolMember {
  userId: string;
  userName: string;
  userPicture: string;
  picks: PlayoffBracketPick[];
  results: PlayoffBracketResult[];
  totalPoints: number;
  rank?: number;
  joinedAt: Date;
}

// Point values per round
export const PLAYOFF_POINTS = {
  wild_card: { winner: 5, maxMargin: 5 },
  divisional: { winner: 7, maxMargin: 5 },
  conference: { winner: 9, maxMargin: 5 },
  super_bowl: { winner: 11, maxMargin: 5 },
} as const;

// Calculate margin points: 5 for exact, decreasing by 1 for each point off, min 0
export function calculateMarginPoints(predictedMargin: number, actualMargin: number): number {
  const difference = Math.abs(predictedMargin - actualMargin);
  return Math.max(0, 5 - difference);
}

// Calculate total points for a game result
export function calculateGamePoints(
  round: PlayoffRound,
  pickedCorrectWinner: boolean,
  predictedMargin: number,
  actualMargin: number
): { winnerPoints: number; marginPoints: number; totalPoints: number } {
  if (!pickedCorrectWinner) {
    return { winnerPoints: 0, marginPoints: 0, totalPoints: 0 };
  }

  const winnerPoints = PLAYOFF_POINTS[round].winner;
  const marginPoints = calculateMarginPoints(predictedMargin, actualMargin);

  return {
    winnerPoints,
    marginPoints,
    totalPoints: winnerPoints + marginPoints,
  };
}

// Display names for rounds
export const roundDisplayNames: Record<PlayoffRound, string> = {
  wild_card: 'Wild Card',
  divisional: 'Divisional',
  conference: 'Conference',
  super_bowl: 'Super Bowl',
};

// 2024-2025 NFL Playoff Bracket Structure
// Wild Card Weekend: 6 games (3 AFC, 3 NFC)
// Divisional Round: 4 games (2 AFC, 2 NFC)
// Conference Championships: 2 games (1 AFC, 1 NFC)
// Super Bowl: 1 game

export interface PlayoffBracket {
  season: number;
  stage: PlayoffStage;
  games: PlayoffGame[];
  // For stage 2, we need to know which teams advanced
  advancedTeams?: {
    afc: string[];  // 4 teams (1 seed bye + 3 Wild Card winners)
    nfc: string[];  // 4 teams (1 seed bye + 3 Wild Card winners)
  };
}

// 2024-2025 Playoff Seeds (example - would be updated based on actual standings)
export interface PlayoffSeeding {
  afc: {
    seed1: string;  // Bye
    seed2: string;
    seed3: string;
    seed4: string;
    seed5: string;
    seed6: string;
    seed7: string;
  };
  nfc: {
    seed1: string;  // Bye
    seed2: string;
    seed3: string;
    seed4: string;
    seed5: string;
    seed6: string;
    seed7: string;
  };
}

// Current 2024-2025 Playoff Seeding (update as season finalizes)
export const CURRENT_PLAYOFF_SEEDING: PlayoffSeeding = {
  afc: {
    seed1: 'kc',   // Chiefs - 1 seed, bye
    seed2: 'buf',  // Bills
    seed3: 'bal',  // Ravens
    seed4: 'hou',  // Texans
    seed5: 'lac',  // Chargers
    seed6: 'pit',  // Steelers
    seed7: 'den',  // Broncos
  },
  nfc: {
    seed1: 'det',  // Lions - 1 seed, bye
    seed2: 'phi',  // Eagles
    seed3: 'lar',  // Rams
    seed4: 'tb',   // Buccaneers
    seed5: 'min',  // Vikings
    seed6: 'was',  // Commanders
    seed7: 'gb',   // Packers
  },
};

// Generate Wild Card games based on seeding
// Format: #7 @ #2, #6 @ #3, #5 @ #4
export function generateWildCardGames(seeding: PlayoffSeeding): PlayoffGame[] {
  return [
    // AFC Wild Card
    {
      id: 'wc-afc-1',
      round: 'wild_card',
      conference: 'AFC',
      awayTeamId: seeding.afc.seed7,  // #7
      homeTeamId: seeding.afc.seed2,  // #2
      gameNumber: 1,
      isComplete: false,
    },
    {
      id: 'wc-afc-2',
      round: 'wild_card',
      conference: 'AFC',
      awayTeamId: seeding.afc.seed6,  // #6
      homeTeamId: seeding.afc.seed3,  // #3
      gameNumber: 2,
      isComplete: false,
    },
    {
      id: 'wc-afc-3',
      round: 'wild_card',
      conference: 'AFC',
      awayTeamId: seeding.afc.seed5,  // #5
      homeTeamId: seeding.afc.seed4,  // #4
      gameNumber: 3,
      isComplete: false,
    },
    // NFC Wild Card
    {
      id: 'wc-nfc-1',
      round: 'wild_card',
      conference: 'NFC',
      awayTeamId: seeding.nfc.seed7,  // #7
      homeTeamId: seeding.nfc.seed2,  // #2
      gameNumber: 4,
      isComplete: false,
    },
    {
      id: 'wc-nfc-2',
      round: 'wild_card',
      conference: 'NFC',
      awayTeamId: seeding.nfc.seed6,  // #6
      homeTeamId: seeding.nfc.seed3,  // #3
      gameNumber: 5,
      isComplete: false,
    },
    {
      id: 'wc-nfc-3',
      round: 'wild_card',
      conference: 'NFC',
      awayTeamId: seeding.nfc.seed5,  // #5
      homeTeamId: seeding.nfc.seed4,  // #4
      gameNumber: 6,
      isComplete: false,
    },
  ];
}

// Generate Divisional Round games (after Wild Card results are in)
// Lowest remaining seed plays #1 seed
// Other two remaining seeds play each other
export function generateDivisionalGames(
  seeding: PlayoffSeeding,
  wildCardWinners: { afc: string[]; nfc: string[] }
): PlayoffGame[] {
  // Sort winners by their original seed (lower seed = higher number)
  const afcTeams = [seeding.afc.seed1, ...wildCardWinners.afc];
  const nfcTeams = [seeding.nfc.seed1, ...wildCardWinners.nfc];

  // Get seed for a team
  const getAfcSeed = (teamId: string) => {
    const seeds = seeding.afc;
    if (seeds.seed1 === teamId) return 1;
    if (seeds.seed2 === teamId) return 2;
    if (seeds.seed3 === teamId) return 3;
    if (seeds.seed4 === teamId) return 4;
    if (seeds.seed5 === teamId) return 5;
    if (seeds.seed6 === teamId) return 6;
    if (seeds.seed7 === teamId) return 7;
    return 8;
  };

  const getNfcSeed = (teamId: string) => {
    const seeds = seeding.nfc;
    if (seeds.seed1 === teamId) return 1;
    if (seeds.seed2 === teamId) return 2;
    if (seeds.seed3 === teamId) return 3;
    if (seeds.seed4 === teamId) return 4;
    if (seeds.seed5 === teamId) return 5;
    if (seeds.seed6 === teamId) return 6;
    if (seeds.seed7 === teamId) return 7;
    return 8;
  };

  // Sort by seed (ascending)
  const sortedAfc = afcTeams.sort((a, b) => getAfcSeed(a) - getAfcSeed(b));
  const sortedNfc = nfcTeams.sort((a, b) => getNfcSeed(a) - getNfcSeed(b));

  // Divisional matchups: #1 vs lowest remaining, other two play each other
  // Lower seed is always away team
  return [
    // AFC Divisional
    {
      id: 'div-afc-1',
      round: 'divisional',
      conference: 'AFC',
      awayTeamId: sortedAfc[3],  // Lowest remaining seed
      homeTeamId: sortedAfc[0],  // #1 seed
      gameNumber: 1,
      isComplete: false,
    },
    {
      id: 'div-afc-2',
      round: 'divisional',
      conference: 'AFC',
      awayTeamId: sortedAfc[2],  // Higher of the two
      homeTeamId: sortedAfc[1],  // Lower of the two
      gameNumber: 2,
      isComplete: false,
    },
    // NFC Divisional
    {
      id: 'div-nfc-1',
      round: 'divisional',
      conference: 'NFC',
      awayTeamId: sortedNfc[3],  // Lowest remaining seed
      homeTeamId: sortedNfc[0],  // #1 seed
      gameNumber: 3,
      isComplete: false,
    },
    {
      id: 'div-nfc-2',
      round: 'divisional',
      conference: 'NFC',
      awayTeamId: sortedNfc[2],  // Higher of the two
      homeTeamId: sortedNfc[1],  // Lower of the two
      gameNumber: 4,
      isComplete: false,
    },
  ];
}

// Conference Championships
export function generateConferenceGames(
  divisionalWinners: { afc: string[]; nfc: string[] },
  seeding: PlayoffSeeding
): PlayoffGame[] {
  const getAfcSeed = (teamId: string) => {
    const seeds = seeding.afc;
    if (seeds.seed1 === teamId) return 1;
    if (seeds.seed2 === teamId) return 2;
    if (seeds.seed3 === teamId) return 3;
    if (seeds.seed4 === teamId) return 4;
    if (seeds.seed5 === teamId) return 5;
    if (seeds.seed6 === teamId) return 6;
    if (seeds.seed7 === teamId) return 7;
    return 8;
  };

  const getNfcSeed = (teamId: string) => {
    const seeds = seeding.nfc;
    if (seeds.seed1 === teamId) return 1;
    if (seeds.seed2 === teamId) return 2;
    if (seeds.seed3 === teamId) return 3;
    if (seeds.seed4 === teamId) return 4;
    if (seeds.seed5 === teamId) return 5;
    if (seeds.seed6 === teamId) return 6;
    if (seeds.seed7 === teamId) return 7;
    return 8;
  };

  const sortedAfc = divisionalWinners.afc.sort((a, b) => getAfcSeed(a) - getAfcSeed(b));
  const sortedNfc = divisionalWinners.nfc.sort((a, b) => getNfcSeed(a) - getNfcSeed(b));

  return [
    {
      id: 'conf-afc',
      round: 'conference',
      conference: 'AFC',
      awayTeamId: sortedAfc[1],  // Lower seed
      homeTeamId: sortedAfc[0],  // Higher seed
      gameNumber: 1,
      isComplete: false,
    },
    {
      id: 'conf-nfc',
      round: 'conference',
      conference: 'NFC',
      awayTeamId: sortedNfc[1],  // Lower seed
      homeTeamId: sortedNfc[0],  // Higher seed
      gameNumber: 2,
      isComplete: false,
    },
  ];
}

// Super Bowl
export function generateSuperBowl(
  afcChampion: string,
  nfcChampion: string
): PlayoffGame {
  return {
    id: 'super-bowl',
    round: 'super_bowl',
    conference: 'SUPER_BOWL',
    awayTeamId: afcChampion,  // AFC is typically designated "away"
    homeTeamId: nfcChampion,
    gameNumber: 1,
    isComplete: false,
  };
}

// Helper to get all games for a round
export function getGamesByRound(games: PlayoffGame[], round: PlayoffRound): PlayoffGame[] {
  return games.filter(g => g.round === round);
}

// Helper to check if user has completed picks for a stage
export function hasCompletedStagePicks(
  picks: PlayoffBracketPick[],
  stage: PlayoffStage,
  games: PlayoffGame[]
): boolean {
  if (stage === 'stage_1') {
    const wildCardGames = getGamesByRound(games, 'wild_card');
    return wildCardGames.every(game =>
      picks.some(p => p.gameId === game.id && p.pickedWinnerId && p.predictedMargin > 0)
    );
  } else {
    // Stage 2: Divisional, Conference, and Super Bowl
    const stage2Rounds: PlayoffRound[] = ['divisional', 'conference', 'super_bowl'];
    const stage2Games = games.filter(g => stage2Rounds.includes(g.round));
    return stage2Games.every(game =>
      picks.some(p => p.gameId === game.id && p.pickedWinnerId && p.predictedMargin > 0)
    );
  }
}
