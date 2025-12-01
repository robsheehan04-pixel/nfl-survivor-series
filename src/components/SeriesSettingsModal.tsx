import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface SeriesSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SeriesSettingsModal({ isOpen, onClose }: SeriesSettingsModalProps) {
  const { activeSeries, updateSeriesSettings, deleteSeries, user } = useStore();
  const [prizeValue, setPrizeValue] = useState('');
  const [showPrizeValue, setShowPrizeValue] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isCreator = activeSeries && user && activeSeries.createdBy === user.id;

  useEffect(() => {
    if (activeSeries) {
      setPrizeValue(activeSeries.prizeValue?.toString() || '');
      setShowPrizeValue(activeSeries.showPrizeValue || false);
    }
  }, [activeSeries]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activeSeries) return;

    const prizeNum = parseFloat(prizeValue) || 0;
    await updateSeriesSettings(activeSeries.id, {
      prizeValue: prizeNum,
      showPrizeValue,
    });

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  const handleDelete = async () => {
    if (!activeSeries) return;

    setIsDeleting(true);
    const success = await deleteSeries(activeSeries.id);
    setIsDeleting(false);

    if (success) {
      setShowDeleteConfirm(false);
      onClose();
    }
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
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="card max-w-md w-full mx-4"
          >
            {saved ? (
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
                <h3 className="text-xl font-bold text-white">Settings Saved!</h3>
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-nfl text-xl text-white">Series Settings</h2>
                  <button
                    onClick={onClose}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Prize Value */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Prize Pool Value
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                      <input
                        type="number"
                        value={prizeValue}
                        onChange={(e) => setPrizeValue(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="input-field pl-8 w-full"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Set the total prize pool for this series
                    </p>
                  </div>

                  {/* Show Prize Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-white">Show Prize Pool</p>
                      <p className="text-xs text-gray-400">Display the prize value to all members</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPrizeValue(!showPrizeValue)}
                      className={`
                        relative w-12 h-6 rounded-full transition-colors
                        ${showPrizeValue ? 'bg-green-500' : 'bg-gray-600'}
                      `}
                    >
                      <motion.div
                        animate={{ x: showPrizeValue ? 24 : 2 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-4 h-4 bg-white rounded-full"
                      />
                    </button>
                  </div>

                  {/* Current Week (info only) */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Current Week</p>
                        <p className="text-xs text-gray-400">Week {activeSeries.currentWeek} of 18</p>
                      </div>
                      <span className="text-2xl font-bold text-blue-400">{activeSeries.currentWeek}</span>
                    </div>
                  </div>

                  {/* Members count */}
                  <div className="p-4 bg-white/5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-white">Members</p>
                        <p className="text-xs text-gray-400">
                          {activeSeries.members.filter(m => !m.isEliminated).length} active, {activeSeries.members.filter(m => m.isEliminated).length} eliminated
                        </p>
                      </div>
                      <span className="text-2xl font-bold text-white">{activeSeries.members.length}</span>
                    </div>
                  </div>

                  {/* Delete Series (only for creator) */}
                  {isCreator && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                      {!showDeleteConfirm ? (
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-red-400">Delete Series</p>
                            <p className="text-xs text-gray-400">Permanently delete this series and all data</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-red-400">
                            Are you sure? This will permanently delete "{activeSeries.name}" and cannot be undone.
                          </p>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => setShowDeleteConfirm(false)}
                              className="flex-1 px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors"
                              disabled={isDeleting}
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={isDeleting}
                              className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Submit */}
                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 btn-secondary"
                    >
                      Cancel
                    </button>
                    <button type="submit" className="flex-1 btn-primary">
                      Save Settings
                    </button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
