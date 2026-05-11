interface PlayerAvatarProps {
  name: string
  avatar?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  /** Estilo de anel colorido (para 1º lugar, por ex.) */
  ring?: 'accent' | 'brand' | 'none'
}

const SIZE = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

const RING = {
  accent: 'ring-2 ring-accent ring-offset-1',
  brand:  'ring-2 ring-brand/40 ring-offset-1',
  none:   '',
}

export function PlayerAvatar({ name, avatar, size = 'md', className = '', ring = 'none' }: PlayerAvatarProps) {
  const initial = name.charAt(0).toUpperCase()

  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={avatar}
        alt={name}
        className={`${SIZE[size]} rounded-full object-cover shrink-0 ${RING[ring]} ${className}`}
      />
    )
  }

  return (
    <div className={`${SIZE[size]} rounded-full flex items-center justify-center font-black shrink-0 bg-brand/10 text-brand ${RING[ring]} ${className}`}>
      {initial}
    </div>
  )
}
