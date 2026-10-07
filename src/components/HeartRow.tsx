import { HeartIcon } from './icons';
import { useGameStore } from '../store/game';

export interface HeartRowProps {
  hearts?: number;
  className?: string;
}

export function HeartRow({
  hearts: explicitHearts,
  className = '',
}: HeartRowProps) {
  const storeHearts = useGameStore((s) => s.game?.hearts ?? 5);
  const hearts = explicitHearts ?? storeHearts;
  const maxHearts = 5;

  return (
    <div
      role="group"
      aria-label={`${hearts} of ${maxHearts} hearts remaining`}
      data-testid="heart-row"
      className={`flex items-center gap-1.5 ${className}`}
    >
      {Array.from({ length: maxHearts }, (_, i) => {
        const isAlive = i < hearts;
        return (
          <div
            key={i}
            className={`transition-transform duration-200 ${
              isAlive ? 'scale-100' : 'scale-[0.82]'
            }`}
          >
            <HeartIcon
              size={26}
              filled={isAlive}
              className={`transition-colors duration-200 ${
                isAlive
                  ? 'text-accent-500 fill-accent-500 stroke-accent-700'
                  : 'text-slate-300 dark:text-slate-600 fill-slate-300 dark:fill-slate-600 stroke-slate-400 dark:stroke-slate-500'
              }`}
            />
          </div>
        );
      })}
    </div>
  );
}
