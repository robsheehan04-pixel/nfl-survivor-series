import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams } from '../data/nflTeams';
import {
  PlayoffBracketPick,
  PlayoffBracketResult,
  PlayoffRound,
  roundDisplayNames,
  PLAYOFF_POINTS,
} from '../types/playoffPool';

interface MemberWithPoints {
  userId: string;
  userName: string;
  userPicture: string;
  picks: PlayoffBracketPick[];
  results: PlayoffBracketResult[];
  totalPoints: number;
  possiblePoints: number;  // Max points still achievable
  rank: number;
}

export function PlayoffPoolStandings() {
  const { activeSeries, user } = useStore();

  // Calculate standings from member picks and results
  const standings = useMemo((): MemberWithPoints[] => {
    if (!activeSeries?.playoffPoolMembers) return [];

    // Calculate total points for each member
    const membersWithPoints = activeSeries.playoffPoolMembers.map(member => {
      const totalPoints = member.results?.reduce((sum, result) => sum + result.totalPoints, 0) || 0;

      // Calculate possible remaining points
      const completedGameIds = new Set(member.results?.map(r => r.gameId) || []);
      const pendingPicks = member.picks?.filter(p => !completedGameIds.has(p.gameId)) || [];

      // For each pending pick, assume max points
      const possibleFromPending = pendingPicks.reduce((sum, pick) => {
        // Find the game to get the round
        const game = activeSeries.playoffGames?.find(g => g.id === pick.gameId);
        if (!game) return sum;
        const points = PLAYOFF_POINTS[game.round];
        return sum + points.winner + points.maxMargin;
      }, 0);

      return {
        ...member,
        totalPoints,
        possiblePoints: totalPoints + possibleFromPending,
        rank: 0,
      };
    });

    // Sort by total points (descending), then by possible points
    membersWithPoints.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      return b.possiblePoints - a.possiblePoints;
    });

    // Assign ranks
    let currentRank = 1;
    membersWithPoints.forEach((member, index) => {
      if (index > 0 && member.totalPoints === membersWithPoints[index - 1].totalPoints) {
        member.rank = membersWithPoints[index - 1].rank;
      } else {
        member.rank = currentRank;
      }
      currentRank++;
    });

    return membersWithPoints;
  }, [activeSeries?.playoffPoolMembers, activeSeries?.playoffGames]);

  // Get the current user's position
  const currentUserStanding = standings.find(s => s.userId === user?.id);

  if (!activeSeries) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Select a series to view standings</p>
      </div>
    );
  }

  if (standings.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
          <span className="text-3xl">🏆</span>
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No picks yet</h3>
        <p className="text-gray-400">
          Standings will appear once members start making picks
        </p>
      </div>
    );
  }

  // Calculate max possible points for the pool
  const maxTotalPoints = Object.entries(PLAYOFF_POINTS).reduce((total, [round, points]) => {
    const gamesInRound = round === 'wild_card' ? 6 : round === 'divisional' ? 4 : round === 'conference' ? 2 : 1;
    return total + (gamesInRound * (points.winner + points.maxMargin));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Pool Summary */}
      <div className="card bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border-yellow-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Playoff Pool Standings</h2>
            <p className="text-gray-400 text-sm mt-1">
              {standings.length} participant{standings.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Max Points</p>
            <p className="text-2xl font-bold text-white">{maxTotalPoints}</p>
          </div>
        </div>
      </div>

      {/* Current User Card (if participating) */}
      {currentUserStanding && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card border-blue-500/30 bg-blue-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-3xl font-bold text-white">#{currentUserStanding.rank}</span>
              </div>
              <div>
                <p className="text-white font-medium">Your Position</p>
                <p className="text-gray-400 text-sm">
                  {currentUserStanding.picks?.length || 0} picks made
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-white">{currentUserStanding.totalPoints}</p>
              <p className="text-gray-400 text-sm">points</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Standings Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pr-4">Rank</th>
                <th className="pb-3 pr-4">Player</th>
                <th className="pb-3 pr-4 text-center">Picks</th>
                <th className="pb-3 pr-4 text-right">Points</th>
                <th className="pb-3 text-right">Possible</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((member, index) => {
                const isCurrentUser = member.userId === user?.id;

                return (
                  <motion.tr
                    key={member.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      border-t border-white/5
                      ${isCurrentUser ? 'bg-blue-500/10' : ''}
                    `}
                  >
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        {member.rank === 1 && <span className="text-lg">🥇</span>}
                        {member.rank === 2 && <span className="text-lg">🥈</span>}
                        {member.rank === 3 && <span className="text-lg">🥉</span>}
                        {member.rank > 3 && (
                          <span className="text-gray-400 font-medium">{member.rank}</span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.userPicture || 'https://via.placeholder.com/40'}
                          alt={member.userName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <span className={`font-medium ${isCurrentUser ? 'text-blue-400' : 'text-white'}`}>
                          {member.userName}
                          {isCurrentUser && <span className="text-xs text-gray-400 ml-2">(You)</span>}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-center">
                      <span className="text-gray-400">{member.picks?.length || 0}</span>
                    </td>
                    <td className="py-4 pr-4 text-right">
                      <span className="text-xl font-bold text-white">{member.totalPoints}</span>
                    </td>
                    <td className="py-4 text-right">
                      <span className="text-gray-400">{member.possiblePoints}</span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Breakdown by Round */}
      <div className="card">
        <h3 className="text-lg font-semibold text-white mb-4">Points by Round</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(PLAYOFF_POINTS).map(([round, points]) => {
            const gamesInRound = round === 'wild_card' ? 6 : round === 'divisional' ? 4 : round === 'conference' ? 2 : 1;
            const maxRoundPoints = gamesInRound * (points.winner + points.maxMargin);

            return (
              <div key={round} className="p-4 bg-white/5 rounded-lg">
                <p className="text-sm text-gray-400 mb-1">{roundDisplayNames[round as PlayoffRound]}</p>
                <p className="text-xl font-bold text-white">{maxRoundPoints} pts</p>
                <p className="text-xs text-gray-500 mt-1">
                  {gamesInRound} game{gamesInRound !== 1 ? 's' : ''} × {points.winner + points.maxMargin} max
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Picks View - Show each player's picks */}
      {activeSeries.playoffGames && activeSeries.playoffGames.some(g => g.isComplete) && (
        <div className="card">
          <h3 className="text-lg font-semibold text-white mb-4">Completed Games</h3>
          <div className="space-y-4">
            {activeSeries.playoffGames
              .filter(g => g.isComplete)
              .map(game => {
                const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                const winnerTeam = nflTeams.find(t => t.id === game.winnerId);

                if (!awayTeam || !homeTeam) return null;

                const margin = Math.abs((game.homeScore || 0) - (game.awayScore || 0));

                return (
                  <div key={game.id} className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 uppercase">
                          {game.conference} {roundDisplayNames[game.round]}
                        </span>
                      </div>
                      <span className="text-xs text-green-400">Final</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 ${game.winnerId === awayTeam.id ? 'text-white' : 'text-gray-500'}`}>
                          <img src={awayTeam.logo} alt={awayTeam.name} className="w-8 h-8 object-contain" />
                          <span className="font-medium">{awayTeam.abbreviation}</span>
                          <span className="font-bold">{game.awayScore}</span>
                        </div>
                        <span className="text-gray-500">@</span>
                        <div className={`flex items-center gap-2 ${game.winnerId === homeTeam.id ? 'text-white' : 'text-gray-500'}`}>
                          <img src={homeTeam.logo} alt={homeTeam.name} className="w-8 h-8 object-contain" />
                          <span className="font-medium">{homeTeam.abbreviation}</span>
                          <span className="font-bold">{game.homeScore}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        {winnerTeam && (
                          <p className="text-sm text-gray-400">
                            {winnerTeam.name} by <span className="text-white font-bold">{margin}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
