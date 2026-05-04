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
  },
};

interface AppStateContextType {
  isLoaded: boolean;
  state: AppStateData;
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

  const value = useMemo<AppStateContextType>(
    () => ({
      isLoaded,
      state,
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

export { toDateKey };
export type { DayData, AppStateData };
