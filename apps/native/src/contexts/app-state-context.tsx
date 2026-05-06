import { getItemAsync, setItemAsync } from "expo-secure-store";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cancelDailyReminder,
  scheduleDailyReminder,
} from "@/lib/notifications";

const STORAGE_KEY = "ronin-app-state-v1";
const EMBERS_PER_RANK = 300;
const RANK_TITLES = [
  "Initiate",
  "Apprentice",
  "Warrior",
  "Guardian",
  "Champion",
  "Master",
  "Legend",
];

interface Trial {
  id: string;
  title: string;
  description: string;
  days: number;
}

const TRIAL_POOL: readonly Trial[] = [
  {
    id: "cold-shower",
    title: "cold shower.",
    description: "Embrace the voluntary discomfort. Rinse the spirit.",
    days: 7,
  },
  {
    id: "silent-hour",
    title: "silent hour.",
    description: "One hour of complete silence. No phone. No words.",
    days: 7,
  },
  {
    id: "early-rise",
    title: "early rise.",
    description: "Wake before six. Greet the dawn before the world stirs.",
    days: 7,
  },
  {
    id: "mindful-fast",
    title: "mindful fast.",
    description: "Sixteen hours without food. Sharpen the will, not the plate.",
    days: 7,
  },
  {
    id: "deep-read",
    title: "deep read.",
    description: "Thirty minutes with a book. No screens. No interruptions.",
    days: 7,
  },
  {
    id: "no-complaints",
    title: "no complaints.",
    description: "A full day without complaint. Observe, accept, move forward.",
    days: 7,
  },
  {
    id: "walk-in-silence",
    title: "walk in silence.",
    description: "Thirty minutes walking. No headphones. Only your thoughts.",
    days: 7,
  },
] as const;

interface Virtue {
  id: "wisdom" | "courage" | "justice" | "temperance";
  name: string;
  description: string;
}

// Indexed by Date.getDay(): 0=Sun ... 6=Sat.
// Mo/Fr → Wisdom, Tu/Sa → Courage, We/Su → Justice, Th → Temperance.
const VIRTUES: readonly Virtue[] = [
  { id: "justice", name: "Justice", description: "Help someone today." },
  { id: "wisdom", name: "Wisdom", description: "Learn something new today." },
  {
    id: "courage",
    name: "Courage",
    description: "Do something uncomfortable.",
  },
  { id: "justice", name: "Justice", description: "Help someone today." },
  {
    id: "temperance",
    name: "Temperance",
    description: "Practice restraint today.",
  },
  { id: "wisdom", name: "Wisdom", description: "Learn something new today." },
  {
    id: "courage",
    name: "Courage",
    description: "Do something uncomfortable.",
  },
] as const;

type ReflectionKind = "morning" | "evening";

type PracticeIconName =
  | "wind"
  | "skull"
  | "scales"
  | "moon"
  | "bolt"
  | "pencil"
  | "shield";

type PracticeCategory = "virtue" | "body" | "mind" | "stillness";

interface Practice {
  id: string;
  title: string;
  description: string;
  icon: PracticeIconName;
  embers: 10 | 15 | 20 | 25 | 30;
  category: PracticeCategory;
  /**
   * Tapping this practice opens the evening reflection sheet rather than
   * toggling completion directly — completion follows the reflection state.
   */
  opensReflection?: boolean;
}

