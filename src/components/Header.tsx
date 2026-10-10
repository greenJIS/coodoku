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
  const exitToHome = useGameStore((s) => s.exitToHome);
  const settingsName = useSettingsStore((s) => s.name);
  const settingsDiff = useSettingsStore((s) => s.difficulty);
  const showTimer = useSettingsStore((s) => s.showTimer);
  const mistakeCheck = useSettingsStore((s) => s.mistakeCheck);

  const displayName = game?.name ?? settingsName;
  // Difficulty actually received from puzzle, fallback to settings
  const actualDifficulty = game?.difficulty ?? settingsDiff;
  const capitalizedDiff =
    actualDifficulty.charAt(0).toUpperCase() + actualDifficulty.slice(1);
  const activeDots = DIFFICULTY_LEVELS[actualDifficulty] ?? 1;

  return (
    <header
      className={`
        w-full max-w-260 select-none
        short:mb-2 short:flex short:h-(--header-h) short:items-center short:gap-2
        ${className}
      `}
    >
      {/* Row 1: Inert Home button, Otter + Name, Settings gear */}
      <div className="mb-2 flex w-full items-center justify-between short:contents">
        <IconButton
          icon={<HomeIcon />}
          label="Home"
          tooltip="Home"
          className="short:order-1"
          onClick={exitToHome}
        />

        <div
          className="
            flex items-center gap-2.5 text-[29px] tracking-[-0.01em]
            text-ink-900
            narrow:text-[24px]
            short:order-2 short:min-w-0 short:flex-1 short:justify-center short:text-[20px]
          "
        >
          <Otter />
          <span
            className="
              underline decoration-brand-500 decoration-wavy decoration-2
              underline-offset-[7px]
              short:truncate
            "
          >
            {displayName}
          </span>
        </div>

        <IconButton
          id="settingsBtn"
          icon={<GearIcon />}
          label="Settings"
          tooltip="Settings"
          className="short:order-6"
          onClick={onOpenSettings}
        />
      </div>

      {/* Row 2: Difficulty left, Hearts center, Timer & Pause right */}
      <div
        className="
          mb-2.5 grid w-full grid-cols-[1fr_auto_1fr] items-center
          justify-items-stretch gap-x-2 text-[17px] text-slate-500
          narrow:mb-1 narrow:text-[14px]
          short:contents
        "
      >
        {/* Difficulty indicator (left) */}
        <div className="order-1 justify-self-start short:order-3">
          <span className="max-[400px]:hidden short:hidden">Difficulty </span>
          <span className="sr-only">{capitalizedDiff}</span>
          <span
            aria-hidden="true"
            className="ml-1.5 inline-flex gap-1 align-middle"
          >
            {[1, 2, 3, 4].map((dot) => (
              <i
                key={dot}
                className={`
                  size-2.25 rounded-full
                  ${dot <= activeDots ? 'bg-brand-500' : 'bg-slate-300'}
                `}
              />
            ))}
          </span>
        </div>

        {/* Hearts row (center) */}
        <div
          className={`
            order-2 justify-self-center short:order-4
            ${mistakeCheck ? '' : 'invisible short:hidden'}
          `}
        >
          <HeartRow />
        </div>

        {/* Timer & Pause button (right) - removed when showTimer is false */}
        {showTimer ? (
          <div className="order-3 flex items-center gap-3 justify-self-end short:order-5">
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
          <div className="order-3 block" />
        )}
      </div>
    </header>
  );
}
