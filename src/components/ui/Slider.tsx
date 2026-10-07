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
      className={`appearance-none w-[150px] h-[28px] m-0 bg-transparent cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed
        focus-visible:outline-2 focus-visible:outline-brand-400 focus-visible:outline-offset-2
        [&::-webkit-slider-runnable-track]:h-3 [&::-webkit-slider-runnable-track]:rounded-full [&::-webkit-slider-runnable-track]:bg-linear-to-b [&::-webkit-slider-runnable-track]:from-[#402312] [&::-webkit-slider-runnable-track]:to-[#7a4f08] [&::-webkit-slider-runnable-track]:shadow-[inset_0_2px_0_#1c0d04]
        [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-[26px] [&::-webkit-slider-thumb]:h-[26px] [&::-webkit-slider-thumb]:-mt-[7px] [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white dark:[&::-webkit-slider-thumb]:bg-[#4a3c25] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-edge [&::-webkit-slider-thumb]:shadow-[0_2px_0_var(--color-edge)]
        [&::-moz-range-track]:h-3 [&::-moz-range-track]:rounded-full [&::-moz-range-track]:bg-linear-to-b [&::-moz-range-track]:from-[#402312] [&::-moz-range-track]:to-[#7a4f08]
        [&::-moz-range-thumb]:w-[22px] [&::-moz-range-thumb]:h-[22px] [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-white dark:[&::-moz-range-thumb]:bg-[#4a3c25] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-edge [&::-moz-range-thumb]:shadow-[0_2px_0_var(--color-edge)]
        ${className}`}
    />
  );
}
