import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  console.log("[API LOGIN] Requisição recebida")
  try {
    const body = await request.json()
    const { email, password } = body
    console.log("[API LOGIN] Dados recebidos:", { email, password: password ? "***" : "vazio" })

    if (!email || !password) {
      console.log("[API LOGIN] Email ou senha faltando")
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    console.log("[API LOGIN] Chamando authenticateUser...")
    const result = await authenticateUser(email, password)
    console.log("[API LOGIN] Resultado authenticateUser:", result ? "Sucesso" : "Falhou")

    if (!result) {
      console.log("[API LOGIN] Credenciais inválidas")
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    console.log("[API LOGIN] Criando resposta com token")
    const response = NextResponse.json({
      user: result.user,
      message: 'Login realizado com sucesso',
    })

    // Definir cookie na resposta
    console.log("[API LOGIN] Definindo cookie...")
    response.cookies.set('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: '/',
    })
    console.log("[API LOGIN] Cookie definido:", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      tokenLength: result.token.length
    })

    return response
  } catch (error: any) {
    console.error("[API LOGIN] Erro:", error)
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}

