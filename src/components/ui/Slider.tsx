import type { ChangeEvent } from 'react';

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  id?: string;
  name?: string;
  'aria-label'?: string;
  className?: string;
}

export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled = false,
  id,
  name,
  'aria-label': ariaLabel,
  className = '',
}: SliderProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <input
      type="range"
      id={id}
      name={name}
      aria-label={ariaLabel}
      min={min}
      max={max}
      step={step}
      value={value}
      disabled={disabled}
      onChange={handleChange}
      className={`
        m-0 h-7 w-37.5 cursor-pointer appearance-none bg-transparent
        focus-visible:outline-2 focus-visible:outline-offset-2
        focus-visible:outline-brand-400
        disabled:cursor-not-allowed disabled:opacity-40
        [&::-moz-range-thumb]:size-5.5 [&::-moz-range-thumb]:rounded-full
        [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-edge
        [&::-moz-range-thumb]:bg-white
        [&::-moz-range-thumb]:shadow-[0_2px_0_var(--color-edge)]
        dark:[&::-moz-range-thumb]:bg-[#4a3c25]
        [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full
        [&::-moz-range-track]:bg-linear-to-b
        [&::-moz-range-track]:from-brand-900 [&::-moz-range-track]:to-brand-800
        [&::-webkit-slider-runnable-track]:h-3
        [&::-webkit-slider-runnable-track]:rounded-full
        [&::-webkit-slider-runnable-track]:bg-linear-to-b
        [&::-webkit-slider-runnable-track]:from-brand-900
        [&::-webkit-slider-runnable-track]:to-brand-800
        [&::-webkit-slider-runnable-track]:shadow-[inset_0_2px_0_#1c0d04]
        [&::-webkit-slider-thumb]:-mt-1.75
        [&::-webkit-slider-thumb]:size-6.5
        [&::-webkit-slider-thumb]:appearance-none
        [&::-webkit-slider-thumb]:rounded-full
        [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-edge
        [&::-webkit-slider-thumb]:bg-white
        [&::-webkit-slider-thumb]:shadow-[0_2px_0_var(--color-edge)]
        dark:[&::-webkit-slider-thumb]:bg-[#4a3c25]
        ${className}
      `}
    />
  );
}
