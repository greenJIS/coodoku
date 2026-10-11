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
        w-full max-w-160 select-none
        short:mb-2 short:flex short:h-(--header-h) short:max-w-none
        short:items-center short:gap-2.5
        ${className}
      `}
    >
      {/* Row 1: Home, Otter + Name, Settings (landscape phones: one row) */}
      <div className="mb-2 flex w-full items-center justify-between short:contents">
        <IconButton
          icon={<HomeIcon className="short:size-4.5" />}
          label="Home"
          tooltip="Home"
          className="short:size-9.5! short:shadow-[0_3px_0_var(--color-edge)]"
          onClick={exitToHome}
        />

        <div
          className="
            flex min-w-0 items-center gap-2.5 text-[30px] tracking-[-0.01em]
            text-ink-900
            max-[860px]:text-[24px]
            short:order-3 short:flex-1 short:justify-start short:text-[20px]
          "
        >
          <Otter />
          <span
            className="
              truncate underline decoration-brand-500 decoration-wavy
              decoration-2 underline-offset-[7px]
            "
          >
            {displayName}
          </span>
        </div>

        <div className="short:order-7">
          <IconButton
            id="settingsBtn"
            icon={<GearIcon className="short:size-4.5" />}
            label="Settings"
            tooltip="Settings"
            className="short:size-9.5! short:shadow-[0_3px_0_var(--color-edge)]"
            onClick={onOpenSettings}
          />
        </div>
      </div>

      {/* Row 2: Hearts left, difficulty chip centered, Timer + Pause right */}
      <div
        className="
          mb-2.5 grid w-full grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]
          items-center gap-x-2.5
          short:order-4 short:mb-0 short:flex short:w-auto short:gap-3
        "
      >
        <div
          className={`
            justify-self-start short:order-4
            ${mistakeCheck ? '' : 'invisible short:hidden'}
          `}
        >
          <HeartRow />
        </div>

        {/* Difficulty chip */}
        <div
          className="
            flex items-center gap-2 rounded-full border-2 border-edge
            bg-cream-50 px-3 py-0.5 text-[16px] text-brand-700
            shadow-[0_2px_0_var(--color-edge)]
            dark:bg-cream-100
            max-[599px]:portrait:px-2.5
            short:order-5 short:text-[14px]
          "
        >
          <span>{capitalizedDiff}</span>
          <span
            aria-hidden="true"
            className="inline-flex gap-1 max-[599px]:portrait:hidden"
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

        {/* Timer & Pause button - removed when showTimer is false */}
        {showTimer ? (
          <div className="flex items-center gap-2 justify-self-end max-[420px]:gap-1.5 short:order-6">
            <Timer />
            <IconButton
              id="pauseBtn"
              icon={<PauseIcon size={18} />}
              size="sm"
              label="Pause"
              tooltip="Pause (P)"
              className="max-[359px]:size-7.5!"
              onClick={onPause}
            />
          </div>
        ) : (
          <div className="block" />
        )}
      </div>
    </header>
  );
}
