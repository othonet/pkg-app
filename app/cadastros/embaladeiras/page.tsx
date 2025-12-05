import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import EmbaladeirasForm from "@/components/cadastros/embaladeiras-form"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { User } from "lucide-react"

export default async function EmbaladeirasPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  const embaladeiras = await prisma.embaladeira.findMany({
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <User className="w-5 h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Embaladeiras
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Gerencie as embaladeiras do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Nova Embaladeira</CardTitle>
            <CardDescription>Adicione uma nova embaladeira ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <EmbaladeirasForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Embaladeiras Cadastradas</CardTitle>
            <CardDescription>Lista de todas as embaladeiras</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {embaladeiras.length > 0 ? (
                embaladeiras.map((embaladeira) => (
                  <div
                    key={embaladeira.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div>
                      <p className="font-medium">{embaladeira.nome}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">
                  Nenhuma embaladeira cadastrada ainda
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

