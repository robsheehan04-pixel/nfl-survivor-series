import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { SeriesSettings, defaultSeriesSettings } from '../types';

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateSeriesModal({ isOpen, onClose }: CreateSeriesModalProps) {
  const { createSeries, setActiveSeries } = useStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Settings state
  const [settings, setSettings] = useState<SeriesSettings>(defaultSeriesSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Series name is required');
      return;
    }

    if (name.length < 3) {
      setError('Series name must be at least 3 characters');
      return;
    }

    try {
      const newSeries = await createSeries(name.trim(), description.trim(), settings);
      if (newSeries) {
        setActiveSeries(newSeries.id);
        setName('');
        setDescription('');
        setSettings(defaultSeriesSettings);
        setShowAdvanced(false);
        onClose();
      } else {
        setError('Failed to create series');
      }
    } catch (err) {
      setError('Failed to create series');
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setError('');
    setSettings(defaultSeriesSettings);
    setShowAdvanced(false);
    onClose();
  };

  const updateSetting = <K extends keyof SeriesSettings>(key: K, value: SeriesSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
            className="card max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-nfl text-xl text-white">Create New Series</h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Series Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Office Pool 2024"
                  className="input-field"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description for your series..."
                  className="input-field min-h-[80px] resize-none"
                  maxLength={200}
                />
              </div>

              {/* Advanced Settings Toggle */}
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                <svg
                  className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                {showAdvanced ? 'Hide' : 'Show'} League Settings
              </button>

              {/* Advanced Settings */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-4 overflow-hidden"
                  >
                    {/* Starting Week */}
                    <div className="p-4 bg-white/5 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Starting Week</p>
                          <p className="text-xs text-gray-400">Which NFL week does the league begin?</p>
                        </div>
                        <select
                          value={settings.startingWeek}
                          onChange={(e) => updateSetting('startingWeek', parseInt(e.target.value))}
                          className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {Array.from({ length: 18 }, (_, i) => i + 1).map(week => (
                            <option key={week} value={week} className="bg-gray-800">
                              Week {week}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Lives Per Player */}
                    <div className="p-4 bg-white/5 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Lives Per Player</p>
                          <p className="text-xs text-gray-400">Losses before elimination</p>
                        </div>
                        <select
                          value={settings.livesPerPlayer}
                          onChange={(e) => updateSetting('livesPerPlayer', parseInt(e.target.value))}
                          className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map(lives => (
                            <option key={lives} value={lives} className="bg-gray-800">
                              {lives} {lives === 1 ? 'life' : 'lives'}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Team Reuse Limit */}
                    <div className="p-4 bg-white/5 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Team Usage Limit</p>
                          <p className="text-xs text-gray-400">Times each team can be picked per season</p>
                        </div>
                        <select
                          value={settings.maxTeamUses}
                          onChange={(e) => updateSetting('maxTeamUses', parseInt(e.target.value))}
                          className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value={1} className="bg-gray-800">Once per season</option>
                          <option value={2} className="bg-gray-800">Twice per season</option>
                          <option value={3} className="bg-gray-800">3 times per season</option>
                          <option value={18} className="bg-gray-800">Unlimited</option>
                        </select>
                      </div>
                    </div>

                    {/* Tie Game Handling */}
                    <div className="p-4 bg-white/5 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Tie Games Count As</p>
                          <p className="text-xs text-gray-400">How to handle tied NFL games</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => updateSetting('tieCountsAsWin', true)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                              settings.tieCountsAsWin
                                ? 'bg-green-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            Win
                          </button>
                          <button
                            type="button"
                            onClick={() => updateSetting('tieCountsAsWin', false)}
                            className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                              !settings.tieCountsAsWin
                                ? 'bg-red-500 text-white'
                                : 'bg-white/10 text-gray-400 hover:bg-white/20'
                            }`}
                          >
                            Loss
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Multiple Entries */}
                    <div className="p-4 bg-white/5 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-white">Allow Multiple Entries</p>
                          <p className="text-xs text-gray-400">Can players have more than one entry?</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => updateSetting('allowMultipleEntries', !settings.allowMultipleEntries)}
                          className={`
                            relative w-12 h-6 rounded-full transition-colors
                            ${settings.allowMultipleEntries ? 'bg-blue-500' : 'bg-gray-600'}
                          `}
                        >
                          <motion.div
                            animate={{ x: settings.allowMultipleEntries ? 24 : 2 }}
                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                            className="absolute top-1 w-4 h-4 bg-white rounded-full"
                          />
                        </button>
                      </div>

                      {/* Max Entries Per Player - only show if multiple entries allowed */}
                      {settings.allowMultipleEntries && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-between pt-3 border-t border-white/10"
                        >
                          <div>
                            <p className="text-sm text-gray-300">Max Entries Per Player</p>
                          </div>
                          <select
                            value={settings.maxEntriesPerPlayer}
                            onChange={(e) => updateSetting('maxEntriesPerPlayer', parseInt(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {[2, 3, 4, 5, 10].map(num => (
                              <option key={num} value={num} className="bg-gray-800">
                                {num} entries
                              </option>
                            ))}
                          </select>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm"
                >
                  {error}
                </motion.div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="flex-1 btn-primary">
                  Create Series
                </button>
              </div>
            </form>

            <div className="mt-6 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-500 text-center">
                After creating, you can invite friends to join your series
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
