import { ALL_CATEGORY_NAMES, CATEGORY_LIST, STARTER_QUESTIONS } from '../data/starterQuestions';
import { CategoryName, Difficulty, QuestionItem } from '../types/game';

const VALID_DIFFICULTIES = new Set<Difficulty>(['easy', 'medium', 'hard']);
const VALID_CATEGORIES = new Set<string>(ALL_CATEGORY_NAMES);

function normalizeCategoryName(rawCategory: unknown): CategoryName | null {
  if (typeof rawCategory !== 'string') return null;
  const trimmed = rawCategory.trim();
  if (VALID_CATEGORIES.has(trimmed)) {
    return trimmed as CategoryName;
  }
  // Fuzzy match for minor punctuation differences
  if (trimmed.includes('معكوس')) return 'الكلمات المعكوسة';
  if (trimmed.includes('إيفيه') || trimmed.includes('فيلم')) return 'إيفيه من فيلم إيه؟';
  if (trimmed.includes('كلمة في أغنية') || trimmed.includes('الكلمة في أغنية'))
    return 'الكلمة في أغنية';
  if (trimmed.includes('غني للمطرب') || trimmed.includes('مطرب')) return 'غني للمطرب';
  if (trimmed.includes('مزاد')) return 'المزاد العام';
  if (trimmed.includes('أوصف') || trimmed.includes('ممنوع')) return 'أوصف من غير ما تقول';
  if (trimmed.includes('السرعة') || trimmed.includes('الذكاء')) return 'أسئلة السرعة والذكاء';
  return null;
}

function normalizeDifficulty(raw: unknown): Difficulty {
  if (typeof raw === 'string') {
    const lower = raw.trim().toLowerCase();
    if (VALID_DIFFICULTIES.has(lower as Difficulty)) {
      return lower as Difficulty;
    }
    if (lower === 'سهل') return 'easy';
    if (lower === 'متوسط') return 'medium';
    if (lower === 'صعب') return 'hard';
  }
  return 'medium';
}

function normalizeStringArray(val: unknown): string[] | undefined {
  if (!Array.isArray(val)) return undefined;
  const cleaned = val
    .map((entry) => (typeof entry === 'string' ? entry.trim() : String(entry ?? '').trim()))
    .filter(Boolean);
  return cleaned.length > 0 ? cleaned : undefined;
}

/**
 * Parses JSON safely and falls back to a line-level unescaped inner quote sanitizer
 * in case a user uploads a JSON file with unescaped double quotes inside Arabic strings.
 */
