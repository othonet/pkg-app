import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const data = searchParams.get("data") // Formato: YYYY-MM-DD

    const where: any = {}
    if (data) {
      const startDate = new Date(data)
      startDate.setHours(0, 0, 0, 0)
      const endDate = new Date(data)
      endDate.setHours(23, 59, 59, 999)
      where.createdAt = {
        gte: startDate,
        lte: endDate,
      }
    }

    const amostras = await prisma.amostraPeso.findMany({
      where,
      include: {
        apontamento: {
          include: {
            cabecal: true,
            valvula: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(amostras)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar amostras" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { pesos, apontamentoId } = body

    if (!pesos || !Array.isArray(pesos) || pesos.length === 0) {
      return NextResponse.json(
        { error: "É necessário fornecer pelo menos um peso" },
        { status: 400 }
      )
    }

    // Validar que todos os pesos são números válidos
    const pesosValidos = pesos.filter((p: any) => typeof p === "number" && p > 0)
    if (pesosValidos.length === 0) {
      return NextResponse.json(
        { error: "Todos os pesos devem ser números positivos" },
        { status: 400 }
      )
    }

    // Se houver apontamentoId, verificar se existe
    if (apontamentoId) {
      const apontamento = await prisma.apontamento.findUnique({
        where: { id: apontamentoId },
      })
      if (!apontamento) {
        return NextResponse.json(
          { error: "Apontamento não encontrado" },
          { status: 404 }
        )
      }
    }

    // Criar múltiplas amostras
    const amostras = await prisma.$transaction(
      pesosValidos.map((peso: number) =>
        prisma.amostraPeso.create({
          data: {
            pesoAmostra: peso,
            apontamentoId: apontamentoId || null,
          },
        })
      )
    )

    // Calcular peso médio
    const pesoMedio =
      pesosValidos.reduce((sum: number, peso: number) => sum + peso, 0) /
      pesosValidos.length

    return NextResponse.json(
      {
        amostras,
        pesoMedio,
        quantidadeAmostras: pesosValidos.length,
      },
      { status: 201 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar amostras" },
      { status: 500 }
    )
  }
}

