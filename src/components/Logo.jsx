// The Bird Labs geometric bird, redrawn as a crisp SVG mark for light backgrounds.
export function BirdMark({ size = 32, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className={className} aria-hidden="true">
      {/* upper wings */}
      <path d="M8.2 20.5 16.1 15.6 25.5 24.8 27.6 29.2Z" fill="#1e40af" />
      <path d="M55.8 20.5 47.9 15.6 38.5 24.8 36.4 29.2Z" fill="#1e40af" />
      {/* main wings */}
      <path d="M8.2 20.5 27.6 29.2 26.7 38 14.3 31.4Z" fill="#7c3aed" />
      <path d="M55.8 20.5 36.4 29.2 37.3 38 49.7 31.4Z" fill="#7c3aed" />
      {/* lower wings */}
      <path d="M0.7 34.2 14.3 31.4 26.7 38 9.9 40.7Z" fill="#3730a3" />
      <path d="M63.3 34.2 49.7 31.4 37.3 38 54.1 40.7Z" fill="#3730a3" />
      {/* body */}
      <path d="M27.6 29.2H36.4L37.3 38H26.7Z" fill="#6d28d9" />
      <path d="M26.7 38H37.3L36 44.2 32 46.3 28 44.2Z" fill="#3730a3" />
      <path d="M31 46.3H33L32.6 55 31.4 55Z" fill="#4c1d95" />
      {/* neck & head */}
      <path d="M29.8 22.6H34.2L35 29.2H29Z" fill="#a78bfa" />
      <path d="M28 22.6 32 14.5 36 22.6Z" fill="#7c3aed" />
      <path d="M30 9.5 32 15.5 34 9.5 32 13Z" fill="#a78bfa" />
      <circle cx="32" cy="19.6" r="1.6" fill="#0f172a" />
      <circle cx="32" cy="19.6" r="0.6" fill="#93c5fd" />
    </svg>
  )
}

export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <BirdMark size={34} />
      <span className="font-display text-[19px] font-extrabold tracking-tight text-ink-900">
        Bird <span className="text-brand-700">Labs</span>
      </span>
    </span>
  )
}
