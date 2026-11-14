import React, { useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowRight,
  Award,
  Crown,
  HelpCircle,
  RotateCcw,
  Settings,
  Trophy,
} from 'lucide-react';
import { Player } from '../types/game';

interface PodiumScreenProps {
  players: Player[];
  questionsPlayedCount: number;
  onPlayAgainSamePlayers: () => void;
  onBackToSetup: () => void;
  onResumeGame: () => void;
}

export const PodiumScreen: React.FC<PodiumScreenProps> = ({
  players,
  questionsPlayedCount,
  onPlayAgainSamePlayers,
  onBackToSetup,
  onResumeGame,
}) => {
  const rankedPlayers = useMemo(() => {
    return [...players].sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aPenalties = a.redCards * 2 + a.yellowCards;
      const bPenalties = b.redCards * 2 + b.yellowCards;
      return aPenalties - bPenalties;
    });
  }, [players]);

  const stats = useMemo(() => {
    const totalYellow = players.reduce((sum, p) => sum + p.yellowCards, 0);
    const totalRed = players.reduce((sum, p) => sum + p.redCards, 0);
    let mostPenalized: Player | null = null;
    let maxWeight = 0;

    players.forEach((p) => {
      const weight = p.redCards * 2 + p.yellowCards;
      if (weight > maxWeight) {
        maxWeight = weight;
        mostPenalized = p;
      }
    });

    return { totalYellow, totalRed, mostPenalized };
  }, [players]);

  useEffect(() => {
    try {
      confetti({
        particleCount: 95,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#F59E0B', '#10B981', '#EAB308', '#EF4444', '#FFFFFF'],
      });
      const timeout = window.setTimeout(() => {
        confetti({
          particleCount: 55,
          angle: 60,
          spread: 55,
          origin: { x: 0.1, y: 0.65 },
        });
        confetti({
          particleCount: 55,
          angle: 120,
          spread: 55,
          origin: { x: 0.9, y: 0.65 },
        });
      }, 450);

      return () => window.clearTimeout(timeout);
    } catch {
      return undefined;
    }
  }, []);

  const first = rankedPlayers[0];
  const second = rankedPlayers[1];
  const third = rankedPlayers[2];
  const restPlayers = rankedPlayers.slice(3);

  const renderPodiumPillar = (
    player: Player | undefined,
    rank: 1 | 2 | 3,
    heightClass: string
  ) => {
    if (!player) return null;

    const styles = {
      1: {
        medal: '🥇',
        label: 'المركز الأول',
        border: 'border-amber-400',
        bg: 'from-amber-500/30 via-amber-500/15 to-slate-900',
        badge: 'bg-amber-400 text-slate-950',
        order: 'order-2',
      },
      2: {
        medal: '🥈',
        label: 'المركز الثاني',
        border: 'border-slate-300/70',
        bg: 'from-slate-400/20 via-slate-500/10 to-slate-900',
        badge: 'bg-slate-300 text-slate-950',
        order: 'order-1',
      },
      3: {
        medal: '🥉',
        label: 'المركز الثالث',
        border: 'border-orange-500/60',
        bg: 'from-orange-500/20 via-orange-500/10 to-slate-900',
        badge: 'bg-orange-400 text-slate-950',
        order: 'order-3',
      },
    }[rank];

    return (
      <div className={`flex flex-col items-center min-w-0 ${styles.order} animate-pop-in`}>
        <div className="mb-2 sm:mb-3 text-center w-full px-0.5">
          <div
            className="relative mx-auto mb-1.5 sm:mb-2 flex h-12 w-12 sm:h-20 sm:w-20 items-center justify-center rounded-2xl border-2 text-2xl sm:text-4xl shadow-xl"
            style={{
              backgroundColor: `${player.color}25`,
              borderColor: player.color,
            }}
          >
            {player.avatar}
            {rank === 1 && (
              <Crown className="absolute -top-3.5 sm:-top-4 left-1/2 -translate-x-1/2 w-5 h-5 sm:w-7 sm:h-7 text-amber-400 fill-amber-400 drop-shadow" />
            )}
          </div>
          <h3 className="text-xs sm:text-lg font-black text-white truncate">
            {player.name}
          </h3>
          <p className="text-[10px] sm:text-xs font-bold text-slate-400">{styles.label}</p>
        </div>

        <div
          className={`w-full rounded-t-2xl sm:rounded-t-3xl border-2 ${styles.border} bg-gradient-to-b ${styles.bg} ${heightClass} p-2 sm:p-4 flex flex-col items-center justify-between shadow-2xl`}
        >
          <span className="text-2xl sm:text-4xl">{styles.medal}</span>

          <div className="text-center">
            <span
              className="block text-xl sm:text-4xl font-black text-white tabular-nums"
              dir="ltr"
            >
              {player.score}
            </span>
            <span className="text-[10px] sm:text-xs font-bold text-slate-300">نقطة</span>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs font-extrabold">
            <span className="inline-flex items-center gap-0.5 rounded-md sm:rounded-lg bg-slate-950/60 px-1.5 py-0.5 text-yellow-300">
              🟨{player.yellowCards}
            </span>
            <span className="inline-flex items-center gap-0.5 rounded-md sm:rounded-lg bg-slate-950/60 px-1.5 py-0.5 text-red-300">
              🟥{player.redCards}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F172A] bg-casino-radial py-6 sm:py-8 px-2.5 sm:px-6 pb-safe">
      <div className="mx-auto max-w-4xl space-y-6 sm:space-y-7">
        {/* Header */}
        <div className="text-center space-y-2 animate-pop-in">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-500/40 bg-amber-500/15 px-3.5 py-1 text-xs sm:text-sm font-black text-amber-300">
            <Trophy className="w-4 h-4" />
            <span>النتائج النهائية — كازينو الألعاب</span>
          </div>
          <h1 className="text-2xl sm:text-5xl font-black text-white">
            مبروك للفائز:{' '}
            <span className="text-amber-400">{first?.name ?? 'الأبطال'}</span>! 🎉
          </h1>
        </div>

        {/* Side-by-Side Top 3 Podium on Mobile & Desktop */}
        <div
          className={`grid ${
            third ? 'grid-cols-3' : 'grid-cols-2 max-w-md mx-auto'
          } gap-2 sm:gap-4 items-end pt-3 sm:pt-4`}
        >
          {renderPodiumPillar(second, 2, 'h-32 sm:h-48')}
          {renderPodiumPillar(first, 1, 'h-40 sm:h-60')}
          {renderPodiumPillar(third, 3, 'h-28 sm:h-40')}
        </div>

        {/* Remaining Standings */}
        {restPlayers.length > 0 && (
          <div className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-4 sm:p-5 space-y-2.5">
            <h2 className="text-sm font-extrabold text-slate-300 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-400" />
              <span>باقي الترتيب</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {restPlayers.map((p, idx) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-2xl border border-slate-700 bg-slate-900/60 px-3.5 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-800 text-xs font-black text-slate-300">
                      {idx + 4}
                    </span>
                    <span className="text-xl">{p.avatar}</span>
                    <span className="font-bold text-white text-sm">{p.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-extrabold">
                    <span className="text-yellow-300">🟨{p.yellowCards}</span>
                    <span className="text-red-300">🟥{p.redCards}</span>
                    <span
                      className="rounded-lg bg-slate-800 px-2.5 py-1 text-sm font-black text-amber-300"
                      dir="ltr"
                    >
                      {p.score}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Session Stats Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-700/80 bg-[#1E293B] p-4 text-center">
            <HelpCircle className="mx-auto mb-1.5 w-5 h-5 text-sky-400" />
            <p className="text-2xl font-black text-white">{questionsPlayedCount}</p>
            <p className="text-xs font-bold text-slate-400">الأسئلة الملعوبة</p>
          </div>

          <div className="rounded-2xl border border-yellow-500/30 bg-[#1E293B] p-4 text-center">
            <span className="block text-xl mb-1">🟨</span>
            <p className="text-2xl font-black text-yellow-300">{stats.totalYellow}</p>
            <p className="text-xs font-bold text-slate-400">إجمالي الكروت الصفراء</p>
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-[#1E293B] p-4 text-center">
            <span className="block text-xl mb-1">🟥</span>
            <p className="text-2xl font-black text-red-400">{stats.totalRed}</p>
            <p className="text-xs font-bold text-slate-400">إجمالي الكروت الحمراء</p>
          </div>

          <div className="rounded-2xl border border-slate-700/80 bg-[#1E293B] p-4 text-center">
            <span className="block text-xl mb-1">
              {stats.mostPenalized ? (stats.mostPenalized as Player).avatar : '😇'}
            </span>
            <p className="text-sm font-black text-white truncate">
              {stats.mostPenalized
                ? (stats.mostPenalized as Player).name
                : 'مفيش إنذارات!'}
            </p>
            <p className="text-xs font-bold text-slate-400">أكثر لاعب إنذارات</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onPlayAgainSamePlayers}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-yellow-400 px-7 py-4 text-base font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 transition"
          >
            <RotateCcw className="w-5 h-5" />
            <span>لعب مرة أخرى (نفس اللاعبين)</span>
          </button>

          <button
            type="button"
            onClick={onBackToSetup}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-600 bg-[#1E293B] px-6 py-4 text-sm font-extrabold text-white hover:border-amber-500/50 transition"
          >
            <Settings className="w-4 h-4" />
            <span>إعداد لعبة جديدة</span>
          </button>

          <button
            type="button"
            onClick={onResumeGame}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-6 py-4 text-sm font-extrabold text-emerald-300 hover:bg-emerald-500/20 transition"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة للعبة الحالية</span>
          </button>
        </div>
      </div>
    </div>
  );
};

