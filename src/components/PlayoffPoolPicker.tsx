import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { nflTeams, NFLTeam } from '../data/nflTeams';
import {
  PlayoffGame,
  PlayoffBracketPick,
  PlayoffRound,
  PlayoffStage,
  CURRENT_PLAYOFF_SEEDING,
  generateWildCardGames,
  roundDisplayNames,
  PLAYOFF_POINTS,
} from '../types/playoffPool';

interface GamePickCardProps {
  game: PlayoffGame;
  awayTeam: NFLTeam;
  homeTeam: NFLTeam;
  existingPick?: PlayoffBracketPick;
  onPickChange: (gameId: string, winnerId: string, margin: number) => void;
  disabled?: boolean;
}

function GamePickCard({ game, awayTeam, homeTeam, existingPick, onPickChange, disabled }: GamePickCardProps) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(existingPick?.pickedWinnerId || null);
  const [margin, setMargin] = useState<number>(existingPick?.predictedMargin || 0);

  const handleTeamSelect = (teamId: string) => {
    if (disabled) return;
    setSelectedWinner(teamId);
    if (margin > 0) {
      onPickChange(game.id, teamId, margin);
    }
  };

  const handleMarginChange = (newMargin: number) => {
    if (disabled) return;
    setMargin(newMargin);
    if (selectedWinner && newMargin > 0) {
      onPickChange(game.id, selectedWinner, newMargin);
    }
  };

  const isComplete = selectedWinner && margin > 0;

  return (
    <div className={`card ${isComplete ? 'border-green-500/30' : 'border-white/10'} transition-all`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-gray-400 uppercase tracking-wider">
          {game.conference} {roundDisplayNames[game.round]}
        </span>
        {isComplete && (
          <span className="text-xs text-green-400 flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Pick complete
          </span>
        )}
      </div>

      {/* Teams Row */}
      <div className="flex items-center gap-4 mb-4">
        {/* Away Team */}
        <button
          onClick={() => handleTeamSelect(awayTeam.id)}
          disabled={disabled}
          className={`
            flex-1 p-3 rounded-lg border-2 transition-all flex items-center gap-3
            ${selectedWinner === awayTeam.id
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <img
            src={awayTeam.logo}
            alt={awayTeam.name}
            className="w-10 h-10 object-contain"
          />
          <div className="text-left">
            <p className="text-xs text-gray-400">{awayTeam.city}</p>
            <p className="text-sm font-semibold text-white">{awayTeam.name}</p>
          </div>
        </button>

        <span className="text-gray-500 font-bold">@</span>

        {/* Home Team */}
        <button
          onClick={() => handleTeamSelect(homeTeam.id)}
          disabled={disabled}
          className={`
            flex-1 p-3 rounded-lg border-2 transition-all flex items-center gap-3
            ${selectedWinner === homeTeam.id
              ? 'border-blue-500 bg-blue-500/20'
              : 'border-white/10 bg-white/5 hover:border-white/30'
            }
            ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          `}
        >
          <img
            src={homeTeam.logo}
            alt={homeTeam.name}
            className="w-10 h-10 object-contain"
          />
          <div className="text-left">
            <p className="text-xs text-gray-400">{homeTeam.city}</p>
            <p className="text-sm font-semibold text-white">{homeTeam.name}</p>
          </div>
        </button>
      </div>

      {/* Margin Selector */}
      {selectedWinner && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="border-t border-white/10 pt-4"
        >
          <p className="text-sm text-gray-400 mb-3">
            <span className="font-medium text-white">
              {nflTeams.find(t => t.id === selectedWinner)?.name}
            </span>{' '}
            to win by:
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleMarginChange(Math.max(1, margin - 1))}
              disabled={disabled || margin <= 1}
              className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              -
            </button>
            <input
              type="number"
              min="1"
              max="99"
              value={margin || ''}
              onChange={(e) => handleMarginChange(Math.max(1, Math.min(99, parseInt(e.target.value) || 0)))}
              placeholder="0"
              disabled={disabled}
              className="w-20 h-10 bg-white/10 border border-white/20 rounded-lg text-center text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleMarginChange(Math.min(99, margin + 1))}
              disabled={disabled || margin >= 99}
              className="w-10 h-10 rounded-lg bg-white/10 text-white flex items-center justify-center hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              +
            </button>
            <span className="text-gray-400 text-sm ml-2">points</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}

export function PlayoffPoolPicker() {
  const { activeSeries, user, makePlayoffPick, getPlayoffPoolStatus } = useStore();
  const [pendingPicks, setPendingPicks] = useState<Map<string, { winnerId: string; margin: number }>>(new Map());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Get current playoff pool status
  const status = activeSeries ? getPlayoffPoolStatus?.(activeSeries.id) : null;
  const currentStage: PlayoffStage = activeSeries?.playoffStage || 'stage_1';

  // Generate games for current stage
  const games = useMemo(() => {
    if (currentStage === 'stage_1') {
      return generateWildCardGames(CURRENT_PLAYOFF_SEEDING);
    }
    // For stage 2, games would come from the series data after Wild Card results
    return activeSeries?.playoffGames || [];
  }, [currentStage, activeSeries?.playoffGames]);

  // Filter games for current stage
  const stageGames = useMemo(() => {
    if (currentStage === 'stage_1') {
      return games.filter(g => g.round === 'wild_card');
    }
    // Stage 2: All remaining rounds
    return games.filter(g => ['divisional', 'conference', 'super_bowl'].includes(g.round));
  }, [currentStage, games]);

  // Group games by round
  const gamesByRound = useMemo(() => {
    const grouped: Record<PlayoffRound, PlayoffGame[]> = {
      wild_card: [],
      divisional: [],
      conference: [],
      super_bowl: [],
    };
    stageGames.forEach(game => {
      grouped[game.round].push(game);
    });
    return grouped;
  }, [stageGames]);

  // Get existing picks
  const existingPicks = useMemo(() => {
    const picks = new Map<string, PlayoffBracketPick>();
    status?.picks?.forEach(pick => {
      picks.set(pick.gameId, pick);
    });
    return picks;
  }, [status?.picks]);

  if (!activeSeries || !user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">Select a series to make your picks</p>
      </div>
    );
  }

  if (activeSeries.seriesType !== 'playoff_pool') {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-400">This is not a Playoff Pool series</p>
      </div>
    );
  }

  const handlePickChange = (gameId: string, winnerId: string, margin: number) => {
    setPendingPicks(prev => {
      const updated = new Map(prev);
      updated.set(gameId, { winnerId, margin });
      return updated;
    });
  };

  const allPicksComplete = stageGames.every(game => {
    const pending = pendingPicks.get(game.id);
    const existing = existingPicks.get(game.id);
    return (pending?.winnerId && pending?.margin > 0) || (existing?.pickedWinnerId && existing?.predictedMargin > 0);
  });

  const handleSubmitPicks = async () => {
    if (!allPicksComplete) return;
    setIsSubmitting(true);

    try {
      // Convert pending picks to array format
      const picksToSubmit = Array.from(pendingPicks.entries()).map(([gameId, pick]) => ({
        gameId,
        pickedWinnerId: pick.winnerId,
        predictedMargin: pick.margin,
      }));

      if (makePlayoffPick) {
        await makePlayoffPick(activeSeries.id, picksToSubmit);
      }

      setPendingPicks(new Map());
      setShowConfirmation(false);
    } catch (error) {
      console.error('Failed to submit picks:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate points possible for display
  const roundsInStage = currentStage === 'stage_1' ? ['wild_card'] : ['divisional', 'conference', 'super_bowl'];
  const maxPointsThisStage = roundsInStage.reduce((total, round) => {
    const roundGames = gamesByRound[round as PlayoffRound]?.length || 0;
    const points = PLAYOFF_POINTS[round as PlayoffRound];
    return total + (roundGames * (points.winner + points.maxMargin));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Stage Header */}
      <div className="card bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">
              {currentStage === 'stage_1' ? 'Stage 1: Wild Card Weekend' : 'Stage 2: Playoff Bracket'}
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {currentStage === 'stage_1'
                ? 'Pick the winner and margin for each Wild Card game'
                : 'Complete your bracket from Divisional round to Super Bowl'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Max Points</p>
            <p className="text-2xl font-bold text-white">{maxPointsThisStage}</p>
          </div>
        </div>
      </div>

      {/* Scoring Guide */}
      <div className="card">
        <h3 className="text-sm font-medium text-gray-400 mb-3">SCORING</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(PLAYOFF_POINTS).map(([round, points]) => (
            <div key={round} className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400">{roundDisplayNames[round as PlayoffRound]}</p>
              <p className="text-sm text-white">
                <span className="font-bold">{points.winner}</span> pts winner +{' '}
                <span className="font-bold">{points.maxMargin}</span> margin bonus
              </p>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Margin bonus: 5 pts for exact, -1 for each point off (min 0)
        </p>
      </div>

      {/* Games by Round */}
      {currentStage === 'stage_1' && gamesByRound.wild_card.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
            AFC Wild Card
          </h3>
          <div className="grid gap-4">
            {gamesByRound.wild_card
              .filter(g => g.conference === 'AFC')
              .map(game => {
                const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                if (!awayTeam || !homeTeam) return null;

                return (
                  <GamePickCard
                    key={game.id}
                    game={game}
                    awayTeam={awayTeam}
                    homeTeam={homeTeam}
                    existingPick={existingPicks.get(game.id)}
                    onPickChange={handlePickChange}
                    disabled={status?.hasSubmittedStage1}
                  />
                );
              })}
          </div>

          <h3 className="text-lg font-semibold text-white flex items-center gap-2 mt-6">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            NFC Wild Card
          </h3>
          <div className="grid gap-4">
            {gamesByRound.wild_card
              .filter(g => g.conference === 'NFC')
              .map(game => {
                const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                if (!awayTeam || !homeTeam) return null;

                return (
                  <GamePickCard
                    key={game.id}
                    game={game}
                    awayTeam={awayTeam}
                    homeTeam={homeTeam}
                    existingPick={existingPicks.get(game.id)}
                    onPickChange={handlePickChange}
                    disabled={status?.hasSubmittedStage1}
                  />
                );
              })}
          </div>
        </div>
      )}

      {/* Stage 2 Games */}
      {currentStage === 'stage_2' && (
        <>
          {gamesByRound.divisional.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Divisional Round</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {gamesByRound.divisional.map(game => {
                  const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                  const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                  if (!awayTeam || !homeTeam) return null;

                  return (
                    <GamePickCard
                      key={game.id}
                      game={game}
                      awayTeam={awayTeam}
                      homeTeam={homeTeam}
                      existingPick={existingPicks.get(game.id)}
                      onPickChange={handlePickChange}
                      disabled={status?.hasSubmittedStage2}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {gamesByRound.conference.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Conference Championships</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {gamesByRound.conference.map(game => {
                  const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                  const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                  if (!awayTeam || !homeTeam) return null;

                  return (
                    <GamePickCard
                      key={game.id}
                      game={game}
                      awayTeam={awayTeam}
                      homeTeam={homeTeam}
                      existingPick={existingPicks.get(game.id)}
                      onPickChange={handlePickChange}
                      disabled={status?.hasSubmittedStage2}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {gamesByRound.super_bowl.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white text-center">Super Bowl</h3>
              <div className="max-w-xl mx-auto">
                {gamesByRound.super_bowl.map(game => {
                  const awayTeam = nflTeams.find(t => t.id === game.awayTeamId);
                  const homeTeam = nflTeams.find(t => t.id === game.homeTeamId);
                  if (!awayTeam || !homeTeam) return null;

                  return (
                    <GamePickCard
                      key={game.id}
                      game={game}
                      awayTeam={awayTeam}
                      homeTeam={homeTeam}
                      existingPick={existingPicks.get(game.id)}
                      onPickChange={handlePickChange}
                      disabled={status?.hasSubmittedStage2}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* Submit Button */}
      {pendingPicks.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
        >
          <button
            onClick={() => setShowConfirmation(true)}
            disabled={!allPicksComplete || isSubmitting}
            className={`
              px-8 py-4 rounded-xl font-bold text-lg shadow-2xl flex items-center gap-3
              ${allPicksComplete
                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Submitting...
              </>
            ) : (
              <>
                Submit {currentStage === 'stage_1' ? 'Wild Card' : 'Bracket'} Picks
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </motion.div>
      )}

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmation && (
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
              className="card max-w-lg mx-4"
            >
              <h3 className="text-xl font-bold text-white mb-4">Confirm Your Picks</h3>

              <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                {Array.from(pendingPicks.entries()).map(([gameId, pick]) => {
                  const game = stageGames.find(g => g.id === gameId);
                  const winnerTeam = nflTeams.find(t => t.id === pick.winnerId);
                  if (!game || !winnerTeam) return null;

                  return (
                    <div key={gameId} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <div className="flex items-center gap-3">
                        <img src={winnerTeam.logo} alt={winnerTeam.name} className="w-8 h-8 object-contain" />
                        <span className="text-white font-medium">{winnerTeam.name}</span>
                      </div>
                      <span className="text-blue-400 font-bold">by {pick.margin}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="flex-1 btn-secondary"
                >
                  Go Back
                </button>
                <button
                  onClick={handleSubmitPicks}
                  disabled={isSubmitting}
                  className="flex-1 btn-primary"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Picks'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
