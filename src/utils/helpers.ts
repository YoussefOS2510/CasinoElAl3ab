import { Difficulty, DifficultyFilter } from '../types/game';

export const DIFFICULTY_LABELS: Record<DifficultyFilter, string> = {
  all: 'الكل',
  easy: 'سهل',
  medium: 'متوسط',
  hard: 'صعب',
};

export const DIFFICULTY_BADGE_CLASSES: Record<Difficulty, string> = {
  easy: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
  hard: 'bg-red-500/15 text-red-300 border-red-500/40',
};

export const STORAGE_KEYS = {
  GAME_STATE: 'casino_el_al3ab_game_state_v1',
  CUSTOM_QUESTIONS: 'casino_custom_questions_v1',
  SEEN_QUESTIONS: 'casino_seen_questions_v1',
} as const;

export function createPlayerId(): string {
  return `p_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function formatTimeMMSS(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

