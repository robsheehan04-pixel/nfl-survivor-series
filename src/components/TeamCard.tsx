import { motion } from 'framer-motion';
import { NFLTeam, getTeamById } from '../data/nflTeams';
import { OddsFormat, formatOdds } from '../lib/nflSchedule';

interface MatchupInfo {
  opponent: string;
  isHome: boolean;
  spread: number;
  moneyline: number;
}

interface TeamCardProps {
  team: NFLTeam;
  isSelected?: boolean;
  isUsed?: boolean;
  isDisabled?: boolean;
  isBye?: boolean;
  matchup?: MatchupInfo | null;
  oddsFormat?: OddsFormat;
  showResult?: 'win' | 'loss' | 'pending';
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamCard({
  team,
  isSelected = false,
  isUsed = false,
  isDisabled = false,
  isBye = false,
  matchup,
  oddsFormat = 'american',
  showResult,
  onClick,
  size = 'md',
}: TeamCardProps) {
  const sizeClasses = {
    sm: 'p-2 rounded-lg',
    md: 'p-3 rounded-xl',
    lg: 'p-6 rounded-2xl',
  };

  const logoSizes = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const disabled = isDisabled || isUsed || isBye;
  const opponentTeam = matchup ? getTeamById(matchup.opponent) : null;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        team-card relative overflow-hidden w-full
        ${sizeClasses[size]}
        ${isSelected ? 'selected ring-2 ring-yellow-400' : ''}
        ${disabled ? 'disabled opacity-60' : ''}
        ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        bg-gradient-to-br from-gray-200 to-gray-300
        border border-gray-400
        transition-all duration-300
      `}
      style={{
        '--team-primary': team.primaryColor,
        '--team-secondary': team.secondaryColor,
      } as React.CSSProperties}
    >
      {/* Background gradient based on team colors */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(135deg, ${team.primaryColor}40 0%, ${team.secondaryColor}40 100%)`,
        }}
      />

      {/* Selection glow */}
      {isSelected && (
        <div
          className="absolute inset-0"
          style={{
            boxShadow: `inset 0 0 30px ${team.primaryColor}80`,
          }}
        />
      )}

      {/* Bye week overlay */}
      {isBye && (
        <div className="absolute inset-0 bg-gray-900/70 z-20 flex items-center justify-center">
          <span className="text-gray-400 font-bold text-sm uppercase tracking-wider">BYE WEEK</span>
        </div>
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-1">
        {/* Team Logo */}
        <div className={`${logoSizes[size]} relative`}>
          <img
            src={team.logo}
            alt={`${team.city} ${team.name}`}
            className="w-full h-full object-contain drop-shadow-lg"
            loading="lazy"
          />
          {isUsed && !isBye && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Team Name */}
        <div className="text-center">
          <p className={`${textSizes[size]} text-gray-600 leading-tight`}>
            {team.city}
          </p>
          <p
            className={`font-nfl ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-xl'} leading-tight`}
            style={{ color: team.primaryColor }}
          >
            {team.name}
          </p>
        </div>

        {/* Matchup info */}
        {matchup && opponentTeam && !isBye && size !== 'sm' && (
          <div className="mt-1 flex items-center gap-1.5 text-xs">
            <span className="text-gray-600">
              {matchup.isHome ? 'vs' : '@'}
            </span>
            <img
              src={opponentTeam.logo}
              alt={opponentTeam.name}
              className="w-4 h-4 object-contain"
            />
            <span className="text-gray-700 font-medium">
              {opponentTeam.id}
            </span>
          </div>
        )}

        {/* Vegas odds */}
        {matchup && !isBye && size !== 'sm' && (
          <div
            className={`
              mt-1 px-2 py-0.5 rounded text-xs font-bold
              ${matchup.moneyline < 0 ? 'bg-emerald-800 text-white' :
                matchup.moneyline > 0 ? 'bg-red-700 text-white' :
                'bg-gray-600 text-white'}
            `}
          >
            {formatOdds(matchup.moneyline, oddsFormat)}
          </div>
        )}

        {/* Result indicator */}
        {showResult && (
          <div
            className={`
              mt-1 px-3 py-1 rounded-full text-xs font-bold
              ${showResult === 'win' ? 'bg-green-500/20 text-green-400' : ''}
              ${showResult === 'loss' ? 'bg-red-500/20 text-red-400' : ''}
              ${showResult === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : ''}
            `}
          >
            {showResult === 'win' && 'WIN'}
            {showResult === 'loss' && 'LOSS'}
            {showResult === 'pending' && 'PENDING'}
          </div>
        )}

        {/* Used badge */}
        {isUsed && !showResult && !isBye && (
          <div className="mt-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-500/30 text-gray-600">
            Already Used
          </div>
        )}
      </div>

      {/* Selected checkmark */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-2 right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center"
        >
          <svg className="w-4 h-4 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
      )}
    </motion.button>
  );
}
