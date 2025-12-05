"use client"

import { Sprout } from 'lucide-react'
import LoginForm from './login-form'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export function LoginPageWrapper() {
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
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-green-500/30 shadow-lg bg-gradient-to-br from-green-500/90 to-green-600 flex items-center justify-center">
                <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
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

          {/* Right Side - Decorative Graphics (40%) - Hidden on mobile */}
          <div className="hidden md:flex flex-[0.4] items-center justify-center p-6 md:p-8 bg-card/20 dark:bg-card/10 backdrop-blur-sm relative overflow-hidden">
            {/* Main circular graphic with AGRO icon */}
            <div className="relative z-10 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full overflow-hidden ring-4 ring-green-500/30 shadow-2xl bg-gradient-to-br from-green-500/80 via-green-500/70 to-green-600/90 dark:from-green-500/70 dark:via-green-500/60 dark:to-green-600/80 flex items-center justify-center">
                <Sprout className="w-32 h-32 text-white/90 drop-shadow-lg" />
              </div>
              
              {/* Smaller decorative circles */}
              <div className="absolute top-10 right-10 w-16 h-16 bg-green-500/40 rounded-full blur-sm"></div>
              <div className="absolute bottom-20 left-12 w-12 h-12 bg-green-500/30 rounded-full blur-sm"></div>
              <div className="absolute top-32 left-8 w-8 h-8 bg-green-500/30 rounded-full blur-sm"></div>
              <div className="absolute bottom-32 right-16 w-10 h-10 bg-green-500/35 rounded-full blur-sm"></div>
              <div className="absolute top-1/2 right-8 w-14 h-14 bg-green-500/35 rounded-full blur-sm"></div>
              <div className="absolute bottom-16 right-1/3 w-9 h-9 bg-green-500/30 rounded-full blur-sm"></div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

