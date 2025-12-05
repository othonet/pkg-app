"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  Settings,
  LogOut,
  FileText,
  PlayCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

const menuItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    children: [
      { title: "Dashboard Primário", href: "/dashboard" },
      { title: "Dashboard Secundário", href: "/dashboard/secundario" },
    ],
  },
  {
    title: "Apontamento",
    href: "/apontamento",
    icon: Package,
    children: [
      { title: "Novo Apontamento", href: "/apontamento" },
      { title: "Amostras de Peso", href: "/apontamento/amostras-peso" },
      { title: "Histórico", href: "/apontamento/historico" },
    ],
  },
  {
    title: "Cadastros",
    href: "/cadastros",
    icon: Settings,
    children: [
      { title: "Cabeçais", href: "/cadastros/cabecais" },
      { title: "Válvulas", href: "/cadastros/valvulas" },
      { title: "Variedades", href: "/cadastros/variedades" },
      { title: "Linhas de Produção", href: "/cadastros/linhas-producao" },
      { title: "Posições", href: "/cadastros/posicoes" },
      { title: "Embaladeiras", href: "/cadastros/embaladeiras" },
    ],
  },
  {
    title: "Simulação",
    href: "/simulacao",
    icon: PlayCircle,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      // Usar window.location para garantir que o cookie seja removido
      window.location.href = "/"
    } catch (error) {
      console.error("Erro ao fazer logout:", error)
      // Mesmo em caso de erro, redirecionar para a página de login
      window.location.href = "/"
    }
  }

  return (
    <div className="flex h-full w-64 flex-col rounded-2xl backdrop-blur-xl bg-card/40 dark:bg-card/30 border border-border/50 shadow-xl shadow-black/5 dark:shadow-black/20 ring-1 ring-white/10 dark:ring-white/5 overflow-hidden">
      {/* Overlay interno para profundidade */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 via-white/5 to-transparent dark:from-white/5 dark:via-transparent dark:to-white/5 pointer-events-none"></div>
      
      {/* Header com Glassmorfismo */}
      <div className="relative z-10 flex h-16 items-center border-b border-border/30 px-6 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 flex items-center justify-center shadow-lg ring-2 ring-primary/30 backdrop-blur-sm">
            <svg
              className="w-5 h-5 text-primary-foreground drop-shadow-sm"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            PKG
          </h1>
        </div>
      </div>
      
      {/* Navigation com Glassmorfismo */}
      <nav className="relative z-10 flex-1 space-y-1 p-4 overflow-y-auto">
        {menuItems.map((item, index) => (
          <div key={item.href} className="animate-in fade-in-0 slide-in-from-left-4" style={{ animationDelay: `${index * 50}ms` }}>
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 group backdrop-blur-sm",
                pathname === item.href || (item.children && pathname.startsWith(item.href))
                  ? "bg-gradient-to-r from-primary/90 via-primary/80 to-primary/90 text-primary-foreground shadow-lg shadow-primary/20 ring-2 ring-primary/30 scale-[1.02] backdrop-blur-md"
                  : "hover:bg-white/10 dark:hover:bg-white/5 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-md hover:ring-1 hover:ring-white/20 dark:hover:ring-white/10"
              )}
            >
              <item.icon className={cn(
                "h-5 w-5 transition-transform duration-200",
                pathname === item.href || (item.children && pathname.startsWith(item.href))
                  ? "scale-110"
                  : "group-hover:scale-110"
              )} />
              <span>{item.title}</span>
            </Link>
            {item.children && (pathname.startsWith(item.href) || pathname === item.href) && (
              <div className="ml-8 mt-1 space-y-1 animate-in fade-in-0 slide-in-from-top-2">
                {item.children.map((child, childIndex) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-all duration-200 backdrop-blur-sm",
                      pathname === child.href
                        ? "bg-primary/30 dark:bg-primary/20 text-primary font-medium shadow-md shadow-primary/10 ring-1 ring-primary/40 scale-[1.02] backdrop-blur-md"
                        : "hover:bg-white/10 dark:hover:bg-white/5 hover:text-accent-foreground hover:scale-[1.01] hover:shadow-sm hover:ring-1 hover:ring-white/20 dark:hover:ring-white/10"
                    )}
                    style={{ animationDelay: `${childIndex * 30}ms` }}
                  >
                    <div className={cn(
                      "w-1.5 h-1.5 rounded-full transition-all",
                      pathname === child.href ? "bg-primary" : "bg-muted-foreground/30 group-hover:bg-primary/50"
                    )} />
                    {child.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
      
      {/* Footer com Glassmorfismo */}
      <div className="relative z-10 border-t border-border/30 p-4 bg-gradient-to-t from-card/40 to-transparent backdrop-blur-md">
        <Button
          variant="ghost"
          className="w-full justify-start hover:bg-destructive/20 dark:hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group rounded-xl backdrop-blur-sm hover:ring-1 hover:ring-destructive/20"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4 transition-transform group-hover:rotate-12" />
          Sair
        </Button>
      </div>
    </div>
  )
}

