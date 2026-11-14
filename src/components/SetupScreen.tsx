import React, { useMemo, useState } from 'react';
import {
  CheckSquare,
  Database,
  FileJson,
  LayoutGrid,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Square,
  Trash2,
  Users,
} from 'lucide-react';
import {
  ALL_CATEGORY_NAMES,
  CATEGORY_LIST,
  TEAM_PALETTE,
} from '../data/starterQuestions';
import {
  CategoryName,
  DifficultyFilter,
  Player,
  QuestionItem,
} from '../types/game';
import { DIFFICULTY_LABELS } from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';

interface SetupScreenProps {
  players: Player[];
  selectedCategories: CategoryName[];
  difficultyFilter: DifficultyFilter;
  noRepeat: boolean;
  allQuestions: QuestionItem[];
  seenIds: string[];
  hasActiveSession: boolean;
  onAddPlayer: (name: string, colorIndex?: number) => void;
  onUpdatePlayer: (id: string, updates: Partial<Player>) => void;
  onRemovePlayer: (id: string) => void;
  onResetScores: () => void;
  onToggleCategory: (category: CategoryName) => void;
  onSelectAllCategories: () => void;
  onClearAllCategories: () => void;
  onChangeDifficulty: (difficulty: DifficultyFilter) => void;
  onToggleNoRepeat: () => void;
  onResetSeenQuestions: () => void;
  onOpenImportModal: () => void;
  onStartGame: (resumeIfActive: boolean) => void;
}

