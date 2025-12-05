"use client"

import { useState, useEffect } from "react"
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
import { cn } from "@/lib/utils"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

const apontamentoSchema = z.object({
  numeroCarroca: z.number().min(1, "Número da carroça é obrigatório"),
  numeroPallet: z.number().min(1, "Número do pallet é obrigatório"),
  cabecalId: z.string().min(1, "Cabeçal é obrigatório"),
  valvulaId: z.string().min(1, "Válvula é obrigatória"),
  variedadeId: z.string().min(1, "Variedade é obrigatória"),
  quantidadeContainers: z.number().min(1, "Quantidade é obrigatória"),
  cor: z.nativeEnum(ContainerColor).optional(), // Será definida automaticamente pela válvula na API
})

type ApontamentoFormData = z.infer<typeof apontamentoSchema>

interface ApontamentoFormProps {
  cabecais: Array<{ id: string; nome: string }>
  variedades: Array<{ id: string; nome: string }>
}

export default function ApontamentoForm({
  cabecais,
  variedades,
}: ApontamentoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [valvulas, setValvulas] = useState<Array<{ id: string; nome: string; cor: ContainerColor }>>([])
  const [selectedValvula, setSelectedValvula] = useState<string>("")
  const [loadingValvulas, setLoadingValvulas] = useState(false)
  const [numeroCarrocaFixo, setNumeroCarrocaFixo] = useState<number | null>(null)

  const COLOR_OPTIONS: Array<{ value: ContainerColor; label: string; color: string }> = [
    { value: "VERMELHO", label: "Vermelho", color: "#ef4444" },
    { value: "AZUL_MARINHO", label: "Azul Marinho", color: "#1e3a8a" },
    { value: "VERDE", label: "Verde", color: "#22c55e" },
    { value: "AMARELO", label: "Amarelo", color: "#eab308" },
    { value: "BRANCO", label: "Branco", color: "#ffffff" },
    { value: "LARANJA", label: "Laranja", color: "#f97316" },
  ]

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    reset,
  } = useForm<ApontamentoFormData>({
    resolver: zodResolver(apontamentoSchema),
    defaultValues: {
      quantidadeContainers: 168, // Quantidade padrão de um pallet completo
    },
  })

  const cabecalId = watch("cabecalId")
  const numeroCarroca = watch("numeroCarroca")
  
  // Obter a cor da válvula selecionada
  const valvulaSelecionada = valvulas.find(v => v.id === selectedValvula)
  const corAutomatica = valvulaSelecionada?.cor

  // Carregar número da carroça do localStorage ao montar
  useEffect(() => {
    const saved = localStorage.getItem("numeroCarroca")
    if (saved) {
      const num = parseInt(saved, 10)
      if (!isNaN(num)) {
        setNumeroCarrocaFixo(num)
        setValue("numeroCarroca", num)
      }
    }
  }, [setValue])

  // Salvar número da carroça no localStorage quando mudar
  useEffect(() => {
    if (numeroCarroca && numeroCarroca > 0) {
      localStorage.setItem("numeroCarroca", numeroCarroca.toString())
      setNumeroCarrocaFixo(numeroCarroca)
    }
  }, [numeroCarroca])

  useEffect(() => {
    if (cabecalId) {
      setLoadingValvulas(true)
      fetch(`/api/cadastros/valvulas/${cabecalId}`)
        .then((res) => res.json())
        .then((data) => {
          setValvulas(data)
          setLoadingValvulas(false)
        })
        .catch(() => {
          setLoadingValvulas(false)
        })
    } else {
      setValvulas([])
      setSelectedValvula("")
    }
  }, [cabecalId])

  useEffect(() => {
    if (selectedValvula) {
      setValue("valvulaId", selectedValvula)
      // Definir a cor automaticamente baseada na válvula selecionada
      const valvula = valvulas.find(v => v.id === selectedValvula)
      if (valvula) {
        setValue("cor", valvula.cor)
      }
    }
  }, [selectedValvula, setValue, valvulas])

  const onSubmit = async (data: ApontamentoFormData) => {
    try {
      const response = await fetch("/api/apontamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao registrar apontamento")
      }

      toast({
        title: "Sucesso!",
        description: `Pallet registrado com sucesso! Área: ${cabecais.find(c => c.id === data.cabecalId)?.nome} - ${valvulas.find(v => v.id === data.valvulaId)?.nome}`,
      })

      // Manter número da carroça e quantidade padrão, limpar apenas os campos do pallet
      setValue("numeroPallet", 0)
      setValue("cabecalId", "")
      setValue("valvulaId", "")
      setValue("variedadeId", "")
      setValue("quantidadeContainers", 168)
      setSelectedValvula("")
      setValvulas([])
      
      // Não fazer reset completo para manter o número da carroça
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="numeroCarroca" className="text-sm font-medium">
              Número da Carroça *
            </Label>
            {numeroCarrocaFixo && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  localStorage.removeItem("numeroCarroca")
                  setNumeroCarrocaFixo(null)
                  setValue("numeroCarroca", 0)
                }}
                className="h-7 text-xs"
              >
                Alterar
              </Button>
            )}
          </div>
          <Input
            id="numeroCarroca"
            type="number"
            placeholder="Ex: 1, 2, 3..."
            className="h-11 transition-all focus:scale-[1.01]"
            {...register("numeroCarroca", { valueAsNumber: true })}
          />
          {numeroCarrocaFixo && (
            <p className="text-xs text-muted-foreground">
              Carroça {numeroCarrocaFixo} fixa - Você pode registrar múltiplos pallets
            </p>
          )}
          {errors.numeroCarroca && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.numeroCarroca.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="numeroPallet" className="text-sm font-medium">
            Número do Pallet *
          </Label>
          <Input
            id="numeroPallet"
            type="number"
            placeholder="Ex: 1, 2, 3..."
            className="h-11 transition-all focus:scale-[1.01]"
            {...register("numeroPallet", { valueAsNumber: true })}
          />
          {errors.numeroPallet && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.numeroPallet.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="cabecalId" className="text-sm font-medium">
            Área do Campo - Cabeçal *
          </Label>
          <Select
            onValueChange={(value) => {
              setValue("cabecalId", value)
              setSelectedValvula("")
            }}
          >
            <SelectTrigger className="h-11 transition-all focus:scale-[1.01]">
              <SelectValue placeholder="Selecione o cabeçal (CAB)" />
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
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.cabecalId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="valvulaId" className="text-sm font-medium">
            Área do Campo - Válvula *
          </Label>
          <Select
            value={selectedValvula}
            onValueChange={setSelectedValvula}
            disabled={!cabecalId || loadingValvulas}
          >
            <SelectTrigger className="h-11 transition-all focus:scale-[1.01]" disabled={!cabecalId || loadingValvulas}>
              <SelectValue placeholder={loadingValvulas ? "Carregando..." : "Selecione a válvula"} />
            </SelectTrigger>
            <SelectContent>
              {valvulas.map((valvula) => (
                <SelectItem key={valvula.id} value={valvula.id}>
                  {valvula.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {cabecalId && selectedValvula && valvulaSelecionada && (
            <div className="p-3 rounded-lg border-2 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded-lg border-2 border-border shadow-sm"
                  style={{ backgroundColor: COLOR_OPTIONS.find(c => c.value === corAutomatica)?.color || "#e5e7eb" }}
                />
                <span className="text-sm font-semibold">
                  {cabecais.find(c => c.id === cabecalId)?.nome} - {valvulaSelecionada.nome}
                </span>
              </div>
            </div>
          )}
          {errors.valvulaId && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.valvulaId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="variedadeId" className="text-sm font-medium">
            Variedade da Fruta *
          </Label>
          <Select
            onValueChange={(value) => setValue("variedadeId", value)}
          >
            <SelectTrigger className="h-11 transition-all focus:scale-[1.01]">
              <SelectValue placeholder="Selecione uma variedade" />
            </SelectTrigger>
            <SelectContent>
              {variedades.map((variedade) => (
                <SelectItem key={variedade.id} value={variedade.id}>
                  {variedade.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.variedadeId && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.variedadeId.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantidadeContainers" className="text-sm font-medium">
            Quantidade de Contentores por Pallet *
          </Label>
          <Input
            id="quantidadeContainers"
            type="number"
            placeholder="168 (padrão)"
            className="h-11 transition-all focus:scale-[1.01]"
            {...register("quantidadeContainers", { valueAsNumber: true })}
          />
          {errors.quantidadeContainers && (
            <p className="text-sm text-destructive animate-in fade-in-0 slide-in-from-top-1">
              {errors.quantidadeContainers.message}
            </p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t space-y-3">
        <Button 
          type="submit" 
          disabled={isSubmitting}
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
              Registrando pallet...
            </span>
          ) : (
            "Registrar Pallet"
          )}
        </Button>
          {numeroCarrocaFixo && (
            <p className="text-xs text-center text-muted-foreground">
              Após registrar, você pode adicionar outro pallet da mesma carroça
            </p>
          )}
      </div>
    </form>
  )
}

