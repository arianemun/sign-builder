interface GuideAppIconProps {
  id: string
  className?: string
}

const ICONS: Record<string, { src: string; alt: string }> = {
  gmail: { src: '/icons/apps/gmail.svg', alt: 'Gmail' },
  'outlook-desktop': { src: '/icons/apps/outlook.svg', alt: 'Outlook' },
  'outlook-web': { src: '/icons/apps/outlook.svg', alt: 'Outlook' },
  'apple-mail': { src: '/icons/apps/apple.svg', alt: 'Apple Mail' },
  thunderbird: { src: '/icons/apps/thunderbird.svg', alt: 'Thunderbird' },
}

/** Official Simple Icons brand marks for install-guide platforms */
export function GuideAppIcon({ id, className = '' }: GuideAppIconProps) {
  const icon = ICONS[id]
  if (!icon) return null

  return (
    <img
      className={`guide-app-icon ${className}`.trim()}
      src={icon.src}
      alt=""
      width={24}
      height={24}
      decoding="async"
      aria-hidden
    />
  )
}
