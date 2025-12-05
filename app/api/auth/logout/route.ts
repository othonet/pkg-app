import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  const response = NextResponse.json({ message: 'Logout realizado com sucesso' })
  
  // Deletar o cookie na resposta
  response.cookies.delete('token')
  
  return response
}