export function sanitizeAndParseJson(rawText: string): unknown {
  const cleanText = rawText.replace(/^\uFEFF/, '').trim();
  try {
    return JSON.parse(cleanText);
  } catch {
    const lines = cleanText.split(/\r?\n/);
    const repaired = lines
      .map((line) => {
        const match = line.match(
          /^(\s*"(?:question|answer|hint|character_and_actor|target_word)":\s*")(.*)(",?\s*)$/
        );
        if (match && match[2].includes('"')) {
          const escapedInner = match[2].replace(/\\"/g, '"').replace(/"/g, '\\"');
          return match[1] + escapedInner + match[3];
        }
        return line;
      })
      .join('\n');
    return JSON.parse(repaired);
  }
}

function normalizeSingleItem(
  rawItem: Record<string, unknown>,
  fallbackCategory: CategoryName | null,
  fallbackIndex: number
): QuestionItem | null {
  const category = normalizeCategoryName(rawItem.category) ?? fallbackCategory;
  if (!category) return null;

  const id =
    typeof rawItem.id === 'number' || typeof rawItem.id === 'string'
      ? rawItem.id
      : fallbackIndex + 1;

  const difficulty = normalizeDifficulty(rawItem.difficulty);

  const item: QuestionItem = {
    id,
    uid: `${category}__${id}`,
    category,
    difficulty,
  };

  if (typeof rawItem.question === 'string' && rawItem.question.trim()) {
    item.question = rawItem.question.trim();
  }
  if (typeof rawItem.answer === 'string' && rawItem.answer.trim()) {
    item.answer = rawItem.answer.trim();
  }
  if (typeof rawItem.hint === 'string' && rawItem.hint.trim()) {
    item.hint = rawItem.hint.trim();
  }
  if (typeof rawItem.character_and_actor === 'string' && rawItem.character_and_actor.trim()) {
    item.character_and_actor = rawItem.character_and_actor.trim();
  }
  if (typeof rawItem.target_word === 'string' && rawItem.target_word.trim()) {
    item.target_word = rawItem.target_word.trim();
  }

  const sampleAnswers = normalizeStringArray(rawItem.sample_answers);
  if (sampleAnswers) item.sample_answers = sampleAnswers;

  const sampleSongs = normalizeStringArray(rawItem.sample_songs);
  if (sampleSongs) item.sample_songs = sampleSongs;

  const forbiddenWords = normalizeStringArray(rawItem.forbidden_words);
  if (forbiddenWords) item.forbidden_words = forbiddenWords;

  // Validate that the item actually has displayable content
  if (category === 'أوصف من غير ما تقول') {
    if (!item.target_word && item.question) {
      item.target_word = item.question;
    }
    if (!item.target_word) return null;
  } else if (!item.question) {
    return null;
  }

  return item;
}

/**
 * Extracts normalized QuestionItem[] from either:
 * 1. `{ category: "...", items: [...] }`
 * 2. Array of `{ category, items }`
 * 3. Raw array of QuestionItem objects (with `category` or optional `fallbackCategory`)
 */
export function parseQuestionDataset(
  parsed: unknown,
  fallbackCategory: CategoryName | null = null
): { items: QuestionItem[]; categoriesFound: CategoryName[] } {
  const items: QuestionItem[] = [];
  const categoriesFound = new Set<CategoryName>();

  const processBlock = (block: unknown, blockFallbackCat: CategoryName | null) => {
    if (!block || typeof block !== 'object') return;
    const obj = block as Record<string, unknown>;

    if (Array.isArray(obj.items)) {
      const cat = normalizeCategoryName(obj.category) ?? blockFallbackCat;
      obj.items.forEach((rawItem, idx) => {
        if (rawItem && typeof rawItem === 'object') {
          const normalized = normalizeSingleItem(rawItem as Record<string, unknown>, cat, idx);
          if (normalized) {
            items.push(normalized);
            categoriesFound.add(normalized.category);
          }
        }
      });
    } else {
      const normalized = normalizeSingleItem(obj, blockFallbackCat, items.length);
      if (normalized) {
        items.push(normalized);
        categoriesFound.add(normalized.category);
      }
    }
  };

  if (Array.isArray(parsed)) {
    parsed.forEach((entry) => processBlock(entry, fallbackCategory));
  } else {
    processBlock(parsed, fallbackCategory);
  }

  return {
    items,
    categoriesFound: Array.from(categoriesFound),
  };
}

/**
 * Loads all `/data/*.json` files shipped in `public/data/`.
 */
export async function fetchBuiltInPublicDatasets(): Promise<QuestionItem[]> {
  const results = await Promise.allSettled(
    CATEGORY_LIST.map(async (meta) => {
      const res = await fetch(`/data/${meta.fileName}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      const parsed = sanitizeAndParseJson(text);
      return parseQuestionDataset(parsed, meta.name).items;
    })
  );

  const collected: QuestionItem[] = [];
  results.forEach((res) => {
    if (res.status === 'fulfilled') {
      collected.push(...res.value);
    }
  });

  return collected;
}

/**
 * Combines starter questions (fallback for any empty category),
 * fetched `/data/*.json` questions, and user-imported custom questions.
 */
export function buildMergedQuestionBank(
  fetchedItems: QuestionItem[],
  customItems: QuestionItem[]
): QuestionItem[] {
  const byCategory = new Map<CategoryName, Map<string, QuestionItem>>();

  ALL_CATEGORY_NAMES.forEach((cat) => {
    byCategory.set(cat, new Map<string, QuestionItem>());
  });

  // Add fetched /data/*.json items
  fetchedItems.forEach((item) => {
    byCategory.get(item.category)?.set(item.uid, item);
  });

  // Add/override with custom imported items
  customItems.forEach((item) => {
    byCategory.get(item.category)?.set(item.uid, item);
  });

  // Fallback to built-in starter questions only for categories that have 0 external/custom items
  ALL_CATEGORY_NAMES.forEach((cat) => {
    const map = byCategory.get(cat);
    if (map && map.size === 0) {
      STARTER_QUESTIONS.filter((q) => q.category === cat).forEach((q) => {
        map.set(q.uid, q);
      });
    }
  });

  const merged: QuestionItem[] = [];
  ALL_CATEGORY_NAMES.forEach((cat) => {
    const map = byCategory.get(cat);
    if (map) {
      merged.push(...map.values());
    }
  });

  return merged;
}

