"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { ContainerColor } from "@prisma/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Search, Filter, Download, Edit } from "lucide-react"

const COLOR_NAMES: Record<ContainerColor, string> = {
  VERMELHO: "Vermelho",
  AZUL_MARINHO: "Azul Marinho",
  VERDE: "Verde",
  AMARELO: "Amarelo",
  BRANCO: "Branco",
  LARANJA: "Laranja",
}

const COLOR_COLORS: Record<ContainerColor, string> = {
  VERMELHO: "#ef4444",
  AZUL_MARINHO: "#1e3a8a",
  VERDE: "#22c55e",
  AMARELO: "#eab308",
  BRANCO: "#e5e7eb",
  LARANJA: "#f97316",
}

interface Apontamento {
  id: string
  numeroCarroca: number
  numeroPallet: number
  quantidadeContainers: number
  cor: ContainerColor
  pesoKg: number | null
  createdAt: Date
  cabecal: { id: string; nome: string }
  valvula: { id: string; nome: string; cor: ContainerColor }
  variedade: { id: string; nome: string }
}

interface Valvula {
  id: string
  nome: string
  cor: ContainerColor
  cabecalId: string
  cabecal: { id: string; nome: string }
}

interface ApontamentosListProps {
  apontamentos: Apontamento[]
  cabecais: Array<{ id: string; nome: string }>
  valvulas: Valvula[]
  variedades: Array<{ id: string; nome: string }>
  initialFilters?: {
    data?: string
    cor?: string
    cabecal?: string
  }
}

