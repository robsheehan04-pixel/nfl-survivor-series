import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams } from '../data/nflTeams';
import { SeriesMember } from '../types';
import { getTeamMatchup } from '../lib/nflSchedule';

export function Standings() {
  const { activeSeries, user } = useStore();

  const sortedMembers = useMemo(() => {
    if (!activeSeries) return [];

    return [...activeSeries.members].sort((a, b) => {
      // Active players first, then by lives, then by wins
      if (a.isEliminated !== b.isEliminated) {
        return a.isEliminated ? 1 : -1;
      }
      if (a.livesRemaining !== b.livesRemaining) {
        return b.livesRemaining - a.livesRemaining;
      }
      const aWins = a.picks.filter(p => p.result === 'win').length;
      const bWins = b.picks.filter(p => p.result === 'win').length;
      return bWins - aWins;
    });
  }, [activeSeries]);

  // Calculate the weeks to display based on series settings
  const weeksToDisplay = useMemo(() => {
    if (!activeSeries) return [];
    const startWeek = activeSeries.settings?.startingWeek || 1;
    const currentWeek = activeSeries.currentWeek;
    const weeks: number[] = [];
    for (let w = startWeek; w <= currentWeek; w++) {
      weeks.push(w);
    }
    return weeks;
  }, [activeSeries]);

  if (!activeSeries) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Select a series to view standings</p>
      </div>
    );
  }

  const getWins = (member: SeriesMember) =>
    member.picks.filter(p => p.result === 'win').length;

  const getLosses = (member: SeriesMember) =>
    member.picks.filter(p => p.result === 'loss').length;

  // Get pick info for a member and week
  const getPickInfo = (member: SeriesMember, week: number) => {
    const pick = member.picks.find(p => p.week === week);
    if (!pick) return null;

    const team = nflTeams.find(t => t.id === pick.teamId);
    if (!team) return null;

    // Get matchup info for that week
    const matchup = getTeamMatchup(pick.teamId, week);
    let opponent = null;
    let isHome = false;
    let homeScore: number | undefined;
    let awayScore: number | undefined;

    if (matchup) {
      const teamIdLower = pick.teamId.toLowerCase();
      if (matchup.homeTeam === teamIdLower) {
        opponent = nflTeams.find(t => t.id.toLowerCase() === matchup.awayTeam);
        isHome = true;
        homeScore = matchup.homeScore;
        awayScore = matchup.awayScore;
      } else {
        opponent = nflTeams.find(t => t.id.toLowerCase() === matchup.homeTeam);
        isHome = false;
        homeScore = matchup.awayScore;
        awayScore = matchup.homeScore;
      }
    }

    return {
      pick,
      team,
      opponent,
      isHome,
      teamScore: homeScore,
      opponentScore: awayScore,
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-nfl text-2xl text-white">Standings</h2>
          <p className="text-gray-400 text-sm">
            Week {activeSeries.currentWeek} • {sortedMembers.filter(m => !m.isEliminated).length} players remaining
          </p>
        </div>
      </div>

      {/* Week-by-Week Picks Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                {/* Player column header */}
                <th className="sticky left-0 z-10 bg-[#1a1a2e] px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[180px]">
                  Player
                </th>
                {/* Week column headers */}
                {weeksToDisplay.map(week => (
                  <th
                    key={week}
                    className="px-2 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[100px]"
                  >
                    Week {week}
                  </th>
                ))}
                {/* Record column */}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[80px]">
                  Record
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedMembers.map((member, index) => {
                const isCurrentUser = member.userId === user?.id;

                return (
                  <motion.tr
                    key={member.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`
                      ${isCurrentUser ? 'bg-blue-500/10' : ''}
                      ${member.isEliminated ? 'opacity-60' : ''}
                    `}
                  >
                    {/* Player info - sticky column */}
                    <td className={`sticky left-0 z-10 px-4 py-3 ${
                      member.isEliminated
                        ? 'bg-red-900/20'
                        : isCurrentUser
                          ? 'bg-blue-900/20'
                          : 'bg-[#1a1a2e]'
                    }`}>
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          {member.userPicture ? (
                            <img
                              src={member.userPicture}
                              alt={member.userName}
                              className={`w-10 h-10 rounded-full border-2 ${
                                member.isEliminated
                                  ? 'border-red-500/50 grayscale'
                                  : 'border-white/10'
                              }`}
                            />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                              member.isEliminated
                                ? 'bg-red-900/50 text-red-300 border-2 border-red-500/50'
                                : 'bg-gray-600 text-white'
                            }`}>
                              {member.userName[0]}
                            </div>
                          )}
                          {member.isEliminated && (
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-xs font-bold">X</span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-medium text-sm truncate flex items-center gap-2 ${
                            member.isEliminated ? 'text-gray-400 line-through' : 'text-white'
                          }`}>
                            {member.userName}
                            {isCurrentUser && (
                              <span className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded no-underline">
                                You
                              </span>
                            )}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {/* Lives indicator with hearts */}
                            <div className="flex gap-1">
                              {[...Array(activeSeries.settings?.livesPerPlayer || 2)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`text-sm ${
                                    i < member.livesRemaining
                                      ? 'text-red-500'
                                      : 'text-gray-600'
                                  }`}
                                >
                                  {i < member.livesRemaining ? '❤️' : '🖤'}
                                </span>
                              ))}
                            </div>
                            {member.isEliminated ? (
                              <span className="text-xs font-bold px-2 py-0.5 bg-red-600/30 text-red-400 rounded-full uppercase tracking-wide">
                                Eliminated
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500">
                                {member.livesRemaining} {member.livesRemaining === 1 ? 'life' : 'lives'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Week picks */}
                    {weeksToDisplay.map(week => {
                      const pickInfo = getPickInfo(member, week);

                      if (!pickInfo) {
                        return (
                          <td key={week} className="px-2 py-3 text-center">
                            <div className="flex items-center justify-center">
                              <span className="text-gray-600 text-xs">—</span>
                            </div>
                          </td>
                        );
                      }

                      const { pick, team, opponent, isHome, teamScore, opponentScore } = pickInfo;
                      const hasScore = teamScore !== undefined && opponentScore !== undefined;

                      return (
                        <td
                          key={week}
                          className={`px-2 py-2 text-center ${
                            pick.result === 'win'
                              ? 'bg-green-500/20'
                              : pick.result === 'loss'
                              ? 'bg-red-500/20'
                              : 'bg-yellow-500/10'
                          }`}
                        >
                          <div className="flex flex-col items-center gap-1">
                            {/* Team logo and name */}
                            <div className="flex items-center gap-1.5">
                              <img
                                src={team.logo}
                                alt={team.name}
                                className="w-6 h-6 object-contain"
                              />
                              <span className="text-xs font-medium text-white">
                                {team.abbreviation}
                              </span>
                            </div>

                            {/* Opponent */}
                            {opponent && (
                              <div className="text-[10px] text-gray-400">
                                {isHome ? 'vs' : '@'} {opponent.abbreviation}
                              </div>
                            )}

                            {/* Score if available */}
                            {hasScore && (
                              <div className={`text-[10px] font-medium ${
                                pick.result === 'win' ? 'text-green-400' :
                                pick.result === 'loss' ? 'text-red-400' :
                                'text-gray-400'
                              }`}>
                                {teamScore} - {opponentScore}
                              </div>
                            )}

                            {/* Result badge for pending */}
                            {pick.result === 'pending' && !hasScore && (
                              <span className="text-[10px] text-yellow-400">Pending</span>
                            )}
                          </div>
                        </td>
                      );
                    })}

                    {/* Record column */}
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-white">
                        {getWins(member)}-{getLosses(member)}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-green-500/20 border border-green-500/30" />
          <span>Win</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-yellow-500/10 border border-yellow-500/30" />
          <span>Pending</span>
        </div>
        <div className="flex items-center gap-2">
          <span>❤️</span>
          <span>Life remaining</span>
        </div>
        <div className="flex items-center gap-2">
          <span>🖤</span>
          <span>Life lost</span>
        </div>
      </div>
    </div>
  );
}
