import { useEffect, useState } from 'react';
import { Board } from './components/Board';
import { Header } from './components/Header';
import {
  AboutModal,
  GameOverModal,
  HelpModal,
  type HelpTopic,
  PauseModal,
  SettingsModal,
  WinModal,
} from './components/modals';
import { NotesSwitch } from './components/NotesSwitch';
import { NumberPad } from './components/NumberPad';
import { HomeScreen } from './components/screens/HomeScreen';
import { LoadingScreen } from './components/screens/LoadingScreen';
import { Toolbar } from './components/Toolbar';
import { Toast } from './components/ui';
import { useGameTimer } from './hooks/useGameTimer';
import { useKeyboard } from './hooks/useKeyboard';
import { useLoadingGate } from './hooks/useLoadingGate';
import { useReducedMotion } from './hooks/useReducedMotion';
import { useTheme } from './hooks/useTheme';
import { loadUiFont } from './lib/fonts';
import { useGameStore } from './store/game';
import { useSettingsStore } from './store/settings';
import { useViewStore } from './store/view';

export function App() {
  const boot = useGameStore((s) => s.boot);
  const game = useGameStore((s) => s.game);
  const paused = useGameStore((s) => s.paused);
  const setPaused = useGameStore((s) => s.setPaused);
  const startGame = useGameStore((s) => s.startGame);
  const retry = useGameStore((s) => s.retry);
  const error = useGameStore((s) => s.error);
  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);

  const view = useViewStore((s) => s.view);
  const goHome = useViewStore((s) => s.goHome);

  const leftHanded = useSettingsStore((s) => s.leftHanded);
  const difficulty = useSettingsStore((s) => s.difficulty);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [helpTopic, setHelpTopic] = useState<HelpTopic | null>(null);
  const helpOpen = helpTopic !== null;

  const gate = useLoadingGate();

  // Mount core app hooks
  useKeyboard();
  useGameTimer();
  useTheme();
  useReducedMotion();

  // Launch: restore any save and load the font, then open Home.
  useEffect(() => {
    void Promise.allSettled([loadUiFont(), boot()]).then(() => goHome());
  }, [boot, goHome]);

  // Release the modal-induced pause in the same batch that closes the modal,
  // otherwise the Pause modal mounts for a render and re-pauses the game.
  // Only in the game view: on Home, `Modal` itself pauses and unpauses around
  // open and close, and Continue sets `paused: false` explicitly on the way in.
  const closeSettings = () => {
    setSettingsOpen(false);
    if (view === 'game' && !helpOpen && pendingDifficulty === null) {
      setPaused(false);
    }
  };
  const closeHelp = () => {
    setHelpTopic(null);
    if (view === 'game' && !settingsOpen && pendingDifficulty === null) {
      setPaused(false);
    }
  };

  const inGame = view === 'game';
  const isWon = inGame && game?.status === 'won';
  const isLost = inGame && game?.status === 'lost';
  const isPauseOpen =
    inGame &&
    paused &&
    !settingsOpen &&
    !helpOpen &&
    pendingDifficulty === null &&
    game?.status === 'playing';

  return (
    <div
      className={`
        flex flex-col items-center px-4.5 pt-3.5 text-ink-900
        transition-colors duration-200
        ${view === 'home' ? 'h-dvh overflow-hidden pb-3' : 'min-h-screen pb-10'}
      `}
    >
      {view === 'home' && (
        <HomeScreen
          onOpenSettings={() => setSettingsOpen(true)}
          onOpenHelp={() => setHelpTopic('rules')}
          onOpenAbout={() => setAboutOpen(true)}
        />
      )}

      {inGame && (
        <>
          {/* Top Header */}
          <Header
            onOpenSettings={() => setSettingsOpen(true)}
            onPause={() => setPaused(true)}
          />

          {/* Main Playable Area: Board + Sidebar Controls */}
          <main
            className={`
              flex w-full max-w-260 items-center justify-center gap-5.5
              min-[861px]:gap-11
              ${
                leftHanded
                  ? `
                    flex-col
                    min-[861px]:flex-row-reverse
                  `
                  : `
                    flex-col
                    min-[861px]:flex-row
                  `
              }
            `}
          >
            <div
              className={`
                flex justify-center transition-[filter] duration-200
                ${isPauseOpen ? 'pointer-events-none blur-sm select-none' : ''}
              `}
            >
              <Board />
            </div>

            <aside
              className="
                flex w-[min(88vw,380px)] flex-col items-center gap-4.5
                min-[861px]:w-75
              "
            >
              <NumberPad />
              <NotesSwitch onHelp={() => setHelpTopic('notes')} />
              <Toolbar onAboutHint={() => setHelpTopic('hint')} />
            </aside>
          </main>
        </>
      )}

      {/* Modals */}
      <SettingsModal open={settingsOpen} onClose={closeSettings} />

      <PauseModal open={isPauseOpen} onClose={() => setPaused(false)} />

      <HelpModal
        open={helpOpen}
        onClose={closeHelp}
        topic={helpTopic ?? 'notes'}
      />

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      <WinModal open={isWon} onNewGame={() => void startGame(difficulty)} />

      <GameOverModal
        open={isLost}
        onRetry={retry}
        onNewGame={() => void startGame(difficulty)}
      />

      {/* Error Toast */}
      {error && (
        <Toast
          message={error}
          actionLabel="Retry"
          onAction={() => void startGame(difficulty)}
        />
      )}

      {gate.show && <LoadingScreen leaving={gate.leaving} />}
    </div>
  );
}
