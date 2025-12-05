# 🔧 Corrigir Escopo do Token

O erro indica que o token precisa do escopo `workflow` para atualizar arquivos `.github/workflows/`.

## ⚠️ Erro Atual

```
refusing to allow a Personal Access Token to create or update workflow 
`.github/workflows/deploy.yml` without `workflow` scope
```

## ✅ Solução

### Opção 1: Atualizar o Token (Recomendado)

1. **Acesse:** https://github.com/settings/tokens
2. **Encontre seu token** (ou crie um novo)
3. **Ao criar/editar, selecione os escopos:**
   - ✅ `repo` (acesso completo aos repositórios)
   - ✅ `workflow` (atualizar arquivos de workflow do GitHub Actions)
4. **Gere/atualize o token**
5. **Use o novo token no push:**

```bash
cd /root/app
git push https://NOVO_TOKEN@github.com/othonet/pkg-app.git main
```

### Opção 2: Usar SSH (Mais Seguro)

Configure SSH para evitar problemas de escopo:

```bash
# Gerar chave SSH
ssh-keygen -t ed25519 -C "vps-deploy" -f ~/.ssh/github_deploy
# (pressione Enter duas vezes - sem passphrase)

# Copiar chave pública
cat ~/.ssh/github_deploy.pub
```

Depois:
1. Adicione a chave em: https://github.com/settings/ssh/new
2. Configure o Git:

```bash
cd /root/app
git remote set-url origin git@github.com:othonet/pkg-app.git
git push origin main
```

### Opção 3: Push Temporário sem Workflow

Se precisar fazer push urgente sem atualizar o workflow:

```bash
cd /root/app
# Fazer commit sem o arquivo de workflow temporariamente
git rm --cached .github/workflows/deploy.yml
git commit -m "Temporarily remove workflow for push"
git push https://SEU_TOKEN@github.com/othonet/pkg-app.git main

# Depois restaurar e fazer push com token correto
git checkout HEAD~1 -- .github/workflows/deploy.yml
git add .github/workflows/deploy.yml
git commit -m "Restore workflow file"
# Fazer push com token que tem escopo workflow
```

## 🎯 Recomendação

**Use SSH (Opção 2)** - É mais seguro e não tem limitações de escopo!