const PRACTICE_POOL: readonly Practice[] = [
  // Virtue
  {
    id: "wisdom",
    title: "Wisdom",
    description: "Learn one thing today. Write it down.",
    icon: "scales",
    embers: 15,
    category: "virtue",
  },
  {
    id: "courage",
    title: "Courage",
    description: "Do the thing you avoid.",
    icon: "scales",
    embers: 25,
    category: "virtue",
  },
  {
    id: "justice",
    title: "Justice",
    description: "Do one good thing today.",
    icon: "scales",
    embers: 15,
    category: "virtue",
  },
  // Body
  {
    id: "cold_shower",
    title: "Cold Shower",
    description: "Stand in the cold. Don't flinch.",
    icon: "wind",
    embers: 25,
    category: "body",
  },
  {
    id: "pushups",
    title: "20 Push-Ups",
    description: "Build the temple.",
    icon: "bolt",
    embers: 15,
    category: "body",
  },
  {
    id: "fast_16h",
    title: "16h Fast",
    description: "Hunger sharpens.",
    icon: "shield",
    embers: 30,
    category: "body",
  },
  // Mind
  {
    id: "read_30",
    title: "Read 30 min",
    description: "No screens. Pages only.",
    icon: "pencil",
    embers: 20,
    category: "mind",
  },
  {
    id: "hardest_first",
    title: "Hardest First",
    description: "Do the worst task at sunrise.",
    icon: "bolt",
    embers: 30,
    category: "mind",
  },
  {
    id: "no_phone_hour",
    title: "No Phone Hour",
    description: "One hour. No screen. No exception.",
    icon: "shield",
    embers: 20,
    category: "mind",
  },
  // Stillness
  {
    id: "silence",
    title: "5 min Silence",
    description: "Sit. Breathe. Observe.",
    icon: "wind",
    embers: 10,
    category: "stillness",
  },
  {
    id: "gratitude",
    title: "Gratitude",
    description: "Three things. No more, no less.",
    icon: "moon",
    embers: 10,
    category: "stillness",
  },
  {
    id: "vision_practice",
    title: "Vision Practice",
    description: "Imagine giving everything. See the life unfold.",
    icon: "skull",
    embers: 15,
    category: "stillness",
  },
] as const;

const PRACTICES_PER_DAY = 4;

function findPractice(id: string): Practice | undefined {
  return PRACTICE_POOL.find((p) => p.id === id);
}

interface DailyPractices {
  date: string;
  selectedIds: string[];
  completedIds: string[];
}

const DEFAULT_PRACTICES: DailyPractices = {
  date: "",
  selectedIds: [],
  completedIds: [],
};

interface DayData {
  reflected: boolean;
  reflectionText: string;
  eveningReflected: boolean;
  eveningReflectionText: string;
  trialCompleted: boolean;
  sealed: boolean;
  // Snapshot of practices completed on this day (silence + mementoMori +
  // virtue). Evening reflection isn't counted here because eveningReflected
  // already represents it. Persisting this lets the 66-day total stay
  // accurate after midnight when dailyPractices resets.
  practicesDone: number;
}

const DEFAULT_DAY: DayData = {
  reflected: false,
  reflectionText: "",
  eveningReflected: false,
  eveningReflectionText: "",
  trialCompleted: false,
  sealed: false,
  practicesDone: 0,
};

const HABIT_AUTOMATICITY_DAYS = 66;

function countActiveDays(days: Record<string, DayData>): number {
  let count = 0;
  for (const day of Object.values(days)) {
    if (
      day.reflected ||
      day.eveningReflected ||
      day.trialCompleted ||
      day.sealed ||
      day.practicesDone > 0
    ) {
      count++;
    }
  }
  return count;
}

interface FenrirData {
  rank: number;
  embersTowardNextRank: number;
  totalTrials: number;
  activeTrialId: string | null;
  trialStartDate: string | null;
  currentDayInTrial: number;
  rerollUsed: boolean;
}

interface AppStateData {
  hasOnboarded: boolean;
  userName: string;
  userInitialReason: string | null;
  userInitialReasonDate: string | null;
  needsWhyRewrite: boolean;
  reminderTime: string;
  reminderEnabled: boolean;
  streak: number;
  days: Record<string, DayData>;
  fenrir: FenrirData;
  dailyPractices: DailyPractices;
  // ID of the trial whose card back was last revealed. null means never
  // revealed. Compared against state.fenrir.activeTrialId to decide whether
  // to render the card flipped on mount — picking a new trial naturally
  // un-reveals the card without an explicit reset.
  trialCardRevealedTrialId: string | null;
}

const DEFAULT_STATE: AppStateData = {
  hasOnboarded: false,
  userName: "Warrior",
  userInitialReason: null,
  userInitialReasonDate: null,
  needsWhyRewrite: false,
  reminderTime: "08:00",
  reminderEnabled: true,
  streak: 0,
  days: {},
  fenrir: {
    rank: 1,
    embersTowardNextRank: 0,
    totalTrials: 0,
    activeTrialId: null,
    trialStartDate: null,
    currentDayInTrial: 1,
    rerollUsed: false,
  },
  dailyPractices: DEFAULT_PRACTICES,
  trialCardRevealedTrialId: null,
};