export default function ApontamentosList({
  apontamentos,
  cabecais,
  valvulas,
  variedades,
  initialFilters = {},
}: ApontamentosListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState({
    data: initialFilters.data || "",
    cor: initialFilters.cor || "",
    cabecal: initialFilters.cabecal || "",
  })
  const [showFilters, setShowFilters] = useState(false)
  const [editingApontamento, setEditingApontamento] = useState<Apontamento | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [formData, setFormData] = useState({
    numeroCarroca: "",
    numeroPallet: "",
    cabecalId: "",
    valvulaId: "",
    variedadeId: "",
    quantidadeContainers: "",
  })
  const [filteredValvulas, setFilteredValvulas] = useState<Valvula[]>([])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.data) params.set("data", filters.data)
    if (filters.cor) params.set("cor", filters.cor)
    if (filters.cabecal) params.set("cabecal", filters.cabecal)
    router.push(`/apontamento/historico?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({ data: "", cor: "", cabecal: "" })
    router.push("/apontamento/historico")
  }

  const handleEdit = (apontamento: Apontamento) => {
    setEditingApontamento(apontamento)
    setFormData({
      numeroCarroca: apontamento.numeroCarroca.toString(),
      numeroPallet: apontamento.numeroPallet.toString(),
      cabecalId: apontamento.cabecal.id,
      valvulaId: apontamento.valvula.id,
      variedadeId: apontamento.variedade.id,
      quantidadeContainers: apontamento.quantidadeContainers.toString(),
    })
    // Filtrar válvulas do cabeçal selecionado
    const valvulasDoCabecal = valvulas.filter((v) => v.cabecalId === apontamento.cabecal.id)
    setFilteredValvulas(valvulasDoCabecal)
    setIsDialogOpen(true)
  }

  const handleCabecalChange = (cabecalId: string) => {
    setFormData((prev) => ({ ...prev, cabecalId, valvulaId: "" }))
    const valvulasDoCabecal = valvulas.filter((v) => v.cabecalId === cabecalId)
    setFilteredValvulas(valvulasDoCabecal)
  }

  const handleUpdate = async () => {
    if (
      !formData.numeroCarroca ||
      !formData.numeroPallet ||
      !formData.cabecalId ||
      !formData.valvulaId ||
      !formData.variedadeId ||
      !formData.quantidadeContainers
    ) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/apontamento/${editingApontamento?.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          numeroCarroca: Number(formData.numeroCarroca),
          numeroPallet: Number(formData.numeroPallet),
          cabecalId: formData.cabecalId,
          valvulaId: formData.valvulaId,
          variedadeId: formData.variedadeId,
          quantidadeContainers: Number(formData.quantidadeContainers),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao atualizar apontamento")
      }

      toast({
        title: "Sucesso!",
        description: "Apontamento atualizado com sucesso",
      })

      setIsDialogOpen(false)
      setEditingApontamento(null)
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const exportToCSV = () => {
    const headers = [
      "Data/Hora",
      "Nº Carroça",
      "Nº Pallet",
      "Cabeçal",
      "Válvula",
      "Variedade",
      "Quantidade",
      "Cor",
      "Peso (kg)",
    ]
    const rows = apontamentos.map((ap) => [
      format(new Date(ap.createdAt), "dd/MM/yyyy HH:mm:ss"),
      ap.numeroCarroca.toString(),
      ap.numeroPallet.toString(),
      ap.cabecal.nome,
      ap.valvula.nome,
      ap.variedade.nome,
      ap.quantidadeContainers.toString(),
      COLOR_NAMES[ap.cor],
      ap.pesoKg?.toFixed(2) || "-",
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `apontamentos_${format(new Date(), "yyyy-MM-dd")}.csv`
    link.click()
  }

  const selectedValvula = filteredValvulas.find((v) => v.id === formData.valvulaId)
  const corAutomatica = selectedValvula?.cor

  return (
    <div className="space-y-4">
      <Card className="border-0 shadow-xl ring-1 ring-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">Filtros de Busca</CardTitle>
              <CardDescription>
                Filtre os apontamentos por data, cor ou cabeçal
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                {showFilters ? "Ocultar" : "Mostrar"} Filtros
              </Button>
              {apontamentos.length > 0 && (
                <Button variant="outline" size="sm" onClick={exportToCSV}>
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data</Label>
                <Input
                  id="data"
                  type="date"
                  value={filters.data}
                  onChange={(e) => handleFilterChange("data", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cor">Cor do Contentor</Label>
                <Select
                  value={filters.cor || undefined}
                  onValueChange={(value) => handleFilterChange("cor", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todas as cores" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(COLOR_NAMES).map(([key, name]) => (
                      <SelectItem key={key} value={key}>
                        {name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="cabecal">Cabeçal</Label>
                <Select
                  value={filters.cabecal || undefined}
                  onValueChange={(value) => handleFilterChange("cabecal", value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Todos os cabeçais" />
                  </SelectTrigger>
                  <SelectContent>
                    {cabecais.map((cabecal) => (
                      <SelectItem key={cabecal.id} value={cabecal.id}>
                        {cabecal.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 flex items-end gap-2">
                <Button onClick={applyFilters} className="flex-1 h-10">
                  <Search className="h-4 w-4 mr-2" />
                  Buscar
                </Button>
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="h-10"
                >
                  Limpar
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      <Card className="border shadow-xl ring-1 ring-border/50 dark:ring-border/30 bg-gradient-to-br from-card via-card to-card/99">
        <CardHeader>
          <CardTitle className="text-xl">
            Apontamentos ({apontamentos.length})
          </CardTitle>
          <CardDescription>
            Lista completa de todos os apontamentos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apontamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Data/Hora</th>
                    <th className="text-left p-3 font-semibold">Nº Carroça</th>
                    <th className="text-left p-3 font-semibold">Nº Pallet</th>
                    <th className="text-left p-3 font-semibold">Cabeçal</th>
                    <th className="text-left p-3 font-semibold">Válvula</th>
                    <th className="text-left p-3 font-semibold">Variedade</th>
                    <th className="text-right p-3 font-semibold">Quantidade</th>
                    <th className="text-left p-3 font-semibold">Cor</th>
                    <th className="text-right p-3 font-semibold">Peso (kg)</th>
                    <th className="text-center p-3 font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {apontamentos.map((ap, index) => (
                    <tr
                      key={ap.id}
                      className="border-b hover:bg-accent/50 transition-colors animate-in fade-in-0"
                      style={{ animationDelay: `${index * 20}ms` }}
                    >
                      <td className="p-3 text-sm">
                        {format(new Date(ap.createdAt), "dd/MM/yyyy HH:mm")}
                      </td>
                      <td className="p-3 font-medium">{ap.numeroCarroca}</td>
                      <td className="p-3 font-medium">{ap.numeroPallet}</td>
                      <td className="p-3">{ap.cabecal.nome}</td>
                      <td className="p-3">{ap.valvula.nome}</td>
                      <td className="p-3">{ap.variedade.nome}</td>
                      <td className="p-3 text-right font-medium">
                        {ap.quantidadeContainers}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-border shadow-sm"
                            style={{
                              backgroundColor: COLOR_COLORS[ap.cor],
                            }}
                          />
                          <span>{COLOR_NAMES[ap.cor]}</span>
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        {ap.pesoKg ? ap.pesoKg.toFixed(2) : "-"}
                      </td>
                      <td className="p-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(ap)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Nenhum apontamento encontrado com os filtros selecionados
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Editar Apontamento</DialogTitle>
            <DialogDescription>
              Atualize as informações do apontamento
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-numeroCarroca">Número da Carroça</Label>
              <Input
                id="edit-numeroCarroca"
                type="number"
                value={formData.numeroCarroca}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numeroCarroca: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-numeroPallet">Número do Pallet</Label>
              <Input
                id="edit-numeroPallet"
                type="number"
                value={formData.numeroPallet}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, numeroPallet: e.target.value }))
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-cabecal">Cabeçal</Label>
              <Select
                value={formData.cabecalId}
                onValueChange={handleCabecalChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o cabeçal" />
                </SelectTrigger>
                <SelectContent>
                  {cabecais.map((cabecal) => (
                    <SelectItem key={cabecal.id} value={cabecal.id}>
                      {cabecal.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-valvula">Válvula</Label>
              <Select
                value={formData.valvulaId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, valvulaId: value }))
                }
                disabled={!formData.cabecalId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a válvula" />
                </SelectTrigger>
                <SelectContent>
                  {filteredValvulas.map((valvula) => (
                    <SelectItem key={valvula.id} value={valvula.id}>
                      {valvula.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {corAutomatica && (
              <div className="p-3 rounded-lg border bg-muted/50">
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-border shadow-sm"
                    style={{
                      backgroundColor: COLOR_COLORS[corAutomatica],
                    }}
                  />
                  <span className="text-sm font-medium">
                    Cor do contentor: {COLOR_NAMES[corAutomatica]}
                  </span>
                </div>
              </div>
            )}
            <div className="grid gap-2">
              <Label htmlFor="edit-variedade">Variedade</Label>
              <Select
                value={formData.variedadeId}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, variedadeId: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a variedade" />
                </SelectTrigger>
                <SelectContent>
                  {variedades.map((variedade) => (
                    <SelectItem key={variedade.id} value={variedade.id}>
                      {variedade.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-quantidadeContainers">Quantidade de Contentores</Label>
              <Input
                id="edit-quantidadeContainers"
                type="number"
                value={formData.quantidadeContainers}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, quantidadeContainers: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setEditingApontamento(null)
              }}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
