interface OtterProps {
  size?: number | string;
  className?: string;
  'aria-hidden'?: boolean;
}

export function Otter({
  size = 32,
  className,
  'aria-hidden': ariaHidden = true,
}: OtterProps) {
  return (
    <svg
      viewBox="0 0 48 48"
      width={size}
      height={size}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden={ariaHidden}
      className={className}
    >
      {/* Outer Ears */}
      <circle cx="10" cy="15" r="5" fill="#8a532e" />
      <circle cx="38" cy="15" r="5" fill="#8a532e" />
      {/* Inner Ears */}
      <circle cx="10" cy="15" r="2.8" fill="#f6d3a3" />
      <circle cx="38" cy="15" r="2.8" fill="#f6d3a3" />

      {/* Head shape */}
      <ellipse cx="24" cy="24" rx="17" ry="15" fill="#a4693e" />

      {/* Chubby cheeks / muzzle */}
      <ellipse cx="24" cy="28.5" rx="11" ry="8.5" fill="#fdedd4" />
      <ellipse cx="19.5" cy="28" rx="4.5" ry="4" fill="#fdedd4" />
      <ellipse cx="28.5" cy="28" rx="4.5" ry="4" fill="#fdedd4" />

      {/* Cheeks blush */}
      <circle cx="14" cy="28" r="2.5" fill="#fca5a5" opacity="0.65" />
      <circle cx="34" cy="28" r="2.5" fill="#fca5a5" opacity="0.65" />

      {/* Cute eyes */}
      <circle cx="17" cy="21" r="2.6" fill="#2d1b0f" />
      <circle cx="16" cy="20" r="0.9" fill="#ffffff" />
      <circle cx="31" cy="21" r="2.6" fill="#2d1b0f" />
      <circle cx="30" cy="20" r="0.9" fill="#ffffff" />

      {/* Nose */}
      <path
        d="M22 25.5C22 24.8 22.8 24 24 24C25.2 24 26 24.8 26 25.5C26 26.5 24.8 27.2 24 27.2C23.2 27.2 22 26.5 22 25.5Z"
        fill="#2d1b0f"
      />

      {/* Mouth */}
      <path
        d="M21.5 28C22.2 29 23.2 29.3 24 28.5C24.8 29.3 25.8 29 26.5 28"
        stroke="#2d1b0f"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* Whiskers */}
      <path
        d="M13 26.5L8.5 25.5M13 28.5L7.5 29M35 26.5L39.5 25.5M35 28.5L40.5 29"
        stroke="#5a3922"
        strokeWidth="1"
        strokeLinecap="round"
      />

      {/* Cute little front paws */}
      <ellipse cx="18" cy="38" rx="3.5" ry="2.8" fill="#8a532e" />
      <ellipse cx="30" cy="38" rx="3.5" ry="2.8" fill="#8a532e" />
    </svg>
  );
}
