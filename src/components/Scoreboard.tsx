import React, { useMemo, useState } from 'react';
import {
  ArrowUpDown,
  Crown,
  Minus,
  Plus,
  SlidersHorizontal,
  UserPlus,
  X,
} from 'lucide-react';
import { PenaltyBanner, Player } from '../types/game';

interface ScoreboardProps {
  players: Player[];
  sortByRank: boolean;
  penaltyBanner: PenaltyBanner | null;
  onToggleSortOrder: () => void;
  onAdjustScore: (playerId: string, delta: number) => void;
  onIssueCard: (playerId: string, cardType: 'yellow' | 'red', delta: 1 | -1) => void;
  onAddPlayerMidGame: (name: string) => void;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  players,
  sortByRank,
  penaltyBanner,
  onToggleSortOrder,
  onAdjustScore,
  onIssueCard,
  onAddPlayerMidGame,
}) => {
  const [openCustomId, setOpenCustomId] = useState<string | null>(null);
  const [customInput, setCustomInput] = useState<string>('3');
  const [showAddPlayer, setShowAddPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');

  const maxScore = useMemo(() => {
    if (players.length === 0) return 0;
    return Math.max(...players.map((p) => p.score));
  }, [players]);

  const sortedByScoreIds = useMemo(() => {
    return [...players]
      .sort((a, b) => b.score - a.score)
      .map((p) => p.id);
  }, [players]);

  const displayedPlayers = useMemo(() => {
    if (!sortByRank) return players;
    return [...players].sort((a, b) => b.score - a.score);
  }, [players, sortByRank]);

  const handleAddMidGameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length >= 12) return;
    const trimmed = newPlayerName.trim() || `فريق ${players.length + 1}`;
    onAddPlayerMidGame(trimmed);
    setNewPlayerName('');
    setShowAddPlayer(false);
  };

  return (
    <section className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-3 sm:p-5 shadow-2xl space-y-3 sm:space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700/80 pb-2.5 sm:pb-3">
        <div>
          <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
            <span>لوحة النقاط</span>
            <span className="rounded-full bg-slate-800 px-2.5 py-0.5 text-xs font-extrabold text-amber-300">
              {players.length}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleSortOrder}
            className={`min-h-[36px] inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-extrabold transition ${
              sortByRank
                ? 'border-amber-500/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-600 bg-slate-800 text-slate-300 hover:text-white'
            }`}
            title="تبديل الترتيب بين الترتيب بالمركز والترتيب الثابت"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>{sortByRank ? 'حسب المركز' : 'ترتيب ثابت'}</span>
          </button>

          {players.length < 12 && (
            <button
              type="button"
              onClick={() => setShowAddPlayer((prev) => !prev)}
              className="min-h-[36px] inline-flex items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1.5 text-xs font-extrabold text-emerald-300 hover:bg-emerald-500/25 transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>إضافة لاعب</span>
            </button>
          )}
        </div>
      </div>

      {/* Add Player Mid-Game Inline Form */}
      {showAddPlayer && (
        <form
          onSubmit={handleAddMidGameSubmit}
          className="flex items-center gap-2 rounded-2xl border border-emerald-500/40 bg-slate-900/75 p-2.5 animate-pop-in"
        >
          <input
            type="text"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            maxLength={24}
            autoFocus
            placeholder="اسم اللاعب أو الفريق الجديد..."
            className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs sm:text-sm font-bold text-white placeholder:text-slate-500 focus:border-emerald-400 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-emerald-500 px-3.5 py-2 text-xs font-black text-slate-950 hover:bg-emerald-400 transition"
          >
            إضافة
          </button>
          <button
            type="button"
            onClick={() => setShowAddPlayer(false)}
            className="rounded-xl p-2 text-slate-400 hover:text-white"
            aria-label="إلغاء"
          >
            <X className="w-4 h-4" />
          </button>
        </form>
      )}

      {/* Penalty Card Visual Feedback Toast */}
      {penaltyBanner && (
        <div
          key={penaltyBanner.id}
          className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-black animate-shake ${
            penaltyBanner.type === 'red'
              ? 'border-red-500 bg-red-500/20 text-red-200'
              : 'border-yellow-400 bg-yellow-500/20 text-yellow-200'
          }`}
        >
          <span>{penaltyBanner.type === 'red' ? '🟥' : '🟨'}</span>
          <span>
            {penaltyBanner.type === 'red' ? 'كارت أحمر لـ' : 'إنذار كارت أصفر لـ'}{' '}
            {penaltyBanner.playerName}!
          </span>
        </div>
      )}

      {/* Player Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5 sm:gap-3">
        {displayedPlayers.map((player) => {
          const isLeader = player.score === maxScore && maxScore > 0;
          const rankIndex = sortedByScoreIds.indexOf(player.id) + 1;
          const isCustomOpen = openCustomId === player.id;
          const parsedCustom = Math.max(1, parseInt(customInput || '1', 10) || 1);

          return (
            <div
              key={player.id}
              className={`relative rounded-2xl border p-3 sm:p-3.5 transition ${
                isLeader
                  ? 'border-amber-400/70 bg-gradient-to-l from-amber-500/10 via-slate-900/80 to-slate-900/90 shadow-lg shadow-amber-500/10'
                  : 'border-slate-700/80 bg-slate-900/70'
              }`}
            >
              {/* Top Row: Avatar, Name, Crown & Score */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <div
                      className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-xl border text-lg sm:text-xl"
                      style={{
                        backgroundColor: `${player.color}22`,
                        borderColor: `${player.color}66`,
                      }}
                    >
                      {player.avatar}
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full border border-slate-800 bg-slate-950 px-1 text-[10px] font-black text-slate-300">
                      {rankIndex}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      {isLeader && (
                        <Crown className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                      <h3 className="truncate text-sm sm:text-base font-extrabold text-white">
                        {player.name}
                      </h3>
                    </div>

                    {/* Penalty Card Badges (Tappable) */}
                    <div className="mt-1 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onIssueCard(player.id, 'yellow', 1)}
                        title="إعطاء كارت أصفر"
                        className="min-h-[30px] inline-flex items-center gap-1 rounded-lg border border-yellow-500/40 bg-yellow-500/10 px-2.5 py-0.5 text-xs font-black text-yellow-300 hover:bg-yellow-500/25 active:scale-95 transition"
                      >
                        <span className="inline-block h-3 w-2 rounded-[2px] bg-yellow-400" />
                        <span>{player.yellowCards}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onIssueCard(player.id, 'red', 1)}
                        title="إعطاء كارت أحمر"
                        className="min-h-[30px] inline-flex items-center gap-1 rounded-lg border border-red-500/40 bg-red-500/10 px-2.5 py-0.5 text-xs font-black text-red-300 hover:bg-red-500/25 active:scale-95 transition"
                      >
                        <span className="inline-block h-3 w-2 rounded-[2px] bg-red-500" />
                        <span>{player.redCards}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Score */}
                <div
                  className={`rounded-2xl border px-3 sm:px-3.5 py-1.5 text-center min-w-[58px] sm:min-w-[64px] ${
                    player.score > 0
                      ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
                      : player.score < 0
                      ? 'border-red-500/40 bg-red-500/15 text-red-300'
                      : 'border-slate-700 bg-slate-800/80 text-slate-200'
                  }`}
                >
                  <span
                    className="block text-xl sm:text-3xl font-black tabular-nums leading-none"
                    dir="ltr"
                  >
                    {player.score}
                  </span>
                </div>
              </div>

              {/* Quick Score Action Buttons */}
              <div className="mt-2.5 sm:mt-3 grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => onAdjustScore(player.id, 1)}
                  className="min-h-[44px] rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-2 text-sm font-black text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 transition"
                  dir="ltr"
                >
                  +1
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustScore(player.id, 2)}
                  className="min-h-[44px] rounded-xl border border-emerald-500/40 bg-emerald-500/15 py-2 text-sm font-black text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 active:scale-95 transition"
                  dir="ltr"
                >
                  +2
                </button>
                <button
                  type="button"
                  onClick={() => onAdjustScore(player.id, -1)}
                  className="min-h-[44px] rounded-xl border border-red-500/40 bg-red-500/15 py-2 text-sm font-black text-red-300 hover:bg-red-500 hover:text-white active:scale-95 transition"
                  dir="ltr"
                >
                  -1
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setOpenCustomId(isCustomOpen ? null : player.id)
                  }
                  className={`min-h-[44px] inline-flex items-center justify-center gap-1 rounded-xl border py-2 text-xs font-black transition ${
                    isCustomOpen
                      ? 'border-amber-400 bg-amber-500 text-slate-950'
                      : 'border-slate-600 bg-slate-800 text-slate-200 hover:border-amber-500/50'
                  }`}
                  title="تعديل مخصص للنقاط والكروت"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>مخصص</span>
                </button>
              </div>

              {/* Custom Adjustment Popover */}
              {isCustomOpen && (
                <div className="mt-2.5 rounded-2xl border border-amber-500/40 bg-slate-950/90 p-3 space-y-2.5 animate-pop-in">
                  <div className="grid grid-cols-4 gap-1.5">
                    {[5, 3, -3, -5].map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          onAdjustScore(player.id, amt);
                          setOpenCustomId(null);
                        }}
                        dir="ltr"
                        className={`rounded-lg py-1.5 text-xs font-black transition ${
                          amt > 0
                            ? 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950'
                            : 'bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white'
                        }`}
                      >
                        {amt > 0 ? `+${amt}` : amt}
                      </button>
                    ))}
                  </div>

                  {/* Custom numeric input */}
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={customInput}
                      onChange={(e) => setCustomInput(e.target.value)}
                      className="w-16 rounded-lg border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-xs font-black text-white focus:border-amber-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustScore(player.id, parsedCustom);
                        setOpenCustomId(null);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-black text-slate-950 hover:bg-emerald-400"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onAdjustScore(player.id, -parsedCustom);
                        setOpenCustomId(null);
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-red-500 px-2.5 py-1.5 text-xs font-black text-white hover:bg-red-400"
                    >
                      <Minus className="w-3.5 h-3.5" />
                      <span>خصم</span>
                    </button>
                  </div>

                  {/* Undo mistaken cards */}
                  {(player.yellowCards > 0 || player.redCards > 0) && (
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800 text-[11px]">
                      <span className="text-slate-400 font-bold">
                        سحب كارت بالخطأ:
                      </span>
                      <div className="flex items-center gap-1.5">
                        {player.yellowCards > 0 && (
                          <button
                            type="button"
                            onClick={() => onIssueCard(player.id, 'yellow', -1)}
                            className="rounded-md border border-yellow-500/40 bg-yellow-500/10 px-2 py-0.5 font-bold text-yellow-300 hover:bg-yellow-500/20"
                          >
                            -1 أصفر
                          </button>
                        )}
                        {player.redCards > 0 && (
                          <button
                            type="button"
                            onClick={() => onIssueCard(player.id, 'red', -1)}
                            className="rounded-md border border-red-500/40 bg-red-500/10 px-2 py-0.5 font-bold text-red-300 hover:bg-red-500/20"
                          >
                            -1 أحمر
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

