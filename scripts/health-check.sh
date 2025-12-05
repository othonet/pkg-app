#!/bin/bash

# Script de verificação de saúde da aplicação
# Este script verifica se a aplicação está respondendo corretamente

set -e

APP_URL="http://localhost:3002"
DOMAIN_URL="https://enord.app"
MAX_RETRIES=3
RETRY_DELAY=5

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_app() {
    local url=$1
    local name=$2
    
    for i in $(seq 1 $MAX_RETRIES); do
        if curl -f -s -o /dev/null -w "%{http_code}" "$url" | grep -q "200\|301\|302"; then
            echo -e "${GREEN}✅ $name está respondendo corretamente${NC}"
            return 0
        else
            if [ $i -lt $MAX_RETRIES ]; then
                echo -e "${YELLOW}⚠️  Tentativa $i/$MAX_RETRIES falhou para $name, aguardando ${RETRY_DELAY}s...${NC}"
                sleep $RETRY_DELAY
            else
                echo -e "${RED}❌ $name não está respondendo após $MAX_RETRIES tentativas${NC}"
                return 1
            fi
        fi
    done
}

echo "🔍 Verificando saúde da aplicação..."

# Verificar PM2
if ! pm2 describe ara-mes-system > /dev/null 2>&1; then
    echo -e "${RED}❌ Aplicação não está rodando no PM2${NC}"
    exit 1
fi

PM2_STATUS=$(pm2 jlist 2>/dev/null | python3 -c "import sys, json; data = json.load(sys.stdin); app = next((a for a in data if a.get('name') == 'ara-mes-system'), None); print(app['pm2_env']['status'] if app and 'pm2_env' in app else 'not_found')" 2>/dev/null || echo "unknown")

if [ "$PM2_STATUS" != "online" ]; then
    echo -e "${RED}❌ Aplicação não está online no PM2 (status: $PM2_STATUS)${NC}"
    echo -e "${YELLOW}🔄 Tentando reiniciar...${NC}"
    pm2 restart ara-mes-system
    sleep 5
fi

# Verificar aplicação local
if ! check_app "$APP_URL" "Aplicação local (porta 3002)"; then
    echo -e "${YELLOW}🔄 Tentando reiniciar aplicação...${NC}"
    pm2 restart ara-mes-system
    sleep 10
    
    if ! check_app "$APP_URL" "Aplicação local (porta 3002)"; then
        echo -e "${RED}❌ Falha ao restaurar aplicação local${NC}"
        exit 1
    fi
fi

# Verificar domínio (opcional, pode falhar se houver problemas de rede)
if check_app "$DOMAIN_URL" "Domínio (enord.app)"; then
    echo -e "${GREEN}✅ Todas as verificações passaram!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Aplicação local está funcionando, mas domínio pode ter problemas${NC}"
    echo -e "${YELLOW}   Isso pode ser um problema temporário de rede ou Traefik${NC}"
    exit 0 # Não falha completamente se apenas o domínio tiver problema
fi

