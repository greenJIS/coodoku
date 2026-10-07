interface OtterProps {
  size?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
}

export function Otter({
  size = 22,
  className,
  'aria-hidden': ariaHidden = true,
}: OtterProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      className={className}
    >
      <circle cx="9" cy="9" r="5" fill="#9a6232" />
      <circle cx="31" cy="9" r="5" fill="#9a6232" />
      <circle cx="20" cy="21" r="15" fill="#b9793f" />
      <ellipse cx="20" cy="26" rx="9" ry="7" fill="#f3d9b1" />
      <circle cx="14" cy="19" r="2" fill="#2b1a0f" />
      <circle cx="26" cy="19" r="2" fill="#2b1a0f" />
      <ellipse cx="20" cy="24" rx="3" ry="2.2" fill="#2b1a0f" />
      <path
        d="M17 28q3 2.5 6 0"
        stroke="#2b1a0f"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
