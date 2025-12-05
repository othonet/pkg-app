import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const posicoes = await prisma.posicao.findMany({
      orderBy: { posicao: "asc" },
    })

    return NextResponse.json(posicoes)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar posições" },
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
    const { posicao, descricao } = body

    if (!posicao) {
      return NextResponse.json(
        { error: "Posição é obrigatória" },
        { status: 400 }
      )
    }

    const posicaoCreated = await prisma.posicao.create({
      data: {
        posicao,
        descricao: descricao || null,
      },
    })

    return NextResponse.json(posicaoCreated, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar posição" },
      { status: 500 }
    )
  }
}

