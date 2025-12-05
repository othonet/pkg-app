import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { startOfDay, getHours } from "date-fns"
import { getLocalHours, getStartOfDayInBrazil } from "@/lib/timezone"
import { LayoutDashboard } from "lucide-react"
import CarrocasPorHoraChart from "@/components/dashboard/secundario/carrocas-por-hora-chart"
import PalletsPorHoraChart from "@/components/dashboard/secundario/pallets-por-hora-chart"
import CabecaisPorHoraChart from "@/components/dashboard/secundario/cabecais-por-hora-chart"
import ValvulasPorHoraChart from "@/components/dashboard/secundario/valvulas-por-hora-chart"
import ContentoresPorHoraSecundarioChart from "@/components/dashboard/secundario/contentores-por-hora-chart"
import CarrocasPorDiaChart from "@/components/dashboard/secundario/carrocas-por-dia-chart"
import PalletsPorDiaChart from "@/components/dashboard/secundario/pallets-por-dia-chart"
import CabecaisPorDiaChart from "@/components/dashboard/secundario/cabecais-por-dia-chart"
import ValvulasPorDiaChart from "@/components/dashboard/secundario/valvulas-por-dia-chart"
import ContentoresPorDiaChart from "@/components/dashboard/secundario/contentores-por-dia-chart"

