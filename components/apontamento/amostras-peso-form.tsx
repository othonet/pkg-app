"use client"

import { useState } from "react"
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
import { Plus, Trash2 } from "lucide-react"
import { ContainerColor } from "@prisma/client"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

const amostrasSchema = z.object({
  apontamentoId: z.string().min(1, "Selecione um apontamento"),
  pesos: z.array(z.number().min(0.01, "Peso deve ser maior que zero")).min(1, "Adicione pelo menos uma amostra"),
})

type AmostrasFormData = z.infer<typeof amostrasSchema>

interface Apontamento {
  id: string
  numeroCarroca: number
  numeroPallet: number
  quantidadeContainers: number
  cor: ContainerColor
  cabecal: { nome: string }
  valvula: { nome: string }
  variedade: { nome: string }
  createdAt: Date
}

interface AmostrasPesoFormProps {
  apontamentos: Apontamento[]
}

export default function AmostrasPesoForm({
  apontamentos,
}: AmostrasPesoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [pesos, setPesos] = useState<number[]>([0])

  const {
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<AmostrasFormData>({
    resolver: zodResolver(amostrasSchema),
    defaultValues: {
      pesos: [0],
    },
  })

  const apontamentoIdSelecionado = watch("apontamentoId")
  const apontamentoSelecionado = apontamentos.find(ap => ap.id === apontamentoIdSelecionado)

  const adicionarCampo = () => {
    const novosPesos = [...pesos, 0]
    setPesos(novosPesos)
    setValue("pesos", novosPesos)
  }

  const removerCampo = (index: number) => {
    if (pesos.length > 1) {
      const novosPesos = pesos.filter((_, i) => i !== index)
      setPesos(novosPesos)
      setValue("pesos", novosPesos)
    }
  }

  const atualizarPeso = (index: number, valor: string) => {
    const novosPesos = [...pesos]
    novosPesos[index] = parseFloat(valor) || 0
    setPesos(novosPesos)
    setValue("pesos", novosPesos)
  }

  const calcularPesoMedio = () => {
    const pesosValidos = pesos.filter((p) => p > 0)
    if (pesosValidos.length === 0) return 0
    return pesosValidos.reduce((sum, peso) => sum + peso, 0) / pesosValidos.length
  }

  const calcularPesoTotal = () => {
    const media = calcularPesoMedio()
    if (!apontamentoSelecionado || media === 0) return 0
    return media * apontamentoSelecionado.quantidadeContainers
  }

  const onSubmit = async (data: AmostrasFormData) => {
    try {
      const pesosValidos = data.pesos.filter((p) => p > 0)
      
      if (pesosValidos.length === 0) {
        toast({
          title: "Erro",
          description: "Adicione pelo menos um peso válido",
          variant: "destructive",
        })
        return
      }

      if (!apontamentoIdSelecionado) {
        toast({
          title: "Erro",
          description: "Selecione um apontamento",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/amostras-peso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pesos: pesosValidos,
          apontamentoId: apontamentoIdSelecionado,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao registrar amostras")
      }

      const pesoMedio = calcularPesoMedio()
      const pesoTotal = calcularPesoTotal()

      toast({
        title: "Sucesso!",
        description: `${pesosValidos.length} amostra(s) registrada(s) para ${apontamentoSelecionado?.cabecal.nome} - ${apontamentoSelecionado?.valvula.nome}. Peso médio: ${pesoMedio.toFixed(2)}kg. Peso total estimado do pallet: ${pesoTotal.toFixed(2)}kg`,
      })

      // Limpar formulário (manter apontamento selecionado)
      setPesos([0])
      setValue("pesos", [0])
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const pesoMedio = calcularPesoMedio()
  const pesoTotal = calcularPesoTotal()

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apontamentoId" className="text-sm font-medium">
            Apontamento do Dia *
          </Label>
          <Select
            value={apontamentoIdSelecionado || ""}
            onValueChange={(value) => setValue("apontamentoId", value)}
          >
            <SelectTrigger className="h-11 transition-all focus:scale-[1.01]">
              <SelectValue placeholder="Selecione um apontamento do dia" />
            </SelectTrigger>
            <SelectContent>
              {apontamentos.length === 0 ? (
                <SelectItem value="none" disabled>
                  Nenhum apontamento encontrado para hoje
                </SelectItem>
              ) : (
                apontamentos.map((ap) => (
                  <SelectItem key={ap.id} value={ap.id}>
                    Carroça {ap.numeroCarroca} - Pallet {ap.numeroPallet} | {ap.cabecal.nome} - {ap.valvula.nome} | {ap.quantidadeContainers} contentores ({COLOR_NAMES[ap.cor]})
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {errors.apontamentoId && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.apontamentoId.message}
            </p>
          )}
          {apontamentoSelecionado && (
            <p className="text-xs text-muted-foreground">
              Área: {apontamentoSelecionado.cabecal.nome} - {apontamentoSelecionado.valvula.nome} | 
              Variedade: {apontamentoSelecionado.variedade.nome} | 
              Contentores: {apontamentoSelecionado.quantidadeContainers}
            </p>
          )}
        </div>
        {pesos.map((peso, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor={`peso-${index}`} className="text-sm font-medium">
                Amostra {index + 1} (kg) *
              </Label>
              <Input
                id={`peso-${index}`}
                type="number"
                step="0.01"
                min="0.01"
                placeholder="Ex: 12.5"
                className="h-11 transition-all focus:scale-[1.01]"
                value={peso || ""}
                onChange={(e) => atualizarPeso(index, e.target.value)}
              />
            </div>
            {pesos.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removerCampo(index)}
                className="h-11 w-11 mt-6 text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={adicionarCampo}
          className="w-full h-11"
        >
          <Plus className="h-4 w-4 mr-2" />
          Adicionar Outra Amostra
        </Button>
      </div>

      {(pesoMedio > 0 || pesoTotal > 0) && (
        <div className="p-4 rounded-lg border bg-muted/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Peso Médio:</span>
            <span className="text-lg font-bold">{pesoMedio.toFixed(2)} kg</span>
          </div>
          {apontamentoSelecionado && pesoTotal > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Peso Total Estimado do Pallet:</span>
              <span className="text-lg font-bold text-primary">
                {pesoTotal.toFixed(2)} kg
              </span>
            </div>
          )}
          {apontamentoSelecionado && (
            <p className="text-xs text-muted-foreground mt-2">
              Baseado em {pesos.filter((p) => p > 0).length} amostra(s) × {apontamentoSelecionado.quantidadeContainers} contentores do pallet selecionado
            </p>
          )}
        </div>
      )}

      {errors.pesos && (
        <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
          {errors.pesos.message}
        </p>
      )}

      <div className="pt-4 border-t">
        <Button
          type="submit"
          disabled={isSubmitting || pesoMedio === 0 || !apontamentoIdSelecionado}
          className="w-full h-11 text-base font-semibold bg-gradient-to-r from-primary via-primary to-primary/90 hover:from-primary/90 hover:via-primary hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ring-2 ring-primary/20"
        >
          {isSubmitting ? (
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
              Registrando amostras...
            </span>
          ) : (
            "Registrar Amostras"
          )}
        </Button>
      </div>
    </form>
  )
}

