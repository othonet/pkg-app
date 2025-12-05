import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const variedades = await prisma.variedade.findMany({
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(variedades)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar variedades" },
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
    const { nome, descricao } = body

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const variedade = await prisma.variedade.create({
      data: {
        nome,
        descricao: descricao || null,
      },
    })

    return NextResponse.json(variedade, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar variedade" },
      { status: 500 }
    )
  }
}

