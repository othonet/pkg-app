import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const linhas = await prisma.linhaProducao.findMany({
      orderBy: { letra: "asc" },
    })

    return NextResponse.json(linhas)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar linhas" },
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
    const { letra, descricao } = body

    if (!letra) {
      return NextResponse.json(
        { error: "Letra é obrigatória" },
        { status: 400 }
      )
    }

    const linha = await prisma.linhaProducao.create({
      data: {
        letra: letra.toUpperCase(),
        descricao: descricao || null,
      },
    })

    return NextResponse.json(linha, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar linha" },
      { status: 500 }
    )
  }
}