export const SetupScreen: React.FC<SetupScreenProps> = ({
  players,
  selectedCategories,
  difficultyFilter,
  noRepeat,
  allQuestions,
  seenIds,
  hasActiveSession,
  onAddPlayer,
  onUpdatePlayer,
  onRemovePlayer,
  onResetScores,
  onToggleCategory,
  onSelectAllCategories,
  onClearAllCategories,
  onChangeDifficulty,
  onToggleNoRepeat,
  onResetSeenQuestions,
  onOpenImportModal,
  onStartGame,
}) => {
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState(
    players.length % TEAM_PALETTE.length
  );
  const [mobileSetupTab, setMobileSetupTab] = useState<'players' | 'categories'>(
    'players'
  );

  const seenSet = useMemo(() => new Set(seenIds), [seenIds]);

  const matchingStats = useMemo(() => {
    const selectedSet = new Set(selectedCategories);
    const matching = allQuestions.filter(
      (q) =>
        selectedSet.has(q.category) &&
        (difficultyFilter === 'all' || q.difficulty === difficultyFilter)
    );
    const unseen = matching.filter((q) => !seenSet.has(q.uid));
    return {
      totalMatching: matching.length,
      unseenMatching: unseen.length,
    };
  }, [allQuestions, selectedCategories, difficultyFilter, seenSet]);

  const handleCreatePlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (players.length >= 12) return;
    const trimmed = newPlayerName.trim() || `فريق ${players.length + 1}`;
    onAddPlayer(trimmed, selectedPaletteIdx);
    setNewPlayerName('');
    setSelectedPaletteIdx((players.length + 1) % TEAM_PALETTE.length);
  };

  const cyclePlayerBadge = (player: Player) => {
    const currentIndex = TEAM_PALETTE.findIndex(
      (p) => p.avatar === player.avatar && p.color === player.color
    );
    const next = TEAM_PALETTE[(currentIndex + 1) % TEAM_PALETTE.length];
    onUpdatePlayer(player.id, { avatar: next.avatar, color: next.color });
  };

  const canStart = players.length >= 2 && selectedCategories.length > 0;

  return (
    <div className="min-h-screen bg-[#0F172A] bg-casino-radial pb-32 lg:pb-12">
      <div className="mx-auto max-w-6xl px-3 sm:px-6 pt-3 sm:pt-8 space-y-4 sm:space-y-6">
        {/* Top Hero Banner */}
        <header className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-l from-[#1E293B] via-[#1E293B] to-slate-900 p-4 sm:p-7 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 sm:gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 sm:px-3 sm:py-1 text-[11px] sm:text-xs font-extrabold text-amber-300">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                <span>لوحة تحكم المذيع المباشرة</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
                كازينو <span className="text-amber-400">الألعاب</span> 🎲
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
                جهّز الفرق، اختار الفئات ومستوى الصعوبة، وابدأ السهرة بأقوى ألعاب
                المسابقات والضحك!
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 rounded-2xl border border-slate-700 bg-slate-900/70 px-3 py-2 text-xs sm:text-sm font-bold text-slate-200">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>الأسئلة:</span>
                <span className="text-amber-400 font-black">
                  {allQuestions.length}
                </span>
              </div>

              <button
                type="button"
                onClick={onOpenImportModal}
                className="min-h-[40px] inline-flex items-center gap-1.5 rounded-2xl border border-amber-500/40 bg-amber-500/15 px-3.5 py-2 text-xs sm:text-sm font-extrabold text-amber-300 hover:bg-amber-500/25 transition"
              >
                <FileJson className="w-4 h-4" />
                <span>تحميل أسئلة (JSON)</span>
              </button>
            </div>
          </div>
        </header>

        {/* Mobile Segmented Setup Tabs */}
        <div className="lg:hidden grid grid-cols-2 gap-2 rounded-2xl border border-slate-700/80 bg-[#1E293B] p-1.5 shadow-lg">
          <button
            type="button"
            onClick={() => setMobileSetupTab('players')}
            className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-black transition ${
              mobileSetupTab === 'players'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>الفرق ({players.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileSetupTab('categories')}
            className={`min-h-[44px] inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs sm:text-sm font-black transition ${
              mobileSetupTab === 'categories'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-300 hover:bg-slate-800/70'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>
              الفئات ({selectedCategories.length}/{ALL_CATEGORY_NAMES.length})
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-6">
          {/* Players / Teams Panel */}
          <section
            className={`${
              mobileSetupTab === 'players' ? 'block' : 'hidden lg:block'
            } lg:col-span-5 rounded-3xl border border-slate-700/80 bg-[#1E293B] p-4 sm:p-5 shadow-xl space-y-4`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    اللاعبين والفرق ({players.length}/12)
                  </h2>
                  <p className="text-xs text-slate-400">
                    من ٢ إلى ١٢ لاعب أو فريق • اضغط على الشارة لتغيير اللون والأيقونة
                  </p>
                </div>
              </div>

              {players.some(
                (p) => p.score !== 0 || p.yellowCards > 0 || p.redCards > 0
              ) && (
                <button
                  type="button"
                  onClick={onResetScores}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-300 hover:border-amber-500/50 hover:text-amber-300 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>تصفير النقاط</span>
                </button>
              )}
            </div>

            {/* Add Player Form */}
            <form onSubmit={handleCreatePlayer} className="space-y-2.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  maxLength={24}
                  placeholder={
                    players.length >= 12
                      ? 'تم الوصول للحد الأقصى (12)'
                      : 'اكتب اسم اللاعب أو الفريق...'
                  }
                  disabled={players.length >= 12}
                  className="flex-1 rounded-xl border border-slate-600 bg-slate-900/75 px-3.5 py-2.5 text-sm font-bold text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={players.length >= 12}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-extrabold text-slate-950 hover:bg-emerald-400 disabled:opacity-40 transition shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>إضافة</span>
                </button>
              </div>

              {/* Quick Avatar/Color Palette Selector */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
                {TEAM_PALETTE.map((item, idx) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => setSelectedPaletteIdx(idx)}
                    title={item.label}
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-base transition ${
                      selectedPaletteIdx === idx
                        ? 'scale-110 border-white ring-2 ring-amber-400/60'
                        : 'border-slate-700 bg-slate-900/60 opacity-75 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        selectedPaletteIdx === idx ? `${item.color}30` : undefined,
                    }}
                  >
                    {item.avatar}
                  </button>
                ))}
              </div>
            </form>

            {/* Players List */}
            <div className="space-y-2 max-h-[370px] overflow-y-auto pl-1">
              {players.map((player, index) => (
                <div
                  key={player.id}
                  className="flex items-center gap-2.5 rounded-2xl border border-slate-700/80 bg-slate-900/60 p-2.5 transition hover:border-slate-600"
                >
                  <button
                    type="button"
                    onClick={() => cyclePlayerBadge(player)}
                    title="تغيير الشارة واللون"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-xl transition hover:scale-105"
                    style={{
                      backgroundColor: `${player.color}22`,
                      borderColor: `${player.color}66`,
                    }}
                  >
                    {player.avatar}
                  </button>

                  <div className="flex-1 min-w-0">
                    <input
                      type="text"
                      value={player.name}
                      maxLength={24}
                      onChange={(e) =>
                        onUpdatePlayer(player.id, { name: e.target.value })
                      }
                      aria-label={`اسم اللاعب ${index + 1}`}
                      className="w-full bg-transparent text-sm font-bold text-white focus:outline-none focus:bg-slate-800/80 rounded-lg px-2 py-1"
                    />
                  </div>

                  {player.score !== 0 && (
                    <span className="rounded-lg bg-slate-800 px-2 py-0.5 text-xs font-extrabold text-amber-300">
                      {player.score} ن
                    </span>
                  )}

                  <button
                    type="button"
                    onClick={() => onRemovePlayer(player.id)}
                    disabled={players.length <= 2}
                    title={
                      players.length <= 2
                        ? 'الحد الأدنى لاعبان'
                        : 'حذف اللاعب'
                    }
                    className="rounded-xl p-2 text-slate-400 hover:bg-red-500/15 hover:text-red-400 disabled:opacity-25 disabled:pointer-events-none transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* Categories + Difficulty & Options Panel */}
          <section
            className={`${
              mobileSetupTab === 'categories' ? 'block' : 'hidden lg:block'
            } lg:col-span-7 space-y-5 lg:space-y-6`}
          >
            {/* Categories Selection */}
            <div className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-4 sm:p-5 shadow-xl space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-lg font-extrabold text-white">
                    اختر فئات اللعب ({selectedCategories.length}/
                    {ALL_CATEGORY_NAMES.length})
                  </h2>
                  <p className="text-xs text-slate-400">
                    حدد الفئات اللي هتظهر في الجولة العشوائية أو التبديل السريع
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onSelectAllCategories}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 hover:bg-emerald-500/20 transition"
                  >
                    <CheckSquare className="w-3.5 h-3.5" />
                    <span>تحديد الكل</span>
                  </button>
                  <button
                    type="button"
                    onClick={onClearAllCategories}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-white transition"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>إلغاء الكل</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CATEGORY_LIST.map((cat) => {
                  const isSelected = selectedCategories.includes(cat.name);
                  const catQuestions = allQuestions.filter(
                    (q) =>
                      q.category === cat.name &&
                      (difficultyFilter === 'all' ||
                        q.difficulty === difficultyFilter)
                  );
                  const unseenCount = catQuestions.filter(
                    (q) => !seenSet.has(q.uid)
                  ).length;

                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => onToggleCategory(cat.name)}
                      className={`group flex items-start gap-2.5 sm:gap-3 rounded-2xl border p-3 sm:p-3.5 text-right transition ${
                        isSelected
                          ? 'border-amber-500/80 bg-amber-500/10 shadow-lg shadow-amber-500/5'
                          : 'border-slate-700/80 bg-slate-900/50 opacity-70 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <div
                        className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl border transition group-hover:scale-105"
                        style={{
                          backgroundColor: `${cat.accentColor}20`,
                          borderColor: `${cat.accentColor}55`,
                          color: cat.accentColor,
                        }}
                      >
                        <CategoryIcon iconName={cat.iconName} className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-sm font-extrabold text-white truncate">
                            {cat.name}
                          </h3>
                          <span
                            className={`h-4 w-4 rounded-full border flex items-center justify-center shrink-0 ${
                              isSelected
                                ? 'border-amber-400 bg-amber-400 text-slate-950'
                                : 'border-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <span className="h-2 w-2 rounded-full bg-slate-950" />
                            )}
                          </span>
                        </div>
                        <p className="mt-0.5 text-[11px] leading-relaxed text-slate-400 line-clamp-1 sm:line-clamp-2">
                          {cat.description}
                        </p>
                        <div className="mt-2 flex items-center gap-2 text-[11px] font-bold">
                          <span className="rounded-md bg-slate-800 px-2 py-0.5 text-slate-300">
                            {catQuestions.length} سؤال
                          </span>
                          {noRepeat && (
                            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-emerald-300">
                              متاح: {unseenCount}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Difficulty & Rules */}
            <div className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-5 shadow-xl space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Difficulty */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-extrabold text-white">
                    مستوى الصعوبة
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {(['all', 'easy', 'medium', 'hard'] as DifficultyFilter[]).map(
                      (diff) => {
                        const active = difficultyFilter === diff;
                        return (
                          <button
                            key={diff}
                            type="button"
                            onClick={() => onChangeDifficulty(diff)}
                            className={`rounded-xl border py-2.5 text-xs sm:text-sm font-extrabold transition ${
                              active
                                ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                                : 'border-slate-700 bg-slate-900/60 text-slate-300 hover:border-slate-500'
                            }`}
                          >
                            {DIFFICULTY_LABELS[diff]}
                          </button>
                        );
                      }
                    )}
                  </div>
                </div>

                {/* No Repeat Toggle */}
                <div className="space-y-2.5">
                  <label className="block text-sm font-extrabold text-white">
                    منع التكرار وحفظ الأسئلة المعروضة
                  </label>
                  <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-700 bg-slate-900/60 p-3">
                    <button
                      type="button"
                      onClick={onToggleNoRepeat}
                      className="flex items-center gap-3 text-right"
                    >
                      <span
                        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition ${
                          noRepeat ? 'bg-emerald-500' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                            noRepeat ? '-translate-x-6' : '-translate-x-1'
                          }`}
                        />
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-white">
                          عدم تكرار الأسئلة
                        </p>
                        <p className="text-[11px] text-slate-400">
                          تم عرض {seenIds.length} سؤال سابقاً
                        </p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={onResetSeenQuestions}
                      disabled={seenIds.length === 0}
                      title="إعادة ضبط الأسئلة المعروضة"
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-600 bg-slate-800 px-2.5 py-1.5 text-xs font-bold text-slate-200 hover:border-amber-500/50 hover:text-amber-300 disabled:opacity-40 transition shrink-0"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>مسح السجل</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Launch Actions (Desktop / Tablet inline) */}
              <div className="hidden lg:flex pt-2 flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-700/70">
                <div className="text-xs sm:text-sm text-slate-300 font-semibold">
                  {selectedCategories.length === 0 ? (
                    <span className="text-red-400 font-bold">
                      ⚠️ اختر فئة واحدة على الأقل للبدء
                    </span>
                  ) : (
                    <span>
                      جاهز للعرض:{' '}
                      <strong className="text-amber-400">
                        {noRepeat
                          ? matchingStats.unseenMatching
                          : matchingStats.totalMatching}
                      </strong>{' '}
                      سؤال متاح من أصل {matchingStats.totalMatching}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  {hasActiveSession && (
                    <button
                      type="button"
                      disabled={!canStart}
                      onClick={() => onStartGame(true)}
                      className="inline-flex items-center justify-center gap-2 rounded-2xl border border-emerald-400/50 bg-emerald-500/15 px-5 py-3.5 text-sm font-extrabold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 transition"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>استكمال الجولة الحالية</span>
                    </button>
                  )}

                  <button
                    type="button"
                    disabled={!canStart}
                    onClick={() => onStartGame(false)}
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-yellow-400 px-7 py-3.5 text-base font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition animate-pulse-glow"
                  >
                    <Play className="w-5 h-5 fill-current" />
                    <span>
                      {hasActiveSession ? 'بدء جولة جديدة 🎲' : 'ابدأ اللعب الآن! 🎲'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Fixed Thumb-Reach Mobile Launch Bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-700/90 bg-[#0F172A]/95 backdrop-blur-md px-3 pt-2.5 pb-safe shadow-2xl">
        <div className="mx-auto max-w-xl space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 px-1">
            {selectedCategories.length === 0 ? (
              <span className="text-red-400 font-extrabold">
                ⚠️ اختر فئة واحدة على الأقل للبدء
              </span>
            ) : (
              <span>
                جاهز للعرض:{' '}
                <strong className="text-amber-400">
                  {noRepeat
                    ? matchingStats.unseenMatching
                    : matchingStats.totalMatching}
                </strong>{' '}
                سؤال متاح
              </span>
            )}
            <span className="text-slate-400">
              {players.length} فرق • {selectedCategories.length} فئات
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveSession && (
              <button
                type="button"
                disabled={!canStart}
                onClick={() => onStartGame(true)}
                className="min-h-[48px] flex-1 inline-flex items-center justify-center gap-1.5 rounded-2xl border border-emerald-400/50 bg-emerald-500/15 px-3 py-2.5 text-xs sm:text-sm font-extrabold text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-40 transition"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>استكمال</span>
              </button>
            )}

            <button
              type="button"
              disabled={!canStart}
              onClick={() => onStartGame(false)}
              className="min-h-[48px] flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-amber-500 to-yellow-400 px-5 py-2.5 text-sm sm:text-base font-black text-slate-950 shadow-lg shadow-amber-500/25 hover:brightness-110 disabled:opacity-40 disabled:pointer-events-none transition"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>
                {hasActiveSession ? 'جولة جديدة 🎲' : 'ابدأ اللعب الآن! 🎲'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

