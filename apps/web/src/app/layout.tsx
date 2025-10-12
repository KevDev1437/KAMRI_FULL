import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '../contexts/AuthContext'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'KAMRI - E-commerce Platform',
  description: 'Modern e-commerce platform built with Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="min-h-screen bg-[#F5F5F5]">
            <main>{children}</main>
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

