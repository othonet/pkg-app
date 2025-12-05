import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContainerColor } from "@prisma/client"
import { format, subHours, startOfDay, setHours, getHours } from "date-fns"
import { getLocalHours, getStartOfDayInBrazil } from "@/lib/timezone"
import ContentoresChart from "@/components/dashboard/contentores-chart"
import ContentoresPorHoraChart from "@/components/dashboard/contentores-por-hora-chart"
import { LayoutDashboard } from "lucide-react"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

export default async function DashboardPage() {
  console.log("[DASHBOARD] Carregando página do dashboard...")
  const user = await getCurrentUser()
  console.log("[DASHBOARD] Usuário atual:", user ? { id: user.id, email: user.email, role: user.role } : "Não encontrado")

  if (!user) {
    console.log("[DASHBOARD] Usuário não encontrado, redirecionando para /")
    redirect("/")
  }

  const now = new Date()
  // Usar início do dia no fuso horário de Brasília
  const startOfToday = getStartOfDayInBrazil(now)
  const startOfYesterday = startOfDay(subHours(startOfToday, 24))

  // Buscar todos os apontamentos do dia com suas amostras e uso de packing
  const apontamentosComAmostrasHoje = await prisma.apontamento.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    include: {
      amostrasPeso: {
        where: {
          createdAt: {
            gte: startOfToday,
          },
        },
      },
      packingSimulacao: true,
    },
  })

  // Calcular peso total do dia: soma de todos os pesos calculados dos apontamentos
  // Para cada apontamento: média das amostras × quantidade de contentores RESTANTES (não usados)
  let pesoTotalDia = 0
  let totalAmostras = 0
  let apontamentosComAmostras = 0
  let totalContainersComAmostras = 0

  apontamentosComAmostrasHoje.forEach((apontamento) => {
    if (apontamento.amostrasPeso.length > 0) {
      // Calcular média das amostras deste apontamento
      const somaPesos = apontamento.amostrasPeso.reduce((sum, amostra) => sum + amostra.pesoAmostra, 0)
      const pesoMedioAmostras = somaPesos / apontamento.amostrasPeso.length
      
      // Calcular quantidade de contentores restantes (não usados)
      const quantidadeUsada = apontamento.packingSimulacao?.quantidadeUsada || 0
      const quantidadeRestante = apontamento.quantidadeContainers - quantidadeUsada
      
      // Calcular peso total deste apontamento: média × quantidade de contentores RESTANTES
      const pesoTotalApontamento = pesoMedioAmostras * quantidadeRestante
      
      // Somar ao peso total do dia (apenas o peso dos contentores restantes)
      pesoTotalDia += pesoTotalApontamento
      
      totalAmostras += apontamento.amostrasPeso.length
      apontamentosComAmostras++
      totalContainersComAmostras += apontamento.quantidadeContainers
    }
  })

  // Total de contentores recebidos no dia
  const totalContainersHoje = await prisma.apontamento.aggregate({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    _sum: {
      quantidadeContainers: true,
    },
  })

  // Total recebido no dia por cor
  const containersReceivedToday = await prisma.apontamento.groupBy({
    by: ["cor"],
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    _sum: {
      quantidadeContainers: true,
    },
  })

  // Buscar uso simulado do packing por cor
  const packingSimulacaoHoje = await prisma.packingSimulacao.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
      apontamento: {
        createdAt: {
          gte: startOfToday,
        },
      },
    },
    include: {
      apontamento: {
        select: {
          cor: true,
          quantidadeContainers: true,
        },
      },
    },
  })

  // Agrupar uso por cor
  const usoPorCor = new Map<ContainerColor, number>()
  packingSimulacaoHoje.forEach((packing) => {
    const cor = packing.apontamento.cor
    const atual = usoPorCor.get(cor) || 0
    usoPorCor.set(cor, atual + packing.quantidadeUsada)
  })

  // Converter para formato groupBy
  const containersUsedToday = Array.from(usoPorCor.entries()).map(([cor, quantidade]) => ({
    cor,
    _sum: { quantidadeContainers: quantidade },
  }))

  // Recebido no dia anterior por cor
  const containersReceivedYesterday = await prisma.apontamento.groupBy({
    by: ["cor"],
    where: {
      createdAt: {
        gte: startOfYesterday,
        lt: startOfToday,
      },
    },
    _sum: {
      quantidadeContainers: true,
    },
  })

  // Usado no dia anterior por cor (por enquanto 0)
  const containersUsedYesterday: Array<{ cor: ContainerColor; _sum: { quantidadeContainers: number | null } }> = []

  // Criar mapas para facilitar o cálculo
  const receivedMap = new Map<string, number>()
  const usedMap = new Map<string, number>()
  const receivedYesterdayMap = new Map<string, number>()
  const usedYesterdayMap = new Map<string, number>()

  containersReceivedToday.forEach((item) => {
    receivedMap.set(item.cor, item._sum.quantidadeContainers || 0)
  })

  containersUsedToday.forEach((item) => {
    usedMap.set(item.cor, item._sum.quantidadeContainers || 0)
  })

  containersReceivedYesterday.forEach((item) => {
    receivedYesterdayMap.set(item.cor, item._sum.quantidadeContainers || 0)
  })

  containersUsedYesterday.forEach((item) => {
    usedYesterdayMap.set(item.cor, item._sum.quantidadeContainers || 0)
  })

  // Calcular sobra do dia anterior
  const sobraYesterdayMap = new Map<string, number>()
  const allColors: ContainerColor[] = ["VERMELHO", "AZUL_MARINHO", "VERDE", "AMARELO", "BRANCO", "LARANJA"]
  
  allColors.forEach((cor) => {
    const recebidoOntem = receivedYesterdayMap.get(cor) || 0
    const usadoOntem = usedYesterdayMap.get(cor) || 0
    const sobra = recebidoOntem - usadoOntem
    if (sobra > 0) {
      sobraYesterdayMap.set(cor, sobra)
    }
  })

  // Calcular dados por cor: recebido, usado, restante (incluindo sobra anterior)
  const containersByColor = allColors.map((cor) => {
    const recebido = receivedMap.get(cor) || 0
    const usado = usedMap.get(cor) || 0
    const sobraAnterior = sobraYesterdayMap.get(cor) || 0
    const restante = (sobraAnterior + recebido) - usado

    return {
      cor: COLOR_NAMES[cor],
      recebido,
      usado,
      restante: Math.max(0, restante),
      sobraAnterior,
    }
  }).filter(item => item.recebido > 0 || item.usado > 0 || item.restante > 0 || item.sobraAnterior > 0)

  // Contentores recebidos por hora (intervalos de 1h)
  const apontamentosParaGrafico = await prisma.apontamento.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    select: {
      quantidadeContainers: true,
      createdAt: true,
    },
  })

  // Agrupar por intervalos de 1h
  const containersPorHora = new Map<string, number>()
  const horaAtual = getLocalHours(now)
  const horaInicioExpediente = 6 // Expediente começa às 6h
  const horaFimExpediente = 18 // Expediente termina às 18h
  
  // Criar intervalos do início do expediente até o fim do expediente (ou hora atual se for antes)
  const horaFim = Math.min(horaAtual, horaFimExpediente)
  for (let h = horaInicioExpediente; h <= horaFim; h++) {
    const intervalo = `${h.toString().padStart(2, '0')}h-${(h + 1).toString().padStart(2, '0')}h`
    containersPorHora.set(intervalo, 0)
  }

  // Agrupar apontamentos por intervalo (usando hora local de Brasília)
  apontamentosParaGrafico.forEach((ap) => {
    const hora = getLocalHours(ap.createdAt)
    // Só considerar apontamentos dentro do horário de expediente
    if (hora >= horaInicioExpediente && hora <= horaFimExpediente) {
      const intervalo = `${hora.toString().padStart(2, '0')}h-${(hora + 1).toString().padStart(2, '0')}h`
      const atual = containersPorHora.get(intervalo) || 0
      containersPorHora.set(intervalo, atual + ap.quantidadeContainers)
    }
  })

  // Manter todos os intervalos do expediente, mesmo com quantidade 0
  const containersPorHoraData = Array.from(containersPorHora.entries())
    .map(([intervalo, quantidade]) => ({
      intervalo,
      quantidade,
    }))
    .sort((a, b) => a.intervalo.localeCompare(b.intervalo))

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Primário
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Visão geral do recebimento de frutas
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-card/99 ring-1 ring-border/50 dark:ring-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-muted-foreground">
                  Peso Total Estimado
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {format(now, "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/30 via-green-500/20 to-green-500/10 flex items-center justify-center shadow-lg ring-2 ring-green-500/20">
                <svg
                  className="w-6 h-6 text-green-600 dark:text-green-400 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                  />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-500 dark:from-green-400 dark:to-green-300 bg-clip-text text-transparent">
              {pesoTotalDia > 0 ? pesoTotalDia.toFixed(2) : "0.00"}
              <span className="text-xl text-muted-foreground ml-2">kg</span>
            </div>
            {pesoTotalDia > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Soma de {apontamentosComAmostras} pallet(s) com amostras | {totalAmostras} amostra(s) | {totalContainersComAmostras} contentores
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] bg-gradient-to-br from-card via-card to-card/99 ring-1 ring-border/50 dark:ring-border/30">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-medium text-muted-foreground">
                  Contentores Recebidos
                </CardTitle>
                <CardDescription className="text-xs mt-1">
                  {format(now, "dd/MM/yyyy")}
                </CardDescription>
              </div>
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/30 via-blue-500/20 to-blue-500/10 flex items-center justify-center shadow-lg ring-2 ring-blue-500/20">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400 drop-shadow-sm"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-500 dark:from-blue-400 dark:to-blue-300 bg-clip-text text-transparent">
              {totalContainersHoje._sum.quantidadeContainers || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Total de contentores recebidos hoje
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-xl hover:shadow-2xl transition-all duration-300 ring-1 ring-border/50 dark:ring-border/30 bg-gradient-to-br from-card via-card to-card/99">
          <CardHeader>
            <CardTitle className="text-xl">Contentores Recebidos vs Restantes</CardTitle>
            <CardDescription>
              Quantidade de contentores recebidos e restantes por cor (rastreabilidade)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentoresChart data={containersByColor} />
          </CardContent>
        </Card>

        <Card className="border shadow-xl hover:shadow-2xl transition-all duration-300 ring-1 ring-border/50 dark:ring-border/30 bg-gradient-to-br from-card via-card to-card/99">
          <CardHeader>
            <CardTitle className="text-xl">Contentores por Hora</CardTitle>
            <CardDescription>
              Quantidade de contentores recebidos no pátio por intervalos de 1 hora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContentoresPorHoraChart data={containersPorHoraData} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
