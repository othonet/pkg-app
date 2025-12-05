# 🔄 Guia: Renomear Repositório GitHub

Este guia explica como renomear o repositório GitHub sem quebrar o CI/CD.

## ✅ O CI/CD NÃO quebra se você:

1. **Atualizar o remote do Git na VPS** (obrigatório)
2. **Atualizar a documentação** (opcional, mas recomendado)

## ❌ O que NÃO precisa ser atualizado:

- ✅ **GitHub Actions workflow** - Funciona automaticamente com o novo nome
- ✅ **Secrets do GitHub** - Continuam funcionando (são do repositório)
- ✅ **GitHub Actions** - Detecta automaticamente o repositório atual

## 📋 Passo a Passo

### 1. Renomear o Repositório no GitHub

1. Acesse: https://github.com/othonet/ara-app/settings
2. Role até a seção **"Repository name"**
3. Digite o novo nome
4. Clique em **"Rename"**

⚠️ **IMPORTANTE**: Se você mudar de organização/usuário, você precisa **transferir** o repositório, não apenas renomear.

### 2. Atualizar na VPS (Automático)

Execute o script de atualização:

```bash
cd /root/app
./scripts/update-repo-name.sh usuario/novo-nome
```

**Exemplo:**
```bash
./scripts/update-repo-name.sh othonet/pkg-system
```

O script irá:
- ✅ Atualizar o remote do Git
- ✅ Atualizar todos os arquivos de documentação
- ✅ Verificar se o novo repositório está acessível
- ✅ Testar a conexão

### 3. Atualizar na VPS (Manual)

Se preferir fazer manualmente:

```bash
cd /root/app

# Ver remote atual
git remote -v

# Atualizar remote (SSH)
git remote set-url origin git@github.com:usuario/novo-nome.git

# OU atualizar remote (HTTPS)
git remote set-url origin https://github.com/usuario/novo-nome.git

# Verificar
git remote -v

# Testar conexão
git fetch origin
```

### 4. Verificar Secrets do GitHub

Os secrets continuam funcionando, mas verifique se estão corretos:

1. Acesse: `https://github.com/usuario/novo-nome/settings/secrets/actions`
2. Verifique se os secrets estão presentes:
   - `VPS_HOST`
   - `VPS_USER`
   - `VPS_SSH_KEY`
   - `VPS_PORT`
   - `DATABASE_URL`
   - `JWT_SECRET`

### 5. Testar CI/CD

Faça um push de teste:

```bash
cd /root/app
git add .
git commit -m "Test: Verify CI/CD after repo rename"
git push origin main
```

Verifique o workflow em:
- `https://github.com/usuario/novo-nome/actions`

## 🔍 Verificações

### Verificar Remote:
```bash
git remote -v
```

Deve mostrar:
```
origin  git@github.com:usuario/novo-nome.git (fetch)
origin  git@github.com:usuario/novo-nome.git (push)
```

### Verificar Conexão:
```bash
git fetch origin --dry-run
```

### Verificar Status:
```bash
git status
```

## ⚠️ Problemas Comuns

### Erro: "repository not found"

**Causa**: O repositório não existe ou você não tem acesso.

**Solução**:
1. Verifique se o repositório existe no GitHub
2. Verifique se você tem permissão de acesso
3. Se mudou de organização, certifique-se de ter transferido o repositório

### Erro: "Permission denied (publickey)"

**Causa**: Chave SSH não está configurada para o novo repositório.

**Solução**:
1. A chave SSH funciona para qualquer repositório que você tem acesso
2. Se não funcionar, verifique se a chave está adicionada no GitHub
3. Teste: `ssh -T git@github.com`

### CI/CD não executa após renomear

**Causa**: O workflow ainda está apontando para o repositório antigo (improvável).

**Solução**:
1. O GitHub Actions detecta automaticamente o repositório atual
2. Se não funcionar, verifique se o workflow está na branch correta
3. Tente executar manualmente: Actions → Deploy to VPS → Run workflow

## 📝 Arquivos Atualizados pelo Script

O script `update-repo-name.sh` atualiza automaticamente:

- `DEPLOY.md`
- `QUICK_START.md`
- `GIT_SETUP.md`
- `PUSH_INSTRUCTIONS.md`
- `SSH_KEY_SETUP.md`
- `FIX_TOKEN_SCOPE.md`
- `scripts/safe-push.sh`

## ✅ Checklist

- [ ] Repositório renomeado no GitHub
- [ ] Remote do Git atualizado na VPS
- [ ] Conexão testada (`git fetch origin`)
- [ ] Secrets verificados no GitHub
- [ ] Push de teste realizado
- [ ] CI/CD executado com sucesso
- [ ] Documentação atualizada (se necessário)

## 🎯 Resumo

**O CI/CD NÃO quebra** ao renomear o repositório, desde que você atualize o remote do Git na VPS. O GitHub Actions funciona automaticamente com o novo nome do repositório.

**Único passo obrigatório**: Atualizar o remote do Git na VPS.

**Recomendado**: Executar o script `update-repo-name.sh` para atualizar tudo automaticamente.

