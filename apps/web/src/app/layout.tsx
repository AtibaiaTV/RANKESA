import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/contexts/auth-context'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RANK',
  description: 'Jogue, Conecte, Evolua. Ranking esportivo da sua cidade.',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: 'RANK' },
}

export const viewport: Viewport = {
  themeColor: '#2E1A8E',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
