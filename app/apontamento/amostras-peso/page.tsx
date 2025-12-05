import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import AmostrasPesoForm from "@/components/apontamento/amostras-peso-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { startOfDay } from "date-fns"

export default async function AmostrasPesoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  // Buscar apontamentos do dia vigente
  const hoje = startOfDay(new Date())
  const apontamentosHoje = await prisma.apontamento.findMany({
    where: {
      createdAt: {
        gte: hoje,
      },
    },
    include: {
      cabecal: true,
      valvula: true,
      variedade: true,
    },
    orderBy: {
      createdAt: "desc",
    },
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
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 5.999M9 7l3 1M9 7l-3 9a5.002 5.002 0 005.999 6.001M9 7l6-6m-6 6l6 6m-6-6l-3-1m3 1l3 1"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Amostras de Peso
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Selecione um apontamento do dia e adicione múltiplas amostras de peso. O sistema calculará automaticamente a média e o peso total estimado.
          </p>
        </div>
      </div>

      <Card className="border shadow-2xl bg-gradient-to-br from-card via-card to-card/99 ring-1 ring-border/50 dark:ring-border/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Coleta de Amostras</CardTitle>
        </CardHeader>
        <CardContent>
          <AmostrasPesoForm apontamentos={apontamentosHoje} />
        </CardContent>
      </Card>
    </div>
  )
}

