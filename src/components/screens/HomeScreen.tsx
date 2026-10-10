import { useCallback, useEffect, useState } from 'react';
import type { Difficulty } from '../../engine';
import { modalStack } from '../../hooks/modalStack';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useViewStore } from '../../store/view';
import { Otter } from '../brand/Otter';
import { ContinueCard } from '../home/ContinueCard';
import { DIFFICULTY_ORDER, DifficultyPicker } from '../home/DifficultyPicker';
import { HomeFooter } from '../home/HomeFooter';
import { HowToPlayCard } from '../home/HowToPlayCard';
import { LIFT_MOVE } from '../home/lift';
import { GearIcon } from '../icons';
import { StickerButton } from '../ui';

export interface HomeScreenProps {
  onOpenSettings: () => void;
  onOpenHelp: () => void;
  onOpenAbout: () => void;
}

export function HomeScreen({
  onOpenSettings,
  onOpenHelp,
  onOpenAbout,
}: HomeScreenProps) {
  const game = useGameStore((s) => s.game);
  const startGame = useGameStore((s) => s.startGame);
  const setPaused = useGameStore((s) => s.setPaused);
  const goGame = useViewStore((s) => s.goGame);
  const settingsDifficulty = useSettingsStore((s) => s.difficulty);

  const [selected, setSelected] = useState<Difficulty>(settingsDifficulty);
  const [armed, setArmed] = useState(false);

  const save = game?.status === 'playing' ? game : null;

  useEffect(() => {
    if (!armed) return;
    const id = setTimeout(() => setArmed(false), 4000);
    return () => clearTimeout(id);
  }, [armed]);

  const pick = useCallback((d: Difficulty) => {
    setSelected(d);
    setArmed(false);
  }, []);

  const resume = useCallback(() => {
    setPaused(false); // Continue goes straight to the running game
    goGame();
  }, [setPaused, goGame]);

  const start = useCallback(() => {
    if (save && !armed) {
      setArmed(true);
      return;
    }
    setArmed(false);
    void startGame(selected);
  }, [save, armed, startGame, selected]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.closest('input, textarea') || target.isContentEditable)
      ) {
        return;
      }
      if (
        modalStack.isOpen() ||
        document.querySelector('[data-modal-open="true"]')
      ) {
        return;
      }
      if (e.key === 'Enter') {
        if (target instanceof HTMLElement && target.closest('button, a')) {
          return; // the focused control handles Enter itself
        }
        if (save) resume();
        else start();
        return;
      }
      const d = DIFFICULTY_ORDER[Number(e.key) - 1];
      if (d) pick(d);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [save, resume, start, pick]);

  const selectedLabel = selected.charAt(0).toUpperCase() + selected.slice(1);

  return (
    <main
      className="
        flex w-full flex-1 flex-col items-center justify-center
        short:flex-row short:gap-8
      "
    >
      <div className="flex flex-col items-center short:flex-1">
        <Otter
          size={96}
          className="
            animate-bob
            [@media(max-height:640px)_and_(orientation:portrait)]:hidden
          "
        />
        <h1
          className="
            mt-1 text-[50px] leading-none underline decoration-brand-500
            decoration-wavy decoration-[3px] underline-offset-8
            short:text-[40px]
          "
        >
          Coodoku
        </h1>
        <p className="mt-3 text-[20px] text-slate-500">
          Quiet sudoku, one otter, no accounts.
        </p>
      </div>

      <div
        className="
          mt-5 flex w-[min(92vw,460px)] flex-col gap-3
          short:mt-0 short:w-auto short:max-w-md short:flex-1 short:gap-2
        "
      >
        {save ? (
          <ContinueCard game={save} onContinue={resume} />
        ) : (
          <StickerButton
            variant="primary"
            size="lg"
            onClick={start}
            className={`
              ${LIFT_MOVE}
              w-full text-[28px]
            `}
          >
            {`Play ${selectedLabel}`}
          </StickerButton>
        )}

        <DifficultyPicker
          value={selected}
          onChange={pick}
          onStart={save ? start : undefined}
          armed={armed}
        />

        <div className="grid grid-cols-2 gap-3">
          <HowToPlayCard onOpen={onOpenHelp} />
          <StickerButton
            variant="soft"
            onClick={onOpenSettings}
            className={`
              ${LIFT_MOVE}
              w-full gap-2 rounded-[18px] text-[22px]
            `}
          >
            <GearIcon />
            Settings
          </StickerButton>
        </div>

        <HomeFooter onAbout={onOpenAbout} />
      </div>
    </main>
  );
}
