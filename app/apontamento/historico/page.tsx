import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import { prisma } from "@/lib/prisma"
import { format } from "date-fns"
import { ContainerColor } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ApontamentosList from "@/components/apontamento/apontamentos-list"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

export default async function HistoricoApontamentosPage({
  searchParams,
}: {
  searchParams: { data?: string; cor?: string; cabecal?: string }
}) {
  const params = searchParams
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // Construir filtros
  const where: any = {}

  if (params.data) {
    const data = new Date(params.data)
    const startOfDay = new Date(data.setHours(0, 0, 0, 0))
    const endOfDay = new Date(data.setHours(23, 59, 59, 999))
    where.createdAt = {
      gte: startOfDay,
      lte: endOfDay,
    }
  }

  if (params.cor) {
    where.cor = params.cor as ContainerColor
  }

  if (params.cabecal) {
    where.cabecalId = params.cabecal
  }

  // Buscar apontamentos com filtros
  const apontamentosRaw = await prisma.apontamento.findMany({
    where,
    include: {
      cabecal: true,
      valvula: true,
      variedade: true,
      amostrasPeso: true,
    },
    orderBy: { createdAt: "desc" },
    take: 500, // Limitar a 500 registros
  })

  // Calcular peso médio para cada apontamento que tem amostras
  const apontamentos = apontamentosRaw.map((ap) => {
    let pesoCalculado: number | null = null
    
    if (ap.amostrasPeso.length > 0) {
      // Calcular média das amostras deste apontamento
      const somaPesos = ap.amostrasPeso.reduce((sum, amostra) => sum + amostra.pesoAmostra, 0)
      const pesoMedioAmostras = somaPesos / ap.amostrasPeso.length
      
      // Calcular peso total: média × quantidade de contentores
      pesoCalculado = pesoMedioAmostras * ap.quantidadeContainers
    }

    return {
      ...ap,
      pesoKg: pesoCalculado,
    }
  })

  // Buscar dados para filtros e edição
  const cabecais = await prisma.cabecal.findMany({
    orderBy: { nome: "asc" },
  })

  const valvulas = await prisma.valvula.findMany({
    include: {
      cabecal: true,
    },
    orderBy: { nome: "asc" },
  })

  const variedades = await prisma.variedade.findMany({
    orderBy: { nome: "asc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <svg
              className="w-5 h-5 text-primary drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Histórico de Apontamentos
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Rastreamento e conferência de todos os apontamentos de recebimento
          </p>
        </div>
      </div>

      <ApontamentosList
        apontamentos={apontamentos}
        cabecais={cabecais}
        valvulas={valvulas}
        variedades={variedades}
        initialFilters={params}
      />
    </div>
  )
}

