import type { Difficulty } from '../engine';
import { useGameStore } from '../store/game';
import { useSettingsStore } from '../store/settings';
import { Otter } from './brand/Otter';
import { HeartRow } from './HeartRow';
import { GearIcon, HomeIcon, PauseIcon } from './icons';
import { Timer } from './Timer';
import { IconButton } from './ui';

export interface HeaderProps {
  onOpenSettings?: () => void;
  onPause?: () => void;
  className?: string;
}

const DIFFICULTY_LEVELS: Record<Difficulty, number> = {
  easy: 1,
  medium: 2,
  hard: 3,
  expert: 4,
};

export function Header({
  onOpenSettings,
  onPause,
  className = '',
}: HeaderProps) {
  const game = useGameStore((s) => s.game);
  const settingsName = useSettingsStore((s) => s.name);
  const settingsDiff = useSettingsStore((s) => s.difficulty);
  const showTimer = useSettingsStore((s) => s.showTimer);

  const displayName = game?.name ?? settingsName;
  // Difficulty actually received from puzzle, fallback to settings
  const actualDifficulty = game?.difficulty ?? settingsDiff;
  const capitalizedDiff =
    actualDifficulty.charAt(0).toUpperCase() + actualDifficulty.slice(1);
  const activeDots = DIFFICULTY_LEVELS[actualDifficulty] ?? 1;

  return (
    <header
      className={`flex flex-col gap-2 w-full max-w-[1040px] mb-2.5 select-none ${className}`}
    >
      {/* Row 1: Inert Home button, Otter + Name, Settings gear */}
      <div className="flex items-center justify-between w-full">
        <IconButton
          icon={<HomeIcon />}
          label="Home"
          aria-disabled="true"
          onClick={(e) => e.preventDefault()}
          className="cursor-default hover:border-edge hover:shadow-[0_4px_0_var(--color-edge)] active:translate-y-0"
        />

        <div className="flex items-center gap-2.5 font-extrabold text-2xl text-ink-900 tracking-[-0.01em]">
          <Otter size={32} />
          <span className="underline decoration-wavy decoration-brand-500 decoration-2 underline-offset-[7px]">
            {displayName}
          </span>
        </div>

        <IconButton
          id="settingsBtn"
          icon={<GearIcon />}
          label="Settings"
          tooltip="Settings"
          onClick={onOpenSettings}
        />
      </div>

      {/* Row 2: Difficulty left, Hearts center, Timer & Pause right */}
      <div className="grid grid-cols-1 sm:grid-cols-3 items-center justify-items-center sm:justify-items-stretch gap-2.5 w-full text-slate-500 font-semibold text-sm">
        {/* Difficulty indicator (left) */}
        <div className="sm:justify-self-start flex items-center gap-1.5 order-2 sm:order-1">
          <span>Difficulty</span>
          <span className="sr-only">{capitalizedDiff}</span>
          <span
            aria-hidden="true"
            className="inline-flex gap-1 ml-1.5 align-middle"
          >
            {[1, 2, 3, 4].map((dot) => (
              <i
                key={dot}
                className={`w-[9px] h-[9px] rounded-full transition-colors duration-150 ${
                  dot <= activeDots ? 'bg-brand-500' : 'bg-slate-300'
                }`}
              />
            ))}
          </span>
        </div>

        {/* Hearts row (center) */}
        <div className="sm:justify-self-center order-1 sm:order-2">
          <HeartRow />
        </div>

        {/* Timer & Pause button (right) - removed when showTimer is false */}
        {showTimer ? (
          <div className="sm:justify-self-end flex items-center gap-3 order-3">
            <Timer />
            <IconButton
              id="pauseBtn"
              icon={<PauseIcon size={18} />}
              size="sm"
              label="Pause"
              tooltip="Pause (P)"
              onClick={onPause}
            />
          </div>
        ) : (
          <div className="hidden sm:block order-3" />
        )}
      </div>
    </header>
  );
}
