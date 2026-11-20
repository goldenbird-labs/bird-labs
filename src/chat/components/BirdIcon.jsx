export default function BirdIcon({ size = 24, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="30" cy="36" rx="16" ry="12" fill="white" opacity="0.95" />
      {/* Wing */}
      <path
        d="M14 34 C6 26, 8 16, 18 20 C22 22, 26 28, 30 30"
        fill="white"
        opacity="0.85"
      />
      {/* Head */}
      <circle cx="44" cy="26" r="9" fill="white" opacity="0.95" />
      {/* Eye */}
      <circle cx="47" cy="24" r="2" fill="#3b82f6" />
      <circle cx="47.7" cy="23.3" r="0.7" fill="white" />
      {/* Beak */}
      <path d="M52 26 L57 24 L52 28 Z" fill="#f59e0b" />
      {/* Tail */}
      <path
        d="M14 40 C8 44, 4 50, 10 48 C14 46, 18 42, 22 42"
        fill="white"
        opacity="0.8"
      />
      {/* Leg lines */}
      <line x1="30" y1="47" x2="28" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <line x1="34" y1="47" x2="36" y2="54" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  )
}
