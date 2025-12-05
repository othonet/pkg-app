import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const embaladeiras = await prisma.embaladeira.findMany({
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(embaladeiras)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar embaladeiras" },
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
    const { nome } = body

    if (!nome) {
      return NextResponse.json(
        { error: "Nome é obrigatório" },
        { status: 400 }
      )
    }

    const embaladeira = await prisma.embaladeira.create({
      data: {
        nome,
      },
    })

    return NextResponse.json(embaladeira, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao criar embaladeira" },
      { status: 500 }
    )
  }
}

