import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  // Criar usuário padrão
  const hashedPassword = await hashPassword('admin123')

  const user = await prisma.user.upsert({
    where: { email: 'admin@ara.com' },
    update: {},
    create: {
      email: 'admin@ara.com',
      password: hashedPassword,
      name: 'Administrador',
      role: 'DIRETOR',
    },
  })

  console.log('Usuário criado:', user)

  // Criar alguns dados de exemplo (se não existirem)
  const existingCabecal = await prisma.cabecal.findFirst({
    where: { nome: 'Cabeçal 1' },
  })

  if (!existingCabecal) {
    const cabecal1 = await prisma.cabecal.create({
      data: {
        nome: 'Cabeçal 1',
        descricao: 'Cabeçal principal',
      },
    })

    await prisma.valvula.create({
      data: {
        nome: 'Válvula 1',
        descricao: 'Válvula do cabeçal 1',
        cabecalId: cabecal1.id,
        cor: 'VERMELHO',
      },
    })

    await prisma.variedade.create({
      data: {
        nome: 'Thompson Seedless',
        descricao: 'Variedade de uva sem semente',
      },
    })

    console.log('Dados de exemplo criados')
  } else {
    console.log('Dados de exemplo já existem')
  }

  console.log('Dados de exemplo criados')
  console.log('Seed concluído!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

