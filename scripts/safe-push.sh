#!/bin/bash

# Script para fazer push seguro com verificação de build
# Uso: ./scripts/safe-push.sh [mensagem do commit] [--yes|-y]

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar flags
SKIP_CONFIRM=false
COMMIT_MSG=""

# Processar argumentos
for arg in "$@"; do
    case $arg in
        --yes|-y)
            SKIP_CONFIRM=true
            shift
            ;;
        *)
            if [ -z "$COMMIT_MSG" ]; then
                COMMIT_MSG="$arg"
            fi
            ;;
    esac
done

echo -e "${BLUE}🚀 Iniciando push seguro...${NC}"
echo ""

# Verificar se há mudanças para commitar
if [ -z "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Nenhuma mudança detectada para commitar${NC}"
    exit 0
fi

# Verificar se há mensagem de commit
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Update: $(date '+%Y-%m-%d %H:%M:%S')"
fi

echo -e "${BLUE}📦 Verificando mudanças...${NC}"
git status --short
echo ""

# Perguntar confirmação (a menos que --yes seja usado)
if [ "$SKIP_CONFIRM" = false ]; then
    read -p "Deseja continuar com o commit? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${YELLOW}❌ Operação cancelada${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Confirmação automática ativada (--yes)${NC}"
    echo ""
fi

# Adicionar todas as mudanças
echo -e "${BLUE}📝 Adicionando arquivos...${NC}"
git add -A

# Fazer commit
echo -e "${BLUE}💾 Fazendo commit...${NC}"
git commit -m "$COMMIT_MSG"

# Executar testes ANTES do build
echo ""
echo -e "${YELLOW}🧪 Executando testes...${NC}"
echo ""

if npm run test:run; then
    echo ""
    echo -e "${GREEN}✅ Todos os testes passaram!${NC}"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Testes falharam! Push cancelado.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Corrija os testes e tente novamente.${NC}"
    echo -e "${YELLOW}   O commit foi feito localmente, mas não foi enviado.${NC}"
    exit 1
fi

# Verificar build ANTES do push
echo ""
echo -e "${YELLOW}🔨 Testando build...${NC}"
echo ""

if npm run build; then
    echo ""
    echo -e "${GREEN}✅ Build passou com sucesso!${NC}"
    echo ""
    
    # Fazer push
    echo -e "${BLUE}📤 Fazendo push para GitHub...${NC}"
    if git push origin main; then
        echo ""
        echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
        echo ""
        echo -e "${GREEN}🔗 Acompanhe o deploy em:${NC}"
        echo -e "${BLUE}   https://github.com/othonet/pkg-app/actions${NC}"
        echo ""
    else
        echo ""
        echo -e "${RED}❌ Erro ao fazer push${NC}"
        exit 1
    fi
else
    echo ""
    echo -e "${RED}❌ Build falhou! Push cancelado.${NC}"
    echo ""
    echo -e "${YELLOW}💡 Corrija os erros e tente novamente.${NC}"
    echo -e "${YELLOW}   O commit foi feito localmente, mas não foi enviado.${NC}"
    exit 1
fi