interface RollingStats {
  completed: number;
  window: number;
  pct: number;
}

interface AppStateContextType {
  isLoaded: boolean;
  state: AppStateData;
  activeTrial: Trial | null;
  todaysPractices: DailyPractices;
  todaysVirtue: Virtue;
  rollingStats: RollingStats;
  totalActiveDays: number;
  completeOnboarding: () => void;
  completeReflection: (text: string) => void;
  completeEveningReflection: (text: string) => void;
  editReflection: (
    dateKey: string,
    text: string,
    kind?: ReflectionKind
  ) => void;
  deleteReflection: (dateKey: string, kind?: ReflectionKind) => void;
  completeTrial: () => void;
  selectTrial: (id: string, opts?: { reroll?: boolean }) => void;
  togglePractice: (id: string) => void;
  selectTodaysPractices: (ids: string[]) => void;
  sealDay: () => void;
  resetProgress: () => void;
  setUserName: (name: string) => void;
  setReminderTime: (time: string) => void;
  setReminderEnabled: (enabled: boolean) => void;
  setUserInitialReason: (text: string) => void;
  clearUserInitialReason: () => void;
  clearNeedsWhyRewrite: () => void;
  isTrialCardRevealed: boolean;
  markTrialCardRevealed: (trialId: string) => void;
}

const AppStateContext = createContext<AppStateContextType | undefined>(
  undefined
);

function toDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const MS_PER_DAY = 86_400_000;

// Number of full local-midnight boundaries crossed between two YYYY-MM-DD keys.
// Same day → 0; next day → 1. Uses local midnight to match toDateKey().
function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  const from = new Date(fy, fm - 1, fd).getTime();
  const to = new Date(ty, tm - 1, td).getTime();
  return Math.round((to - from) / MS_PER_DAY);
}

// Tolerant streak: counts sealed days going backwards from today, but only
// breaks the run after 3 consecutive missed days. Up to 2 gap days within a
// run still count as a continuing streak (only sealed days are counted).
const STREAK_MAX_GAP = 3;
const STREAK_LOOKBACK_LIMIT = 365;

