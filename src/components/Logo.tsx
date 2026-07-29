interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 40, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="DiN Japanese"
    >
      <defs>
        <linearGradient id="logoBg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#1e293b" />
          <stop offset="1" stopColor="#0f172a" />
        </linearGradient>
        <linearGradient id="logoAccent" x1="12" y1="10" x2="36" y2="38" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ef4444" />
          <stop offset="1" stopColor="#dc2626" />
        </linearGradient>
      </defs>

      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#logoBg)" stroke="#334155" strokeWidth="1.5" />

      <path
        d="M14 14 L14 34 M14 14 L22 14 M14 24 L20 24"
        stroke="#f8fafc"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <path
        d="M30 12 C30 12 34 16 34 22 C34 28 30 32 30 32 M30 12 C30 12 26 16 26 22 C26 28 30 32 30 32"
        stroke="url(#logoAccent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />

      <circle cx="30" cy="22" r="2.5" fill="url(#logoAccent)" />

      <path
        d="M16 38 L32 38"
        stroke="#475569"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
