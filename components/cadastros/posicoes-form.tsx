"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const posicaoSchema = z.object({
  posicao: z.string().min(1, "Posição é obrigatória"),
  descricao: z.string().optional(),
})

type PosicaoFormData = z.infer<typeof posicaoSchema>

export default function PosicoesForm() {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<PosicaoFormData>({
    resolver: zodResolver(posicaoSchema),
  })

  const onSubmit = async (data: PosicaoFormData) => {
    try {
      const response = await fetch("/api/cadastros/posicoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar posição")
      }

      toast({
        title: "Sucesso!",
        description: "Posição cadastrada com sucesso",
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
        <Label htmlFor="posicao">Posição *</Label>
        <Input
          id="posicao"
          placeholder="Ex: 1, 2, 3..."
          {...register("posicao")}
        />
        {errors.posicao && (
          <p className="text-sm text-destructive">{errors.posicao.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          placeholder="Descrição da posição"
          {...register("descricao")}
        />
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

