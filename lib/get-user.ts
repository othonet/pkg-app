import { cookies } from 'next/headers'
import { verifyToken } from './auth'
import { prisma } from './prisma'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')?.value
  
  console.log("[GET USER] Token encontrado:", token ? `Sim (${token.length} chars)` : "Não")
  console.log("[GET USER] Todos os cookies:", cookieStore.getAll().map(c => c.name))

  if (!token) {
    console.log("[GET USER] Token não encontrado")
    return null
  }

  console.log("[GET USER] Verificando token...")
  const payload = verifyToken(token)
  console.log("[GET USER] Payload:", payload ? { userId: payload.userId, email: payload.email, role: payload.role } : "Inválido")

  if (!payload) {
    console.log("[GET USER] Token inválido")
    return null
  }

  console.log("[GET USER] Buscando usuário no banco...")
  console.log("[GET USER] ID do payload:", payload.userId)
  console.log("[GET USER] Email do payload:", payload.email)
  
  // Tentar buscar por ID primeiro
  let user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  // Se não encontrar por ID, tentar buscar por email (fallback)
  if (!user && payload.email) {
    console.log("[GET USER] Usuário não encontrado por ID, tentando buscar por email...")
    user = await prisma.user.findUnique({
      where: { email: payload.email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    })
    
    if (user) {
      console.log("[GET USER] Usuário encontrado por email, mas ID diferente:", {
        idNoToken: payload.userId,
        idNoBanco: user.id,
        email: user.email
      })
    }
  }

  console.log("[GET USER] Usuário encontrado:", user ? { id: user.id, email: user.email, role: user.role } : "Não encontrado")
  
  if (!user) {
    console.log("[GET USER] Verificando se existem usuários no banco...")
    const totalUsers = await prisma.user.count()
    console.log("[GET USER] Total de usuários no banco:", totalUsers)
    
    if (totalUsers > 0) {
      const firstUser = await prisma.user.findFirst({
        select: { id: true, email: true }
      })
      console.log("[GET USER] Primeiro usuário encontrado:", firstUser)
    }
  }
  
  return user
}

