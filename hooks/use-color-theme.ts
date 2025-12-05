"use client"

import { useEffect, useState } from "react"

export type ColorTheme = 
  | "blue"
  | "green"
  | "purple"
  | "orange"
  | "pink"
  | "cyan"
  | "red"
  | "indigo"

const colorThemes: Record<ColorTheme, { name: string; light: string; dark: string }> = {
  blue: {
    name: "Azul",
    light: "221 83% 53%",
    dark: "217 91% 60%",
  },
  green: {
    name: "Verde",
    light: "142 76% 36%",
    dark: "142 71% 45%",
  },
  purple: {
    name: "Roxo",
    light: "262 83% 58%",
    dark: "262 80% 65%",
  },
  orange: {
    name: "Laranja",
    light: "25 95% 53%",
    dark: "25 95% 60%",
  },
  pink: {
    name: "Rosa",
    light: "330 81% 60%",
    dark: "330 81% 68%",
  },
  cyan: {
    name: "Ciano",
    light: "188 94% 43%",
    dark: "188 94% 52%",
  },
  red: {
    name: "Vermelho",
    light: "0 72% 51%",
    dark: "0 72% 58%",
  },
  indigo: {
    name: "Índigo",
    light: "239 84% 67%",
    dark: "239 84% 75%",
  },
}

export function useColorTheme() {
  const [colorTheme, setColorThemeState] = useState<ColorTheme>("blue")
  const [mounted, setMounted] = useState(false)

  const applyColorTheme = (theme: ColorTheme) => {
    const colors = colorThemes[theme]
    const root = document.documentElement
    const isDark = document.documentElement.classList.contains("dark")
    
    // Aplicar cores baseadas no tema atual (light/dark)
    if (isDark) {
      root.style.setProperty("--primary", colors.dark)
      root.style.setProperty("--ring", colors.dark)
    } else {
      root.style.setProperty("--primary", colors.light)
      root.style.setProperty("--ring", colors.light)
    }
    
    // Armazenar ambas as cores para uso futuro
    root.style.setProperty("--primary-light", colors.light)
    root.style.setProperty("--primary-dark", colors.dark)
  }

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("color-theme") as ColorTheme
    if (saved && colorThemes[saved]) {
      setColorThemeState(saved)
      applyColorTheme(saved)
    } else {
      applyColorTheme("blue")
    }
  }, [])

  const setColorTheme = (theme: ColorTheme) => {
    setColorThemeState(theme)
    localStorage.setItem("color-theme", theme)
    applyColorTheme(theme)
  }

  // Observar mudanças no tema dark/light para atualizar cores
  useEffect(() => {
    const observer = new MutationObserver(() => {
      applyColorTheme(colorTheme)
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // Também observar mudanças no media query
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
    const handleChange = () => {
      applyColorTheme(colorTheme)
    }
    
    mediaQuery.addEventListener("change", handleChange)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [colorTheme])

  return {
    colorTheme,
    setColorTheme,
    colorThemes,
    mounted,
  }
}

