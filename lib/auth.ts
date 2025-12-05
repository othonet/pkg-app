import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'
import { UserRole } from '@prisma/client'
import { jwtVerify } from 'jose'

// Função helper para garantir que JWT_SECRET seja sempre o mesmo
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
  return secret.trim()
}

function getJwtExpiresIn(): string {
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d'
  return expiresIn.trim()
}

// Garantir que JWT_SECRET seja sempre uma string válida
const JWT_SECRET = getJwtSecret()
const JWT_EXPIRES_IN = getJwtExpiresIn()

// Log apenas uma vez ao carregar o módulo (não em produção)
if (process.env.NODE_ENV !== 'production') {
  console.log("[AUTH INIT] JWT_SECRET definido:", JWT_SECRET ? `Sim (${JWT_SECRET.length} chars)` : "Não")
  console.log("[AUTH INIT] JWT_EXPIRES_IN:", JWT_EXPIRES_IN)
  console.log("[AUTH INIT] Primeiros 10 chars do secret:", JWT_SECRET.substring(0, 10))
}

export interface TokenPayload {
  userId: string
  email: string
  role: UserRole
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: TokenPayload): string {
  const expiresIn = getJwtExpiresIn()
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn,
  } as jwt.SignOptions)
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    // Garantir que estamos usando o mesmo secret
    const secret = getJwtSecret()
    
    console.log("[VERIFY TOKEN] Verificando token, tamanho:", token.length)
    console.log("[VERIFY TOKEN] JWT_SECRET definido:", secret ? `Sim (${secret.length} chars)` : "Não")
    console.log("[VERIFY TOKEN] Primeiros 20 chars do token:", token.substring(0, 20))
    console.log("[VERIFY TOKEN] Primeiros 10 chars do secret:", secret.substring(0, 10))
    
    // Verificar se o token não está vazio ou malformado
    if (!token || token.trim().length === 0) {
      console.error("[VERIFY TOKEN] Token vazio ou inválido")
      return null
    }
    
    const decoded = jwt.verify(token.trim(), secret) as TokenPayload
    console.log("[VERIFY TOKEN] Token válido, payload:", { userId: decoded.userId, email: decoded.email, role: decoded.role })
    return decoded
  } catch (error: any) {
    console.error("[VERIFY TOKEN] Erro ao verificar token:", error.message)
    console.error("[VERIFY TOKEN] Tipo do erro:", error.name)
    if (error.name === 'JsonWebTokenError') {
      console.error("[VERIFY TOKEN] Erro JWT:", error.message)
    } else if (error.name === 'TokenExpiredError') {
      console.error("[VERIFY TOKEN] Token expirado em:", error.expiredAt)
    }
    return null
  }
}

/**
 * Função para verificar token no Edge Runtime (compatível com middleware)
 * Usa jose ao invés de jsonwebtoken para compatibilidade com Edge Runtime
 */
export async function verifyTokenEdge(token: string): Promise<TokenPayload | null> {
  try {
    const secret = getJwtSecret()
    
    console.log("[VERIFY TOKEN EDGE] Verificando token, tamanho:", token.length)
    console.log("[VERIFY TOKEN EDGE] JWT_SECRET definido:", secret ? `Sim (${secret.length} chars)` : "Não")
    
    // Verificar se o token não está vazio ou malformado
    if (!token || token.trim().length === 0) {
      console.error("[VERIFY TOKEN EDGE] Token vazio ou inválido")
      return null
    }
    
    // Converter o secret para TextEncoder compatível com jose
    const secretKey = new TextEncoder().encode(secret)
    
    // Verificar o token usando jose (compatível com Edge Runtime)
    // Especificar algoritmo HS256 explicitamente para compatibilidade com jsonwebtoken
    const { payload } = await jwtVerify(token.trim(), secretKey, {
      algorithms: ['HS256']
    })
    
    // Converter o payload para TokenPayload
    const decoded = payload as unknown as TokenPayload
    console.log("[VERIFY TOKEN EDGE] Token válido, payload:", { userId: decoded.userId, email: decoded.email, role: decoded.role })
    return decoded
  } catch (error: any) {
    console.error("[VERIFY TOKEN EDGE] Erro ao verificar token:", error.message)
    console.error("[VERIFY TOKEN EDGE] Tipo do erro:", error.name)
    if (error.code === 'ERR_JWT_INVALID') {
      console.error("[VERIFY TOKEN EDGE] Token inválido")
    } else if (error.code === 'ERR_JWT_EXPIRED') {
      console.error("[VERIFY TOKEN EDGE] Token expirado")
    }
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  console.log("[AUTH] Buscando usuário com email:", email)
  const user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    console.log("[AUTH] Usuário não encontrado")
    return null
  }

  console.log("[AUTH] Usuário encontrado:", { id: user.id, email: user.email, role: user.role })
  console.log("[AUTH] Verificando senha...")
  const isValid = await verifyPassword(password, user.password)
  console.log("[AUTH] Senha válida:", isValid)

  if (!isValid) {
    console.log("[AUTH] Senha inválida")
    return null
  }

  console.log("[AUTH] Gerando token...")
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  })
  console.log("[AUTH] Token gerado com sucesso, tamanho:", token.length)

  return {
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
    token,
  }
}

