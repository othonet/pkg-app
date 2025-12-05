import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const cabecais = await prisma.cabecal.findMany({
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(cabecais)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar cabeçais" },
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

    const cabecal = await prisma.cabecal.create({
      data: {
        nome,
        descricao: descricao || null,
      },
    })

    return NextResponse.json(cabecal, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar cabeçal" },
      { status: 500 }
    )
  }
}

