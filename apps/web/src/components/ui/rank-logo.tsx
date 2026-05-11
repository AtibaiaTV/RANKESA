/**
 * Logo RANK — ícone triangular roxo + verde (versão fundo escuro)
 */

interface RankIconProps {
  size?: number
}

/** O ícone triangular que substitui o "A" no logotipo */
export function RankIcon({ size = 36 }: RankIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Metade esquerda — azul-violeta do logo */}
      <path
        d="M30 4 L4 48 H20 V56 H30 V4 Z"
        fill="#3F01C4"
      />
      {/* Metade direita — verde limão */}
      <path
        d="M30 4 V56 H40 V48 H56 L30 4 Z"
        fill="#8DC22A"
      />
      {/* Separador central branco sutil */}
      <line x1="30" y1="4" x2="30" y2="56" stroke="white" strokeWidth="1.5" />
    </svg>
  )
}

interface RankLogoProps {
  /** Variante do fundo — define cor do texto e tagline */
  variant?: 'dark' | 'light'
  /** Mostrar ou não a tagline "Jogue · Conecte · Evolua" */
  showTagline?: boolean
  /** Tamanho do ícone em px (padrão 36) */
  iconSize?: number
  /** Classe extra no container */
  className?: string
}

/**
 * Logo completo: R [ícone] NK
 * Uso: <RankLogo /> em fundos escuros (navy), <RankLogo variant="light" /> em fundos claros
 */
export function RankLogo({
  variant = 'dark',
  showTagline = true,
  iconSize = 36,
  className = '',
}: RankLogoProps) {
  const textCls    = variant === 'dark' ? 'text-white'   : 'text-navy'
  const taglineCls = variant === 'dark' ? 'text-accent'  : 'text-brand'

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      {/* R [ícone] NK */}
      <div className="flex items-center" style={{ gap: iconSize * 0.1 }}>
        <span
          className={`font-black ${textCls} leading-none tracking-tight`}
          style={{ fontSize: iconSize * 0.9, letterSpacing: '-0.02em' }}
        >
          R
        </span>

        <RankIcon size={iconSize} />

        <span
          className={`font-black ${textCls} leading-none tracking-tight`}
          style={{ fontSize: iconSize * 0.9, letterSpacing: '-0.02em' }}
        >
          NK
        </span>
      </div>

      {showTagline && (
        <p
          className={`font-bold uppercase tracking-[0.22em] ${taglineCls}`}
          style={{ fontSize: iconSize * 0.22 }}
        >
          Jogue · Conecte · Evolua
        </p>
      )}
    </div>
  )
}
