import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams } from '../data/nflTeams';
import { SeriesMember } from '../types';

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

  const getStreak = (member: SeriesMember) => {
    const picks = [...member.picks].sort((a, b) => b.week - a.week);
    if (picks.length === 0) return null;

    const streakResult = picks[0].result;
    if (streakResult === 'pending') return null;

    let count = 0;
    for (const pick of picks) {
      if (pick.result === streakResult) count++;
      else break;
    }

    return { type: streakResult, count };
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

      {/* Standings Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Player
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                  Lives
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center">
                  W-L
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center hidden sm:table-cell">
                  Streak
                </th>
                <th className="px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wider text-center hidden md:table-cell">
                  This Week
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sortedMembers.map((member, index) => {
                const isCurrentUser = member.userId === user?.id;
                const streak = getStreak(member);
                const currentPick = member.picks.find(p => p.week === activeSeries.currentWeek);
                const currentTeam = currentPick ? nflTeams.find(t => t.id === currentPick.teamId) : null;

                return (
                  <motion.tr
                    key={member.userId}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`
                      ${isCurrentUser ? 'bg-blue-500/10' : ''}
                      ${member.isEliminated ? 'opacity-50' : ''}
                    `}
                  >
                    <td className="px-4 py-4">
                      <span className={`
                        inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold
                        ${index === 0 && !member.isEliminated ? 'bg-yellow-500/20 text-yellow-400' : ''}
                        ${index === 1 && !member.isEliminated ? 'bg-gray-400/20 text-gray-300' : ''}
                        ${index === 2 && !member.isEliminated ? 'bg-orange-500/20 text-orange-400' : ''}
                        ${index > 2 || member.isEliminated ? 'bg-white/5 text-gray-400' : ''}
                      `}>
                        {member.isEliminated ? '—' : index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.userPicture}
                          alt={member.userName}
                          className="w-10 h-10 rounded-full border-2 border-white/10"
                        />
                        <div>
                          <p className="font-medium text-white flex items-center gap-2">
                            {member.userName}
                            {isCurrentUser && (
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">
                                You
                              </span>
                            )}
                          </p>
                          {member.isEliminated && (
                            <p className="text-xs text-red-400">Eliminated</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center gap-1">
                        {[...Array(2)].map((_, i) => (
                          <span
                            key={i}
                            className={`
                              w-3 h-3 rounded-full transition-all
                              ${i < member.livesRemaining ? 'bg-red-500' : 'bg-gray-600'}
                            `}
                          />
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className="font-medium text-white">
                        {getWins(member)}-{getLosses(member)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center hidden sm:table-cell">
                      {streak ? (
                        <span className={`
                          text-sm font-medium
                          ${streak.type === 'win' ? 'text-green-400' : 'text-red-400'}
                        `}>
                          {streak.count}{streak.type === 'win' ? 'W' : 'L'}
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center hidden md:table-cell">
                      {currentTeam ? (
                        <div className="flex items-center justify-center gap-2">
                          <img
                            src={currentTeam.logo}
                            alt={currentTeam.name}
                            className="w-8 h-8 object-contain"
                          />
                          <span className="text-sm text-gray-400">
                            {currentTeam.abbreviation}
                          </span>
                          {currentPick?.result !== 'pending' && (
                            <span className={`
                              text-xs px-1.5 py-0.5 rounded
                              ${currentPick?.result === 'win' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}
                            `}>
                              {currentPick?.result === 'win' ? 'W' : 'L'}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">No pick yet</span>
                      )}
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pick History */}
      <div className="card">
        <h3 className="font-nfl text-lg text-white mb-4">Your Pick History</h3>
        <div className="flex flex-wrap gap-2">
          {activeSeries.members
            .find(m => m.userId === user?.id)
            ?.picks.sort((a, b) => a.week - b.week)
            .map(pick => {
              const team = nflTeams.find(t => t.id === pick.teamId);
              if (!team) return null;

              return (
                <motion.div
                  key={pick.week}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg border
                    ${pick.result === 'win' ? 'bg-green-500/10 border-green-500/30' : ''}
                    ${pick.result === 'loss' ? 'bg-red-500/10 border-red-500/30' : ''}
                    ${pick.result === 'pending' ? 'bg-yellow-500/10 border-yellow-500/30' : ''}
                  `}
                >
                  <span className="text-xs text-gray-400">W{pick.week}</span>
                  <img
                    src={team.logo}
                    alt={team.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span className={`
                    text-xs font-medium
                    ${pick.result === 'win' ? 'text-green-400' : ''}
                    ${pick.result === 'loss' ? 'text-red-400' : ''}
                    ${pick.result === 'pending' ? 'text-yellow-400' : ''}
                  `}>
                    {pick.result === 'win' && 'W'}
                    {pick.result === 'loss' && 'L'}
                    {pick.result === 'pending' && '?'}
                  </span>
                  {pick.isAutoPick && (
                    <span className="text-xs text-gray-500" title="Auto-pick">
                      ⚡
                    </span>
                  )}
                </motion.div>
              );
            })}
          {!activeSeries.members.find(m => m.userId === user?.id)?.picks.length && (
            <p className="text-gray-500 text-sm">No picks yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
