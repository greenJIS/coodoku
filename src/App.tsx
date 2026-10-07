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
    <div className="min-h-screen flex flex-col items-center px-[18px] pt-[14px] pb-10 bg-paper text-ink-900 transition-colors duration-200">
      {/* Top Header */}
      <Header
        onOpenSettings={() => setSettingsOpen(true)}
        onPause={() => setPaused(true)}
      />

      {/* Main Playable Area: Board + Sidebar Controls */}
      <main
        className={`w-full max-w-[1040px] flex gap-[22px] min-[861px]:gap-11 items-center justify-center ${
          leftHanded
            ? 'flex-col min-[861px]:flex-row-reverse'
            : 'flex-col min-[861px]:flex-row'
        }`}
      >
        <div
          className={`flex justify-center transition-[filter] duration-200 ${
            isPauseOpen ? 'blur-sm select-none pointer-events-none' : ''
          }`}
        >
          <Board />
        </div>

        <aside className="w-[min(88vw,380px)] min-[861px]:w-[300px] flex flex-col gap-[18px] items-center">
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
