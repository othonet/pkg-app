# Configuração Inicial do Git e GitHub

Este guia ajuda a configurar o repositório Git e conectar com o GitHub para habilitar o CI/CD.

## 📦 Inicializar Repositório Git

Se o repositório ainda não foi inicializado:

```bash
cd /root/app

# Inicializar repositório
git init

# Adicionar arquivos
git add .

# Fazer commit inicial
git commit -m "Initial commit: ARA MES System"

# Adicionar remote do GitHub
git remote add origin https://github.com/othonet/ara-app.git

# Renomear branch para main (se necessário)
git branch -M main

# Fazer push inicial
git push -u origin main
```

## 🔗 Conectar com Repositório Existente

Se o repositório já existe no GitHub:

```bash
cd /root/app

# Adicionar remote
git remote add origin https://github.com/othonet/ara-app.git

# Fazer pull do código existente
git pull origin main --allow-unrelated-histories

# Ou fazer push do código local
git push -u origin main
```

## 🔐 Configurar SSH para GitHub (Opcional)

Para usar SSH ao invés de HTTPS:

```bash
# Gerar chave SSH (se ainda não tiver)
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave pública
cat ~/.ssh/id_ed25519.pub

# Adicionar a chave no GitHub:
# Settings → SSH and GPG keys → New SSH key
```

Depois, use a URL SSH:
```bash
git remote set-url origin git@github.com:othonet/ara-app.git
```

## ✅ Verificar Configuração

```bash
# Verificar remote configurado
git remote -v

# Verificar status
git status

# Verificar branches
git branch -a
```

## 🚀 Próximos Passos

Após configurar o Git:

1. **Configure os secrets no GitHub** (veja [DEPLOY.md](./DEPLOY.md))
2. **Faça um push** para testar o CI/CD:
   ```bash
   git add .
   git commit -m "Configure CI/CD"
   git push origin main
   ```
3. **Verifique o workflow** em: GitHub → Actions

## 📝 Estrutura de Branches Recomendada

- `main` ou `master` - Branch de produção (deploy automático)
- `develop` - Branch de desenvolvimento
- `feature/*` - Branches de features
- `hotfix/*` - Branches de correções urgentes

## 🔄 Workflow de Desenvolvimento

1. Criar branch para feature:
   ```bash
   git checkout -b feature/nova-funcionalidade
   ```

2. Fazer alterações e commits:
   ```bash
   git add .
   git commit -m "Adiciona nova funcionalidade"
   ```

3. Fazer push da branch:
   ```bash
   git push origin feature/nova-funcionalidade
   ```

4. Criar Pull Request no GitHub

5. Após merge na `main`, o deploy automático será acionado

