import { create } from 'zustand';

export type View = 'loading' | 'home' | 'game';

export interface ViewStore {
  view: View;
  goHome: () => void;
  goGame: () => void;
}

export const useViewStore = create<ViewStore>((set) => ({
  view: 'loading',
  goHome: () => set({ view: 'home' }),
  goGame: () => set({ view: 'game' }),
}));
