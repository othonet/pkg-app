import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser } from "@/lib/get-user"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { apontamentoId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { apontamentoId } = params

    await prisma.packingSimulacao.deleteMany({
      where: { apontamentoId },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Erro ao deletar packing simulado" },
      { status: 500 }
    )
  }
}

