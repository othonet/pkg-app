"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    console.log("[LOGIN FORM] Iniciando login com:", { email: data.email })
    setIsLoading(true)
    try {
      console.log("[LOGIN FORM] Enviando requisição para /api/auth/login")
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      console.log("[LOGIN FORM] Status da resposta:", response.status)
      const result = await response.json()
      console.log("[LOGIN FORM] Resposta recebida:", result)

      if (!response.ok) {
        console.error("[LOGIN FORM] Erro na resposta:", result.error)
        throw new Error(result.error || "Erro ao fazer login")
      }

      console.log("[LOGIN FORM] Login bem-sucedido! Token recebido:", result.user)
      console.log("[LOGIN FORM] Cookies após login:", document.cookie)

      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando...",
      })

      // Usar window.location para garantir que o cookie seja lido
      setTimeout(() => {
        console.log("[LOGIN FORM] Redirecionando para /dashboard")
        window.location.href = "/dashboard"
      }, 500)
    } catch (error: any) {
      console.error("[LOGIN FORM] Erro no login:", error)
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md shadow-2xl border-0 bg-card/95 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 duration-500">
      <CardHeader className="space-y-3 pb-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-2 rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/80 shadow-xl ring-2 ring-primary/20">
          <svg
            className="w-8 h-8 text-primary-foreground drop-shadow-sm"
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
        <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          ARA MES
        </CardTitle>
        <CardDescription className="text-center text-base">
          Sistema de Controle de Recebimento de Frutas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className="h-11 transition-all focus:scale-[1.02]"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              className="h-11 transition-all focus:scale-[1.02]"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
                {errors.password.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ring-2 ring-primary/20"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Entrando...
              </span>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