export default async function DashboardSecundarioPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const now = new Date()
  // Usar início do dia no fuso horário de Brasília
  const startOfToday = getStartOfDayInBrazil(now)
  const horaInicioExpediente = 6
  const horaFimExpediente = 18
  const horaAtual = getLocalHours(now)

  // Buscar todos os apontamentos do dia
  const apontamentosHoje = await prisma.apontamento.findMany({
    where: {
      createdAt: {
        gte: startOfToday,
      },
    },
    include: {
      cabecal: true,
      valvula: true,
    },
  })

  // Preparar dados por hora (6h-18h)
  const horaFim = Math.min(horaAtual, horaFimExpediente)
  const intervalos = []
  for (let h = horaInicioExpediente; h <= horaFim; h++) {
    intervalos.push(`${h.toString().padStart(2, '0')}h-${(h + 1).toString().padStart(2, '0')}h`)
  }

  // Agrupar dados por intervalo de hora
  const dadosPorHora = new Map<string, {
    carrocas: Set<number>
    pallets: Set<number>
    cabecais: Set<string>
    valvulas: Set<string>
    contentores: number
  }>()

  intervalos.forEach(intervalo => {
    dadosPorHora.set(intervalo, {
      carrocas: new Set(),
      pallets: new Set(),
      cabecais: new Set(),
      valvulas: new Set(),
      contentores: 0,
    })
  })

  apontamentosHoje.forEach((ap) => {
    const hora = getLocalHours(ap.createdAt)
    if (hora >= horaInicioExpediente && hora <= horaFimExpediente) {
      const intervalo = `${hora.toString().padStart(2, '0')}h-${(hora + 1).toString().padStart(2, '0')}h`
      const dados = dadosPorHora.get(intervalo)
      if (dados) {
        dados.carrocas.add(ap.numeroCarroca)
        dados.pallets.add(ap.numeroPallet)
        dados.cabecais.add(ap.cabecal.nome)
        dados.valvulas.add(ap.valvula.nome)
        dados.contentores += ap.quantidadeContainers
      }
    }
  })

  // Converter para arrays para os gráficos
  const carrocasPorHoraData = intervalos.map(intervalo => {
    const dados = dadosPorHora.get(intervalo) || { carrocas: new Set() }
    return {
      intervalo,
      quantidade: dados.carrocas.size,
    }
  })

  const palletsPorHoraData = intervalos.map(intervalo => {
    const dados = dadosPorHora.get(intervalo) || { pallets: new Set() }
    return {
      intervalo,
      quantidade: dados.pallets.size,
    }
  })

  const cabecaisPorHoraData = intervalos.map(intervalo => {
    const dados = dadosPorHora.get(intervalo) || { cabecais: new Set() }
    return {
      intervalo,
      quantidade: dados.cabecais.size,
    }
  })

  const valvulasPorHoraData = intervalos.map(intervalo => {
    const dados = dadosPorHora.get(intervalo) || { valvulas: new Set() }
    return {
      intervalo,
      quantidade: dados.valvulas.size,
    }
  })

  const contentoresPorHoraData = intervalos.map(intervalo => {
    const dados = dadosPorHora.get(intervalo) || { contentores: 0 }
    return {
      intervalo,
      quantidade: dados.contentores,
    }
  })

  // Dados por dia (totais do dia)
  const carrocasUnicas = new Set(apontamentosHoje.map(ap => ap.numeroCarroca))
  const palletsUnicos = new Set(apontamentosHoje.map(ap => ap.numeroPallet))
  const cabecaisUnicos = new Set(apontamentosHoje.map(ap => ap.cabecal.nome))
  const valvulasUnicas = new Set(apontamentosHoje.map(ap => ap.valvula.nome))
  const totalContentores = apontamentosHoje.reduce((sum, ap) => sum + ap.quantidadeContainers, 0)

  const dadosPorDia = [
    { item: "Carroças", quantidade: carrocasUnicas.size },
    { item: "Pallets", quantidade: palletsUnicos.size },
    { item: "Cabeçal", quantidade: cabecaisUnicos.size },
    { item: "Válvula", quantidade: valvulasUnicas.size },
    { item: "Contentores", quantidade: totalContentores },
  ]

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-3 sm:space-y-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <LayoutDashboard className="w-4 h-4 sm:w-5 sm:h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Dashboard Secundário
          </h1>
        </div>
        
        <div className="p-3 sm:p-4 rounded-lg border-2 border-blue-500/30 bg-blue-500/10 dark:bg-blue-500/5">
          <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
            Análise detalhada por intervalos de hora e totais do dia vigente
          </p>
        </div>
      </div>

      {/* Gráficos por Intervalos de 1 Hora */}
      <div className="space-y-4 sm:space-y-6">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold">Por Intervalos de 1 Hora (Expediente: 6h-18h)</h2>
        
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Carroças por Hora</CardTitle>
              <CardDescription>Quantidade única de carroças por intervalo</CardDescription>
            </CardHeader>
            <CardContent>
              <CarrocasPorHoraChart data={carrocasPorHoraData} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Pallets por Hora</CardTitle>
              <CardDescription>Quantidade única de pallets por intervalo</CardDescription>
            </CardHeader>
            <CardContent>
              <PalletsPorHoraChart data={palletsPorHoraData} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Cabeçais por Hora</CardTitle>
              <CardDescription>Quantidade única de cabeçais por intervalo</CardDescription>
            </CardHeader>
            <CardContent>
              <CabecaisPorHoraChart data={cabecaisPorHoraData} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Válvulas por Hora</CardTitle>
              <CardDescription>Quantidade única de válvulas por intervalo</CardDescription>
            </CardHeader>
            <CardContent>
              <ValvulasPorHoraChart data={valvulasPorHoraData} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contentores por Hora</CardTitle>
              <CardDescription>Total de contentores por intervalo</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentoresPorHoraSecundarioChart data={contentoresPorHoraData} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Gráficos por Dia Vigente */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Por Dia Vigente</h2>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Carroças</CardTitle>
              <CardDescription>Total único de carroças do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <CarrocasPorDiaChart data={dadosPorDia.filter(d => d.item === "Carroças")} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Pallets</CardTitle>
              <CardDescription>Total único de pallets do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <PalletsPorDiaChart data={dadosPorDia.filter(d => d.item === "Pallets")} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Cabeçais</CardTitle>
              <CardDescription>Total único de cabeçais do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <CabecaisPorDiaChart data={dadosPorDia.filter(d => d.item === "Cabeçal")} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Válvulas</CardTitle>
              <CardDescription>Total único de válvulas do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ValvulasPorDiaChart data={dadosPorDia.filter(d => d.item === "Válvula")} />
            </CardContent>
          </Card>

          <Card className="border shadow-xl ring-1 ring-border/50 md:col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Contentores</CardTitle>
              <CardDescription>Total de contentores do dia</CardDescription>
            </CardHeader>
            <CardContent>
              <ContentoresPorDiaChart data={dadosPorDia.filter(d => d.item === "Contentores")} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

