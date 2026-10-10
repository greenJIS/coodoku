import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../engine';
import { randomName } from '../../lib/names';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useStatsStore } from '../../store/stats';
import { useViewStore } from '../../store/view';
import { CloseIcon, DiceIcon } from '../icons';
import {
  IconButton,
  Segmented,
  Slider,
  StickerButton,
  Tabs,
  Toggle,
  Tooltip,
} from '../ui';
import { ConfirmDifficultyModal } from './ConfirmDifficultyModal';
import { Modal } from './Modal';

export interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = 'game' | 'play' | 'feel';

const DIFFICULTIES: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('game');
  const [resetArmed, setResetArmed] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gearBtnRef = useRef<HTMLElement | null>(null);

  // Store bindings
  const settingsName = useSettingsStore((s) => s.name);
  const renameGame = useGameStore((s) => s.renameGame);
  const gameName = useGameStore((s) => s.game?.name);
  const view = useViewStore((s) => s.view);
  const currentDiff = useSettingsStore((s) => s.difficulty);
  const mistakeCheck = useSettingsStore((s) => s.mistakeCheck);
  const setMistakeCheck = useSettingsStore((s) => s.setMistakeCheck);
  const autoRemoveNotes = useSettingsStore((s) => s.autoRemoveNotes);
  const setAutoRemoveNotes = useSettingsStore((s) => s.setAutoRemoveNotes);
  const highlightPeers = useSettingsStore((s) => s.highlightPeers);
  const setHighlightPeers = useSettingsStore((s) => s.setHighlightPeers);
  const highlightSame = useSettingsStore((s) => s.highlightSame);
  const setHighlightSame = useSettingsStore((s) => s.setHighlightSame);
  const showRemaining = useSettingsStore((s) => s.showRemaining);
  const setShowRemaining = useSettingsStore((s) => s.setShowRemaining);
  const showTimer = useSettingsStore((s) => s.showTimer);
  const setShowTimer = useSettingsStore((s) => s.setShowTimer);

  const sound = useSettingsStore((s) => s.sound);
  const setSound = useSettingsStore((s) => s.setSound);
  const volume = useSettingsStore((s) => s.volume);
  const setVolume = useSettingsStore((s) => s.setVolume);
  const vibrate = useSettingsStore((s) => s.vibrate);
  const setVibrate = useSettingsStore((s) => s.setVibrate);
  const reduceMotion = useSettingsStore((s) => s.reduceMotion);
  const setReduceMotion = useSettingsStore((s) => s.setReduceMotion);
  const theme = useSettingsStore((s) => s.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const digitSize = useSettingsStore((s) => s.digitSize);
  const setDigitSize = useSettingsStore((s) => s.setDigitSize);
  const leftHanded = useSettingsStore((s) => s.leftHanded);
  const setLeftHanded = useSettingsStore((s) => s.setLeftHanded);

  const stats = useStatsStore((s) => s.stats);
  const resetStats = useStatsStore((s) => s.reset);

  const pendingDifficulty = useGameStore((s) => s.pendingDifficulty);
  const requestDifficulty = useGameStore((s) => s.requestDifficulty);
  const confirmDifficulty = useGameStore((s) => s.confirmDifficulty);
  const newGame = useGameStore((s) => s.newGame);

  // Local state for name input
  const [nameInput, setNameInput] = useState(settingsName);

  useEffect(() => {
    if (open) {
      gearBtnRef.current = document.getElementById('settingsBtn');
      setNameInput(gameName ?? settingsName);
      setResetArmed(false);
    }
  }, [open, gameName, settingsName]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value.slice(0, 24));
  };

  const handleNameBlur = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      // Restore previous name
      setNameInput(gameName ?? settingsName);
    } else {
      renameGame(trimmed);
      setNameInput(trimmed);
    }
  };

  const handleRandomName = () => {
    const newName = randomName();
    renameGame(newName);
    setNameInput(newName);
  };

  const handleResetStats = () => {
    if (resetArmed) {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
      resetStats();
      setResetArmed(false);
    } else {
      setResetArmed(true);
      resetTimerRef.current = setTimeout(() => {
        setResetArmed(false);
      }, 3000);
    }
  };

  const handleNewGameClick = () => {
    void newGame(currentDiff);
    onClose();
  };

  const activeDiff = pendingDifficulty ?? currentDiff;
  const totalSolved = DIFFICULTIES.reduce((n, d) => n + stats[d].solved, 0);
  const paneAnimation =
    direction === 'forward'
      ? 'animate-pane-slide-left'
      : 'animate-[paneSlideRight_0.26s_cubic-bezier(0.2,0.9,0.3,1)]';

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        originRef={gearBtnRef}
        label="Settings"
        className="
          relative flex max-h-[calc(100dvh-2rem)] max-w-105 flex-col px-6! pt-5.5!
          pb-4.5! text-left
        "
      >
        {/* Close button */}
        <div className="absolute top-3 right-3">
          <IconButton
            icon={<CloseIcon size={16} />}
            size="sm"
            variant="close"
            label="Close settings"
            onClick={onClose}
          />
        </div>

        <h2 className="mb-3 text-center text-[24px] text-ink-900">Settings</h2>

        {/* Tab selection */}
        <Tabs
          tabs={[
            { id: 'game', label: 'Game' },
            { id: 'play', label: 'Play' },
            { id: 'feel', label: 'Look & feel' },
          ]}
          activeTab={activeTab}
          onChange={(id) => {
            const order: SettingsTab[] = ['game', 'play', 'feel'];
            setDirection(
              order.indexOf(id as SettingsTab) > order.indexOf(activeTab)
                ? 'forward'
                : 'back',
            );
            setActiveTab(id as SettingsTab);
          }}
          className="mb-3"
        />

        {/* Scrolling body */}
        <div
          className="
            -mr-2.5 h-88 max-h-[calc(100dvh-14rem)] short:max-h-[calc(100dvh-10rem)]
            overflow-x-hidden overflow-y-auto pr-2.5
          "
        >
          {/* TAB 1: Game */}
          {activeTab === 'game' && (
            <div className={paneAnimation}>
              <div>
                <label
                  htmlFor="settingsNameInput"
                  className="
                    mt-0.5 mb-2 block text-[14px] tracking-[0.06em]
                    text-slate-500 uppercase
                  "
                >
                  Game name
                </label>
                <div className="flex gap-2">
                  <input
                    id="settingsNameInput"
                    type="text"
                    maxLength={24}
                    autoComplete="off"
                    spellCheck="false"
                    value={nameInput}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    className="
                      min-w-0 flex-1 rounded-xl border-2 border-edge bg-cream-50
                      px-3 py-2 text-[19px] text-ink-900 transition-colors
                      outline-none
                      focus:border-brand-500
                      dark:bg-cream-100
                    "
                  />
                  <Tooltip text="Random name" align="end">
                    <button
                      type="button"
                      aria-label="Random name"
                      onClick={handleRandomName}
                      className="
                        grid size-10.5 cursor-pointer place-items-center
                        rounded-xl border-2 border-edge bg-cream-50 text-user
                        shadow-[0_3px_0_var(--color-edge)]
                        active:translate-y-0.5
                        active:shadow-[0_1px_0_var(--color-edge)]
                        dark:bg-cream-100
                      "
                    >
                      <DiceIcon />
                    </button>
                  </Tooltip>
                </div>
              </div>

              {view === 'game' && (
                <div>
                  <div
                    className="
                      mt-3.5 mb-2 text-[14px] tracking-[0.06em] text-slate-500
                      uppercase
                    "
                  >
                    Difficulty
                  </div>
                  <div
                    id="difficultySelector"
                    className="mb-1 flex flex-wrap gap-1.5"
                  >
                    {DIFFICULTIES.map((d) => (
                      <StickerButton
                        key={d}
                        variant={activeDiff === d ? 'primary' : 'default'}
                        size="sm"
                        aria-pressed={activeDiff === d}
                        onClick={() => requestDifficulty(d)}
                        className="rounded-full! px-3.5! shadow-[0_3px_0_var(--color-edge)]"
                      >
                        {d.charAt(0).toUpperCase() + d.slice(1)}
                      </StickerButton>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <div
                  className="
                    mt-3.5 mb-2 text-[14px] tracking-[0.06em] text-slate-500
                    uppercase
                  "
                >
                  Stats
                </div>
                <div
                  className="
                    mb-2.5 grid grid-cols-2 gap-x-4.5 gap-y-1.5 text-[16px]
                    text-slate-500
                  "
                >
                  <div className="flex justify-between">
                    <span>Solved</span>
                    <b className="text-ink-900">{totalSolved}</b>
                  </div>
                  <div />
                  {DIFFICULTIES.map((d) => (
                    <div key={d} className="flex justify-between">
                      <span>Best {d.charAt(0).toUpperCase() + d.slice(1)}</span>
                      <b className="text-ink-900">
                        {stats[d].bestMs !== null
                          ? formatTime(stats[d].bestMs)
                          : '\u2013'}
                      </b>
                    </div>
                  ))}
                </div>
              </div>
              <StickerButton
                variant="ghost"
                size="md"
                armed={resetArmed}
                onClick={handleResetStats}
                className="mt-1 mb-1 w-full"
              >
                {resetArmed ? 'Tap again to confirm' : 'Reset stats'}
              </StickerButton>
            </div>
          )}

          {/* TAB 2: Play */}
          {activeTab === 'play' && (
            <div className={paneAnimation}>
              <div
                className="
                  flex min-h-11.5 items-center justify-between border-b
                  border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Mistake check
                </span>
                <Segmented
                  options={[
                    { value: 'instant', label: 'Instant' },
                    { value: 'off', label: 'Off' },
                  ]}
                  value={mistakeCheck ? 'instant' : 'off'}
                  onChange={(v) => setMistakeCheck(v === 'instant')}
                />
              </div>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Auto-remove notes
                </span>
                <Toggle
                  checked={autoRemoveNotes}
                  onChange={setAutoRemoveNotes}
                  aria-label="Auto-remove notes"
                />
              </label>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Highlight row, column, box
                </span>
                <Toggle
                  checked={highlightPeers}
                  onChange={setHighlightPeers}
                  aria-label="Highlight row, column, box"
                />
              </label>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Highlight same digits
                </span>
                <Toggle
                  checked={highlightSame}
                  onChange={setHighlightSame}
                  aria-label="Highlight same digits"
                />
              </label>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Show remaining count
                </span>
                <Toggle
                  checked={showRemaining}
                  onChange={setShowRemaining}
                  aria-label="Show remaining count"
                />
              </label>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Show timer
                </span>
                <Toggle
                  checked={showTimer}
                  onChange={setShowTimer}
                  aria-label="Show timer"
                />
              </label>
            </div>
          )}

          {/* TAB 3: Look & feel */}
          {activeTab === 'feel' && (
            <div className={paneAnimation}>
              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">Sound</span>
                <Toggle
                  checked={sound}
                  onChange={setSound}
                  aria-label="Sound"
                />
              </label>

              <div
                className="
                  flex min-h-11.5 items-center justify-between border-b
                  border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">Volume</span>
                <Slider
                  min={0}
                  max={100}
                  value={volume}
                  onChange={setVolume}
                  aria-label="Volume"
                />
              </div>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Vibration on mistakes
                </span>
                <Toggle
                  checked={vibrate}
                  onChange={setVibrate}
                  aria-label="Vibration on mistakes"
                />
              </label>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Reduce motion
                </span>
                <Toggle
                  checked={reduceMotion}
                  onChange={setReduceMotion}
                  aria-label="Reduce motion"
                />
              </label>

              <div
                className="
                  flex min-h-11.5 items-center justify-between border-b
                  border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">Theme</span>
                <Segmented
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                  ]}
                  value={theme}
                  onChange={setTheme}
                  aria-label="Theme"
                />
              </div>

              <div
                className="
                  flex min-h-11.5 items-center justify-between border-b
                  border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Digit size
                </span>
                <Segmented
                  options={[
                    { value: 'normal', label: 'Normal' },
                    { value: 'large', label: 'Large' },
                  ]}
                  value={digitSize}
                  onChange={setDigitSize}
                  aria-label="Digit size"
                />
              </div>

              <label
                className="
                  flex min-h-11.5 cursor-pointer items-center justify-between
                  border-b border-hairline
                  last:border-b-0
                "
              >
                <span className="pr-3 text-[17px] text-ink-900">
                  Left-handed layout
                </span>
                <Toggle
                  checked={leftHanded}
                  onChange={setLeftHanded}
                  aria-label="Left-handed layout"
                />
              </label>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 shrink-0">
          <StickerButton
            variant="primary"
            size="lg"
            onClick={handleNewGameClick}
            className="mt-1.5 w-full"
          >
            New game
          </StickerButton>
        </div>
      </Modal>

      {/* Stacked confirm difficulty modal */}
      <ConfirmDifficultyModal
        open={pendingDifficulty !== null}
        onConfirm={() => {
          confirmDifficulty();
          onClose();
        }}
      />
    </>
  );
}
