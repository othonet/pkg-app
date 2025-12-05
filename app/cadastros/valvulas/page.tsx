import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import ValvulasForm from "@/components/cadastros/valvulas-form"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings } from "lucide-react"

export default async function ValvulasPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const valvulas = await prisma.valvula.findMany({
    include: {
      cabecal: true,
    },
    orderBy: { createdAt: "desc" },
  })

  const cabecais = await prisma.cabecal.findMany({
    orderBy: { nome: "asc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <Settings className="w-5 h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Válvulas
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Gerencie as válvulas e suas cores
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Válvula</CardTitle>
            <CardDescription>Adicione uma nova válvula ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <ValvulasForm cabecais={cabecais} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Válvulas Cadastradas</CardTitle>
            <CardDescription>Lista de todas as válvulas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {valvulas.length > 0 ? (
                valvulas.map((valvula) => (
                  <div
                    key={valvula.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{valvula.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        Cabeçal: {valvula.cabecal.nome} | Cor: {valvula.cor}
                      </p>
                      {valvula.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {valvula.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma válvula cadastrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

