import { motion } from 'framer-motion';
import { NFLTeam } from '../data/nflTeams';

interface TeamCardProps {
  team: NFLTeam;
  isSelected?: boolean;
  isUsed?: boolean;
  isDisabled?: boolean;
  showResult?: 'win' | 'loss' | 'pending';
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function TeamCard({
  team,
  isSelected = false,
  isUsed = false,
  isDisabled = false,
  showResult,
  onClick,
  size = 'md',
}: TeamCardProps) {
  const sizeClasses = {
    sm: 'p-2 rounded-lg',
    md: 'p-4 rounded-xl',
    lg: 'p-6 rounded-2xl',
  };

  const logoSizes = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  const textSizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const disabled = isDisabled || isUsed;

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.03 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`
        team-card relative overflow-hidden
        ${sizeClasses[size]}
        ${isSelected ? 'selected ring-2 ring-yellow-400' : ''}
        ${disabled ? 'disabled' : ''}
        ${!disabled ? 'cursor-pointer' : 'cursor-not-allowed'}
        bg-gradient-to-br from-white/10 to-white/5
        border border-white/10
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-2">
        {/* Team Logo */}
        <div className={`${logoSizes[size]} relative`}>
          <img
            src={team.logo}
            alt={`${team.city} ${team.name}`}
            className="w-full h-full object-contain drop-shadow-lg"
            loading="lazy"
          />
          {isUsed && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </div>

        {/* Team Name */}
        <div className="text-center">
          <p className={`${textSizes[size]} text-gray-400 leading-tight`}>
            {team.city}
          </p>
          <p
            className={`font-nfl ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-lg' : 'text-xl'} leading-tight`}
            style={{ color: team.primaryColor }}
          >
            {team.name}
          </p>
        </div>

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
        {isUsed && !showResult && (
          <div className="mt-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-500/20 text-gray-400">
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
