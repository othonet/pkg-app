import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyTokenEdge } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  console.log("[MIDDLEWARE] Verificando rota:", pathname)
  
  // Verificar JWT_SECRET no middleware
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  console.log("[MIDDLEWARE] JWT_SECRET no middleware:", jwtSecret ? `Sim (${jwtSecret.trim().length} chars)` : "Não")
  
  const token = request.cookies.get('token')?.value
  console.log("[MIDDLEWARE] Token encontrado:", token ? `Sim (${token.length} chars)` : "Não")
  console.log("[MIDDLEWARE] Todos os cookies:", request.cookies.getAll().map(c => c.name))

  // Rotas públicas
  if (pathname === '/' || pathname.startsWith('/api/auth/')) {
    console.log("[MIDDLEWARE] Rota pública de autenticação, permitindo acesso")
    return NextResponse.next()
  }

  // Verificar autenticação para rotas protegidas
  if (!token) {
    console.log("[MIDDLEWARE] Token não encontrado")
    // Se for rota de API, retornar 401, senão redirecionar
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Não autenticado' },
        { status: 401 }
      )
    }
    console.log("[MIDDLEWARE] Redirecionando para /")
    return NextResponse.redirect(new URL('/', request.url))
  }

  console.log("[MIDDLEWARE] Verificando token...")
  const payload = await verifyTokenEdge(token)
  console.log("[MIDDLEWARE] Payload do token:", payload ? { userId: payload.userId, email: payload.email, role: payload.role } : "Inválido")

  if (!payload) {
    console.log("[MIDDLEWARE] Token inválido")
    // Se for rota de API, retornar 401, senão redirecionar
    if (pathname.startsWith('/api/')) {
      const response = NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
      response.cookies.delete('token')
      return response
    }
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('token')
    return response
  }

  // Verificar permissões por rota
  console.log("[MIDDLEWARE] Verificando permissões para rota:", pathname)

  // Rotas que requerem nível Diretor ou Analista
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/cadastros')) {
    if (payload.role !== 'DIRETOR' && payload.role !== 'ANALISTA' && payload.role !== 'INSPETOR') {
      console.log("[MIDDLEWARE] Permissão insuficiente, redirecionando")
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  console.log("[MIDDLEWARE] Acesso permitido")
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

