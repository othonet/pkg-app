import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { LoginPageWrapper } from '@/components/auth/login-page-wrapper'

export default async function Home() {
  const cookieStore = await cookies()
  const token = cookieStore.get('token')
  
  console.log("[HOME PAGE] Verificando token:", token ? `Sim (${token.value.length} chars)` : "Não")
  console.log("[HOME PAGE] Todos os cookies:", cookieStore.getAll().map(c => c.name))

  if (token) {
    console.log("[HOME PAGE] Token encontrado, redirecionando para /dashboard")
    redirect('/dashboard')
  }

  console.log("[HOME PAGE] Exibindo formulário de login")
  return <LoginPageWrapper />
}

