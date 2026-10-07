import { create } from 'zustand';
import {
  type DifficultyStats,
  type Stats,
  getDefaultStats,
  parseStats,
} from '../storage/schema';
import { STATS_KEY, readKey, writeKey } from '../storage/storage';

export interface StatsStore {
  stats: Stats;
  resetArmed: boolean;
  recordWin: (difficulty: keyof Stats, ms: number) => void;
  armReset: () => void;
  disarmReset: () => void;
  reset: () => void;
}

function loadInitialStats(): Stats {
  return readKey(STATS_KEY, parseStats) ?? getDefaultStats();
}

let disarmTimer: ReturnType<typeof setTimeout> | null = null;

export const useStatsStore = create<StatsStore>((set, get) => ({
  stats: loadInitialStats(),
  resetArmed: false,

  recordWin: (difficulty, ms) => {
    const prevStats = get().stats;
    const currentDiff: DifficultyStats = prevStats[difficulty] ?? {
      solved: 0,
      bestMs: null,
    };

    const newSolved = currentDiff.solved + 1;
    const newBestMs =
      currentDiff.bestMs === null ? ms : Math.min(currentDiff.bestMs, ms);

    const newStats: Stats = {
      ...prevStats,
      [difficulty]: {
        solved: newSolved,
        bestMs: newBestMs,
      },
    };

    set({ stats: newStats });
    writeKey(STATS_KEY, newStats);
  },

  armReset: () => {
    if (disarmTimer) {
      clearTimeout(disarmTimer);
    }
    set({ resetArmed: true });
    disarmTimer = setTimeout(() => {
      set({ resetArmed: false });
      disarmTimer = null;
    }, 4000);
  },

  disarmReset: () => {
    if (disarmTimer) {
      clearTimeout(disarmTimer);
      disarmTimer = null;
    }
    set({ resetArmed: false });
  },

  reset: () => {
    if (!get().resetArmed) {
      get().armReset();
      return;
    }

    if (disarmTimer) {
      clearTimeout(disarmTimer);
      disarmTimer = null;
    }

    const defaultStats = getDefaultStats();
    set({ stats: defaultStats, resetArmed: false });
    writeKey(STATS_KEY, defaultStats);
  },
}));