function calculateStreak(days: Record<string, DayData>): number {
  let streak = 0;
  let consecutiveMissed = 0;
  const checkDate = new Date();
  for (let i = 0; i < STREAK_LOOKBACK_LIMIT; i++) {
    const key = toDateKey(checkDate);
    if (days[key]?.sealed) {
      streak++;
      consecutiveMissed = 0;
    } else {
      consecutiveMissed++;
      if (consecutiveMissed >= STREAK_MAX_GAP) {
        break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

function rollingCompletion(
  days: Record<string, DayData>,
  windowDays = 7
): { completed: number; window: number; pct: number } {
  let completed = 0;
  const checkDate = new Date();
  for (let i = 0; i < windowDays; i++) {
    if (days[toDateKey(checkDate)]?.sealed) {
      completed++;
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return {
    completed,
    window: windowDays,
    pct: Math.round((completed / windowDays) * 100),
  };
}

type LegacyDailyPractices = Partial<DailyPractices> & {
  silence?: boolean;
  mementoMori?: boolean;
  virtue?: boolean;
  eveningReflection?: boolean;
};

function migratePractices(loaded: LegacyDailyPractices): DailyPractices {
  if (Array.isArray(loaded.selectedIds)) {
    return {
      date: loaded.date ?? "",
      selectedIds: loaded.selectedIds,
      completedIds: Array.isArray(loaded.completedIds)
        ? loaded.completedIds
        : [],
    };
  }
  // Legacy shape: four hard-coded practices with boolean flags. Map them onto
  // the new selection model so old users don't lose today's progress.
  const hasLegacy =
    typeof loaded.silence === "boolean" ||
    typeof loaded.mementoMori === "boolean" ||
    typeof loaded.virtue === "boolean" ||
    typeof loaded.eveningReflection === "boolean";
  if (!hasLegacy) {
    return { ...DEFAULT_PRACTICES };
  }
  const legacyVirtueId = VIRTUES[new Date().getDay()].id;
  // Evening reflection used to be a 4th pseudo-practice; it's no longer in
  // the pool, so legacy users land with three picked and need to pick a
  // reflection-category practice (gratitude / negative_visualization) on
  // their next visit. eveningReflection completion stays in days[].eveningReflected.
  const selectedIds = ["silence", "memento_mori", legacyVirtueId];
  const completedIds: string[] = [];
  if (loaded.silence) {
    completedIds.push("silence");
  }
  if (loaded.mementoMori) {
    completedIds.push("memento_mori");
  }
  if (loaded.virtue) {
    completedIds.push(legacyVirtueId);
  }
  return {
    date: loaded.date ?? toDateKey(),
    selectedIds,
    completedIds,
  };
}

function mergeWithDefaults(loaded: Partial<AppStateData>): AppStateData {
  const days: Record<string, DayData> = {};
  for (const [key, day] of Object.entries(loaded.days ?? {})) {
    days[key] = { ...DEFAULT_DAY, ...day };
  }

  const loadedFenrir = (loaded.fenrir ?? {}) as Partial<FenrirData> & {
    activeTrialIndex?: number;
  };
  // Migrate legacy `activeTrialIndex` (numeric, auto-rotating) to the new
  // `activeTrialId` model. If the user already had a trial in flight, keep
  // them on it instead of dropping them back to the selection screen.
  const fenrir: FenrirData = { ...DEFAULT_STATE.fenrir, ...loadedFenrir };
  if (
    loadedFenrir.activeTrialId === undefined &&
    typeof loadedFenrir.activeTrialIndex === "number"
  ) {
    const legacy = TRIAL_POOL[loadedFenrir.activeTrialIndex];
    fenrir.activeTrialId = legacy?.id ?? null;
    fenrir.trialStartDate = fenrir.activeTrialId ? toDateKey() : null;
  }

  // Drop the legacy per-day trial card field. It was replaced with the
  // per-trial trialCardRevealedTrialId; existing installs that have it land
  // on the new default (null) and re-flip once for their current trial.
  const { trialCardRevealedDate: _trialCardRevealedDate, ...loadedSansLegacy } =
    loaded as Partial<AppStateData> & { trialCardRevealedDate?: unknown };

  return {
    ...DEFAULT_STATE,
    ...loadedSansLegacy,
    fenrir,
    days,
    dailyPractices: migratePractices(
      (loaded.dailyPractices ?? {}) as LegacyDailyPractices
    ),
  };
}

function adjustEmbers(
  fenrir: FenrirData,
  delta: number
): Pick<FenrirData, "rank" | "embersTowardNextRank"> {
  const totalBefore =
    (fenrir.rank - 1) * EMBERS_PER_RANK + fenrir.embersTowardNextRank;
  const totalAfter = Math.max(0, totalBefore + delta);
  return {
    rank: Math.max(1, Math.floor(totalAfter / EMBERS_PER_RANK) + 1),
    embersTowardNextRank: totalAfter % EMBERS_PER_RANK,
  };
}

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppStateData>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    getItemAsync(STORAGE_KEY)
      .then((json) => {
        if (json) {
          setState(mergeWithDefaults(JSON.parse(json)));
        }
      })
      .catch((_err) => {
        // storage unavailable — continue with in-memory defaults
      })
      .finally(() => {
        setIsLoaded(true);
      });
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setItemAsync(STORAGE_KEY, JSON.stringify(state)).catch((_err) => {
      // ignore write failures — state lives in memory
    });
  }, [state, isLoaded]);

  // Auto-advance the active trial's day counter when the date rolls over.
  // Without this, a user who skipped tapping "Complete Trial" yesterday would
  // still see Day II this morning even though the calendar moved on. Rolling
  // window: progress is always (today - trialStartDate) + 1, even on missed
  // days. If the last day passed, finish the trial so the user picks anew.
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    const { activeTrialId, trialStartDate, currentDayInTrial } = state.fenrir;
    if (!(activeTrialId && trialStartDate)) {
      return;
    }
    const trial = TRIAL_POOL.find((t) => t.id === activeTrialId);
    if (!trial) {
      return;
    }
    const today = toDateKey();
    const expectedDay = daysBetween(trialStartDate, today) + 1;
    if (expectedDay <= currentDayInTrial) {
      return;
    }
    if (expectedDay > trial.days) {
      // Trial window has fully elapsed — clear so the user re-picks.
      setState((prev) => ({
        ...prev,
        fenrir: {
          ...prev.fenrir,
          activeTrialId: null,
          trialStartDate: null,
          currentDayInTrial: 1,
          rerollUsed: false,
        },
      }));
      return;
    }
    setState((prev) => ({
      ...prev,
      fenrir: { ...prev.fenrir, currentDayInTrial: expectedDay },
    }));
  }, [
    isLoaded,
    state.fenrir.activeTrialId,
    state.fenrir.trialStartDate,
    state.fenrir.currentDayInTrial,
  ]);

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

  const completeReflection = useCallback((text: string) => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? DEFAULT_DAY;
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...existing, reflected: true, reflectionText: text },
        },
      };
    });
  }, []);

  const completeEveningReflection = useCallback((text: string) => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? DEFAULT_DAY;
      // Evening reflection is its own dedicated flow now — no longer a pool
      // practice — so it just records the entry. Practice embers come from
      // the four selected practices, not this flow.
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: {
            ...existing,
            eveningReflected: true,
            eveningReflectionText: text,
          },
        },
      };
    });
  }, []);

  const editReflection = useCallback(
    (dateKey: string, text: string, kind: ReflectionKind = "morning") => {
      setState((prev) => {
        const existing = prev.days[dateKey];
        if (!existing) {
          return prev;
        }
        const updated: DayData =
          kind === "morning"
            ? { ...existing, reflectionText: text }
            : { ...existing, eveningReflectionText: text };
        return {
          ...prev,
          days: { ...prev.days, [dateKey]: updated },
        };
      });
    },
    []
  );

  const deleteReflection = useCallback(
    (dateKey: string, kind: ReflectionKind = "morning") => {
      setState((prev) => {
        const existing = prev.days[dateKey];
        if (!existing) {
          return prev;
        }
        const updated: DayData =
          kind === "morning"
            ? { ...existing, reflected: false, reflectionText: "" }
            : {
                ...existing,
                eveningReflected: false,
                eveningReflectionText: "",
              };
        return {
          ...prev,
          days: { ...prev.days, [dateKey]: updated },
        };
      });
    },
    []
  );

  const completeTrial = useCallback(() => {
    const key = toDateKey();
    setState((prev) => {
      if (!prev.fenrir.activeTrialId) {
        return prev;
      }
      const existing = prev.days[key] ?? DEFAULT_DAY;
      const newTotalTrials = prev.fenrir.totalTrials + 1;

      const trial = TRIAL_POOL.find((t) => t.id === prev.fenrir.activeTrialId);
      const trialDays = trial?.days ?? 7;
      const finishedTrial = prev.fenrir.currentDayInTrial >= trialDays;

      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...existing, trialCompleted: true },
        },
        fenrir: {
          ...prev.fenrir,
          totalTrials: newTotalTrials,
          ...adjustEmbers(prev.fenrir, 50),
          // Finishing the last day clears the active trial so the user picks
          // the next one deliberately rather than auto-rotating.
          activeTrialId: finishedTrial ? null : prev.fenrir.activeTrialId,
          trialStartDate: finishedTrial ? null : prev.fenrir.trialStartDate,
          currentDayInTrial: finishedTrial
            ? 1
            : prev.fenrir.currentDayInTrial + 1,
          rerollUsed: finishedTrial ? false : prev.fenrir.rerollUsed,
        },
      };
    });
  }, []);

  const selectTrial = useCallback((id: string, opts?: { reroll?: boolean }) => {
    const today = toDateKey();
    setState((prev) => {
      if (opts?.reroll && prev.fenrir.rerollUsed) {
        // Already rerolled this trial — UI should hide the gear, but guard
        // here too so a stale callback can't slip through.
        return prev;
      }
      return {
        ...prev,
        fenrir: {
          ...prev.fenrir,
          activeTrialId: id,
          trialStartDate: today,
          currentDayInTrial: 1,
          rerollUsed: Boolean(opts?.reroll),
        },
      };
    });
  }, []);

  const togglePractice = useCallback((id: string) => {
    setState((prev) => {
      const today = toDateKey();
      const practices =
        prev.dailyPractices.date === today
          ? prev.dailyPractices
          : { ...DEFAULT_PRACTICES, date: today };
      // Only practices the user picked today can be toggled.
      if (!practices.selectedIds.includes(id)) {
        return prev;
      }
      const practice = findPractice(id);
      if (!practice) {
        return prev;
      }
      // Evening reflection completion is owned by the reflection sheet —
      // toggling it here would sidestep the text entry it requires.
      if (practice.opensReflection) {
        return prev;
      }
      const wasOn = practices.completedIds.includes(id);
      const delta = wasOn ? -practice.embers : practice.embers;
      const nextCompletedIds = wasOn
        ? practices.completedIds.filter((cid) => cid !== id)
        : [...practices.completedIds, id];

      // Persist the count of non-reflection practices into days[today] so the
      // 66-day total stays accurate after midnight (evening reflection is
      // already counted via days[today].eveningReflected).
      const practicesDone = nextCompletedIds.filter((cid) => {
        const p = findPractice(cid);
        return p ? !p.opensReflection : false;
      }).length;
      const existingDay = prev.days[today] ?? DEFAULT_DAY;

      return {
        ...prev,
        dailyPractices: { ...practices, completedIds: nextCompletedIds },
        days: {
          ...prev.days,
          [today]: { ...existingDay, practicesDone },
        },
        fenrir: {
          ...prev.fenrir,
          ...adjustEmbers(prev.fenrir, delta),
        },
      };
    });
  }, []);

  const selectTodaysPractices = useCallback((ids: string[]) => {
    setState((prev) => {
      const today = toDateKey();
      const valid = ids.filter((id) => findPractice(id) !== undefined);
      return {
        ...prev,
        dailyPractices: {
          date: today,
          selectedIds: valid.slice(0, PRACTICES_PER_DAY),
          completedIds: [],
        },
      };
    });
  }, []);

  const sealDay = useCallback(() => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? DEFAULT_DAY;
      const updatedDays = {
        ...prev.days,
        [key]: { ...existing, sealed: true },
      };
      return {
        ...prev,
        days: updatedDays,
        streak: calculateStreak(updatedDays),
        fenrir: {
          ...prev.fenrir,
          embersTowardNextRank: Math.min(
            prev.fenrir.embersTowardNextRank + 10,
            EMBERS_PER_RANK - 1
          ),
        },
      };
    });
  }, []);

  // Reset wipes streaks/trials AND the onboarding fields so the next launch
  // re-runs the full ritual from Screen 1. We do not preserve userName or
  // reminder settings — they are part of what the user re-commits to.
  const resetProgress = useCallback(() => {
    setState(() => ({ ...DEFAULT_STATE }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, userName: name }));
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setState((prev) => ({ ...prev, reminderTime: time }));
  }, []);

  const setReminderEnabled = useCallback((enabled: boolean) => {
    setState((prev) => ({ ...prev, reminderEnabled: enabled }));
  }, []);

  const setUserInitialReason = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      userInitialReason: text,
      userInitialReasonDate: toDateKey(),
      needsWhyRewrite: false,
    }));
  }, []);

  const clearUserInitialReason = useCallback(() => {
    setState((prev) => ({
      ...prev,
      userInitialReason: null,
      userInitialReasonDate: null,
      needsWhyRewrite: true,
    }));
  }, []);

  const clearNeedsWhyRewrite = useCallback(() => {
    setState((prev) =>
      prev.needsWhyRewrite ? { ...prev, needsWhyRewrite: false } : prev
    );
  }, []);

  const markTrialCardRevealed = useCallback((trialId: string) => {
    setState((prev) =>
      prev.trialCardRevealedTrialId === trialId
        ? prev
        : { ...prev, trialCardRevealedTrialId: trialId }
    );
  }, []);

  // Keep the OS-scheduled reminder in sync with reminderTime + enabled. First
  // schedule prompts for permission; later changes silently re-schedule. We
  // skip the welcome screen so the permission dialog doesn't appear before
  // the user has committed to using the app.
  const lastScheduledRef = useRef<string | null>(null);
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    if (!state.hasOnboarded) {
      return;
    }
    const key = state.reminderEnabled ? state.reminderTime : "off";
    if (lastScheduledRef.current === key) {
      return;
    }
    lastScheduledRef.current = key;
    if (state.reminderEnabled) {
      scheduleDailyReminder(state.reminderTime).catch((_err) => {
        // Permission denied or platform unavailable — leave silently.
      });
    } else {
      cancelDailyReminder().catch((_err) => {
        // No scheduled reminder — fine.
      });
    }
  }, [isLoaded, state.hasOnboarded, state.reminderTime, state.reminderEnabled]);

  const activeTrial = useMemo<Trial | null>(
    () =>
      state.fenrir.activeTrialId
        ? (TRIAL_POOL.find((t) => t.id === state.fenrir.activeTrialId) ?? null)
        : null,
    [state.fenrir.activeTrialId]
  );

  const todaysPractices = useMemo<DailyPractices>(() => {
    const today = toDateKey();
    if (state.dailyPractices.date === today) {
      return state.dailyPractices;
    }
    return { ...DEFAULT_PRACTICES, date: today };
  }, [state.dailyPractices]);

  const todaysVirtue = useMemo<Virtue>(() => {
    return VIRTUES[new Date().getDay()];
  }, []);

  const rollingStats = useMemo<RollingStats>(
    () => rollingCompletion(state.days, 7),
    [state.days]
  );

  const totalActiveDays = useMemo(
    () => countActiveDays(state.days),
    [state.days]
  );

  const isTrialCardRevealed = useMemo(
    () =>
      state.fenrir.activeTrialId !== null &&
      state.trialCardRevealedTrialId === state.fenrir.activeTrialId,
    [state.trialCardRevealedTrialId, state.fenrir.activeTrialId]
  );

  const value = useMemo<AppStateContextType>(
    () => ({
      isLoaded,
      state,
      activeTrial,
      todaysPractices,
      todaysVirtue,
      rollingStats,
      totalActiveDays,
      completeOnboarding,
      completeReflection,
      completeEveningReflection,
      editReflection,
      deleteReflection,
      completeTrial,
      selectTrial,
      togglePractice,
      selectTodaysPractices,
      sealDay,
      resetProgress,
      setUserName,
      setReminderTime,
      setReminderEnabled,
      setUserInitialReason,
      clearUserInitialReason,
      clearNeedsWhyRewrite,
      isTrialCardRevealed,
      markTrialCardRevealed,
    }),
    [
      isLoaded,
      state,
      activeTrial,
      todaysPractices,
      todaysVirtue,
      rollingStats,
      totalActiveDays,
      completeOnboarding,
      completeReflection,
      completeEveningReflection,
      editReflection,
      deleteReflection,
      completeTrial,
      selectTrial,
      togglePractice,
      selectTodaysPractices,
      sealDay,
      resetProgress,
      setUserName,
      setReminderTime,
      setReminderEnabled,
      setUserInitialReason,
      clearUserInitialReason,
      clearNeedsWhyRewrite,
      isTrialCardRevealed,
      markTrialCardRevealed,
    ]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error("useAppState must be used within AppStateProvider");
  }
  return context;
}

export function getRankTitle(rank: number): string {
  return `Ronin ${RANK_TITLES[Math.min(rank - 1, RANK_TITLES.length - 1)]}`;
}

export {
  toDateKey,
  TRIAL_POOL,
  VIRTUES,
  HABIT_AUTOMATICITY_DAYS,
  PRACTICE_POOL,
  PRACTICES_PER_DAY,
  findPractice,
};
export type {
  DayData,
  AppStateData,
  Trial,
  Virtue,
  DailyPractices,
  Practice,
  PracticeIconName,
  PracticeCategory,
  ReflectionKind,
};
