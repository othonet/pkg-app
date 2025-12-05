"use client"

import LoginForm from './login-form'
import { ColorPicker } from '@/components/ui/color-picker'

export function LoginPageWrapper() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute top-6 right-6 z-10">
        <ColorPicker />
      </div>
      <LoginForm />
    </div>
  )
}

