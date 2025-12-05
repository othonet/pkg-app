# Guia de Deploy - CI/CD com GitHub Actions

Este documento explica como configurar o CI/CD para deploy automático na VPS usando GitHub Actions.

## 📋 Pré-requisitos

1. Repositório GitHub configurado
2. Acesso SSH à VPS
3. Chave SSH configurada para acesso à VPS

## 🔐 Configuração de Secrets no GitHub

Para que o GitHub Actions possa fazer deploy na VPS, você precisa configurar os seguintes secrets no repositório GitHub:

### Como adicionar secrets:

1. Acesse seu repositório no GitHub: **https://github.com/othonet/ara-app**
2. Vá em **Settings** → **Secrets and variables** → **Actions**
3. Clique em **New repository secret**
4. Adicione os seguintes secrets:

### Secrets necessários:

| Secret | Descrição | Exemplo |
|--------|-----------|---------|
| `VPS_HOST` | IP ou domínio da VPS | `72.61.42.147` ou `enord.app` |
| `VPS_USER` | Usuário SSH da VPS | `root` |
| `VPS_SSH_KEY` | Chave privada SSH (conteúdo completo) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_PORT` | Porta SSH (opcional, padrão: 22) | `22` |
| `DATABASE_URL` | URL de conexão do banco de dados | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Secret para JWT | `seu-secret-aqui` |

### Como gerar e configurar a chave SSH:

1. **Na sua máquina local**, gere uma chave SSH (se ainda não tiver):
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

2. **Copie a chave pública para a VPS**:
```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@SEU_IP_VPS
```

3. **Teste a conexão**:
```bash
ssh -i ~/.ssh/github_actions_deploy root@SEU_IP_VPS
```

4. **Copie o conteúdo da chave privada** para o secret `VPS_SSH_KEY`:
```bash
cat ~/.ssh/github_actions_deploy
```

⚠️ **IMPORTANTE**: Nunca compartilhe ou commite a chave privada SSH!

## 🚀 Como funciona o deploy

### Deploy automático

O deploy é acionado automaticamente quando:
- Há um push para a branch `main` ou `master`
- Você aciona manualmente via **Actions** → **Deploy to VPS** → **Run workflow**

### Processo de deploy

1. **Checkout do código** - Baixa o código do repositório
2. **Setup Node.js** - Configura o ambiente Node.js
3. **Instala dependências** - Executa `npm ci`
4. **Linter** - Executa `npm run lint` (não bloqueia se falhar)
5. **Build** - Compila a aplicação com `npm run build`
6. **Deploy na VPS** - Conecta via SSH e executa:
   - `git pull` para atualizar o código
   - `npm ci` para instalar dependências
   - `npm run db:generate` para gerar cliente Prisma
   - `npm run build` para compilar
   - `pm2 reload` para reiniciar a aplicação
7. **Verificação** - Verifica se a aplicação está respondendo

## 📝 Deploy manual

Se precisar fazer deploy manualmente na VPS, você pode usar o script:

```bash
cd /root/app
./scripts/deploy.sh
```

Ou executar os comandos manualmente:

```bash
cd /root/app
git pull origin main
npm ci --production=false
npm run db:generate
npm run build
pm2 reload ecosystem.config.js --update-env
pm2 save
```

## 🔍 Verificação do deploy

Após o deploy, verifique:

1. **Status do PM2**:
```bash
pm2 status
pm2 logs ara-mes-system --lines 50
```

2. **Aplicação respondendo**:
```bash
curl http://localhost:3002
```

3. **Domínio funcionando**:
```bash
curl https://enord.app
```

## 🐛 Troubleshooting

### Erro de conexão SSH

- Verifique se o IP/hostname está correto
- Confirme que a porta SSH está aberta no firewall
- Verifique se a chave SSH está configurada corretamente

### Erro no build

- Verifique os logs do GitHub Actions
- Confirme que as variáveis de ambiente estão configuradas
- Verifique se o banco de dados está acessível

### PM2 não reinicia

- Verifique se o PM2 está instalado: `pm2 --version`
- Verifique o status: `pm2 status`
- Veja os logs: `pm2 logs ara-mes-system`

### Aplicação não responde

- Verifique se a porta 3002 está aberta
- Confira os logs do PM2
- Verifique se o Traefik está configurado corretamente

## 📚 Recursos adicionais

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
- [SSH Action](https://github.com/appleboy/ssh-action)

