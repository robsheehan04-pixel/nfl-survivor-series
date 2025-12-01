import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import {
  SeriesSettings,
  defaultSeriesSettings,
  Sport,
  Competition,
  SeriesType,
  getCompetitionsForSport,
  getSeriesTypesForSport,
  sportDisplayNames,
  competitionDisplayNames,
  seriesTypeDisplayNames,
} from '../types';
import { getTotalWeeks, getWeekLabel } from '../data/teams';

interface CreateSeriesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'sport' | 'competition' | 'seriesType' | 'details';

export function CreateSeriesModal({ isOpen, onClose }: CreateSeriesModalProps) {
  const { createSeries, setActiveSeries } = useStore();
  const [step, setStep] = useState<Step>('sport');
  const [sport, setSport] = useState<Sport>('nfl');
  const [competition, setCompetition] = useState<Competition>('regular_season');
  const [seriesType, setSeriesType] = useState<SeriesType>('survivor');
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
      const newSeries = await createSeries(name.trim(), description.trim(), settings, sport, competition, seriesType);
      if (newSeries) {
        setActiveSeries(newSeries.id);
        resetForm();
        onClose();
      } else {
        setError('Failed to create series');
      }
    } catch (err) {
      setError('Failed to create series');
    }
  };

  const resetForm = () => {
    setStep('sport');
    setSport('nfl');
    setCompetition('regular_season');
    setSeriesType('survivor');
    setName('');
    setDescription('');
    setSettings(defaultSeriesSettings);
    setShowAdvanced(false);
    setError('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSportSelect = (selectedSport: Sport) => {
    setSport(selectedSport);
    // Set defaults based on sport
    const competitions = getCompetitionsForSport(selectedSport);
    setCompetition(competitions[0]);
    const seriesTypes = getSeriesTypesForSport(selectedSport);
    setSeriesType(seriesTypes[0]);
    setStep('competition');
  };

  const handleCompetitionSelect = (selectedCompetition: Competition) => {
    setCompetition(selectedCompetition);
    setStep('seriesType');
  };

  const handleSeriesTypeSelect = (selectedType: SeriesType) => {
    setSeriesType(selectedType);
    setStep('details');
  };

  const handleBack = () => {
    if (step === 'competition') setStep('sport');
    else if (step === 'seriesType') setStep('competition');
    else if (step === 'details') setStep('seriesType');
  };

  const totalWeeks = getTotalWeeks(sport, competition);
  const weekLabel = getWeekLabel(sport, competition);

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
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                {step !== 'sport' && (
                  <button
                    onClick={handleBack}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}
                <h2 className="font-nfl text-xl text-white">
                  {step === 'sport' && 'Select Sport'}
                  {step === 'competition' && 'Select Competition'}
                  {step === 'seriesType' && 'Select Series Type'}
                  {step === 'details' && 'Series Details'}
                </h2>
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

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {['sport', 'competition', 'seriesType', 'details'].map((s, i) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-2 h-2 rounded-full transition-colors ${
                      ['sport', 'competition', 'seriesType', 'details'].indexOf(step) >= i
                        ? 'bg-blue-500'
                        : 'bg-gray-600'
                    }`}
                  />
                  {i < 3 && <div className={`w-8 h-0.5 ${['sport', 'competition', 'seriesType', 'details'].indexOf(step) > i ? 'bg-blue-500' : 'bg-gray-600'}`} />}
                </div>
              ))}
            </div>

            {/* Step 1: Sport Selection */}
            {step === 'sport' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleSportSelect('nfl')}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-blue-600 rounded-lg flex items-center justify-center text-2xl">
                    🏈
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">NFL</p>
                    <p className="text-sm text-gray-400">American Football</p>
                  </div>
                </button>
                <button
                  onClick={() => handleSportSelect('soccer')}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-800 rounded-lg flex items-center justify-center text-2xl">
                    ⚽
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-white">Soccer</p>
                    <p className="text-sm text-gray-400">Football / Soccer</p>
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Competition Selection */}
            {step === 'competition' && (
              <div className="space-y-3">
                {getCompetitionsForSport(sport).map((comp) => (
                  <button
                    key={comp}
                    onClick={() => handleCompetitionSelect(comp)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl ${
                      sport === 'nfl' ? 'bg-gradient-to-br from-red-600 to-blue-600' : 'bg-gradient-to-br from-green-600 to-green-800'
                    }`}>
                      {sport === 'nfl' ? '🏈' : '⚽'}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{competitionDisplayNames[comp]}</p>
                      <p className="text-sm text-gray-400">
                        {comp === 'regular_season' && '18 weeks of NFL action'}
                        {comp === 'playoffs' && 'Postseason tournament'}
                        {comp === 'premier_league' && 'English top-flight football'}
                        {comp === 'world_cup_2026' && 'FIFA World Cup USA/Mexico/Canada'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 3: Series Type Selection */}
            {step === 'seriesType' && (
              <div className="space-y-3">
                {getSeriesTypesForSport(sport).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleSeriesTypeSelect(type)}
                    className="w-full p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-blue-500/50 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center text-2xl">
                      {type === 'survivor' || type === 'last_man_standing' ? '👑' : '🏆'}
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-white">{seriesTypeDisplayNames[type]}</p>
                      <p className="text-sm text-gray-400">
                        {type === 'survivor' && 'Pick one team per week to win. Lose if they lose.'}
                        {type === 'playoff_pool' && 'Survivor format for the playoffs.'}
                        {type === 'last_man_standing' && 'Pick one team per matchweek to win.'}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Step 4: Details Form */}
            {step === 'details' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Selected options summary */}
                <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3 text-sm">
                  <span className="text-xl">{sport === 'nfl' ? '🏈' : '⚽'}</span>
                  <span className="text-gray-400">
                    {sportDisplayNames[sport]} • {competitionDisplayNames[competition]} • {seriesTypeDisplayNames[seriesType]}
                  </span>
                </div>

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
                      {/* Starting Week/Matchweek */}
                      <div className="p-4 bg-white/5 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">Starting {weekLabel}</p>
                            <p className="text-xs text-gray-400">Which {weekLabel.toLowerCase()} does the league begin?</p>
                          </div>
                          <select
                            value={settings.startingWeek}
                            onChange={(e) => updateSetting('startingWeek', parseInt(e.target.value))}
                            className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {Array.from({ length: totalWeeks }, (_, i) => i + 1).map(week => (
                              <option key={week} value={week} className="bg-gray-800">
                                {weekLabel} {week}
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
                            <option value={totalWeeks} className="bg-gray-800">Unlimited</option>
                          </select>
                        </div>
                      </div>

                      {/* Tie/Draw Game Handling */}
                      <div className="p-4 bg-white/5 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-white">{sport === 'soccer' ? 'Draws' : 'Tie Games'} Count As</p>
                            <p className="text-xs text-gray-400">How to handle {sport === 'soccer' ? 'drawn' : 'tied'} games</p>
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
                    onClick={handleBack}
                    className="flex-1 btn-secondary"
                  >
                    Back
                  </button>
                  <button type="submit" className="flex-1 btn-primary">
                    Create Series
                  </button>
                </div>
              </form>
            )}

            {step !== 'details' && (
              <div className="mt-6 pt-4 border-t border-white/10">
                <p className="text-xs text-gray-500 text-center">
                  Select options to continue setting up your series
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
