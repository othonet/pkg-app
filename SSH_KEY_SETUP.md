# 🔑 Configuração de Chave SSH para GitHub Actions

## ⚠️ Importante sobre Passphrase

Quando você gerar a chave SSH para GitHub Actions, **deixe a passphrase VAZIA** (pressione Enter sem digitar nada).

### Por quê?

- O GitHub Actions precisa usar a chave automaticamente
- Se houver passphrase, você precisaria configurá-la como secret adicional
- Para deploy automático, não é necessário ter passphrase
- A chave já estará protegida como secret no GitHub

## 📝 Passo a Passo Completo

### 1. Gerar a Chave SSH (sem passphrase)

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

**Quando pedir passphrase:**
- Primeira vez: Pressione **Enter** (deixe vazio)
- Segunda vez: Pressione **Enter** novamente (deixe vazio)

### 2. Copiar Chave Pública para VPS

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@72.61.42.147
```

Ou manualmente:
```bash
cat ~/.ssh/github_actions_deploy.pub | ssh root@72.61.42.147 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

### 3. Testar Conexão

```bash
ssh -i ~/.ssh/github_actions_deploy root@72.61.42.147
```

Se conectar sem pedir senha, está funcionando! ✅

### 4. Copiar Chave Privada para GitHub

```bash
cat ~/.ssh/github_actions_deploy
```

Copie **TODO** o conteúdo (incluindo `-----BEGIN OPENSSH PRIVATE KEY-----` e `-----END OPENSSH PRIVATE KEY-----`)

### 5. Adicionar no GitHub

1. Acesse: https://github.com/othonet/pkg-app/settings/secrets/actions
2. Clique em **New repository secret**
3. Nome: `VPS_SSH_KEY`
4. Valor: Cole o conteúdo completo da chave privada
5. Clique em **Add secret**

## 🔒 Segurança

- ✅ A chave privada fica protegida como secret no GitHub
- ✅ Apenas workflows autorizados podem acessá-la
- ✅ Você pode revogar a chave a qualquer momento
- ⚠️ **NUNCA** compartilhe ou commite a chave privada no código

## 🆘 Problemas Comuns

### "Permission denied (publickey)"
- Verifique se a chave pública está na VPS: `cat ~/.ssh/authorized_keys` na VPS
- Confirme que o arquivo tem permissões corretas: `chmod 600 ~/.ssh/authorized_keys`

### "Host key verification failed"
- O GitHub Actions gerencia isso automaticamente
- Se ocorrer, adicione `-o StrictHostKeyChecking=no` no workflow (não recomendado para produção)

### Chave com passphrase não funciona
- Para GitHub Actions, sempre use chave SEM passphrase
- Se já gerou com passphrase, gere uma nova sem passphrase

