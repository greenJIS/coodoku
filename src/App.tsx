import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import {
  GameOverModal,
  HelpModal,
  PauseModal,
  SettingsModal,
  WinModal,
} from './components/modals';
import { NotesSwitch } from './components/NotesSwitch';
import { NumberPad } from './components/NumberPad';
import { Toolbar } from './components/Toolbar';
import { Toast } from './components/ui';
import { useGameTimer } from './hooks/useGameTimer';
import { useKeyboard } from './hooks/useKeyboard';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useTheme } from './hooks/useTheme';
import { useGameStore } from './store/game';
import { useSettingsStore } from './store/settings';

export function App() {
  const boot = useGameStore((s) => s.boot);
  const game = useGameStore((s) => s.game);
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);
  const newGame = useGameStore((s) => s.newGame);
  const retry = useGameStore((s) => s.retry);
  const error = useGameStore((s) => s.error);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);

  const leftHanded = useSettingsStore((s) => s.leftHanded);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  // Mount core app hooks
  useKeyboard();
  useGameTimer();
  useTheme();
  useReducedMotion();

  // Call boot() once on mount
  useEffect(() => {
    void boot();
  }, [boot]);

  const isWon = game?.status === 'won';
  const isLost = game?.status === 'lost';
  const isPauseOpen =
    paused &&
    !settingsOpen &&
    !helpOpen &&
    pendingDifficulty === null &&
    game?.status === 'playing';

  return (
    <div className="min-h-screen flex flex-col items-center justify-between px-3 sm:px-5 py-3 sm:py-4 pb-8 sm:pb-12 bg-paper text-ink-900 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onPause={() => setPaused(true)}
      />

      {/* Main Playable Area: Board + Sidebar Controls */}
      <main
        className={`w-full max-w-[1040px] flex gap-6 lg:gap-11 items-center justify-center my-auto transition-all ${
          leftHanded
            ? 'flex-col min-[861px]:flex-row-reverse'
            : 'flex-col min-[861px]:flex-row'
        }`}
      >
        <div
          className={`flex justify-center w-full max-w-[600px] transition-[filter] duration-200 ${
            isPauseOpen ? 'blur-sm select-none pointer-events-none' : ''
          }`}
        >
          <Board />
        </div>

        <aside className="w-[min(88vw,320px)] sm:w-[320px] flex flex-col gap-4 sm:gap-5 items-center">
          <NumberPad />
          <NotesSwitch onHelp={() => setHelpOpen(true)} />
          <Toolbar onAboutHint={() => setHelpOpen(true)} />
        </aside>
      </main>

      {/* Modals */}
      <SettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />

      <PauseModal open={isPauseOpen} onClose={() => setPaused(false)} />

      <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />

      <WinModal open={isWon} onNewGame={() => void newGame()} />

      <GameOverModal
        open={isLost}
        onRetry={retry}
        onNewGame={() => void newGame()}
      />

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          actionLabel="Retry"
          onAction={() => void newGame()}
        />
      )}
    </div>
  );
}
