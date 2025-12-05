"use client"

import * as React from "react"
import { Palette } from "lucide-react"
import { useColorTheme, type ColorTheme } from "@/hooks/use-color-theme"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

const colorOptions: Array<{ theme: ColorTheme; color: string; name: string }> = [
  { theme: "blue", color: "#3b82f6", name: "Azul" },
  { theme: "green", color: "#10b981", name: "Verde" },
  { theme: "purple", color: "#8b5cf6", name: "Roxo" },
  { theme: "orange", color: "#f97316", name: "Laranja" },
  { theme: "pink", color: "#ec4899", name: "Rosa" },
  { theme: "cyan", color: "#06b6d4", name: "Ciano" },
  { theme: "red", color: "#ef4444", name: "Vermelho" },
  { theme: "indigo", color: "#6366f1", name: "Índigo" },
]

export function ColorPicker() {
  const { colorTheme, setColorTheme, mounted } = useColorTheme()
  const [open, setOpen] = React.useState(false)

  if (!mounted) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          title="Selecionar cor do tema"
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Selecionar cor</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-4 shadow-xl ring-1 ring-border/50" align="end">
        <div className="space-y-3">
          <div className="text-sm font-semibold">Cor do Tema</div>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.theme}
                onClick={() => {
                  setColorTheme(option.theme)
                  setOpen(false)
                }}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg",
                  colorTheme === option.theme
                    ? "border-foreground shadow-xl ring-2 ring-offset-2 ring-offset-background ring-primary scale-110"
                    : "border-border hover:border-primary/50"
                )}
                style={{ backgroundColor: option.color }}
                title={option.name}
              >
                {colorTheme === option.theme && (
                  <svg
                    className="h-5 w-5 text-white drop-shadow-lg"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            ))}
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Cor atual: <span className="font-medium">{colorOptions.find((o) => o.theme === colorTheme)?.name}</span>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}

