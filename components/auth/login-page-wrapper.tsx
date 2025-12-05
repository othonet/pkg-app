"use client"

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
      <div className="flex flex-1 overflow-hidden items-center justify-center px-8 py-8">
        <div className="flex w-full max-w-6xl h-full max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl border border-border/30 backdrop-blur-sm">
          {/* Left Side - Login Form (60%) */}
          <div className="flex-[0.6] flex items-center justify-center p-8 bg-gradient-to-br from-background via-background/95 to-primary/5 relative">
          {/* Decorative background elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-48 h-48 bg-primary/5 rounded-full blur-2xl"></div>
          </div>
          
          {/* Logo no topo esquerdo */}
          <div className="absolute top-8 left-8 flex items-center gap-2 z-10">
            <div className="w-10 h-10 rounded-full overflow-hidden ring-2 ring-primary/20 shadow-lg">
              <div className="w-full h-full flex">
                <div className="w-1/2 bg-primary/80"></div>
                <div className="w-1/2 bg-primary"></div>
              </div>
            </div>
          </div>

          {/* Login Form Content */}
          <div className="relative z-10 w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="text-2xl font-semibold text-foreground mb-2">
                Login with e-mail and password
              </h1>
            </div>
            <LoginForm />
          </div>
        </div>

          {/* Right Side - Decorative Graphics (40%) */}
          <div className="flex-[0.4] flex items-center justify-center p-8 bg-card/20 dark:bg-card/10 backdrop-blur-sm relative overflow-hidden">
          {/* Main circular graphic */}
          <div className="relative z-10 flex items-center justify-center">
            <div className="w-64 h-64 rounded-full overflow-hidden ring-4 ring-primary/20 shadow-2xl">
              <div className="w-full h-full flex">
                <div className="w-1/2 bg-primary/80 dark:bg-primary/70"></div>
                <div className="w-1/2 bg-primary dark:bg-primary/90"></div>
              </div>
            </div>
            
            {/* Smaller decorative circles */}
            <div className="absolute top-10 right-10 w-16 h-16 bg-primary/60 rounded-full blur-sm"></div>
            <div className="absolute bottom-20 left-12 w-12 h-12 bg-primary/50 rounded-full blur-sm"></div>
            <div className="absolute top-32 left-8 w-8 h-8 bg-primary/40 rounded-full blur-sm"></div>
            <div className="absolute bottom-32 right-16 w-10 h-10 bg-primary/50 rounded-full blur-sm"></div>
            <div className="absolute top-1/2 right-8 w-14 h-14 bg-primary/45 rounded-full blur-sm"></div>
            <div className="absolute bottom-16 right-1/3 w-9 h-9 bg-primary/40 rounded-full blur-sm"></div>
          </div>

          {/* Background pattern */}
          <div className="absolute inset-0 opacity-[0.05] dark:opacity-[0.08]">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.1),transparent_70%)]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

