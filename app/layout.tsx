import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { ColorThemeInit } from '@/components/color-theme-init'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ARA MES - Sistema de Controle de Recebimento',
  description: 'Sistema para controle de recebimento de frutas',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ColorThemeInit />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

