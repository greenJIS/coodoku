import { type ChangeEvent, useEffect, useRef, useState } from 'react';
import type { Difficulty } from '../../engine';
import { randomName } from '../../lib/names';
import { formatTime } from '../../lib/time';
import { useGameStore } from '../../store/game';
import { useSettingsStore } from '../../store/settings';
import { useStatsStore } from '../../store/stats';
import { CloseIcon, DiceIcon } from '../icons';
import { IconButton, Segmented, Slider, Tabs, Toggle } from '../ui';
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
      ? 'animate-[paneSlideLeft_0.26s_cubic-bezier(0.2,0.9,0.3,1)]'
      : 'animate-[paneSlideRight_0.26s_cubic-bezier(0.2,0.9,0.3,1)]';

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        originRef={gearBtnRef}
        label="Settings"
        className="relative flex flex-col max-h-[92vh] max-w-[420px] text-left px-6! pt-[22px]! pb-[18px]!"
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

        <h2 className="text-[20px] font-bold text-ink-900 mb-3 text-center">
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
        <div className="h-[336px] max-h-[calc(92vh-200px)] overflow-y-auto -mr-2.5 pr-2.5">
          {/* TAB 1: Game */}
          {activeTab === 'game' && (
            <div className={paneAnimation}>
              <div>
                <label
                  htmlFor="settingsNameInput"
                  className="block text-[12px] font-bold uppercase tracking-[0.06em] text-slate-500 mt-0.5 mb-2"
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
                    className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-ink-900 font-extrabold text-[16px] outline-none focus:border-brand-500 transition-colors"
                  />
                  <button
                    type="button"
                    aria-label="Random name"
                    title="Random name"
                    onClick={handleRandomName}
                    className="w-[42px] h-[42px] rounded-xl border-2 border-edge bg-cream-50 dark:bg-cream-100 text-user grid place-items-center shadow-[0_3px_0_var(--color-edge)] active:translate-y-[2px] active:shadow-[0_1px_0_var(--color-edge)] cursor-pointer"
                  >
                    <DiceIcon />
                  </button>
                </div>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-slate-500 mt-3.5 mb-2">
                  Difficulty
                </div>
                <div
                  id="difficultySelector"
                  className="flex flex-wrap gap-1.5 mb-1"
                >
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => requestDifficulty(d)}
                      className={`px-3 py-1 rounded-full border text-[12px] font-bold cursor-pointer transition-colors ${
                        activeDiff === d
                          ? 'bg-brand-500 border-brand-500 text-brand-900'
                          : 'border-[#e4e2de] bg-white/60 dark:bg-[#3a2f1e] text-slate-500 hover:border-brand-500'
                      }`}
                    >
                      {d.charAt(0).toUpperCase() + d.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-[12px] font-bold uppercase tracking-[0.06em] text-slate-500 mt-3.5 mb-2">
                  Stats
                </div>
                <div className="grid grid-cols-2 gap-x-[18px] gap-y-1.5 text-[13px] font-semibold text-slate-500 mb-2.5">
                  <div className="flex justify-between">
                    <span>Solved</span>
                    <b className="font-extrabold text-ink-900">{totalSolved}</b>
                  </div>
                  <div />
                  {DIFFICULTIES.map((d) => (
                    <div key={d} className="flex justify-between">
                      <span>Best {d.charAt(0).toUpperCase() + d.slice(1)}</span>
                      <b className="font-extrabold text-ink-900">
                        {stats[d].bestMs !== null
                          ? formatTime(stats[d].bestMs)
                          : '\u2013'}
                      </b>
                    </div>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetStats}
                className={`w-full mt-1 px-2 py-2 rounded-full border-2 bg-transparent font-bold cursor-pointer transition-colors ${
                  resetArmed
                    ? 'border-error text-error'
                    : 'border-edge text-slate-500 hover:border-brand-600'
                }`}
              >
                {resetArmed ? 'Tap again to confirm' : 'Reset stats'}
              </button>
            </div>
          )}

          {/* TAB 2: Play */}
          {activeTab === 'play' && (
            <div className={paneAnimation}>
              <div className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
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

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Auto-remove notes
                </span>
                <Toggle
                  checked={autoRemoveNotes}
                  onChange={setAutoRemoveNotes}
                  aria-label="Auto-remove notes"
                />
              </label>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Highlight row, column, box
                </span>
                <Toggle
                  checked={highlightPeers}
                  onChange={setHighlightPeers}
                  aria-label="Highlight row, column, box"
                />
              </label>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Highlight same digits
                </span>
                <Toggle
                  checked={highlightSame}
                  onChange={setHighlightSame}
                  aria-label="Highlight same digits"
                />
              </label>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Show remaining count
                </span>
                <Toggle
                  checked={showRemaining}
                  onChange={setShowRemaining}
                  aria-label="Show remaining count"
                />
              </label>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
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
              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Sound
                </span>
                <Toggle
                  checked={sound}
                  onChange={setSound}
                  aria-label="Sound"
                />
              </label>

              <div className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Volume
                </span>
                <Slider
                  min={0}
                  max={100}
                  value={volume}
                  onChange={setVolume}
                  aria-label="Volume"
                />
              </div>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Vibration on mistakes
                </span>
                <Toggle
                  checked={vibrate}
                  onChange={setVibrate}
                  aria-label="Vibration on mistakes"
                />
              </label>

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Reduce motion
                </span>
                <Toggle
                  checked={reduceMotion}
                  onChange={setReduceMotion}
                  aria-label="Reduce motion"
                />
              </label>

              <div className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
                  Theme
                </span>
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

              <div className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
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

              <label className="flex items-center justify-between min-h-[46px] border-b border-hairline last:border-b-0 cursor-pointer">
                <span className="font-bold text-[14px] text-ink-900 pr-3">
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
          <button
            type="button"
            onClick={handleNewGameClick}
            className="w-full mt-1.5 px-[22px] py-2.5 rounded-full border-0 bg-brand-500 text-brand-900 font-bold cursor-pointer transition-[filter,transform] duration-100 hover:brightness-105 active:translate-y-[2px] focus-visible:outline-3 focus-visible:outline-brand-300 focus-visible:outline-offset-2"
          >
            New game
          </button>
        </div>
      </Modal>

      {/* Stacked confirm difficulty modal */}
      <ConfirmDifficultyModal open={pendingDifficulty !== null} />
    </>
  );
}
