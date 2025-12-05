"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const embaladeiraSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
})

type EmbaladeiraFormData = z.infer<typeof embaladeiraSchema>

export default function EmbaladeirasForm() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<EmbaladeiraFormData>({
    resolver: zodResolver(embaladeiraSchema),
  })

  const onSubmit = async (data: EmbaladeiraFormData) => {
    try {
      const response = await fetch("/api/cadastros/embaladeiras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar embaladeira")
      }

      toast({
        title: "Sucesso!",
        description: "Embaladeira cadastrada com sucesso",
      })

      reset()
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          placeholder="Nome da embaladeira"
          {...register("nome")}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

