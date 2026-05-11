interface IconProps {
  className?: string
  size?: number
  color?: string
}

export function TennisIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="2"/>
      <path d="M7 12 Q20 20 7 28" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M33 12 Q20 20 33 28" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  )
}

export function TableTennisIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="14" cy="20" rx="12" ry="12" stroke={color} strokeWidth="2"/>
      <rect x="24" y="18" width="13" height="4" rx="2" stroke={color} strokeWidth="2"/>
      <circle cx="34" cy="10" r="4" stroke={color} strokeWidth="2"/>
      <line x1="2" y1="32" x2="38" y2="32" stroke={color} strokeWidth="2"/>
    </svg>
  )
}

export function BadmintonIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="20" cy="13" rx="9" ry="9" stroke={color} strokeWidth="2"/>
      <line x1="20" y1="22" x2="20" y2="37" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
      <line x1="14" y1="13" x2="26" y2="13" stroke={color} strokeWidth="1.5"/>
      <line x1="11" y1="9" x2="29" y2="9" stroke={color} strokeWidth="1.5"/>
    </svg>
  )
}

export function SoccerIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="2"/>
      <polygon points="20,9 24,14 20,19 16,14" stroke={color} strokeWidth="1.5" fill="none"/>
      <polygon points="9,17 14,14 16,19 11,22" stroke={color} strokeWidth="1.5" fill="none"/>
      <polygon points="31,17 26,14 24,19 29,22" stroke={color} strokeWidth="1.5" fill="none"/>
      <polygon points="12,29 11,22 16,22 17,28" stroke={color} strokeWidth="1.5" fill="none"/>
      <polygon points="28,29 29,22 24,22 23,28" stroke={color} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

export function BasketballIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="2"/>
      <line x1="3" y1="20" x2="37" y2="20" stroke={color} strokeWidth="1.5"/>
      <line x1="20" y1="3" x2="20" y2="37" stroke={color} strokeWidth="1.5"/>
      <path d="M20 3 Q10 10 10 20 Q10 30 20 37" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M20 3 Q30 10 30 20 Q30 30 20 37" stroke={color} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

export function VolleyballIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="20" cy="20" r="17" stroke={color} strokeWidth="2"/>
      <path d="M3 20 Q10 8 22 8 Q34 8 37 20" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M8 30 Q16 18 28 22 Q36 26 37 20" stroke={color} strokeWidth="1.5" fill="none"/>
      <path d="M3 20 Q6 28 14 32 Q22 36 32 30" stroke={color} strokeWidth="1.5" fill="none"/>
    </svg>
  )
}

export function PadelIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="4" width="20" height="22" rx="10" stroke={color} strokeWidth="2"/>
      <line x1="8" y1="15" x2="28" y2="15" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="4" x2="18" y2="26" stroke={color} strokeWidth="1.5"/>
      <line x1="18" y1="26" x2="18" y2="38" stroke={color} strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  )
}

export function SwimmingIcon({ size = 40, color = 'currentColor', className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="30" cy="8" r="4" stroke={color} strokeWidth="2"/>
      <path d="M26 12 L14 20 L20 24 L10 32" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 32 Q10 28 16 32 Q22 36 28 32 Q34 28 38 32" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}
