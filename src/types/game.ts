export type CategoryName =
  | 'الكلمات المعكوسة'
  | 'إيفيه من فيلم إيه؟'
  | 'الكلمة في أغنية'
  | 'غني للمطرب'
  | 'المزاد العام'
  | 'أوصف من غير ما تقول'
  | 'أسئلة السرعة والذكاء';

export type Difficulty = 'easy' | 'medium' | 'hard';
export type DifficultyFilter = 'all' | Difficulty;
export type ScreenMode = 'setup' | 'game' | 'podium';

export interface QuestionItem {
  id: number | string;
  uid: string; // "${category}__${id}"
  category: CategoryName;
  difficulty: Difficulty;
  question?: string;
  answer?: string;
  hint?: string;
  character_and_actor?: string;
  sample_answers?: string[];
  sample_songs?: string[];
  target_word?: string;
  forbidden_words?: string[];
}

export interface CategoryMeta {
  name: CategoryName;
  shortName: string;
  description: string;
  iconName:
    | 'Shuffle'
    | 'Clapperboard'
    | 'Music'
    | 'Mic2'
    | 'Gavel'
    | 'Ban'
    | 'Zap';
  accentColor: string;
  badgeClass: string;
  defaultTimer: 15 | 30 | 60;
  fileName: string;
}

export interface Player {
  id: string;
  name: string;
  score: number;
  yellowCards: number;
  redCards: number;
  color: string;
  avatar: string;
}

export interface PenaltyBanner {
  id: string;
  playerName: string;
  type: 'yellow' | 'red';
}

export interface GameState {
  screen: ScreenMode;
  players: Player[];
  selectedCategories: CategoryName[];
  activeCategory: CategoryName | 'random';
  difficultyFilter: DifficultyFilter;
  noRepeat: boolean;
  currentQuestion: QuestionItem | null;
  isAnswerRevealed: boolean;
  isHintRevealed: boolean;
  sortByRank: boolean;
  soundMuted: boolean;
  questionsPlayedCount: number;
  auctionCounter: number;
}

