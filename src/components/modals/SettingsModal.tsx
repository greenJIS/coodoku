import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../engine';
import { randomName } from '../../lib/names';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useStatsStore } from '../../store/stats';
import { CloseIcon, DiceIcon } from '../icons';
import {
  IconButton,
  Segmented,
  Slider,
  StickerButton,
  Tabs,
  Toggle,
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
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gearBtnRef = useRef<HTMLElement | null>(null);

  // Store bindings
  const settingsName = useSettingsStore((s) => s.name);
  const setName = useSettingsStore((s) => s.setName);
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
  const newGame = useGameStore((s) => s.newGame);

  // Local state for name input
  const [nameInput, setNameInput] = useState(settingsName);

  useEffect(() => {
    if (open) {
      gearBtnRef.current = document.getElementById('settingsBtn');
      setNameInput(settingsName);
      setResetArmed(false);
    }
  }, [open, settingsName]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNameInput(e.target.value.slice(0, 24));
  };

  const handleNameBlur = () => {
    const trimmed = nameInput.trim();
    if (!trimmed) {
      // Restore previous name
      setNameInput(settingsName);
    } else {
      setName(trimmed);
      setNameInput(trimmed);
    }
  };

  const handleRandomName = () => {
    const newName = randomName();
    setName(newName);
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

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        originRef={gearBtnRef}
        label="Settings"
        className="relative flex flex-col max-h-[92vh] text-left p-6 sm:p-7"
      >
        {/* Close button */}
        <div className="absolute top-4 right-4">
          <IconButton
            icon={<CloseIcon size={16} />}
            size="sm"
            variant="close"
            label="Close settings"
            onClick={onClose}
          />
        </div>

        <h2 className="text-2xl font-extrabold text-ink-900 mb-3 text-center">
          Settings
        </h2>

        {/* Tab selection */}
        <Tabs
          tabs={[
            { id: 'game', label: 'Game' },
            { id: 'play', label: 'Play' },
            { id: 'feel', label: 'Look & feel' },
          ]}
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as SettingsTab)}
          className="mb-4"
        />

        {/* Scrolling body */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 space-y-4 min-h-[300px]">
          {/* TAB 1: Game */}
          {activeTab === 'game' && (
            <div className="space-y-4 animate-[paneSlideRight_0.2s_ease-out]">
              <div>
                <label
                  htmlFor="settingsNameInput"
                  className="block text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5"
                >
                  Game name
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    id="settingsNameInput"
                    type="text"
                    maxLength={24}
                    autoComplete="off"
                    spellCheck="false"
                    value={nameInput}
                    onChange={handleNameChange}
                    onBlur={handleNameBlur}
                    className="flex-1 min-w-0 px-3.5 py-2 rounded-xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-extrabold text-base outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    aria-label="Random name"
                    title="Random name"
                    onClick={handleRandomName}
                    className="w-[42px] h-[42px] rounded-xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-brand-700 dark:text-brand-400 grid place-items-center shadow-[0_3px_0_var(--color-edge)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-edge)] cursor-pointer"
                  >
                    <DiceIcon size={20} />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
                  Difficulty
                </div>
                <div id="difficultySelector" className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => requestDifficulty(d)}
                      className={`px-3 py-1.5 rounded-full border text-xs font-extrabold cursor-pointer transition-colors ${
                        activeDiff === d
                          ? 'bg-brand-500 border-brand-500 text-brand-900'
                          : 'border-slate-300 dark:border-edge bg-cream-50 dark:bg-cream-100 text-slate-600 dark:text-slate-300 hover:border-brand-500'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-2">
                  Stats
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 bg-cream-100/60 dark:bg-cream-200/20 p-3 rounded-xl border border-edge/60">
                  {DIFFICULTIES.map((d) => (
                    <div key={d} className="flex justify-between items-center">
                      <span className="capitalize">{d}:</span>
                      <span className="font-extrabold text-ink-900">
                        {stats[d].solved} (
                        {stats[d].bestMs !== null
                          ? formatTime(stats[d].bestMs!)
                          : '--:--'}
                        )
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <StickerButton
                variant="ghost"
                size="sm"
                armed={resetArmed}
                onClick={handleResetStats}
                className="w-full"
              >
                {resetArmed ? 'Tap again to reset stats' : 'Reset stats'}
              </StickerButton>
            </div>
          )}

          {/* TAB 2: Play */}
          {activeTab === 'play' && (
            <div className="space-y-3.5 divide-y divide-slate-200 dark:divide-slate-700/60 animate-[paneSlideRight_0.2s_ease-out]">
              <div className="flex items-center justify-between pt-1">
                <span className="font-bold text-sm text-ink-900">
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

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Auto-remove notes
                </span>
                <Toggle
                  checked={autoRemoveNotes}
                  onChange={setAutoRemoveNotes}
                  aria-label="Auto-remove notes"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Highlight row, column, box
                </span>
                <Toggle
                  checked={highlightPeers}
                  onChange={setHighlightPeers}
                  aria-label="Highlight row, column, box"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Highlight same digits
                </span>
                <Toggle
                  checked={highlightSame}
                  onChange={setHighlightSame}
                  aria-label="Highlight same digits"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Show remaining count
                </span>
                <Toggle
                  checked={showRemaining}
                  onChange={setShowRemaining}
                  aria-label="Show remaining count"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
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
            <div className="space-y-3.5 divide-y divide-slate-200 dark:divide-slate-700/60 animate-[paneSlideRight_0.2s_ease-out]">
              <label className="flex items-center justify-between pt-1 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">Sound</span>
                <Toggle
                  checked={sound}
                  onChange={setSound}
                  aria-label="Sound"
                />
              </label>

              <div className="flex items-center justify-between pt-3">
                <span className="font-bold text-sm text-ink-900">Volume</span>
                <Slider
                  min={0}
                  max={100}
                  value={volume}
                  onChange={setVolume}
                  aria-label="Volume"
                />
              </div>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Vibration on mistakes
                </span>
                <Toggle
                  checked={vibrate}
                  onChange={setVibrate}
                  aria-label="Vibration on mistakes"
                />
              </label>

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
                  Reduce motion
                </span>
                <Toggle
                  checked={reduceMotion}
                  onChange={setReduceMotion}
                  aria-label="Reduce motion"
                />
              </label>

              <div className="flex items-center justify-between pt-3">
                <span className="font-bold text-sm text-ink-900">Theme</span>
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

              <div className="flex items-center justify-between pt-3">
                <span className="font-bold text-sm text-ink-900">
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

              <label className="flex items-center justify-between pt-3 cursor-pointer">
                <span className="font-bold text-sm text-ink-900">
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
        <div className="pt-4 border-t border-edge/60 mt-4 flex justify-center">
          <StickerButton
            variant="primary"
            size="lg"
            onClick={handleNewGameClick}
            className="w-full"
          >
            New game
          </StickerButton>
        </div>
      </Modal>

      {/* Stacked confirm difficulty modal */}
      <ConfirmDifficultyModal open={pendingDifficulty !== null} />
    </>
  );
}
