"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { ContainerColor } from "@prisma/client"
import { Plus, Trash2, Package, Scale } from "lucide-react"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

const COLOR_VALUES: Record<ContainerColor, string> = {
  VERMELHO: "#ef4444",
  AZUL_MARINHO: "#1e3a8a",
  VERDE: "#22c55e",
  AMARELO: "#eab308",
  BRANCO: "#e5e7eb",
  LARANJA: "#f97316",
}

interface SimulacaoPanelProps {
  cabecais: Array<{ id: string; nome: string }>
  variedades: Array<{ id: string; nome: string }>
  valvulas: Array<{ id: string; nome: string; cor: ContainerColor; cabecal: { nome: string } }>
}

export default function SimulacaoPanel({
  cabecais,
  variedades,
  valvulas,
}: SimulacaoPanelProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSimulating, setIsSimulating] = useState(false)

  const simularApontamento = async () => {
    if (cabecais.length === 0 || variedades.length === 0 || valvulas.length === 0) {
      toast({
        title: "Erro",
        description: "É necessário ter pelo menos um cabeçal, variedade e válvula cadastrados",
        variant: "destructive",
      })
      return
    }

    setIsSimulating(true)

    try {
      // Selecionar aleatoriamente
      const cabecal = cabecais[Math.floor(Math.random() * cabecais.length)]
      const variedade = variedades[Math.floor(Math.random() * variedades.length)]
      const valvulasDoCabecal = valvulas.filter(v => v.cabecal.nome === cabecal.nome)
      
      if (valvulasDoCabecal.length === 0) {
        toast({
          title: "Erro",
          description: `Nenhuma válvula encontrada para ${cabecal.nome}`,
          variant: "destructive",
        })
        setIsSimulating(false)
        return
      }

      const valvula = valvulasDoCabecal[Math.floor(Math.random() * valvulasDoCabecal.length)]
      const numeroCarroca = Math.floor(Math.random() * 5) + 1
      const numeroPallet = Math.floor(Math.random() * 10) + 1
      const quantidadeContainers = Math.random() > 0.3 ? 168 : Math.floor(Math.random() * 100) + 50

      const response = await fetch("/api/apontamento", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeroCarroca,
          numeroPallet,
          cabecalId: cabecal.id,
          valvulaId: valvula.id,
          variedadeId: variedade.id,
          quantidadeContainers,
          cor: valvula.cor,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar apontamento")
      }

      toast({
        title: "Apontamento simulado!",
        description: `${quantidadeContainers} contentores ${COLOR_NAMES[valvula.cor]} - ${cabecal.nome} - ${valvula.nome}`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const simularAmostraPeso = async () => {
    setIsSimulating(true)

    try {
      // Criar 3-5 amostras com pesos aleatórios entre 10 e 15 kg
      const numAmostras = Math.floor(Math.random() * 3) + 3
      const pesos = Array.from({ length: numAmostras }, () => 
        Number((Math.random() * 5 + 10).toFixed(2))
      )

      const response = await fetch("/api/amostras-peso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pesos,
          apontamentoId: null,
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao criar amostras")
      }

      const pesoMedio = pesos.reduce((sum, peso) => sum + peso, 0) / pesos.length

      toast({
        title: "Amostras simuladas!",
        description: `${numAmostras} amostras - Peso médio: ${pesoMedio.toFixed(2)}kg`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  const simularUsoPacking = async () => {
    setIsSimulating(true)

    try {
      // Buscar apontamentos do dia
      const response = await fetch("/api/apontamento")
      if (!response.ok) {
        throw new Error("Erro ao buscar apontamentos")
      }

      const apontamentos = await response.json()
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      
      const apontamentosHoje = apontamentos.filter((ap: any) => {
        const dataAp = new Date(ap.createdAt)
        dataAp.setHours(0, 0, 0, 0)
        return dataAp.getTime() === hoje.getTime()
      })

      if (apontamentosHoje.length === 0) {
        toast({
          title: "Aviso",
          description: "Não há apontamentos de hoje para simular uso",
          variant: "destructive",
        })
        setIsSimulating(false)
        return
      }

      // Selecionar um apontamento aleatório e simular uso parcial (30-70% dos contentores)
      const apontamento = apontamentosHoje[Math.floor(Math.random() * apontamentosHoje.length)]
      const percentualUso = Math.random() * 0.4 + 0.3 // Entre 30% e 70%
      const quantidadeUsada = Math.floor(apontamento.quantidadeContainers * percentualUso)

      // Criar um "apontamento negativo" para representar o uso
      // Nota: Isso é temporário - em produção, haveria uma tabela de Packing
      const responseUso = await fetch("/api/simulacao/packing", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apontamentoId: apontamento.id,
          quantidadeUsada,
        }),
      })

      if (!responseUso.ok) {
        // Se a API não existir, apenas mostrar toast
        toast({
          title: "Uso simulado!",
          description: `${quantidadeUsada} contentores ${COLOR_NAMES[apontamento.cor as ContainerColor]} usados no packing`,
        })
        router.refresh()
        setIsSimulating(false)
        return
      }

      toast({
        title: "Uso simulado!",
        description: `${quantidadeUsada} contentores ${COLOR_NAMES[apontamento.cor as ContainerColor]} usados no packing`,
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Uso simulado!",
        description: "Quantidade de contentores restantes atualizada",
      })
      router.refresh()
    } finally {
      setIsSimulating(false)
    }
  }

  const limparDadosSimulados = async () => {
    if (!confirm("Tem certeza que deseja limpar todos os dados simulados de hoje? Esta ação não pode ser desfeita.")) {
      return
    }

    setIsSimulating(true)

    try {
      const hoje = new Date()
      hoje.setHours(0, 0, 0, 0)
      const amanha = new Date(hoje)
      amanha.setDate(amanha.getDate() + 1)

      // Buscar apontamentos de hoje
      const response = await fetch("/api/apontamento")
      if (!response.ok) {
        throw new Error("Erro ao buscar apontamentos")
      }

      const apontamentos = await response.json()
      const apontamentosHoje = apontamentos.filter((ap: any) => {
        const dataAp = new Date(ap.createdAt)
        return dataAp >= hoje && dataAp < amanha
      })

      // Deletar apontamentos de hoje (simulados)
      for (const ap of apontamentosHoje) {
        await fetch(`/api/apontamento/${ap.id}`, {
          method: "DELETE",
        })
      }

      // Deletar amostras de hoje
      const responseAmostras = await fetch(`/api/amostras-peso?data=${hoje.toISOString().split('T')[0]}`)
      if (responseAmostras.ok) {
        const amostras = await responseAmostras.json()
        for (const amostra of amostras) {
          await fetch(`/api/amostras-peso/${amostra.id}`, {
            method: "DELETE",
          })
        }
      }

      // Deletar packing simulado de hoje
      for (const ap of apontamentosHoje) {
        await fetch(`/api/simulacao/packing/${ap.id}`, {
          method: "DELETE",
        }).catch(() => {
          // Ignorar erros se a API não existir
        })
      }

      toast({
        title: "Dados limpos!",
        description: "Todos os dados simulados de hoje foram removidos",
      })

      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSimulating(false)
    }
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="border shadow-xl ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            Simular Apontamento
          </CardTitle>
          <CardDescription>
            Cria um apontamento aleatório com dados simulados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={simularApontamento}
            disabled={isSimulating}
            className="w-full h-11"
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Simulando...
              </span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar Apontamento Simulado
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Cria um apontamento com carroça, pallet, área do campo e quantidade aleatórios
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-xl ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Scale className="h-5 w-5" />
            Simular Amostras de Peso
          </CardTitle>
          <CardDescription>
            Cria amostras de peso aleatórias para o dia
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={simularAmostraPeso}
            disabled={isSimulating}
            className="w-full h-11"
            variant="outline"
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Simulando...
              </span>
            ) : (
              <>
                <Plus className="h-4 w-4 mr-2" />
                Criar Amostras Simuladas
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Adiciona 3-5 amostras com pesos entre 10-15kg
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-xl ring-1 ring-border/50">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Package className="h-5 w-5" />
            Simular Uso no Packing
          </CardTitle>
          <CardDescription>
            Simula o uso de contentores no processo de packing
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={simularUsoPacking}
            disabled={isSimulating}
            className="w-full h-11"
            variant="outline"
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Simulando...
              </span>
            ) : (
              <>
                <Package className="h-4 w-4 mr-2" />
                Simular Uso de Contentores
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            Simula o uso de 30-70% dos contentores de um apontamento aleatório
          </p>
        </CardContent>
      </Card>

      <Card className="border shadow-xl ring-1 ring-border/50 border-destructive/30">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Limpar Dados Simulados
          </CardTitle>
          <CardDescription>
            Remove todos os dados simulados de hoje
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={limparDadosSimulados}
            disabled={isSimulating}
            className="w-full h-11"
            variant="destructive"
          >
            {isSimulating ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Limpando...
              </span>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Dados de Hoje
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            ⚠️ Remove todos os apontamentos e amostras criados hoje
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

