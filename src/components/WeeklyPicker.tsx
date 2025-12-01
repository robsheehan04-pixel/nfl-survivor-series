import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams, NFLTeam } from '../data/nflTeams';
import { TeamCard } from './TeamCard';
import { CountdownTimer, isDeadlinePassed } from './CountdownTimer';
import { isTeamOnBye, getTeamMatchupInfo, OddsFormat } from '../lib/nflSchedule';

export function WeeklyPicker() {
  const { activeSeries, user, makePick, getUserSeriesStatus, oddsFormat, setOddsFormat } = useStore();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'AFC' | 'NFC'>('all');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isChangingPick, setIsChangingPick] = useState(false);

  const status = activeSeries ? getUserSeriesStatus(activeSeries.id) : null;
  const currentWeek = activeSeries?.currentWeek || 1;

  const filteredTeams = useMemo(() => {
    if (filter === 'all') return nflTeams;
    return nflTeams.filter(team => team.conference === filter);
  }, [filter]);

  const groupedTeams = useMemo(() => {
    const groups: Record<string, NFLTeam[]> = {};
    filteredTeams.forEach(team => {
      const key = `${team.conference} ${team.division}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(team);
    });
    return groups;
  }, [filteredTeams]);

  // Get matchup info for all teams
  const teamMatchups = useMemo(() => {
    const matchups: Record<string, { opponent: string; isHome: boolean; spread: number; moneyline: number } | null> = {};
    nflTeams.forEach(team => {
      matchups[team.id] = getTeamMatchupInfo(team.id, currentWeek);
    });
    return matchups;
  }, [currentWeek]);

  // Get bye teams for current week
  const byeTeams = useMemo(() => {
    return nflTeams.filter(team => isTeamOnBye(team.id, currentWeek)).map(t => t.id);
  }, [currentWeek]);

  if (!activeSeries || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Select a series to make your pick</p>
      </div>
    );
  }

  if (!status?.member) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">You are not a member of this series</p>
      </div>
    );
  }

  if (status.member.isEliminated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-64 text-center"
      >
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
          <span className="text-4xl">💀</span>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Eliminated</h3>
        <p className="text-gray-400">Better luck next season!</p>
      </motion.div>
    );
  }

  const currentPick = status.member.picks.find(p => p.week === activeSeries.currentWeek);
  const deadlinePassed = isDeadlinePassed();
  const canChangePick = currentPick && currentPick.result === 'pending' && !deadlinePassed;

  // Show the locked-in pick view if user has picked and is not changing their pick
  if (currentPick && !isChangingPick) {
    const pickedTeam = nflTeams.find(t => t.id === currentPick.teamId);
    const matchup = pickedTeam ? teamMatchups[pickedTeam.id] : null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          Week {activeSeries.currentWeek} Pick {deadlinePassed ? 'Locked In' : 'Selected'}
        </h3>
        {pickedTeam && (
          <div className="flex justify-center mb-4">
            <TeamCard
              team={pickedTeam}
              isSelected
              showResult={currentPick.result}
              matchup={matchup}
              oddsFormat={oddsFormat}
              size="lg"
            />
          </div>
        )}
        {currentPick.isAutoPick && (
          <p className="text-yellow-400 text-sm mt-4">
            This was an auto-pick based on Vegas odds
          </p>
        )}
        <p className="text-gray-400 text-sm mt-2">
          Result: {currentPick.result === 'pending' ? 'Waiting for game results...' : currentPick.result.toUpperCase()}
        </p>

        {/* Change Pick Button - only show before deadline and while result is pending */}
        {canChangePick && (
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setIsChangingPick(true)}
              className="btn-secondary flex items-center gap-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Change Pick
            </button>
            <p className="text-xs text-gray-500">
              You can change your pick until the deadline
            </p>
          </div>
        )}

        {/* Countdown Timer - show when pick can still be changed */}
        {canChangePick && (
          <div className="mt-6 max-w-xs mx-auto">
            <CountdownTimer />
          </div>
        )}
      </motion.div>
    );
  }

  const handleConfirmPick = () => {
    if (selectedTeam) {
      makePick(activeSeries.id, selectedTeam);
      setShowConfirmation(false);
      setSelectedTeam(null);
      setIsChangingPick(false);
    }
  };

  // When changing pick, exclude the current pick's team from "used teams"
  const effectiveUsedTeams = isChangingPick && currentPick
    ? status.usedTeams.filter(t => t !== currentPick.teamId)
    : status.usedTeams;

  const selectedTeamData = selectedTeam ? nflTeams.find(t => t.id === selectedTeam) : null;
  const selectedMatchup = selectedTeam ? teamMatchups[selectedTeam] : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="font-nfl text-2xl text-white">
            {isChangingPick ? 'Change Your Pick' : `Week ${activeSeries.currentWeek} Pick`}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-gray-400 text-sm">Lives remaining:</span>
            <div className="flex gap-1">
              {[...Array(2)].map((_, i) => (
                <span
                  key={i}
                  className={`w-4 h-4 rounded-full ${
                    i < status.member!.livesRemaining ? 'bg-red-500' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
          {isChangingPick && (
            <button
              onClick={() => {
                setIsChangingPick(false);
                setSelectedTeam(null);
              }}
              className="mt-2 text-sm text-gray-400 hover:text-white flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel change
            </button>
          )}
        </div>

        {/* Countdown Timer */}
        <div className="lg:w-64">
          <CountdownTimer />
        </div>
      </div>

      {/* Bye week notice */}
      {byeTeams.length > 0 && (
        <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-yellow-400 text-sm">
            <span className="font-medium">Week {currentWeek} Bye Teams:</span>{' '}
            {byeTeams.map(id => nflTeams.find(t => t.id === id)?.name).join(', ')}
          </p>
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-2">
        {(['all', 'AFC', 'NFC'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all
              ${filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {f === 'all' ? 'All Teams' : f}
          </button>
        ))}
      </div>

      {/* Legend and Odds Format Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-emerald-800 rounded" />
            <span>Favored</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-700 rounded" />
            <span>Underdog</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gray-600 rounded" />
            <span>Already used / Bye</span>
          </div>
        </div>

        {/* Odds Format Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Odds:</span>
          <select
            value={oddsFormat}
            onChange={(e) => setOddsFormat(e.target.value as OddsFormat)}
            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="american" className="bg-gray-800">American (-110)</option>
            <option value="decimal" className="bg-gray-800">Decimal (1.91)</option>
            <option value="fractional" className="bg-gray-800">Fractional (10/11)</option>
          </select>
        </div>
      </div>

      {/* Teams Grid */}
      <div className="space-y-8">
        {Object.entries(groupedTeams).map(([division, teams]) => (
          <div key={division}>
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              {division}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {teams.map((team) => {
                const isBye = byeTeams.includes(team.id);
                const isUsed = effectiveUsedTeams.includes(team.id);
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
                    onClick={() => {
                      if (!isUsed && !isBye) {
                        setSelectedTeam(team.id);
                      }
                    }}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating action button */}
      <AnimatePresence>
        {selectedTeam && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-30"
          >
            <button
              onClick={() => setShowConfirmation(true)}
              className="btn-success shadow-2xl flex items-center gap-3 px-8"
            >
              <span className="font-nfl">Lock In Pick</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && selectedTeamData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowConfirmation(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-md mx-4"
            >
              <h3 className="font-nfl text-xl text-center text-white mb-6">
                Confirm Your Pick
              </h3>

              <div className="flex justify-center mb-6">
                <TeamCard
                  team={selectedTeamData}
                  isSelected
                  matchup={selectedMatchup}
                  oddsFormat={oddsFormat}
                  size="lg"
                />
              </div>

              <p className="text-center text-gray-400 mb-6">
                Are you sure you want to {isChangingPick ? 'change your pick to' : 'pick'} the{' '}
                <span className="text-white font-medium">
                  {selectedTeamData.city} {selectedTeamData.name}
                </span>
                ?{' '}
                {isChangingPick
                  ? 'You can change again before the deadline.'
                  : 'You can change your pick until the deadline.'}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPick}
                  className="flex-1 btn-success"
                >
                  Confirm Pick
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
