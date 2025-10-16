import AuthGuard from '@/components/AuthGuard'
import { AuthProvider } from '@/contexts/AuthContext'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KAMRI Admin - Dashboard Dropshipping',
  description: 'Dashboard administrateur pour la plateforme KAMRI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <div className="min-h-screen bg-gray-50">
              {children}
            </div>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}