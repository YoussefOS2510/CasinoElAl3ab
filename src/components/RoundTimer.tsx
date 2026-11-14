import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, Timer } from 'lucide-react';
import { formatTimeMMSS } from '../utils/helpers';
import { soundEngine } from '../utils/soundEffects';

interface RoundTimerProps {
  resetSignal: number;
}

const PRESETS = [15, 30, 60] as const;

export const RoundTimer: React.FC<RoundTimerProps> = ({ resetSignal }) => {
  const [duration, setDuration] = useState<number>(30);
  const [secondsLeft, setSecondsLeft] = useState<number>(30);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [justExpired, setJustExpired] = useState<boolean>(false);
  const lastSoundSecondRef = useRef<number | null>(null);

  // Reset timer to current preset duration (paused) whenever question advances
  useEffect(() => {
    setIsRunning(false);
    setSecondsLeft(duration);
    setJustExpired(false);
    lastSoundSecondRef.current = null;
  }, [resetSignal, duration]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          setIsRunning(false);
          setJustExpired(true);
          soundEngine.playBuzzer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [isRunning]);

  // Ticking sound in the last 5 seconds (5, 4, 3, 2, 1)
  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft >= 1 && secondsLeft <= 5 && lastSoundSecondRef.current !== secondsLeft) {
      lastSoundSecondRef.current = secondsLeft;
      soundEngine.playTick(secondsLeft <= 2);
    }
  }, [secondsLeft, isRunning]);

  const handleSelectPreset = (sec: number) => {
    setIsRunning(false);
    setDuration(sec);
    setSecondsLeft(sec);
    setJustExpired(false);
    lastSoundSecondRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setSecondsLeft(duration);
    setJustExpired(false);
    lastSoundSecondRef.current = null;
  };

  const handleToggleRun = () => {
    if (secondsLeft === 0) {
      setSecondsLeft(duration);
      setJustExpired(false);
      lastSoundSecondRef.current = null;
      setIsRunning(true);
      return;
    }
    setJustExpired(false);
    setIsRunning((prev) => !prev);
  };

  const progressPct = duration > 0 ? (secondsLeft / duration) * 100 : 0;
  const isDanger = secondsLeft <= 5 && secondsLeft > 0;
  const isExpired = secondsLeft === 0;

  let barColor = 'bg-emerald-500';
  let timeTextColor = 'text-emerald-300';
  if (isExpired) {
    barColor = 'bg-red-500';
    timeTextColor = 'text-red-400';
  } else if (isDanger) {
    barColor = 'bg-red-500';
    timeTextColor = 'text-red-400 animate-pulse';
  } else if (progressPct <= 50) {
    barColor = 'bg-amber-500';
    timeTextColor = 'text-amber-300';
  }

  return (
    <div
      className={`rounded-2xl border px-2.5 py-2 sm:px-3.5 sm:py-2.5 transition ${
        justExpired
          ? 'border-red-500 bg-red-500/15 animate-shake'
          : isDanger && isRunning
          ? 'border-red-500/70 bg-red-950/30'
          : 'border-slate-700/80 bg-slate-900/75'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-1.5 sm:gap-2">
        {/* Time Readout + Quick Presets */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div
            className={`flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950/75 px-2.5 py-1.5 font-mono text-base sm:text-xl font-black tabular-nums ${timeTextColor}`}
            dir="ltr"
          >
            <Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-80" />
            <span>{formatTimeMMSS(secondsLeft)}</span>
          </div>

          <div className="flex items-center gap-1">
            {PRESETS.map((preset) => {
              const isActive = duration === preset;
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`min-h-[36px] rounded-xl px-2 sm:px-2.5 py-1 text-[11px] sm:text-xs font-extrabold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  {preset}ث
                </button>
              );
            })}
          </div>
        </div>

        {/* Play / Pause / Reset */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleToggleRun}
            className={`min-h-[40px] inline-flex items-center justify-center gap-1 rounded-xl px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-extrabold transition active:scale-95 ${
              isRunning
                ? 'bg-amber-500 text-slate-950 hover:bg-amber-400'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>إيقاف</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>{isExpired ? 'إعادة' : 'ابدأ'}</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleReset}
            title="إعادة ضبط المؤقت"
            aria-label="إعادة ضبط المؤقت"
            className="min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-800 p-2 text-slate-300 hover:border-slate-500 hover:text-white active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Sleek Integrated Progress Bar */}
      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-linear ${barColor}`}
          style={{ width: `${progressPct}%` }}
        />
      </div>
    </div>
  );
};

