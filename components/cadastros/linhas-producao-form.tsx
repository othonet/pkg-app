"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const linhaSchema = z.object({
  letra: z.string().min(1, "Letra é obrigatória"),
  descricao: z.string().optional(),
})

type LinhaFormData = z.infer<typeof linhaSchema>

export default function LinhasProducaoForm() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LinhaFormData>({
    resolver: zodResolver(linhaSchema),
  })

  const onSubmit = async (data: LinhaFormData) => {
    try {
      const response = await fetch("/api/cadastros/linhas-producao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar linha")
      }

      toast({
        title: "Sucesso!",
        description: "Linha de produção cadastrada com sucesso",
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
        <Label htmlFor="letra">Letra *</Label>
        <Input
          id="letra"
          placeholder="Ex: A, B, C..."
          maxLength={1}
          {...register("letra")}
        />
        {errors.letra && (
          <p className="text-sm text-destructive">{errors.letra.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          placeholder="Descrição da linha"
          {...register("descricao")}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

