import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

// API temporária para simular packing
// Em produção, isso seria substituído por uma tabela de Packing real

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { apontamentoId, quantidadeUsada } = body

    if (!apontamentoId || !quantidadeUsada) {
      return NextResponse.json(
        { error: "apontamentoId e quantidadeUsada são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se o apontamento existe
    const apontamento = await prisma.apontamento.findUnique({
      where: { id: apontamentoId },
    })

    if (!apontamento) {
      return NextResponse.json(
        { error: "Apontamento não encontrado" },
        { status: 404 }
      )
    }

    // Verificar se já existe uso registrado para este apontamento
    const usoExistente = await prisma.packingSimulacao.findUnique({
      where: { apontamentoId },
    })

    if (usoExistente) {
      // Atualizar quantidade usada
      await prisma.packingSimulacao.update({
        where: { apontamentoId },
        data: {
          quantidadeUsada: Math.min(
            usoExistente.quantidadeUsada + quantidadeUsada,
            apontamento.quantidadeContainers
          ),
        },
      })
    } else {
      // Criar novo registro de uso
      await prisma.packingSimulacao.create({
        data: {
          apontamentoId,
          quantidadeUsada: Math.min(quantidadeUsada, apontamento.quantidadeContainers),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: "Uso simulado com sucesso",
      apontamentoId,
      quantidadeUsada,
    })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao simular packing" },
      { status: 500 }
    )
  }
}

