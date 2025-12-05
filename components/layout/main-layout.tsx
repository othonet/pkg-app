"use client"

import { Sidebar } from "./sidebar"
import { ThemeToggle } from "@/components/ui/theme-toggle"
import { ColorPicker } from "@/components/ui/color-picker"

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b bg-gradient-to-r from-card/80 via-card/60 to-card/40 backdrop-blur-md px-6 shadow-md ring-1 ring-border/50">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-foreground via-foreground/90 to-foreground/80 bg-clip-text text-transparent">
              Sistema de Controle
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ColorPicker />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6 animate-in fade-in-0 duration-300">{children}</main>
      </div>
    </div>
  )
}

