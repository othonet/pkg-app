"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ContainerColor } from "@prisma/client"

const COLOR_OPTIONS: { value: ContainerColor; label: string }[] = [
  { value: "VERMELHO", label: "Vermelho" },
  { value: "AZUL_MARINHO", label: "Azul Marinho" },
  { value: "VERDE", label: "Verde" },
  { value: "AMARELO", label: "Amarelo" },
  { value: "BRANCO", label: "Branco" },
  { value: "LARANJA", label: "Laranja" },
]

const valvulaSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  descricao: z.string().optional(),
  cabecalId: z.string().min(1, "Cabeçal é obrigatório"),
  cor: z.nativeEnum(ContainerColor),
})

type ValvulaFormData = z.infer<typeof valvulaSchema>

interface ValvulasFormProps {
  cabecais: Array<{ id: string; nome: string }>
}

export default function ValvulasForm({ cabecais }: ValvulasFormProps) {
  const router = useRouter()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ValvulaFormData>({
    resolver: zodResolver(valvulaSchema),
    defaultValues: {
      cor: "VERMELHO",
    },
  })

  const corValue = watch("cor")

  const onSubmit = async (data: ValvulaFormData) => {
    try {
      const response = await fetch("/api/cadastros/valvulas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao cadastrar válvula")
      }

      toast({
        title: "Sucesso!",
        description: "Válvula cadastrada com sucesso",
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
        <Label htmlFor="cabecalId">Cabeçal *</Label>
        <Select
          onValueChange={(value) => setValue("cabecalId", value)}
          {...register("cabecalId")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione um cabeçal" />
          </SelectTrigger>
          <SelectContent>
            {cabecais.map((cabecal) => (
              <SelectItem key={cabecal.id} value={cabecal.id}>
                {cabecal.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cabecalId && (
          <p className="text-sm text-destructive">
            {errors.cabecalId.message}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="nome">Nome *</Label>
        <Input
          id="nome"
          placeholder="Nome da válvula"
          {...register("nome")}
        />
        {errors.nome && (
          <p className="text-sm text-destructive">{errors.nome.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="descricao">Descrição</Label>
        <Input
          id="descricao"
          placeholder="Descrição da válvula"
          {...register("descricao")}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cor">Cor do Contentor *</Label>
        <Select
          value={corValue}
          onValueChange={(value) => setValue("cor", value as ContainerColor)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione a cor" />
          </SelectTrigger>
          <SelectContent>
            {COLOR_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cor && (
          <p className="text-sm text-destructive">{errors.cor.message}</p>
        )}
      </div>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  )
}

