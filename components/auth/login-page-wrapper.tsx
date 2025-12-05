"use client"

import { useState } from 'react'
import Image from 'next/image'
import LoginForm from './login-form'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LoginPageWrapper() {
  const [imageError, setImageError] = useState(false)
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Top Bar */}
      <div className="relative z-20 flex items-center justify-end gap-4 px-6 py-4 backdrop-blur-md bg-card/30 dark:bg-card/20 border-b border-border/30">
        <ThemeToggle />
      </div>

      {/* Split Screen Container - Centralizado com espaços laterais */}
      <div className="flex flex-1 overflow-hidden items-center justify-center px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="flex flex-col md:flex-row w-full max-w-6xl h-full max-h-[95vh] md:max-h-[85vh] rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border border-border/30 backdrop-blur-sm">
          {/* Left Side - Login Form (60%) */}
          <div className="flex-1 md:flex-[0.6] flex items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-br from-background via-background/95 to-primary/5 relative min-h-[50vh] md:min-h-0">
            {/* Decorative background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
              <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
            </div>
            
            {/* Logo no topo esquerdo */}
            <div className="absolute top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8 flex items-center gap-2 z-10">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-lg">
                <div className="w-full h-full flex">
                  <div className="w-1/2 bg-primary/80"></div>
                  <div className="w-1/2 bg-primary"></div>
                </div>
              </div>
            </div>

            {/* Login Form Content */}
            <div className="relative z-10 w-full max-w-md">
              <div className="mb-4 sm:mb-6 md:mb-8 text-center">
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  Login with e-mail and password
                </h1>
              </div>
              <LoginForm />
            </div>
          </div>

          {/* Right Side - AGRO Image (40%) - Hidden on mobile */}
          <div className="hidden md:flex flex-[0.4] items-center justify-center p-6 md:p-8 bg-gradient-to-br from-green-50/50 via-green-50/30 to-primary/5 dark:from-green-950/20 dark:via-green-950/10 dark:to-primary/10 backdrop-blur-sm relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]"></div>
            </div>
            
            {/* Decorative elements */}
            <div className="absolute top-10 right-10 w-32 h-32 bg-green-500/10 rounded-full blur-2xl"></div>
            <div className="absolute bottom-20 left-12 w-24 h-24 bg-primary/10 rounded-full blur-xl"></div>
            
            {/* AGRO Image */}
            <div className="relative z-10 flex items-center justify-center w-full h-full">
              <div className="relative w-full h-full max-w-md max-h-[500px] flex items-center justify-center">
                {!imageError ? (
                  <Image
                    src="/images/agro-image.jpg"
                    alt="AGRO - Agricultura e Tecnologia"
                    fill
                    className="object-contain rounded-lg"
                    priority
                    sizes="(max-width: 768px) 0vw, 40vw"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  /* Fallback decorativo caso a imagem não exista */
                  <div className="flex flex-col items-center justify-center text-center p-8 w-full h-full">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-500/20 via-green-500/10 to-primary/10 flex items-center justify-center mb-6 shadow-lg ring-2 ring-green-500/20">
                      <svg
                        className="w-16 h-16 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                        />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-green-700 dark:text-green-300 mb-2">
                      AGRO
                    </h2>
                    <p className="text-sm text-green-600/80 dark:text-green-400/80">
                      Agricultura e Tecnologia
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Adicione sua imagem em: /public/images/agro-image.jpg
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

