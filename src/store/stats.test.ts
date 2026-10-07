import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getDefaultStats, parseStats } from '../storage/schema';
import { STATS_KEY, readKey } from '../storage/storage';
import { useStatsStore } from './stats';

describe('stats store', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    useStatsStore.setState({
      stats: getDefaultStats(),
      resetArmed: false,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records wins and computes best time', () => {
    const store = useStatsStore.getState();

    // First win: 20000 ms
    store.recordWin('easy', 20000);
    let stats = useStatsStore.getState().stats;
    expect(stats.easy.solved).toBe(1);
    expect(stats.easy.bestMs).toBe(20000);

    // Second win (slower): 25000 ms -> bestMs remains 20000
    store.recordWin('easy', 25000);
    stats = useStatsStore.getState().stats;
    expect(stats.easy.solved).toBe(2);
    expect(stats.easy.bestMs).toBe(20000);

    // Third win (faster): 15000 ms -> bestMs updates to 15000
    store.recordWin('easy', 15000);
    stats = useStatsStore.getState().stats;
    expect(stats.easy.solved).toBe(3);
    expect(stats.easy.bestMs).toBe(15000);

    // Verified in storage
    const saved = readKey(STATS_KEY, parseStats);
    expect(saved?.easy).toEqual({ solved: 3, bestMs: 15000 });
  });

  it('implements two-tap reset with auto-disarm timer', () => {
    const store = useStatsStore.getState();
    store.recordWin('hard', 50000);
    expect(useStatsStore.getState().stats.hard.solved).toBe(1);

    // First tap arms reset
    store.reset();
    expect(useStatsStore.getState().resetArmed).toBe(true);
    expect(useStatsStore.getState().stats.hard.solved).toBe(1);

    // If 4000ms passes without 2nd tap, auto-disarms
    vi.advanceTimersByTime(4500);
    expect(useStatsStore.getState().resetArmed).toBe(false);
    expect(useStatsStore.getState().stats.hard.solved).toBe(1);

    // Arm again
    store.reset();
    expect(useStatsStore.getState().resetArmed).toBe(true);

    // Second tap confirms reset
    store.reset();
    expect(useStatsStore.getState().resetArmed).toBe(false);
    expect(useStatsStore.getState().stats.hard.solved).toBe(0);
    expect(useStatsStore.getState().stats.hard.bestMs).toBeNull();

    // Verified in storage
    const saved = readKey(STATS_KEY, parseStats);
    expect(saved?.hard).toEqual({ solved: 0, bestMs: null });
  });
});
