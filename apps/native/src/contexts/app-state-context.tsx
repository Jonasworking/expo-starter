import { getItemAsync, setItemAsync } from "expo-secure-store";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

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

interface DayData {
  reflected: boolean;
  reflectionText: string;
  trialCompleted: boolean;
  sealed: boolean;
}

interface FenrirData {
  rank: number;
  embersTowardNextRank: number;
  totalTrials: number;
  activeTrialIndex: number;
  currentDayInTrial: number;
}

interface AppStateData {
  hasOnboarded: boolean;
  userName: string;
  reminderTime: string;
  streak: number;
  days: Record<string, DayData>;
  fenrir: FenrirData;
}

const DEFAULT_STATE: AppStateData = {
  hasOnboarded: false,
  userName: "Warrior",
  reminderTime: "08:00",
  streak: 0,
  days: {},
  fenrir: {
    rank: 1,
    embersTowardNextRank: 0,
    totalTrials: 0,
    activeTrialIndex: 0,
    currentDayInTrial: 1,
  },
};

interface AppStateContextType {
  isLoaded: boolean;
  state: AppStateData;
  activeTrial: Trial;
  completeOnboarding: () => void;
  completeReflection: (text: string) => void;
  completeTrial: () => void;
  sealDay: () => void;
  resetProgress: () => void;
  setUserName: (name: string) => void;
  setReminderTime: (time: string) => void;
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

function calculateStreak(days: Record<string, DayData>): number {
  let streak = 0;
  const checkDate = new Date();

  while (true) {
    const key = toDateKey(checkDate);
    if (days[key]?.sealed) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
}

function mergeWithDefaults(loaded: Partial<AppStateData>): AppStateData {
  return {
    ...DEFAULT_STATE,
    ...loaded,
    fenrir: { ...DEFAULT_STATE.fenrir, ...(loaded.fenrir ?? {}) },
    days: loaded.days ?? {},
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

  const completeOnboarding = useCallback(() => {
    setState((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

  const completeReflection = useCallback((text: string) => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? {
        reflected: false,
        reflectionText: "",
        trialCompleted: false,
        sealed: false,
      };
      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...existing, reflected: true, reflectionText: text },
        },
      };
    });
  }, []);

  const completeTrial = useCallback(() => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? {
        reflected: false,
        reflectionText: "",
        trialCompleted: false,
        sealed: false,
      };
      const newTotalTrials = prev.fenrir.totalTrials + 1;
      const newEmbers = prev.fenrir.embersTowardNextRank + 50;
      const rankUp = newEmbers >= EMBERS_PER_RANK;

      const activeTrial = TRIAL_POOL[prev.fenrir.activeTrialIndex];
      const finishedTrial = prev.fenrir.currentDayInTrial >= activeTrial.days;
      const nextTrialIndex = finishedTrial
        ? (prev.fenrir.activeTrialIndex + 1) % TRIAL_POOL.length
        : prev.fenrir.activeTrialIndex;
      const nextDayInTrial = finishedTrial
        ? 1
        : prev.fenrir.currentDayInTrial + 1;

      return {
        ...prev,
        days: {
          ...prev.days,
          [key]: { ...existing, trialCompleted: true },
        },
        fenrir: {
          ...prev.fenrir,
          totalTrials: newTotalTrials,
          rank: rankUp ? prev.fenrir.rank + 1 : prev.fenrir.rank,
          embersTowardNextRank: rankUp
            ? newEmbers - EMBERS_PER_RANK
            : newEmbers,
          activeTrialIndex: nextTrialIndex,
          currentDayInTrial: nextDayInTrial,
        },
      };
    });
  }, []);

  const sealDay = useCallback(() => {
    const key = toDateKey();
    setState((prev) => {
      const existing = prev.days[key] ?? {
        reflected: false,
        reflectionText: "",
        trialCompleted: false,
        sealed: false,
      };
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

  const resetProgress = useCallback(() => {
    setState((prev) => ({
      ...DEFAULT_STATE,
      hasOnboarded: true,
      userName: prev.userName,
      reminderTime: prev.reminderTime,
    }));
  }, []);

  const setUserName = useCallback((name: string) => {
    setState((prev) => ({ ...prev, userName: name }));
  }, []);

  const setReminderTime = useCallback((time: string) => {
    setState((prev) => ({ ...prev, reminderTime: time }));
  }, []);

  const activeTrial = useMemo(
    () =>
      TRIAL_POOL[state.fenrir.activeTrialIndex % TRIAL_POOL.length] ??
      TRIAL_POOL[0],
    [state.fenrir.activeTrialIndex]
  );

  const value = useMemo<AppStateContextType>(
    () => ({
      isLoaded,
      state,
      activeTrial,
      completeOnboarding,
      completeReflection,
      completeTrial,
      sealDay,
      resetProgress,
      setUserName,
      setReminderTime,
    }),
    [
      isLoaded,
      state,
      activeTrial,
      completeOnboarding,
      completeReflection,
      completeTrial,
      sealDay,
      resetProgress,
      setUserName,
      setReminderTime,
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

export { toDateKey, TRIAL_POOL };
export type { DayData, AppStateData, Trial };
