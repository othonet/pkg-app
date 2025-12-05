#!/bin/bash

# Script de deploy para VPS
# Este script pode ser executado manualmente ou via CI/CD

set -e

echo "🚀 Iniciando deploy..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Diretório da aplicação
APP_DIR="/root/app"

# Verificar se estamos no diretório correto
if [ ! -d "$APP_DIR" ]; then
    echo -e "${RED}❌ Diretório $APP_DIR não encontrado!${NC}"
    exit 1
fi

cd "$APP_DIR"

echo -e "${YELLOW}📦 Atualizando código do repositório...${NC}"
git pull origin main || git pull origin master || echo "Aviso: Não foi possível fazer pull"

echo -e "${YELLOW}📥 Instalando dependências...${NC}"
npm ci --production=false

echo -e "${YELLOW}🔧 Gerando cliente Prisma...${NC}"
npm run db:generate

echo -e "${YELLOW}🏗️  Fazendo build da aplicação...${NC}"
npm run build

echo -e "${YELLOW}🔄 Reiniciando aplicação com PM2...${NC}"
pm2 reload ecosystem.config.js --update-env

echo -e "${YELLOW}💾 Salvando configuração do PM2...${NC}"
pm2 save

echo -e "${GREEN}✅ Deploy concluído com sucesso!${NC}"
echo -e "${GREEN}📊 Status do PM2:${NC}"
pm2 status

echo -e "${GREEN}🌐 Verificando aplicação...${NC}"
sleep 2
if curl -f http://localhost:3002 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Aplicação está respondendo corretamente!${NC}"
else
    echo -e "${RED}⚠️  Aplicação pode não estar respondendo corretamente${NC}"
fi

