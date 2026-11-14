import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Crown,
  Flag,
  HelpCircle,
  Settings,
  Trophy,
} from 'lucide-react';
import { ImportJsonModal } from './components/ImportJsonModal';
import { PodiumScreen } from './components/PodiumScreen';
import { QuestionCard } from './components/QuestionCard';
import { Scoreboard } from './components/Scoreboard';
import { SetupScreen } from './components/SetupScreen';
import { TopBar } from './components/TopBar';
import {
  ALL_CATEGORY_NAMES,
  TEAM_PALETTE,
} from './data/starterQuestions';
import {
  CategoryName,
  DifficultyFilter,
  GameState,
  PenaltyBanner,
  Player,
  QuestionItem,
} from './types/game';
import { createPlayerId, STORAGE_KEYS } from './utils/helpers';
import {
  buildMergedQuestionBank,
  fetchBuiltInPublicDatasets,
} from './utils/jsonLoader';
import { soundEngine } from './utils/soundEffects';

function createDefaultPlayers(): Player[] {
  return [
    {
      id: createPlayerId(),
      name: 'فريق 1',
      score: 0,
      yellowCards: 0,
      redCards: 0,
      color: TEAM_PALETTE[0].color,
      avatar: TEAM_PALETTE[0].avatar,
    },
    {
      id: createPlayerId(),
      name: 'فريق 2',
      score: 0,
      yellowCards: 0,
      redCards: 0,
      color: TEAM_PALETTE[1].color,
      avatar: TEAM_PALETTE[1].avatar,
    },
  ];
}

function createInitialGameState(): GameState {
  return {
    screen: 'setup',
    players: createDefaultPlayers(),
    selectedCategories: [...ALL_CATEGORY_NAMES],
    activeCategory: 'random',
    difficultyFilter: 'all',
    noRepeat: true,
    currentQuestion: null,
    isAnswerRevealed: false,
    isHintRevealed: false,
    sortByRank: true,
    soundMuted: false,
    questionsPlayedCount: 0,
    auctionCounter: 0,
  };
}

function loadSavedGameState(): GameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.GAME_STATE);
    if (!raw) return createInitialGameState();
    const parsed = JSON.parse(raw) as Partial<GameState>;
    const defaults = createInitialGameState();
    return {
      ...defaults,
      ...parsed,
      players:
        Array.isArray(parsed.players) && parsed.players.length >= 2
          ? parsed.players
          : defaults.players,
      selectedCategories:
        Array.isArray(parsed.selectedCategories) &&
        parsed.selectedCategories.length > 0
          ? parsed.selectedCategories
          : defaults.selectedCategories,
    };
  } catch {
    return createInitialGameState();
  }
}

function loadSavedStringArray(key: string): string[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function loadSavedCustomQuestions(): QuestionItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as QuestionItem[]) : [];
  } catch {
    return [];
  }
}

