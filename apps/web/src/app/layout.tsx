import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AppProvider } from '../contexts/AppContext'
import { AuthProvider } from '../contexts/AuthContext'
import { CartProvider } from '../contexts/CartContext'
import { WishlistProvider } from '../contexts/WishlistContext'
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
          <AppProvider>
            <CartProvider userId="user-1">
              <WishlistProvider userId="user-1">
                <div className="min-h-screen bg-[#F5F5F5]">
                  <main>{children}</main>
                </div>
              </WishlistProvider>
            </CartProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

