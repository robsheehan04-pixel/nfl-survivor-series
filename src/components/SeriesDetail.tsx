import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { WeeklyPicker } from './WeeklyPicker';
import { Standings } from './Standings';
import { InviteModal } from './InviteModal';
import { PrizeDisplay } from './PrizeDisplay';
import { SeriesSettingsModal } from './SeriesSettingsModal';
import { AdminPickModal } from './AdminPickModal';

type Tab = 'pick' | 'standings' | 'history';

export function SeriesDetail() {
  const { activeSeries, user, leaveSeries, setActiveSeries } = useStore();
  const [activeTab, setActiveTab] = useState<Tab>('standings');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAdminPickModal, setShowAdminPickModal] = useState(false);

  // Check if user is a member of the current series
  const currentMember = activeSeries?.members.find(m => m.userId === user?.id);

  // Set default tab based on membership
  useEffect(() => {
    if (activeSeries) {
      // If user is a member, default to 'pick', otherwise 'standings'
      setActiveTab(currentMember ? 'pick' : 'standings');
    }
  }, [activeSeries?.id, currentMember]);

  if (!activeSeries) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center h-96 text-center"
      >
        <div className="w-24 h-24 mb-6 bg-white/5 rounded-full flex items-center justify-center">
          <span className="text-5xl">🏈</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Select a Series</h2>
        <p className="text-gray-400 max-w-md">
          Choose a series from the sidebar to view your picks, standings, and more.
        </p>
      </motion.div>
    );
  }

  const isSeriesCreator = activeSeries.createdBy === user?.id;
  const isAppOwner = user?.role === 'owner';
  const isOwner = isSeriesCreator || isAppOwner;
  const member = activeSeries.members.find(m => m.userId === user?.id);
  const isMember = !!member;
  const activePlayers = activeSeries.members.filter(m => !m.isEliminated).length;

  const handleLeaveSeries = () => {
    leaveSeries(activeSeries.id);
    setActiveSeries(null);
    setShowLeaveConfirm(false);
  };

  // Only show "Make Pick" tab if user is a member of the series
  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    // Only show Make Pick if user is a member
    ...(isMember ? [{
      id: 'pick' as Tab,
      label: 'Make Pick',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    }] : []),
    {
      id: 'standings',
      label: 'Standings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Prize Display - shown if enabled */}
      {activeSeries.showPrizeValue && activeSeries.prizeValue && activeSeries.prizeValue > 0 && (
        <PrizeDisplay
          prizeValue={activeSeries.prizeValue}
          playersRemaining={activePlayers}
        />
      )}

      {/* Series Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="font-nfl text-2xl text-white">{activeSeries.name}</h1>
              {isOwner && (
                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                  Owner
                </span>
              )}
            </div>
            {activeSeries.description && (
              <p className="text-gray-400 text-sm mb-2">{activeSeries.description}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Week {activeSeries.currentWeek}
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {activePlayers}/{activeSeries.members.length} remaining
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {isOwner && (
              <>
                <button
                  onClick={() => setShowAdminPickModal(true)}
                  className="btn-secondary flex items-center gap-2"
                  title="Make pick for another member"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Admin Pick
                </button>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="btn-secondary flex items-center gap-2"
                  title="Series Settings"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </>
            )}
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Invite
            </button>
            {!isOwner && (
              <button
                onClick={() => setShowLeaveConfirm(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Leave
              </button>
            )}
          </div>
        </div>

        {/* Player status bar */}
        {member && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Your lives:</span>
                <div className="flex gap-1">
                  {[...Array(2)].map((_, i) => (
                    <motion.span
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1 }}
                      className={`
                        w-4 h-4 rounded-full
                        ${i < member.livesRemaining ? 'bg-red-500' : 'bg-gray-600'}
                      `}
                    />
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Record:</span>
                <span className="text-sm font-medium text-white">
                  {member.picks.filter(p => p.result === 'win').length}-
                  {member.picks.filter(p => p.result === 'loss').length}
                </span>
              </div>
            </div>
            {member.isEliminated && (
              <span className="px-3 py-1 bg-red-500/20 text-red-400 text-sm rounded-full">
                Eliminated
              </span>
            )}
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
              ${activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'pick' && <WeeklyPicker />}
          {activeTab === 'standings' && <Standings />}
        </motion.div>
      </AnimatePresence>

      {/* Invite Modal */}
      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
      />

      {/* Series Settings Modal (Owner only) */}
      <SeriesSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />

      {/* Admin Pick Modal (Owner only) */}
      <AdminPickModal
        isOpen={showAdminPickModal}
        onClose={() => setShowAdminPickModal(false)}
      />

      {/* Leave Confirmation Modal */}
      <AnimatePresence>
        {showLeaveConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-overlay"
            onClick={() => setShowLeaveConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="card max-w-sm mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Leave Series?</h3>
                <p className="text-gray-400 mb-6">
                  Are you sure you want to leave "{activeSeries.name}"? This action cannot be undone.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLeaveConfirm(false)}
                    className="flex-1 btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLeaveSeries}
                    className="flex-1 btn-danger"
                  >
                    Leave Series
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
