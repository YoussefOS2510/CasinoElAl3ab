import React from 'react';
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  Minus,
  Plus,
  RotateCcw,
  SkipForward,
  Sparkles,
} from 'lucide-react';
import { CATEGORY_MAP } from '../data/starterQuestions';
import { CategoryName, QuestionItem } from '../types/game';
import { DIFFICULTY_BADGE_CLASSES, DIFFICULTY_LABELS } from '../utils/helpers';
import { CategoryIcon } from './CategoryIcon';

interface QuestionCardProps {
  question: QuestionItem | null;
  isAnswerRevealed: boolean;
  isHintRevealed: boolean;
  auctionCounter: number;
  activeCategory: CategoryName | 'random';
  onRevealAnswer: () => void;
  onToggleHint: () => void;
  onNextQuestion: () => void;
  onSkipQuestion: () => void;
  onUpdateAuctionCounter: (delta: number) => void;
  onResetSeenQuestions: () => void;
  onSwitchToRandom: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  isAnswerRevealed,
  isHintRevealed,
  auctionCounter,
  activeCategory,
  onRevealAnswer,
  onToggleHint,
  onNextQuestion,
  onSkipQuestion,
  onUpdateAuctionCounter,
  onResetSeenQuestions,
  onSwitchToRandom,
}) => {
  if (!question) {
    return (
      <div className="rounded-3xl border border-slate-700/80 bg-[#1E293B] p-7 sm:p-10 text-center shadow-2xl space-y-5">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30 text-3xl">
          🎉
        </div>
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-white">
            خلصت كل الأسئلة المتاحة في الاختيار ده!
          </h2>
          <p className="text-sm text-slate-300 max-w-md mx-auto">
            تقدر تمسح سجل الأسئلة المعروضة عشان تبدأ من جديد، أو تحوّل لـ
            &quot;عشوائي&quot; أو تغير مستوى الصعوبة من الشريط العلوي.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onResetSeenQuestions}
            className="inline-flex items-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-amber-400 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>إعادة فتح كل الأسئلة</span>
          </button>

          {activeCategory !== 'random' && (
            <button
              type="button"
              onClick={onSwitchToRandom}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3 text-sm font-extrabold text-white hover:border-amber-500/50 transition"
            >
              <span>التبديل إلى عشوائي 🎲</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const meta = CATEGORY_MAP[question.category];
  const isDescribeMode = question.category === 'أوصف من غير ما تقول';

  const renderReversedLetters = (raw: string) => {
    const wordGroups = raw.trim().split(/\s{2,}/);
    return (
      <div className="space-y-3 sm:space-y-4">
        {/* Raw huge spaced string for instant readability */}
        <p className="text-2xl sm:text-4xl md:text-5xl font-black tracking-[0.14em] sm:tracking-[0.22em] text-amber-300 leading-relaxed break-words select-all">
          {raw}
        </p>

        {/* Letter tiles grouped by word */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 pt-1">
          {wordGroups.map((group, gIdx) => {
            const letters = group.trim().split(/\s+/).filter(Boolean);
            return (
              <div
                key={`${gIdx}-${group}`}
                className="flex flex-wrap items-center justify-center gap-1 sm:gap-1.5 rounded-2xl border border-slate-700/70 bg-slate-900/50 px-2.5 py-1.5 sm:px-3 sm:py-2"
              >
                {letters.map((ch, lIdx) => (
                  <span
                    key={`${lIdx}-${ch}`}
                    className="inline-flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl border border-amber-500/35 bg-slate-800 text-base sm:text-xl font-black text-white shadow-inner"
                  >
                    {ch}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMainPrompt = () => {
    switch (question.category) {
      case 'الكلمات المعكوسة':
        return (
          <div className="space-y-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              رتّب الحروف المعكوسة دي واكتشف الكلمة:
            </p>
            {renderReversedLetters(question.question ?? '')}
            {question.hint && (
              <div className="pt-2">
                {!isHintRevealed ? (
                  <button
                    type="button"
                    onClick={onToggleHint}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2 text-xs sm:text-sm font-extrabold text-yellow-300 hover:bg-yellow-500/20 transition"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>إظهار التلميح 💡</span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-2.5 text-sm font-bold text-yellow-200 animate-pop-in">
                    <Lightbulb className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>تلميح: {question.hint}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'إيفيه من فيلم إيه؟':
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              الإيفيه ده من فيلم أو مسرحية إيه؟
            </p>
            <blockquote className="relative rounded-2xl border border-pink-500/30 bg-slate-900/70 px-4 py-5 sm:px-8 sm:py-8">
              <span className="block text-xl sm:text-3xl md:text-4xl font-black leading-snug text-white">
                « {question.question} »
              </span>
            </blockquote>
          </div>
        );

      case 'الكلمة في أغنية':
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              غنّي مقطع أغنية فيه الكلمة دي:
            </p>
            <div className="mx-auto inline-flex items-center justify-center rounded-3xl border-2 border-sky-400/50 bg-sky-500/10 px-7 py-4 sm:px-10 sm:py-6 shadow-lg shadow-sky-500/10">
              <span className="text-3xl sm:text-5xl font-black text-sky-300">
                {question.question}
              </span>
            </div>
          </div>
        );

      case 'غني للمطرب':
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              تحدي الغناء! غنّي أي أغنية للمطرب / المطربة:
            </p>
            <div className="mx-auto inline-flex items-center justify-center rounded-3xl border-2 border-purple-400/50 bg-purple-500/10 px-6 py-4 sm:px-8 sm:py-6 shadow-lg shadow-purple-500/10">
              <span className="text-2xl sm:text-5xl font-black text-purple-200">
                🎤 {question.question}
              </span>
            </div>
          </div>
        );

      case 'المزاد العام':
        return (
          <div className="space-y-4 sm:space-y-5 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              تحدي المزاد العام — كم إجابة تقدر تعدّهم؟
            </p>
            <h2 className="text-xl sm:text-4xl font-black leading-snug text-white">
              {question.question}
            </h2>

            {/* Live Host Auction Tally Counter */}
            <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-2">
              <span className="text-xs sm:text-sm font-extrabold text-emerald-300">
                عداد المزاد:
              </span>
              <button
                type="button"
                onClick={() => onUpdateAuctionCounter(-1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-200 hover:bg-red-500/20 hover:text-red-300 active:scale-95 transition"
                aria-label="إنقاص عداد المزاد"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="min-w-[2ch] text-xl font-black text-white tabular-nums">
                {auctionCounter}
              </span>
              <button
                type="button"
                onClick={() => onUpdateAuctionCounter(1)}
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 active:scale-95 transition"
                aria-label="زيادة عداد المزاد"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        );

      case 'أوصف من غير ما تقول':
        return (
          <div className="space-y-4 sm:space-y-5 text-center">
            <div className="space-y-1.5 sm:space-y-2">
              <p className="text-xs sm:text-sm font-bold text-slate-400">
                الكلمة المطلوب وصفها للفريق:
              </p>
              <div className="mx-auto inline-block rounded-3xl border-2 border-amber-400/70 bg-gradient-to-b from-amber-500/20 to-amber-500/5 px-6 py-3.5 sm:px-8 sm:py-5 shadow-lg shadow-amber-500/10">
                <span className="text-2xl sm:text-5xl font-black text-amber-300">
                  {question.target_word}
                </span>
              </div>
            </div>

            {/* Clear Red-Bordered Forbidden Words Box */}
            <div className="mx-auto max-w-xl rounded-2xl border-2 border-red-500 bg-red-500/10 p-3.5 sm:p-5 shadow-lg shadow-red-500/10">
              <div className="mb-2.5 sm:mb-3 flex items-center justify-center gap-2 text-xs sm:text-base font-black text-red-400">
                <Ban className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>الكلمات الممنوعة (ممنوع تقولها!)</span>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
                {(question.forbidden_words ?? []).map((word, idx) => (
                  <div
                    key={`${idx}-${word}`}
                    className="rounded-xl border border-red-500/40 bg-slate-950/60 px-2.5 py-2 sm:px-3 sm:py-2.5 text-sm sm:text-lg font-extrabold text-red-200"
                  >
                    🚫 {word}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'أسئلة السرعة والذكاء':
      default:
        return (
          <div className="space-y-3 sm:space-y-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-slate-400">
              أسرع إجابة صح تاخد النقطة:
            </p>
            <h2 className="text-xl sm:text-3xl md:text-4xl font-black leading-relaxed text-white">
              {question.question}
            </h2>
          </div>
        );
    }
  };

  const renderRevealedAnswer = () => {
    if (!isAnswerRevealed || isDescribeMode) return null;

    return (
      <div className="mt-6 rounded-2xl border border-emerald-500/50 bg-emerald-500/10 p-4 sm:p-5 text-center animate-pop-in space-y-3">
        <div className="inline-flex items-center gap-1.5 text-xs font-black text-emerald-400">
          <Sparkles className="w-4 h-4" />
          <span>الإجابة</span>
        </div>

        {question.answer && (
          <p className="text-2xl sm:text-3xl font-black text-emerald-300">
            {question.answer}
          </p>
        )}

        {question.character_and_actor && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-slate-900/70 px-4 py-1.5 text-sm font-extrabold text-amber-300">
            <span>🎭 {question.character_and_actor}</span>
          </div>
        )}

        {question.sample_answers && question.sample_answers.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-300/80">
              أمثلة لإجابات صحيحة:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {question.sample_answers.map((ans, idx) => (
                <span
                  key={`${idx}-${ans}`}
                  className="rounded-xl border border-emerald-500/35 bg-slate-900/75 px-3.5 py-1.5 text-sm sm:text-base font-bold text-emerald-100"
                >
                  {ans}
                </span>
              ))}
            </div>
          </div>
        )}

        {question.sample_songs && question.sample_songs.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-300/80">
              أمثلة لأغاني المطرب:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {question.sample_songs.map((song, idx) => (
                <span
                  key={`${idx}-${song}`}
                  className="rounded-xl border border-purple-400/40 bg-slate-900/75 px-3.5 py-1.5 text-sm sm:text-base font-bold text-purple-200"
                >
                  🎵 {song}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      key={question.uid}
      className="relative overflow-hidden rounded-3xl border border-slate-700/90 bg-[#1E293B] p-4 sm:p-7 shadow-2xl animate-pop-in"
    >
      {/* Top accent strip */}
      <div
        className="absolute inset-x-0 top-0 h-1.5"
        style={{ backgroundColor: meta.accentColor }}
      />

      {/* Card Header */}
      <div className="mb-4 sm:mb-6 flex flex-wrap items-center justify-between gap-2">
        <div
          className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm font-extrabold ${meta.badgeClass}`}
        >
          <CategoryIcon iconName={meta.iconName} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span>{question.category}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <span
            className={`rounded-full border px-2.5 py-0.5 text-[11px] sm:text-xs font-extrabold ${
              DIFFICULTY_BADGE_CLASSES[question.difficulty]
            }`}
          >
            {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          <span className="rounded-full bg-slate-900/80 border border-slate-700 px-2.5 py-0.5 text-[11px] sm:text-xs font-bold text-slate-400">
            #{question.id}
          </span>
        </div>
      </div>

      {/* Main Question Body */}
      <div className="min-h-[140px] sm:min-h-[180px] flex flex-col justify-center py-1 sm:py-2">
        {renderMainPrompt()}
        {renderRevealedAnswer()}
      </div>

      {/* Host Action Buttons */}
      <div className="mt-5 sm:mt-7 pt-4 sm:pt-5 border-t border-slate-700/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
        {!isDescribeMode ? (
          <button
            type="button"
            onClick={onRevealAnswer}
            className={`min-h-[48px] inline-flex items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm sm:text-base font-black transition active:scale-[0.98] ${
              isAnswerRevealed
                ? 'border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25'
                : 'bg-gradient-to-l from-amber-500 to-yellow-400 text-slate-950 shadow-lg shadow-amber-500/20 hover:brightness-110'
            }`}
          >
            {isAnswerRevealed ? (
              <>
                <EyeOff className="w-5 h-5" />
                <span>إخفاء الإجابة</span>
              </>
            ) : (
              <>
                <Eye className="w-5 h-5" />
                <span>إظهار الإجابة</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-2.5 w-full">
            <button
              type="button"
              onClick={onNextQuestion}
              className="min-h-[48px] flex-[2] inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-l from-emerald-500 to-teal-400 px-5 py-3 text-sm sm:text-base font-black text-slate-950 shadow-lg shadow-emerald-500/20 hover:brightness-110 active:scale-[0.98] transition"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>تم التخمين / التالي</span>
            </button>
            <button
              type="button"
              onClick={onSkipQuestion}
              className="min-h-[48px] flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-600 bg-slate-800/90 px-4 py-3 text-sm font-extrabold text-slate-200 hover:border-slate-400 hover:text-white active:scale-[0.98] transition"
            >
              <SkipForward className="w-4 h-4" />
              <span>تخطي</span>
            </button>
          </div>
        )}

        {!isDescribeMode && (
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onSkipQuestion}
              className="min-h-[48px] flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-600 bg-slate-800/90 px-4 py-3 text-sm font-extrabold text-slate-200 hover:border-slate-400 hover:text-white active:scale-[0.98] transition"
            >
              <SkipForward className="w-4 h-4" />
              <span>تخطي</span>
            </button>

            <button
              type="button"
              onClick={onNextQuestion}
              className="min-h-[48px] flex-[2] sm:flex-none inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-6 py-3 text-sm sm:text-base font-black text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/15 active:scale-[0.98] transition"
            >
              <span>السؤال التالي</span>
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

