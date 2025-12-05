# 🚀 Guia Rápido - Configuração CI/CD

Este guia ajuda a configurar rapidamente o CI/CD para o repositório **https://github.com/othonet/ara-app**.

## ⚡ Configuração Rápida na VPS

Execute os seguintes comandos na VPS para conectar com o repositório GitHub:

```bash
cd /root/app

# Inicializar Git (se ainda não foi feito)
git init

# Adicionar remote do GitHub
git remote add origin https://github.com/othonet/ara-app.git

# Verificar remote configurado
git remote -v

# Fazer pull do código existente (se houver)
git pull origin main --allow-unrelated-histories

# Ou fazer push do código local (se for a primeira vez)
git add .
git commit -m "Add CI/CD configuration"
git branch -M main
git push -u origin main
```

## 🔐 Configurar Secrets no GitHub

1. Acesse: **https://github.com/othonet/ara-app/settings/secrets/actions**
2. Clique em **New repository secret**
3. Adicione os seguintes secrets:

### Secrets Obrigatórios:

| Secret | Valor | Como obter |
|--------|-------|------------|
| `VPS_HOST` | `72.61.42.147` ou `enord.app` | IP ou domínio da VPS |
| `VPS_USER` | `root` | Usuário SSH |
| `VPS_SSH_KEY` | Chave privada SSH completa | Ver instruções abaixo |
| `DATABASE_URL` | `mysql://...` | URL do banco de dados |
| `JWT_SECRET` | Seu secret JWT | Secret usado no `.env` |

### Gerar Chave SSH para GitHub Actions:

```bash
# Na sua máquina local
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copiar chave pública para VPS
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@72.61.42.147

# Copiar conteúdo da chave privada (para colar no GitHub)
cat ~/.ssh/github_actions_deploy
```

Cole o conteúdo completo da chave privada no secret `VPS_SSH_KEY` do GitHub.

## ✅ Testar Deploy

Após configurar os secrets:

1. **Faça um pequeno commit e push:**
   ```bash
   git add .
   git commit -m "Test CI/CD"
   git push origin main
   ```

2. **Verifique o workflow:**
   - Acesse: https://github.com/othonet/ara-app/actions
   - Você verá o workflow "Deploy to VPS" executando

3. **Ou acione manualmente:**
   - Vá em: Actions → Deploy to VPS → Run workflow

## 📋 Checklist de Configuração

- [ ] Git inicializado na VPS
- [ ] Remote do GitHub configurado
- [ ] Código sincronizado com GitHub
- [ ] Chave SSH gerada e configurada
- [ ] Secrets configurados no GitHub:
  - [ ] VPS_HOST
  - [ ] VPS_USER
  - [ ] VPS_SSH_KEY
  - [ ] DATABASE_URL
  - [ ] JWT_SECRET
- [ ] Primeiro deploy testado

## 🆘 Problemas Comuns

### Erro: "Repository not found"
- Verifique se o repositório existe: https://github.com/othonet/ara-app
- Confirme que você tem acesso ao repositório

### Erro: "Permission denied (publickey)"
- Verifique se a chave SSH foi adicionada corretamente no GitHub
- Confirme que a chave pública está na VPS: `cat ~/.ssh/authorized_keys`

### Erro no workflow: "Host key verification failed"
- Adicione a VPS aos known_hosts do GitHub Actions (o workflow já faz isso automaticamente)

## 📚 Documentação Completa

Para mais detalhes, consulte:
- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [GIT_SETUP.md](./GIT_SETUP.md) - Configuração detalhada do Git


