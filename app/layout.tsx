import './globals.css'
import type { Metadata } from 'next'
import { Poppins, Inter, Space_Grotesk } from 'next/font/google'
import { Toaster } from 'sonner'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'SirkupAI Cafe POS',
  description: 'Advanced Point of Sale System for Modern Cafes by SirkupAI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable} ${spaceGrotesk.variable}`}>
      <body className={poppins.className}>
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={3000}
          toastOptions={{
            style: {
              fontFamily: 'var(--font-poppins)',
            },
          }}
        />
      </body>
    </html>
  )
}