import { beforeEach, describe, expect, it } from 'vitest';
import { useViewStore } from './view';

describe('view store', () => {
  beforeEach(() => {
    useViewStore.setState({ view: 'loading' });
  });

  it('starts on loading', () => {
    expect(useViewStore.getState().view).toBe('loading');
  });

  it('switches between home and game', () => {
    useViewStore.getState().goHome();
    expect(useViewStore.getState().view).toBe('home');
    useViewStore.getState().goGame();
    expect(useViewStore.getState().view).toBe('game');
  });
});
