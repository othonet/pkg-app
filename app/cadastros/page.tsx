import { redirect } from "next/navigation"
import { getCurrentUser } from "@/lib/get-user"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import {
  Package,
  Settings,
  Boxes,
  Sprout,
  Grid3x3,
  User,
} from "lucide-react"

const cadastrosItems = [
  {
    title: "Cabeçais",
    href: "/cadastros/cabecais",
    icon: Package,
    description: "Gerencie os cabeçais do sistema",
  },
  {
    title: "Válvulas",
    href: "/cadastros/valvulas",
    icon: Settings,
    description: "Gerencie as válvulas e suas cores",
  },
  {
    title: "Variedades",
    href: "/cadastros/variedades",
    icon: Sprout,
    description: "Cadastre variedades de frutas",
  },
  {
    title: "Linhas de Produção",
    href: "/cadastros/linhas-producao",
    icon: Grid3x3,
    description: "Gerencie linhas de produção",
  },
  {
    title: "Posições",
    href: "/cadastros/posicoes",
    icon: Boxes,
    description: "Cadastre posições do sistema",
  },
  {
    title: "Embaladeiras",
    href: "/cadastros/embaladeiras",
    icon: User,
    description: "Gerencie embaladeiras",
  },
]

export default async function CadastrosPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/")
  }

  return (
    <div className="space-y-6 animate-in fade-in-0 duration-500">
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center shadow-lg ring-2 ring-primary/20">
            <Settings className="w-5 h-5 text-primary drop-shadow-sm" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Cadastros
          </h1>
        </div>
        
        <div className="p-4 rounded-lg border-2 border-green-500/30 bg-green-500/10 dark:bg-green-500/5">
          <p className="text-sm text-green-700 dark:text-green-300">
            Gerencie todos os cadastros do sistema
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cadastrosItems.map((item, index) => (
          <Link 
            key={item.href} 
            href={item.href}
            className="animate-in fade-in-0 slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <Card className="hover:shadow-2xl transition-all duration-300 cursor-pointer h-full border shadow-xl hover:scale-[1.02] group bg-gradient-to-br from-card via-card to-card/99 ring-1 ring-border/50 dark:ring-border/30">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg ring-2 ring-primary/20">
                    <item.icon className="h-6 w-6 text-primary drop-shadow-sm" />
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {item.description}
                </CardDescription>
              </CardHeader>
              <div className="px-6 pb-6">
                <div className="flex items-center gap-2 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform duration-300">
                  <span>Gerenciar</span>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

