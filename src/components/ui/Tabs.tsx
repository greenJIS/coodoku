import { type KeyboardEvent, type ReactNode, useRef } from 'react';

export interface TabItem<T extends string = string> {
  id: T;
  label: ReactNode;
  'aria-label'?: string;
}

export interface TabsProps<T extends string = string> {
  tabs: readonly TabItem<T>[];
  activeTab: T;
  onChange: (id: T) => void;
  className?: string;
  'aria-label'?: string;
}

export function Tabs<T extends string = string>({
  tabs,
  activeTab,
  onChange,
  className = '',
  'aria-label': ariaLabel,
}: TabsProps<T>) {
  const tabRefs = useRef<Map<T, HTMLButtonElement | null>>(new Map());
  const activeIndex = Math.max(
    0,
    tabs.findIndex((t) => t.id === activeTab),
  );

  const handleKeyDown = (
    e: KeyboardEvent<HTMLButtonElement>,
    currentIndex: number,
  ) => {
    let targetIndex = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      targetIndex = (currentIndex + 1) % tabs.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      targetIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else if (e.key === 'Home') {
      targetIndex = 0;
    } else if (e.key === 'End') {
      targetIndex = tabs.length - 1;
    }

    if (targetIndex >= 0) {
      e.preventDefault();
      const targetTab = tabs[targetIndex];
      onChange(targetTab.id);
      const targetElement = tabRefs.current.get(targetTab.id);
      targetElement?.focus();
    }
  };

  const pillWidthStyle =
    tabs.length > 0
      ? `calc((100% - ${8 + (tabs.length - 1) * 4}px) / ${tabs.length})`
      : '0px';

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={`relative flex gap-1 p-1 bg-hairline rounded-full shrink-0 select-none ${className}`}
    >
      {/* Sliding pill indicator */}
      {tabs.length > 0 && (
        <div
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-1 rounded-full bg-cream-50 dark:bg-slate-200 shadow-[0_2px_0_var(--color-edge)] transition-transform duration-[340ms] ease-[cubic-bezier(0.3,1.35,0.5,1)] pointer-events-none"
          style={{
            width: pillWidthStyle,
            transform: `translateX(calc(${activeIndex} * (100% + 4px)))`,
          }}
        />
      )}

      {tabs.map((tab, idx) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current.set(tab.id, el);
            }}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-controls={`pane-${tab.id}`}
            aria-selected={isActive}
            tabIndex={isActive ? 0 : -1}
            aria-label={tab['aria-label']}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={`relative z-10 flex-1 py-[7px] px-1 rounded-full border-0 bg-transparent text-center text-[16px] cursor-pointer [transition:background_.15s,color_.15s] focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2 ${
              isActive ? 'text-ink-900' : 'text-slate-500 hover:text-ink-900'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
