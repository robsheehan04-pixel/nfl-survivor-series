import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface CountdownTimerProps {
  compact?: boolean;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

// Export this function so other components can check deadline status
export function getNextSaturdayDeadline(): Date {
  const now = new Date();

  // Create date in EST/EDT
  const estOffset = -5; // EST is UTC-5 (EDT is UTC-4, but we use EST for consistency)
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  const estNow = new Date(utc + (3600000 * estOffset));

  // Find next Saturday
  const daysUntilSaturday = (6 - estNow.getDay() + 7) % 7;
  const saturday = new Date(estNow);

  if (daysUntilSaturday === 0) {
    // It's Saturday - check if we're past 1 PM
    if (estNow.getHours() >= 13) {
      saturday.setDate(saturday.getDate() + 7);
    }
  } else {
    saturday.setDate(saturday.getDate() + daysUntilSaturday);
  }

  // Set to 1 PM EST
  saturday.setHours(13, 0, 0, 0);

  // Convert back to local time
  const deadlineUTC = saturday.getTime() - (3600000 * estOffset);
  return new Date(deadlineUTC - (now.getTimezoneOffset() * 60000));
}

// Check if the current week's deadline has passed
export function isDeadlinePassed(): boolean {
  const deadline = getNextSaturdayDeadline();
  const now = new Date();
  return now >= deadline;
}

export function CountdownTimer({ compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  function calculateTimeLeft(): TimeLeft {
    const deadline = getNextSaturdayDeadline();
    const now = new Date();
    const difference = deadline.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / (1000 * 60)) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      total: difference,
    };
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const isUrgent = timeLeft.total < 24 * 60 * 60 * 1000; // Less than 24 hours
  const isCritical = timeLeft.total < 4 * 60 * 60 * 1000; // Less than 4 hours

  if (compact) {
    return (
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          ${isCritical ? 'bg-red-500/20 text-red-400 animate-pulse' :
            isUrgent ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-blue-500/20 text-blue-400'}
        `}
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {timeLeft.hours}h {timeLeft.minutes}m
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl p-4 border
        ${isCritical ? 'bg-red-500/10 border-red-500/30' :
          isUrgent ? 'bg-yellow-500/10 border-yellow-500/30' :
          'bg-blue-500/10 border-blue-500/30'}
      `}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <svg
            className={`w-5 h-5 ${isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-blue-400'}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className={`text-sm font-medium ${isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-blue-400'}`}>
            Pick Deadline
          </span>
        </div>
        <span className="text-xs text-gray-500">Saturday 1:00 PM EST</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item) => (
          <div key={item.label} className="text-center">
            <div
              className={`
                text-2xl font-bold font-mono
                ${isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-white'}
              `}
            >
              {String(item.value).padStart(2, '0')}
            </div>
            <div className="text-xs text-gray-500 uppercase">{item.label}</div>
          </div>
        ))}
      </div>

      {isCritical && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-400 text-sm mt-3 font-medium"
        >
          Make your pick now!
        </motion.p>
      )}
    </motion.div>
  );
}
