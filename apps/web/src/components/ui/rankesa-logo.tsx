import Image from 'next/image'

export function RankesaLogo({
  size = 32,
  className = '',
  onLight = false,
}: {
  size?: number
  className?: string
  onLight?: boolean
}) {
  const src = onLight ? '/rankesa-light.svg' : '/rankesa-dark.svg'
  // SVG viewBox aspect ratio ≈ 3.72 : 1
  const width = Math.round(size * 3.72)

  return (
    <Image
      src={src}
      alt="RANKESA"
      width={width}
      height={size}
      style={{ height: size, width: 'auto' }}
      className={className}
      priority
    />
  )
}
