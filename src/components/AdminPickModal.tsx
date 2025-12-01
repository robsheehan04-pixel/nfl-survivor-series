import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams } from '../data/nflTeams';
import { TeamCard } from './TeamCard';
import { isTeamOnBye, getTeamMatchupInfo } from '../lib/nflSchedule';
import { SeriesMember } from '../types';

interface AdminPickModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminPickModal({ isOpen, onClose }: AdminPickModalProps) {
  const { activeSeries, adminMakePick, oddsFormat } = useStore();
  const [selectedMember, setSelectedMember] = useState<SeriesMember | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const currentWeek = activeSeries?.currentWeek || 1;

  // Get bye teams for current week
  const byeTeams = useMemo(() => {
    return nflTeams.filter(team => isTeamOnBye(team.id, currentWeek)).map(t => t.id);
  }, [currentWeek]);

  // Get matchup info for all teams
  const teamMatchups = useMemo(() => {
    const matchups: Record<string, { opponent: string; isHome: boolean; spread: number; moneyline: number } | null> = {};
    nflTeams.forEach(team => {
      matchups[team.id] = getTeamMatchupInfo(team.id, currentWeek);
    });
    return matchups;
  }, [currentWeek]);

  // Get members who need picks (not eliminated, no pick this week)
  const membersNeedingPicks = useMemo(() => {
    if (!activeSeries) return [];
    return activeSeries.members.filter(m => {
      if (m.isEliminated) return false;
      const hasPick = m.picks.some(p => p.week === currentWeek);
      return !hasPick;
    });
  }, [activeSeries, currentWeek]);

  // Get all active members (for override purposes)
  const activeMembers = useMemo(() => {
    if (!activeSeries) return [];
    return activeSeries.members.filter(m => !m.isEliminated);
  }, [activeSeries]);

  // Get used teams for selected member
  const usedTeams = useMemo(() => {
    if (!selectedMember) return [];
    // Exclude current week's pick if changing
    return selectedMember.picks
      .filter(p => p.week !== currentWeek)
      .map(p => p.teamId);
  }, [selectedMember, currentWeek]);

  const handleSubmit = async () => {
    if (!activeSeries || !selectedMember || !selectedTeam) return;

    setIsSubmitting(true);
    const result = await adminMakePick(activeSeries.id, selectedMember.userId, selectedTeam);
    setIsSubmitting(false);

    if (result) {
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setSelectedMember(null);
        setSelectedTeam(null);
        onClose();
      }, 1500);
    }
  };

  const handleClose = () => {
    setSelectedMember(null);
    setSelectedTeam(null);
    setSuccess(false);
    onClose();
  };

  if (!activeSeries) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="modal-overlay"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-green-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">Pick Saved!</h3>
                <p className="text-gray-400 mt-2">
                  {selectedMember?.userName}'s pick has been updated.
                </p>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="font-nfl text-xl text-white">Admin Pick Override</h2>
                    <p className="text-sm text-gray-400">Make a pick on behalf of a member</p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Step 1: Select Member */}
                {!selectedMember ? (
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-300">Select a Member</h3>

                    {membersNeedingPicks.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs text-yellow-400">Members without picks this week:</p>
                        {membersNeedingPicks.map(member => (
                          <button
                            key={member.userId}
                            onClick={() => setSelectedMember(member)}
                            className="w-full p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-3 hover:bg-yellow-500/20 transition-colors text-left"
                          >
                            {member.userPicture ? (
                              <img
                                src={member.userPicture}
                                alt={member.userName}
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                <span className="text-lg">{member.userName[0]}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="text-white font-medium">{member.userName}</p>
                              <p className="text-xs text-yellow-400">No pick for Week {currentWeek}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    )}

                    {activeMembers.length > membersNeedingPicks.length && (
                      <div className="space-y-2 mt-4">
                        <p className="text-xs text-gray-500">All active members (can override existing pick):</p>
                        {activeMembers
                          .filter(m => !membersNeedingPicks.includes(m))
                          .map(member => {
                            const currentPick = member.picks.find(p => p.week === currentWeek);
                            const pickedTeam = currentPick ? nflTeams.find(t => t.id === currentPick.teamId) : null;

                            return (
                              <button
                                key={member.userId}
                                onClick={() => setSelectedMember(member)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3 hover:bg-white/10 transition-colors text-left"
                              >
                                {member.userPicture ? (
                                  <img
                                    src={member.userPicture}
                                    alt={member.userName}
                                    className="w-10 h-10 rounded-full"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-gray-600 flex items-center justify-center">
                                    <span className="text-lg">{member.userName[0]}</span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-white font-medium">{member.userName}</p>
                                  {pickedTeam && (
                                    <p className="text-xs text-gray-400">
                                      Current pick: {pickedTeam.city} {pickedTeam.name}
                                    </p>
                                  )}
                                </div>
                                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </button>
                            );
                          })}
                      </div>
                    )}

                    {activeMembers.length === 0 && (
                      <p className="text-gray-400 text-center py-8">No active members to pick for</p>
                    )}
                  </div>
                ) : (
                  /* Step 2: Select Team */
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-4">
                      <button
                        onClick={() => {
                          setSelectedMember(null);
                          setSelectedTeam(null);
                        }}
                        className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <div className="flex items-center gap-2">
                        {selectedMember.userPicture ? (
                          <img
                            src={selectedMember.userPicture}
                            alt={selectedMember.userName}
                            className="w-8 h-8 rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                            <span>{selectedMember.userName[0]}</span>
                          </div>
                        )}
                        <span className="text-white font-medium">
                          Pick for {selectedMember.userName}
                        </span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-400">Select a team for Week {currentWeek}:</p>

                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-[50vh] overflow-y-auto">
                      {nflTeams.map(team => {
                        const isBye = byeTeams.includes(team.id);
                        const isUsed = usedTeams.includes(team.id);
                        const matchup = teamMatchups[team.id];

                        return (
                          <TeamCard
                            key={team.id}
                            team={team}
                            isSelected={selectedTeam === team.id}
                            isUsed={isUsed}
                            isBye={isBye}
                            matchup={matchup}
                            oddsFormat={oddsFormat}
                            size="sm"
                            onClick={() => {
                              if (!isUsed && !isBye) {
                                setSelectedTeam(team.id);
                              }
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-white/10">
                      <button
                        onClick={handleClose}
                        className="flex-1 btn-secondary"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={!selectedTeam || isSubmitting}
                        className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Saving...' : 'Save Pick'}
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
