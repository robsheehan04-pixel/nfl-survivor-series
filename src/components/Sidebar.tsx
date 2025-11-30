import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { Series } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSeries: () => void;
  onViewInvitations: () => void;
}

export function Sidebar({ isOpen, onClose, onCreateSeries, onViewInvitations }: SidebarProps) {
  const {
    user,
    series,
    activeSeries,
    setActiveSeries,
    getPendingInvitations,
  } = useStore();

  const pendingInvitations = getPendingInvitations();

  const mySeries = series.filter(s =>
    s.members.some(m => m.userId === user?.id)
  );

  const getMyStatus = (s: Series) => {
    const member = s.members.find(m => m.userId === user?.id);
    if (!member) return null;
    return member;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <h2 className="font-nfl text-lg text-white">My Series</h2>
          <button
            onClick={onClose}
            className="lg:hidden p-1 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Invitations */}
      {pendingInvitations.length > 0 && (
        <button
          onClick={onViewInvitations}
          className="mx-4 mt-4 p-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-xl flex items-center gap-3 hover:from-yellow-500/30 hover:to-orange-500/30 transition-all"
        >
          <span className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </span>
          <div className="flex-1 text-left">
            <p className="text-sm font-medium text-white">
              {pendingInvitations.length} Pending Invitation{pendingInvitations.length > 1 ? 's' : ''}
            </p>
            <p className="text-xs text-gray-400">Click to review</p>
          </div>
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}

      {/* Series List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {mySeries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-white/5 rounded-full flex items-center justify-center">
              <span className="text-3xl">🏈</span>
            </div>
            <p className="text-gray-400 text-sm mb-2">No active series</p>
            <p className="text-gray-500 text-xs">Create or join a series to get started</p>
          </div>
        ) : (
          mySeries.map((s) => {
            const status = getMyStatus(s);
            const isActive = activeSeries?.id === s.id;

            return (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSeries(s.id)}
                className={`w-full p-3 rounded-xl text-left transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-800/30 border border-blue-500/30'
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-white truncate pr-2">{s.name}</h3>
                  {status?.isEliminated && (
                    <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full">
                      Eliminated
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Week {s.currentWeek}</span>
                  <span className="flex items-center gap-1">
                    {status && !status.isEliminated && (
                      <>
                        {[...Array(2)].map((_, i) => (
                          <span
                            key={i}
                            className={`w-2 h-2 rounded-full ${
                              i < status.livesRemaining ? 'bg-red-500' : 'bg-gray-600'
                            }`}
                          />
                        ))}
                      </>
                    )}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-1">
                  <div className="flex -space-x-2">
                    {s.members.slice(0, 5).map((m, i) => (
                      <img
                        key={m.userId}
                        src={m.userPicture}
                        alt={m.userName}
                        className="w-6 h-6 rounded-full border-2 border-gray-900"
                        style={{ zIndex: 5 - i }}
                      />
                    ))}
                  </div>
                  {s.members.length > 5 && (
                    <span className="text-xs text-gray-500 ml-1">
                      +{s.members.length - 5}
                    </span>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>

      {/* Create Button */}
      <div className="p-4 border-t border-white/10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateSeries}
          className="w-full btn-primary flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Create New Series
        </motion.button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-[calc(100vh-64px)] sticky top-16 glass border-r border-white/10">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-gray-900 z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
