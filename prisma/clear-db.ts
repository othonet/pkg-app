import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando limpeza do banco de dados...')

  try {
    // Deletar dados na ordem correta respeitando foreign keys
    
    // 1. Deletar PackingSimulacao (depende de Apontamento)
    console.log('Deletando PackingSimulacao...')
    await prisma.packingSimulacao.deleteMany({})
    console.log('✓ PackingSimulacao deletado')

    // 2. Deletar AmostraPeso (depende de Apontamento)
    console.log('Deletando AmostraPeso...')
    await prisma.amostraPeso.deleteMany({})
    console.log('✓ AmostraPeso deletado')

    // 3. Deletar Apontamento (depende de Cabecal, Valvula, Variedade)
    console.log('Deletando Apontamento...')
    await prisma.apontamento.deleteMany({})
    console.log('✓ Apontamento deletado')

    // 4. Deletar Valvula (depende de Cabecal)
    console.log('Deletando Valvula...')
    await prisma.valvula.deleteMany({})
    console.log('✓ Valvula deletado')

    // 5. Deletar Cabecal
    console.log('Deletando Cabecal...')
    await prisma.cabecal.deleteMany({})
    console.log('✓ Cabecal deletado')

    // 6. Deletar Variedade
    console.log('Deletando Variedade...')
    await prisma.variedade.deleteMany({})
    console.log('✓ Variedade deletado')

    // 7. Deletar LinhaProducao
    console.log('Deletando LinhaProducao...')
    await prisma.linhaProducao.deleteMany({})
    console.log('✓ LinhaProducao deletado')

    // 8. Deletar Posicao
    console.log('Deletando Posicao...')
    await prisma.posicao.deleteMany({})
    console.log('✓ Posicao deletado')

    // 9. Deletar Embaladeira
    console.log('Deletando Embaladeira...')
    await prisma.embaladeira.deleteMany({})
    console.log('✓ Embaladeira deletado')

    // 10. Deletar todos os usuários EXCETO o admin
    console.log('Deletando usuários (exceto admin)...')
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: {
          not: 'admin@ara.com'
        }
      }
    })
    console.log(`✓ ${deletedUsers.count} usuário(s) deletado(s)`)

    // Verificar se o admin ainda existe
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@ara.com' }
    })

    if (admin) {
      console.log('✓ Usuário admin mantido:', admin.email)
    } else {
      console.log('⚠ ATENÇÃO: Usuário admin não encontrado!')
    }

    console.log('\n✅ Limpeza do banco de dados concluída com sucesso!')
    console.log('📊 Resumo:')
    console.log('   - Todos os dados foram deletados')
    console.log('   - Usuário admin mantido')
  } catch (error) {
    console.error('❌ Erro ao limpar banco de dados:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

