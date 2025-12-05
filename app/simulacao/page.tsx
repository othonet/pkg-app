import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import SimulacaoPanel from "@/components/simulacao/simulacao-panel"
import { prisma } from "@/lib/prisma"
import { ContainerColor } from "@prisma/client"
import { PlayCircle } from "lucide-react"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

export default async function SimulacaoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // Buscar dados atuais para exibir
  const cabecais = await prisma.cabecal.findMany({
    orderBy: { nome: "asc" },
    take: 3,
  })

  const variedades = await prisma.variedade.findMany({
    orderBy: { nome: "asc" },
    take: 3,
  })

  const valvulas = await prisma.valvula.findMany({
    include: { cabecal: true },
    take: 6,
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <PlayCircle className="w-5 h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Modo Simulação
          </h1>
          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30">
            DEMO
          </span>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Ferramenta temporária para simular o funcionamento do sistema durante apresentações. Os dados simulados podem ser removidos facilmente.
          </p>
        </div>
      </div>

      <SimulacaoPanel 
        cabecais={cabecais}
        variedades={variedades}
        valvulas={valvulas}
      />
    </div>
  )
}

