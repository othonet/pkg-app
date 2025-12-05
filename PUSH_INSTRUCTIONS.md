# 📤 Instruções para Fazer Push

O commit de teste foi criado com sucesso! Agora você precisa fazer o push manualmente.

## ✅ Commit Criado

```
7bb2585 Test CI/CD deployment
```

## 🔐 Opções para Fazer Push

### Opção 1: Usar Personal Access Token (Mais Rápido)

1. **Criar Personal Access Token no GitHub:**
   - Acesse: https://github.com/settings/tokens
   - Clique em **Generate new token (classic)**
   - Dê um nome: `VPS Deploy Token`
   - Selecione escopo: `repo` (acesso completo aos repositórios)
   - Clique em **Generate token**
   - **Copie o token** (você só verá uma vez!)

2. **Fazer push usando o token:**

```bash
cd /root/app
git push https://SEU_TOKEN@github.com/othonet/pkg-app.git main
```

Ou configure a URL com o token:

```bash
cd /root/app
git remote set-url origin https://SEU_TOKEN@github.com/othonet/pkg-app.git
git push origin main
```

### Opção 2: Configurar SSH (Recomendado para Longo Prazo)

1. **Gerar chave SSH na VPS:**

```bash
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/github_deploy
# Pressione Enter duas vezes (sem passphrase)
```

2. **Copiar chave pública:**

```bash
cat ~/.ssh/github_deploy.pub
```

3. **Adicionar no GitHub:**
   - Acesse: https://github.com/settings/ssh/new
   - Cole a chave pública
   - Dê um título: `VPS Deploy Key`
   - Clique em **Add SSH key**

4. **Configurar Git para usar SSH:**

```bash
cd /root/app
git remote set-url origin git@github.com:othonet/pkg-app.git
git push origin main
```

### Opção 3: Fazer Push da Sua Máquina Local

Se você tem o repositório clonado na sua máquina local:

```bash
# Na sua máquina local
cd /caminho/para/ara-app
git pull origin main
git push origin main
```

## ✅ Verificar Push Bem-Sucedido

Após fazer o push, verifique:

1. **No GitHub:**
   - Acesse: https://github.com/othonet/pkg-app/commits/main
   - Você deve ver o commit "Test CI/CD deployment"

2. **GitHub Actions:**
   - Acesse: https://github.com/othonet/pkg-app/actions
   - Você deve ver o workflow "Deploy to VPS" executando

## ⚠️ Importante

- **Se usar Personal Access Token:** Mantenha o token seguro e não compartilhe
- **Se usar SSH:** A chave privada fica na VPS, mantenha o servidor seguro
- **Secrets do GitHub:** Certifique-se de ter configurado todos os secrets antes do deploy automático funcionar

## 🚀 Após o Push

Quando o push for bem-sucedido, o GitHub Actions irá:

1. Fazer checkout do código
2. Instalar dependências
3. Fazer build
4. Conectar na VPS via SSH
5. Fazer deploy automático
6. Reiniciar o PM2

Você pode acompanhar em: https://github.com/othonet/pkg-app/actions

