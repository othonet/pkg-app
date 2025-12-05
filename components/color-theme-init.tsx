"use client"

import { useEffect } from "react"
import { useColorTheme } from "@/hooks/use-color-theme"

export function ColorThemeInit() {
  const { mounted } = useColorTheme()
  
  // Este componente apenas garante que o hook seja inicializado
  // As cores serão aplicadas automaticamente pelo hook
  return null
}

