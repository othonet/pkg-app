import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    const apontamento = await prisma.apontamento.findUnique({
      where: { id },
      include: {
        cabecal: true,
        valvula: true,
        variedade: true,
      },
    })

    if (!apontamento) {
      return NextResponse.json({ error: "Apontamento não encontrado" }, { status: 404 })
    }

    return NextResponse.json(apontamento)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar apontamento" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()
    const {
      numeroCarroca,
      numeroPallet,
      cabecalId,
      valvulaId,
      variedadeId,
      quantidadeContainers,
    } = body

    if (
      !numeroCarroca ||
      !numeroPallet ||
      !cabecalId ||
      !valvulaId ||
      !variedadeId ||
      !quantidadeContainers
    ) {
      return NextResponse.json(
        { error: "Todos os campos são obrigatórios" },
        { status: 400 }
      )
    }

    // Verificar se a válvula pertence ao cabeçal
    const valvula = await prisma.valvula.findUnique({
      where: { id: valvulaId },
    })

    if (!valvula || valvula.cabecalId !== cabecalId) {
      return NextResponse.json(
        { error: "Válvula não pertence ao cabeçal selecionado" },
        { status: 400 }
      )
    }

    // A cor é sempre definida automaticamente pela válvula selecionada
    const corContentor = valvula.cor

    const apontamento = await prisma.apontamento.update({
      where: { id },
      data: {
        numeroCarroca: Number(numeroCarroca),
        numeroPallet: Number(numeroPallet),
        cabecalId,
        valvulaId,
        variedadeId,
        quantidadeContainers: Number(quantidadeContainers),
        cor: corContentor,
      },
      include: {
        cabecal: true,
        valvula: true,
        variedade: true,
      },
    })

    return NextResponse.json(apontamento)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao atualizar apontamento" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { id } = params

    // Deletar amostras relacionadas primeiro
    await prisma.amostraPeso.deleteMany({
      where: { apontamentoId: id },
    })

    // Deletar o apontamento
    await prisma.apontamento.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao deletar apontamento" },
      { status: 500 }
    )
  }
}

