import React from 'react';
import {
  FileJson,
  Flag,
  Settings,
  Shuffle,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { CATEGORY_MAP } from '../data/starterQuestions';
import { CategoryName, DifficultyFilter, QuestionItem } from '../types/game';
import { DIFFICULTY_BADGE_CLASSES, DIFFICULTY_LABELS } from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';
import { RoundTimer } from './RoundTimer';

interface TopBarProps {
  selectedCategories: CategoryName[];
  activeCategory: CategoryName | 'random';
  difficultyFilter: DifficultyFilter;
  currentQuestion: QuestionItem | null;
  unseenRemaining: number;
  totalMatching: number;
  noRepeat: boolean;
  soundMuted: boolean;
  timerResetSignal: number;
  onSelectActiveCategory: (cat: CategoryName | 'random') => void;
  onChangeDifficulty: (diff: DifficultyFilter) => void;
  onToggleMute: () => void;
  onOpenImportModal: () => void;
  onBackToSetup: () => void;
  onEndGame: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  selectedCategories,
  activeCategory,
  difficultyFilter,
  currentQuestion,
  unseenRemaining,
  totalMatching,
  noRepeat,
  soundMuted,
  timerResetSignal,
  onSelectActiveCategory,
  onChangeDifficulty,
  onToggleMute,
  onOpenImportModal,
  onBackToSetup,
  onEndGame,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#0F172A]/95 backdrop-blur-md shadow-lg">
      <div className="mx-auto max-w-7xl px-2.5 sm:px-5 py-2 space-y-2">
        {/* Row 1: Compact Brand, Counter/Difficulty & Quick Utility Buttons */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <button
              type="button"
              onClick={onBackToSetup}
              className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-[#1E293B] px-2.5 py-1.5 hover:border-amber-500/60 transition shrink-0"
              title="العودة للإعدادات"
            >
              <span className="text-base sm:text-lg">🎲</span>
              <span className="text-xs sm:text-base font-black text-white">
                كازينو <span className="text-amber-400">الألعاب</span>
              </span>
            </button>

            {/* Unseen Counter + Current Question Difficulty */}
            <div className="flex items-center gap-1.5 min-w-0">
              {currentQuestion && (
                <span
                  className={`hidden sm:inline-flex rounded-full border px-2 py-0.5 text-xs font-extrabold shrink-0 ${
                    DIFFICULTY_BADGE_CLASSES[currentQuestion.difficulty]
                  }`}
                >
                  {DIFFICULTY_LABELS[currentQuestion.difficulty]}
                </span>
              )}
              <span className="truncate rounded-full border border-slate-700 bg-slate-800/80 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-slate-300">
                {noRepeat
                  ? `متبقي ${unseenRemaining}`
                  : `${totalMatching} سؤال`}
                <span className="hidden md:inline">
                  {noRepeat ? ` من ${totalMatching}` : ''}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Difficulty Filter Dropdown */}
            <select
              value={difficultyFilter}
              onChange={(e) =>
                onChangeDifficulty(e.target.value as DifficultyFilter)
              }
              aria-label="تصفية حسب الصعوبة"
              className="min-h-[36px] rounded-xl border border-slate-700 bg-[#1E293B] px-2 py-1 text-[11px] sm:text-xs font-extrabold text-slate-200 focus:border-amber-500 focus:outline-none"
            >
              <option value="all">الكل</option>
              <option value="easy">سهل</option>
              <option value="medium">متوسط</option>
              <option value="hard">صعب</option>
            </select>

            {/* Mute Toggle */}
            <button
              type="button"
              onClick={onToggleMute}
              title={soundMuted ? 'تشغيل المؤثرات الصوتية' : 'كتم الصوت'}
              aria-label={soundMuted ? 'تشغيل الصوت' : 'كتم الصوت'}
              className={`min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-xl border p-1.5 sm:p-2 transition ${
                soundMuted
                  ? 'border-red-500/40 bg-red-500/15 text-red-300'
                  : 'border-slate-700 bg-[#1E293B] text-slate-200 hover:border-amber-500/50'
              }`}
            >
              {soundMuted ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>

            {/* Import JSON */}
            <button
              type="button"
              onClick={onOpenImportModal}
              title="تحميل ملفات الأسئلة"
              aria-label="تحميل ملفات الأسئلة"
              className="min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-xl border border-slate-700 bg-[#1E293B] p-1.5 sm:p-2 text-amber-300 hover:border-amber-500/50 transition"
            >
              <FileJson className="w-4 h-4" />
            </button>

            {/* Setup & End Game (Desktop/Tablet - also in Mobile Bottom Nav) */}
            <button
              type="button"
              onClick={onBackToSetup}
              title="إعدادات اللعبة"
              className="hidden lg:inline-flex min-h-[36px] min-w-[36px] items-center justify-center rounded-xl border border-slate-700 bg-[#1E293B] p-2 text-slate-300 hover:border-slate-500 hover:text-white transition"
            >
              <Settings className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onEndGame}
              className="hidden lg:inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border border-red-500/50 bg-red-500/15 px-3 py-1.5 text-sm font-extrabold text-red-300 hover:bg-red-500 hover:text-white transition"
            >
              <Flag className="w-3.5 h-3.5" />
              <span>إنهاء اللعبة</span>
            </button>
          </div>
        </div>

        {/* Row 2: Swipeable Category Pills (Mobile & Desktop) + Round Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 items-center">
          <div className="lg:col-span-7 flex items-center gap-1.5 overflow-x-auto no-scrollbar touch-pan-x py-0.5 w-full">
            <button
              type="button"
              onClick={() => onSelectActiveCategory('random')}
              className={`min-h-[38px] inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition active:scale-95 ${
                activeCategory === 'random'
                  ? 'border-amber-400 bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'border-slate-700 bg-[#1E293B] text-slate-300 hover:border-slate-500'
              }`}
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>عشوائي</span>
            </button>

            {selectedCategories.map((catName) => {
              const meta = CATEGORY_MAP[catName];
              const isActive = activeCategory === catName;
              return (
                <button
                  key={catName}
                  type="button"
                  onClick={() => onSelectActiveCategory(catName)}
                  className={`min-h-[38px] inline-flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition active:scale-95 ${
                    isActive
                      ? 'border-amber-400 bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/50'
                      : 'border-slate-700 bg-[#1E293B] text-slate-300 hover:border-slate-500 hover:text-white'
                  }`}
                >
                  <span style={{ color: meta.accentColor }}>
                    <CategoryIcon
                      iconName={meta.iconName}
                      className="w-3.5 h-3.5"
                    />
                  </span>
                  <span>{meta.shortName}</span>
                </button>
              );
            })}
          </div>

          {/* Built-in Round Timer */}
          <div className="lg:col-span-5">
            <RoundTimer resetSignal={timerResetSignal} />
          </div>
        </div>
      </div>
    </header>
  );
};
