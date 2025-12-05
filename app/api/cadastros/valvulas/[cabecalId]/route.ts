import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function GET(
  request: NextRequest,
  { params }: { params: { cabecalId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const valvulas = await prisma.valvula.findMany({
      where: {
        cabecalId: params.cabecalId,
      },
      orderBy: { nome: "asc" },
    })

    return NextResponse.json(valvulas)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao buscar válvulas" },
      { status: 500 }
    )
  }
}

