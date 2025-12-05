import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import ApontamentoForm from "@/components/apontamento/apontamento-form"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function ApontamentoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const cabecais = await prisma.cabecal.findMany({
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
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Apontamento de Chegada
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Registre pallets individuais. Cada pallet representa 168 contentores de uma área específica do campo (CAB + VÁLVULA).
          </p>
        </div>
      </div>

      <Card className="border shadow-2xl bg-gradient-to-br from-card via-card to-card/99 ring-1 ring-border/50 dark:ring-border/30">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl">Novo Apontamento</CardTitle>
        </CardHeader>
        <CardContent>
          <ApontamentoForm cabecais={cabecais} variedades={variedades} />
        </CardContent>
      </Card>
    </div>
  )
}

