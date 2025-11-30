import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams, NFLTeam } from '../data/nflTeams';
import { TeamCard } from './TeamCard';

export function WeeklyPicker() {
  const { activeSeries, user, makePick, getUserSeriesStatus } = useStore();
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'AFC' | 'NFC'>('all');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const status = activeSeries ? getUserSeriesStatus(activeSeries.id) : null;

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

  // Calculate deadline (Saturday 1 PM)
  const getNextDeadline = () => {
    const now = new Date();
    const saturday = new Date(now);
    const dayOfWeek = now.getDay();
    const daysUntilSaturday = (6 - dayOfWeek + 7) % 7;
    saturday.setDate(now.getDate() + daysUntilSaturday);
    saturday.setHours(13, 0, 0, 0);
    if (saturday <= now) {
      saturday.setDate(saturday.getDate() + 7);
    }
    return saturday;
  };

  const deadline = getNextDeadline();
  const timeUntilDeadline = deadline.getTime() - Date.now();
  const hoursRemaining = Math.floor(timeUntilDeadline / (1000 * 60 * 60));
  const isUrgent = hoursRemaining < 24;

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

  if (currentPick) {
    const pickedTeam = nflTeams.find(t => t.id === currentPick.teamId);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8"
      >
        <h3 className="text-xl font-bold text-white mb-6">
          Week {activeSeries.currentWeek} Pick Locked In
        </h3>
        {pickedTeam && (
          <div className="flex justify-center mb-4">
            <TeamCard
              team={pickedTeam}
              isSelected
              showResult={currentPick.result}
              size="lg"
            />
          </div>
        )}
        {currentPick.isAutoPick && (
          <p className="text-yellow-400 text-sm mt-4">
            ⚠ This was an auto-pick based on Vegas odds
          </p>
        )}
        <p className="text-gray-400 text-sm mt-2">
          Result: {currentPick.result === 'pending' ? 'Waiting for game results...' : currentPick.result.toUpperCase()}
        </p>
      </motion.div>
    );
  }

  const handleConfirmPick = () => {
    if (selectedTeam) {
      makePick(activeSeries.id, selectedTeam);
      setShowConfirmation(false);
      setSelectedTeam(null);
    }
  };

  const selectedTeamData = selectedTeam ? nflTeams.find(t => t.id === selectedTeam) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="font-nfl text-2xl text-white">
            Week {activeSeries.currentWeek} Pick
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
        </div>

        {/* Deadline warning */}
        <div
          className={`
            px-4 py-2 rounded-lg flex items-center gap-2
            ${isUrgent ? 'bg-red-500/20 text-red-400 deadline-warning' : 'bg-blue-500/20 text-blue-400'}
          `}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium">
            {isUrgent ? `${hoursRemaining}h remaining!` : `Deadline: Saturday 1:00 PM`}
          </span>
        </div>
      </div>

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

      {/* Teams Grid */}
      <div className="space-y-8">
        {Object.entries(groupedTeams).map(([division, teams]) => (
          <div key={division}>
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              {division}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {teams.map((team) => (
                <TeamCard
                  key={team.id}
                  team={team}
                  isSelected={selectedTeam === team.id}
                  isUsed={status.usedTeams.includes(team.id)}
                  onClick={() => {
                    if (!status.usedTeams.includes(team.id)) {
                      setSelectedTeam(team.id);
                    }
                  }}
                />
              ))}
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
                <TeamCard team={selectedTeamData} isSelected size="lg" />
              </div>

              <p className="text-center text-gray-400 mb-6">
                Are you sure you want to pick the{' '}
                <span className="text-white font-medium">
                  {selectedTeamData.city} {selectedTeamData.name}
                </span>
                ? This cannot be undone.
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
