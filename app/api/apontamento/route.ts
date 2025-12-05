import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const apontamentos = await prisma.apontamento.findMany({
      include: {
        cabecal: true,
        valvula: true,
        variedade: true,
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    })

    return NextResponse.json(apontamentos)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar apontamentos" },
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
    const {
      numeroCarroca,
      numeroPallet,
      cabecalId,
      valvulaId,
      variedadeId,
      quantidadeContainers,
      cor,
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

    const apontamento = await prisma.apontamento.create({
      data: {
        numeroCarroca: Number(numeroCarroca),
        numeroPallet: Number(numeroPallet),
        cabecalId,
        valvulaId,
        variedadeId,
        quantidadeContainers: Number(quantidadeContainers),
        cor: corContentor,
      },
    })

    return NextResponse.json(apontamento, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar apontamento" },
      { status: 500 }
    )
  }
}