export function App() {
  const [gameState, setGameState] = useState<GameState>(loadSavedGameState);
  const [fetchedQuestions, setFetchedQuestions] = useState<QuestionItem[]>([]);
  const [customQuestions, setCustomQuestions] = useState<QuestionItem[]>(
    loadSavedCustomQuestions
  );
  const [seenIds, setSeenIds] = useState<string[]>(() =>
    loadSavedStringArray(STORAGE_KEYS.SEEN_QUESTIONS)
  );
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [timerResetSignal, setTimerResetSignal] = useState(0);
  const [penaltyBanner, setPenaltyBanner] = useState<PenaltyBanner | null>(null);
  const [mobileTab, setMobileTab] = useState<'question' | 'scoreboard'>('question');
  const bannerTimerRef = useRef<number | null>(null);

  // Merge built-in starter questions, /data/*.json files, and user-imported JSONs
  const allQuestions = useMemo(
    () => buildMergedQuestionBank(fetchedQuestions, customQuestions),
    [fetchedQuestions, customQuestions]
  );

  // Load `/data/*.json` on startup
  useEffect(() => {
    let active = true;
    void fetchBuiltInPublicDatasets().then((items) => {
      if (active && items.length > 0) {
        setFetchedQuestions(items);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  // Sync mute state
  useEffect(() => {
    soundEngine.setMuted(gameState.soundMuted);
  }, [gameState.soundMuted]);

  // Persist game state, custom questions, and seen IDs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
    } catch {
      // Ignore storage quota errors
    }
  }, [gameState]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_QUESTIONS,
        JSON.stringify(customQuestions)
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [customQuestions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SEEN_QUESTIONS, JSON.stringify(seenIds));
    } catch {
      // Ignore storage quota errors
    }
  }, [seenIds]);

  const seenSet = useMemo(() => new Set(seenIds), [seenIds]);

  // Helper to filter matching questions for the active category & difficulty
  const getPoolStats = useCallback(
    (
      activeCat: CategoryName | 'random',
      selectedCats: CategoryName[],
      diffFilter: DifficultyFilter,
      noRepeat: boolean,
      seenLookup: Set<string>
    ) => {
      const allowedCats =
        activeCat === 'random'
          ? new Set(selectedCats)
          : new Set<CategoryName>([activeCat]);

      const matching = allQuestions.filter(
        (q) =>
          allowedCats.has(q.category) &&
          (diffFilter === 'all' || q.difficulty === diffFilter)
      );

      const available = noRepeat
        ? matching.filter((q) => !seenLookup.has(q.uid))
        : matching;

      return { matching, available };
    },
    [allQuestions]
  );

  const pickRandomQuestion = useCallback(
    (
      activeCat: CategoryName | 'random',
      selectedCats: CategoryName[],
      diffFilter: DifficultyFilter,
      noRepeat: boolean,
      seenLookup: Set<string>,
      excludeUid?: string
    ): QuestionItem | null => {
      const { available } = getPoolStats(
        activeCat,
        selectedCats,
        diffFilter,
        noRepeat,
        seenLookup
      );
      if (available.length === 0) return null;

      const withoutCurrent =
        excludeUid && available.length > 1
          ? available.filter((q) => q.uid !== excludeUid)
          : available;

      const idx = Math.floor(Math.random() * withoutCurrent.length);
      return withoutCurrent[idx] ?? null;
    },
    [getPoolStats]
  );

  const currentPoolStats = useMemo(
    () =>
      getPoolStats(
        gameState.activeCategory,
        gameState.selectedCategories,
        gameState.difficultyFilter,
        gameState.noRepeat,
        seenSet
      ),
    [
      getPoolStats,
      gameState.activeCategory,
      gameState.selectedCategories,
      gameState.difficultyFilter,
      gameState.noRepeat,
      seenSet,
    ]
  );

  // If game screen opens with no active question, draw one automatically once questions exist
  useEffect(() => {
    if (
      gameState.screen === 'game' &&
      !gameState.currentQuestion &&
      currentPoolStats.available.length > 0
    ) {
      const nextQ = pickRandomQuestion(
        gameState.activeCategory,
        gameState.selectedCategories,
        gameState.difficultyFilter,
        gameState.noRepeat,
        seenSet
      );
      if (nextQ) {
        setGameState((prev) => ({
          ...prev,
          currentQuestion: nextQ,
          isAnswerRevealed: false,
          isHintRevealed: false,
          auctionCounter: 0,
        }));
      }
    }
  }, [
    gameState.screen,
    gameState.currentQuestion,
    gameState.activeCategory,
    gameState.selectedCategories,
    gameState.difficultyFilter,
    gameState.noRepeat,
    currentPoolStats.available.length,
    pickRandomQuestion,
    seenSet,
  ]);

  // Player management handlers
  const handleAddPlayer = (name: string, colorIndex?: number) => {
    setGameState((prev) => {
      if (prev.players.length >= 12) return prev;
      const palette =
        TEAM_PALETTE[
          colorIndex !== undefined
            ? colorIndex % TEAM_PALETTE.length
            : prev.players.length % TEAM_PALETTE.length
        ];
      const newPlayer: Player = {
        id: createPlayerId(),
        name,
        score: 0,
        yellowCards: 0,
        redCards: 0,
        color: palette.color,
        avatar: palette.avatar,
      };
      return {
        ...prev,
        players: [...prev.players, newPlayer],
      };
    });
  };

  const handleUpdatePlayer = (id: string, updates: Partial<Player>) => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }));
  };

  const handleRemovePlayer = (id: string) => {
    setGameState((prev) => {
      if (prev.players.length <= 2) return prev;
      return {
        ...prev,
        players: prev.players.filter((p) => p.id !== id),
      };
    });
  };

  const handleResetScores = () => {
    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => ({
        ...p,
        score: 0,
        yellowCards: 0,
        redCards: 0,
      })),
      questionsPlayedCount: 0,
    }));
  };

  // Setup category & filter handlers
  const handleToggleCategory = (cat: CategoryName) => {
    setGameState((prev) => {
      const exists = prev.selectedCategories.includes(cat);
      const nextSelected = exists
        ? prev.selectedCategories.filter((c) => c !== cat)
        : [...prev.selectedCategories, cat];

      const nextActive =
        prev.activeCategory !== 'random' && !nextSelected.includes(prev.activeCategory)
          ? 'random'
          : prev.activeCategory;

      return {
        ...prev,
        selectedCategories: nextSelected,
        activeCategory: nextActive,
      };
    });
  };

  const handleSelectAllCategories = () => {
    setGameState((prev) => ({
      ...prev,
      selectedCategories: [...ALL_CATEGORY_NAMES],
    }));
  };

  const handleClearAllCategories = () => {
    setGameState((prev) => ({
      ...prev,
      selectedCategories: [],
      activeCategory: 'random',
    }));
  };

  const handleChangeDifficulty = (diff: DifficultyFilter) => {
    setGameState((prev) => {
      const nextQ =
        prev.screen === 'game'
          ? pickRandomQuestion(
              prev.activeCategory,
              prev.selectedCategories,
              diff,
              prev.noRepeat,
              seenSet
            )
          : prev.currentQuestion;
      return {
        ...prev,
        difficultyFilter: diff,
        currentQuestion: nextQ,
        isAnswerRevealed: false,
        isHintRevealed: false,
        auctionCounter: 0,
      };
    });
    if (gameState.screen === 'game') {
      setTimerResetSignal((n) => n + 1);
    }
  };

  const handleSelectActiveCategory = (cat: CategoryName | 'random') => {
    setGameState((prev) => {
      const nextQ = pickRandomQuestion(
        cat,
        prev.selectedCategories,
        prev.difficultyFilter,
        prev.noRepeat,
        seenSet,
        prev.currentQuestion?.uid
      );
      return {
        ...prev,
        activeCategory: cat,
        currentQuestion: nextQ,
        isAnswerRevealed: false,
        isHintRevealed: false,
        auctionCounter: 0,
      };
    });
    setTimerResetSignal((n) => n + 1);
  };

  const handleStartGame = (resumeIfActive: boolean) => {
    if (resumeIfActive) {
      setGameState((prev) => ({
        ...prev,
        screen: 'game',
      }));
      return;
    }

    const firstQuestion = pickRandomQuestion(
      gameState.activeCategory,
      gameState.selectedCategories,
      gameState.difficultyFilter,
      gameState.noRepeat,
      seenSet
    );

    setGameState((prev) => ({
      ...prev,
      screen: 'game',
      players: prev.players.map((p) => ({
        ...p,
        score: 0,
        yellowCards: 0,
        redCards: 0,
      })),
      currentQuestion: firstQuestion,
      isAnswerRevealed: false,
      isHintRevealed: false,
      questionsPlayedCount: 0,
      auctionCounter: 0,
    }));
    setTimerResetSignal((n) => n + 1);
  };

  // Active Game Question Controls
  const handleNextQuestion = () => {
    const current = gameState.currentQuestion;
    let nextSeenIds = seenIds;

    if (current && !seenSet.has(current.uid)) {
      nextSeenIds = [...seenIds, current.uid];
      setSeenIds(nextSeenIds);
    }

    const updatedSeenSet = new Set(nextSeenIds);
    const nextQ = pickRandomQuestion(
      gameState.activeCategory,
      gameState.selectedCategories,
      gameState.difficultyFilter,
      gameState.noRepeat,
      updatedSeenSet,
      current?.uid
    );

    setGameState((prev) => ({
      ...prev,
      currentQuestion: nextQ,
      isAnswerRevealed: false,
      isHintRevealed: false,
      questionsPlayedCount: prev.questionsPlayedCount + (current ? 1 : 0),
      auctionCounter: 0,
    }));
    setTimerResetSignal((n) => n + 1);
  };

  const handleSkipQuestion = () => {
    const nextQ = pickRandomQuestion(
      gameState.activeCategory,
      gameState.selectedCategories,
      gameState.difficultyFilter,
      gameState.noRepeat,
      seenSet,
      gameState.currentQuestion?.uid
    );

    setGameState((prev) => ({
      ...prev,
      currentQuestion: nextQ,
      isAnswerRevealed: false,
      isHintRevealed: false,
      auctionCounter: 0,
    }));
    setTimerResetSignal((n) => n + 1);
  };

  // Scoreboard handlers
  const handleAdjustScore = (playerId: string, delta: number) => {
    if (delta > 0) {
      soundEngine.playScoreUp();
    } else if (delta < 0) {
      soundEngine.playScoreDown();
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) =>
        p.id === playerId ? { ...p, score: p.score + delta } : p
      ),
    }));
  };

  const handleIssueCard = (
    playerId: string,
    cardType: 'yellow' | 'red',
    delta: 1 | -1
  ) => {
    const targetPlayer = gameState.players.find((p) => p.id === playerId);
    if (!targetPlayer) return;

    if (delta > 0) {
      soundEngine.playWhistle(cardType === 'red');
      setPenaltyBanner({
        id: `${Date.now()}`,
        playerName: targetPlayer.name,
        type: cardType,
      });
      if (bannerTimerRef.current) {
        window.clearTimeout(bannerTimerRef.current);
      }
      bannerTimerRef.current = window.setTimeout(() => {
        setPenaltyBanner(null);
      }, 2600);
    }

    setGameState((prev) => ({
      ...prev,
      players: prev.players.map((p) => {
        if (p.id !== playerId) return p;
        return {
          ...p,
          yellowCards:
            cardType === 'yellow'
              ? Math.max(0, p.yellowCards + delta)
              : p.yellowCards,
          redCards:
            cardType === 'red' ? Math.max(0, p.redCards + delta) : p.redCards,
        };
      }),
    }));
  };

  // JSON Import handlers
  const handleImportQuestions = (
    newItems: QuestionItem[],
    replaceCategories: boolean
  ) => {
    setCustomQuestions((prev) => {
      const importedCategories = new Set(newItems.map((q) => q.category));
      const base = replaceCategories
        ? prev.filter((q) => !importedCategories.has(q.category))
        : [...prev];

      const map = new Map<string, QuestionItem>();
      base.forEach((q) => map.set(q.uid, q));
      newItems.forEach((q) => map.set(q.uid, q));
      return Array.from(map.values());
    });
  };

  const handleClearCustomQuestions = () => {
    setCustomQuestions([]);
  };

  const handleResetSeenQuestions = () => {
    setSeenIds([]);
    if (gameState.screen === 'game' && !gameState.currentQuestion) {
      const nextQ = pickRandomQuestion(
        gameState.activeCategory,
        gameState.selectedCategories,
        gameState.difficultyFilter,
        gameState.noRepeat,
        new Set()
      );
      setGameState((prev) => ({
        ...prev,
        currentQuestion: nextQ,
        isAnswerRevealed: false,
        isHintRevealed: false,
        auctionCounter: 0,
      }));
    }
  };

  const hasActiveSession =
    gameState.questionsPlayedCount > 0 ||
    gameState.players.some(
      (p) => p.score !== 0 || p.yellowCards > 0 || p.redCards > 0
    );

  const leaderInfo = useMemo(() => {
    if (gameState.players.length === 0) return null;
    const sorted = [...gameState.players].sort((a, b) => b.score - a.score);
    const top = sorted[0];
    return top && top.score > 0 ? top : null;
  }, [gameState.players]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100" dir="rtl" lang="ar">
      {gameState.screen === 'setup' && (
        <SetupScreen
          players={gameState.players}
          selectedCategories={gameState.selectedCategories}
          difficultyFilter={gameState.difficultyFilter}
          noRepeat={gameState.noRepeat}
          allQuestions={allQuestions}
          seenIds={seenIds}
          hasActiveSession={hasActiveSession}
          onAddPlayer={handleAddPlayer}
          onUpdatePlayer={handleUpdatePlayer}
          onRemovePlayer={handleRemovePlayer}
          onResetScores={handleResetScores}
          onToggleCategory={handleToggleCategory}
          onSelectAllCategories={handleSelectAllCategories}
          onClearAllCategories={handleClearAllCategories}
          onChangeDifficulty={handleChangeDifficulty}
          onToggleNoRepeat={() =>
            setGameState((prev) => ({ ...prev, noRepeat: !prev.noRepeat }))
          }
          onResetSeenQuestions={handleResetSeenQuestions}
          onOpenImportModal={() => setIsImportModalOpen(true)}
          onStartGame={handleStartGame}
        />
      )}

      {gameState.screen === 'game' && (
        <div className="min-h-screen flex flex-col bg-[#0F172A] bg-casino-radial">
          <TopBar
            selectedCategories={gameState.selectedCategories}
            activeCategory={gameState.activeCategory}
            difficultyFilter={gameState.difficultyFilter}
            currentQuestion={gameState.currentQuestion}
            unseenRemaining={currentPoolStats.available.length}
            totalMatching={currentPoolStats.matching.length}
            noRepeat={gameState.noRepeat}
            soundMuted={gameState.soundMuted}
            timerResetSignal={timerResetSignal}
            onSelectActiveCategory={handleSelectActiveCategory}
            onChangeDifficulty={handleChangeDifficulty}
            onToggleMute={() =>
              setGameState((prev) => ({ ...prev, soundMuted: !prev.soundMuted }))
            }
            onOpenImportModal={() => setIsImportModalOpen(true)}
            onBackToSetup={() =>
              setGameState((prev) => ({ ...prev, screen: 'setup' }))
            }
            onEndGame={() =>
              setGameState((prev) => ({ ...prev, screen: 'podium' }))
            }
          />

          <main className="flex-1 mx-auto w-full max-w-7xl px-2.5 sm:px-5 pt-3 pb-24 lg:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
              {/* Zone 2: Center Stage Question Card (+ Mobile Quick-Score Strip) */}
              <div
                className={`${
                  mobileTab === 'question' ? 'block' : 'hidden lg:block'
                } lg:col-span-7 xl:col-span-8 space-y-3`}
              >
                <QuestionCard
                  question={gameState.currentQuestion}
                  isAnswerRevealed={gameState.isAnswerRevealed}
                  isHintRevealed={gameState.isHintRevealed}
                  auctionCounter={gameState.auctionCounter}
                  activeCategory={gameState.activeCategory}
                  onRevealAnswer={() =>
                    setGameState((prev) => ({
                      ...prev,
                      isAnswerRevealed: !prev.isAnswerRevealed,
                    }))
                  }
                  onToggleHint={() =>
                    setGameState((prev) => ({
                      ...prev,
                      isHintRevealed: !prev.isHintRevealed,
                    }))
                  }
                  onNextQuestion={handleNextQuestion}
                  onSkipQuestion={handleSkipQuestion}
                  onUpdateAuctionCounter={(delta) =>
                    setGameState((prev) => ({
                      ...prev,
                      auctionCounter: Math.max(0, prev.auctionCounter + delta),
                    }))
                  }
                  onResetSeenQuestions={handleResetSeenQuestions}
                  onSwitchToRandom={() => handleSelectActiveCategory('random')}
                />

                {/* Mobile Instant Quick-Score Strip (1-tap scoring right under QuestionCard) */}
                <div className="lg:hidden rounded-2xl border border-slate-700/80 bg-[#1E293B] p-3 space-y-2 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-200 flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>نقاط سريعة للفرق</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setMobileTab('scoreboard')}
                      className="text-[11px] font-extrabold text-amber-300 hover:text-amber-200"
                    >
                      لوحة النقاط الكاملة ({gameState.players.length}) ↗
                    </button>
                  </div>

                  {penaltyBanner && (
                    <div
                      key={penaltyBanner.id}
                      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-black animate-shake ${
                        penaltyBanner.type === 'red'
                          ? 'border-red-500 bg-red-500/20 text-red-200'
                          : 'border-yellow-400 bg-yellow-500/20 text-yellow-200'
                      }`}
                    >
                      <span>{penaltyBanner.type === 'red' ? '🟥' : '🟨'}</span>
                      <span>
                        {penaltyBanner.type === 'red' ? 'كارت أحمر لـ' : 'كارت أصفر لـ'}{' '}
                        {penaltyBanner.playerName}
                      </span>
                    </div>
                  )}

                  <div className="space-y-1.5 max-h-[225px] overflow-y-auto">
                    {gameState.players.map((player) => {
                      const isLeader =
                        leaderInfo !== null && player.score === leaderInfo.score;
                      return (
                        <div
                          key={player.id}
                          className={`flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 ${
                            isLeader
                              ? 'border-amber-500/50 bg-amber-500/10'
                              : 'border-slate-700/70 bg-slate-900/65'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <span className="text-base shrink-0">
                              {player.avatar}
                            </span>
                            <span className="truncate text-xs font-extrabold text-white">
                              {player.name}
                            </span>
                            {isLeader && (
                              <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                            )}
                            <span
                              className={`mr-auto rounded-lg px-2 py-0.5 text-xs font-black tabular-nums ${
                                player.score > 0
                                  ? 'bg-emerald-500/15 text-emerald-300'
                                  : player.score < 0
                                  ? 'bg-red-500/15 text-red-300'
                                  : 'bg-slate-800 text-slate-200'
                              }`}
                              dir="ltr"
                            >
                              {player.score}
                            </span>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleAdjustScore(player.id, 1)}
                              dir="ltr"
                              className="min-h-[38px] min-w-[38px] rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-xs font-black text-emerald-300 active:scale-95 transition"
                            >
                              +1
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustScore(player.id, 2)}
                              dir="ltr"
                              className="min-h-[38px] min-w-[38px] rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-xs font-black text-emerald-300 active:scale-95 transition"
                            >
                              +2
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdjustScore(player.id, -1)}
                              dir="ltr"
                              className="min-h-[38px] min-w-[34px] rounded-lg border border-red-500/40 bg-red-500/15 text-xs font-black text-red-300 active:scale-95 transition"
                            >
                              -1
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleIssueCard(player.id, 'yellow', 1)
                              }
                              aria-label={`كارت أصفر لـ ${player.name}`}
                              className="min-h-[38px] min-w-[30px] inline-flex items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-500/10 active:scale-95 transition"
                            >
                              <span className="h-3.5 w-2.5 rounded-[2px] bg-yellow-400" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleIssueCard(player.id, 'red', 1)
                              }
                              aria-label={`كارت أحمر لـ ${player.name}`}
                              className="min-h-[38px] min-w-[30px] inline-flex items-center justify-center rounded-lg border border-red-500/40 bg-red-500/10 active:scale-95 transition"
                            >
                              <span className="h-3.5 w-2.5 rounded-[2px] bg-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Zone 3: Full Scoreboard */}
              <div
                className={`${
                  mobileTab === 'scoreboard' ? 'block' : 'hidden lg:block'
                } lg:col-span-5 xl:col-span-4 lg:sticky lg:top-36`}
              >
                <Scoreboard
                  players={gameState.players}
                  sortByRank={gameState.sortByRank}
                  penaltyBanner={penaltyBanner}
                  onToggleSortOrder={() =>
                    setGameState((prev) => ({
                      ...prev,
                      sortByRank: !prev.sortByRank,
                    }))
                  }
                  onAdjustScore={handleAdjustScore}
                  onIssueCard={handleIssueCard}
                  onAddPlayerMidGame={(name) => handleAddPlayer(name)}
                />
              </div>
            </div>
          </main>

          {/* Fixed Mobile Bottom Navigation Bar */}
          <nav
            aria-label="التنقل السفلي"
            className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-700/90 bg-[#0F172A]/95 backdrop-blur-md px-2 pt-1.5 pb-safe shadow-2xl"
          >
            <div className="grid grid-cols-4 gap-1.5 max-w-xl mx-auto">
              <button
                type="button"
                onClick={() => setMobileTab('question')}
                className={`min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-black transition ${
                  mobileTab === 'question'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>السؤال</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileTab('scoreboard')}
                className={`min-h-[48px] relative flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-black transition ${
                  mobileTab === 'scoreboard'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                    : 'text-slate-300 hover:bg-slate-800/80'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="truncate max-w-full">
                  {leaderInfo
                    ? `النقاط (${leaderInfo.score})`
                    : `النقاط (${gameState.players.length})`}
                </span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setGameState((prev) => ({ ...prev, screen: 'setup' }))
                }
                className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1 text-[11px] font-extrabold text-slate-300 hover:bg-slate-800/80 transition"
              >
                <Settings className="w-4 h-4" />
                <span>الإعدادات</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setGameState((prev) => ({ ...prev, screen: 'podium' }))
                }
                className="min-h-[48px] flex flex-col items-center justify-center gap-0.5 rounded-xl bg-red-500/15 border border-red-500/35 px-2 py-1 text-[11px] font-black text-red-300 hover:bg-red-500 hover:text-white transition"
              >
                <Flag className="w-4 h-4" />
                <span>إنهاء</span>
              </button>
            </div>
          </nav>
        </div>
      )}

      {gameState.screen === 'podium' && (
        <PodiumScreen
          players={gameState.players}
          questionsPlayedCount={gameState.questionsPlayedCount}
          onPlayAgainSamePlayers={() => handleStartGame(false)}
          onBackToSetup={() =>
            setGameState((prev) => ({ ...prev, screen: 'setup' }))
          }
          onResumeGame={() =>
            setGameState((prev) => ({ ...prev, screen: 'game' }))
          }
        />
      )}

      <ImportJsonModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        allQuestions={allQuestions}
        customQuestionsCount={customQuestions.length}
        onImportQuestions={handleImportQuestions}
        onClearCustomQuestions={handleClearCustomQuestions}
      />
    </div>
  );
}

export default App;

