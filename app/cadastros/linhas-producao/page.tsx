import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import LinhasProducaoForm from "@/components/cadastros/linhas-producao-form"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Grid3x3 } from "lucide-react"

export default async function LinhasProducaoPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const linhas = await prisma.linhaProducao.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <Grid3x3 className="w-5 h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Linhas de Produção
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Gerencie as linhas de produção
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Linha de Produção</CardTitle>
            <CardDescription>Adicione uma nova linha ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <LinhasProducaoForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Linhas Cadastradas</CardTitle>
            <CardDescription>Lista de todas as linhas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {linhas.length > 0 ? (
                linhas.map((linha) => (
                  <div
                    key={linha.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">Linha {linha.letra}</p>
                      {linha.descricao && (
                        <p className="text-sm text-muted-foreground">
                          {linha.descricao}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma linha cadastrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

