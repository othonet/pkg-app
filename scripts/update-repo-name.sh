#!/bin/bash

# Script para atualizar o nome do repositório GitHub
# Uso: ./scripts/update-repo-name.sh usuario/novo-nome

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

if [ -z "$1" ]; then
    echo -e "${RED}❌ Erro: Forneça o novo nome do repositório${NC}"
    echo -e "${YELLOW}Uso: ./scripts/update-repo-name.sh usuario/novo-nome${NC}"
    echo -e "${YELLOW}Exemplo: ./scripts/update-repo-name.sh othonet/pkg-system${NC}"
    exit 1
fi

NEW_REPO="$1"
OLD_REPO="othonet/ara-app"

# Validar formato
if [[ ! "$NEW_REPO" =~ ^[a-zA-Z0-9_-]+/[a-zA-Z0-9_.-]+$ ]]; then
    echo -e "${RED}❌ Formato inválido. Use: usuario/nome-repo${NC}"
    exit 1
fi

echo -e "${BLUE}🔄 Atualizando nome do repositório...${NC}"
echo -e "${YELLOW}   De: $OLD_REPO${NC}"
echo -e "${YELLOW}   Para: $NEW_REPO${NC}"
echo ""

# 1. Atualizar remote do Git
echo -e "${YELLOW}1. Atualizando remote do Git...${NC}"
cd /root/app

CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "")
if [[ "$CURRENT_REMOTE" == *"$OLD_REPO"* ]]; then
    # Atualizar URL do remote
    if [[ "$CURRENT_REMOTE" == *"git@"* ]]; then
        NEW_REMOTE="git@github.com:${NEW_REPO}.git"
    else
        NEW_REMOTE="https://github.com/${NEW_REPO}.git"
    fi
    
    git remote set-url origin "$NEW_REMOTE"
    echo -e "${GREEN}✅ Remote atualizado: $NEW_REMOTE${NC}"
else
    echo -e "${YELLOW}⚠️  Remote atual não contém '$OLD_REPO', pulando atualização${NC}"
    echo -e "${YELLOW}   Remote atual: $CURRENT_REMOTE${NC}"
fi

# 2. Atualizar arquivos de documentação
echo -e "${YELLOW}2. Atualizando arquivos de documentação...${NC}"

FILES_TO_UPDATE=(
    "DEPLOY.md"
    "QUICK_START.md"
    "GIT_SETUP.md"
    "PUSH_INSTRUCTIONS.md"
    "SSH_KEY_SETUP.md"
    "FIX_TOKEN_SCOPE.md"
    "scripts/safe-push.sh"
)

UPDATED_COUNT=0
for file in "${FILES_TO_UPDATE[@]}"; do
    if [ -f "$file" ]; then
        # Substituir URLs antigas por novas
        sed -i "s|github.com/${OLD_REPO}|github.com/${NEW_REPO}|g" "$file"
        sed -i "s|github.com:${OLD_REPO}|github.com:${NEW_REPO}|g" "$file"
        UPDATED_COUNT=$((UPDATED_COUNT + 1))
        echo -e "${GREEN}   ✅ $file${NC}"
    fi
done

echo -e "${GREEN}✅ $UPDATED_COUNT arquivos atualizados${NC}"

# 3. Verificar se o novo repositório existe
echo -e "${YELLOW}3. Verificando novo repositório...${NC}"
if git ls-remote "$NEW_REMOTE" > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Repositório '$NEW_REPO' encontrado e acessível${NC}"
else
    echo -e "${RED}⚠️  Aviso: Não foi possível acessar o repositório '$NEW_REPO'${NC}"
    echo -e "${YELLOW}   Certifique-se de que:${NC}"
    echo -e "${YELLOW}   1. O repositório existe no GitHub${NC}"
    echo -e "${YELLOW}   2. Você tem acesso ao repositório${NC}"
    echo -e "${YELLOW}   3. A chave SSH está configurada (se usando SSH)${NC}"
fi

# 4. Testar conexão
echo -e "${YELLOW}4. Testando conexão...${NC}"
if git fetch origin --dry-run > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Conexão com o repositório funcionando${NC}"
else
    echo -e "${YELLOW}⚠️  Não foi possível testar a conexão (pode ser normal se o repositório estiver vazio)${NC}"
fi

echo ""
echo -e "${GREEN}✅ Atualização concluída!${NC}"
echo ""
echo -e "${BLUE}📝 Próximos passos:${NC}"
echo -e "${YELLOW}1. Certifique-se de que o repositório '$NEW_REPO' existe no GitHub${NC}"
echo -e "${YELLOW}2. Se mudou de organização/usuário, transfira o repositório no GitHub${NC}"
echo -e "${YELLOW}3. Os secrets do GitHub Actions continuarão funcionando (são do repositório)${NC}"
echo -e "${YELLOW}4. Faça um push de teste:${NC}"
echo -e "${BLUE}   git push origin main${NC}"
echo ""
echo -e "${BLUE}📋 Verificar:${NC}"
echo -e "${YELLOW}   git remote -v${NC}"

