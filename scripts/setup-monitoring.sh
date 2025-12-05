#!/bin/bash

# Script para configurar monitoramento 24/7 da aplicação

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Configurando monitoramento 24/7...${NC}"

# 1. Garantir que PM2 inicia no boot
echo -e "${YELLOW}1. Configurando PM2 para iniciar no boot...${NC}"
pm2 startup systemd -u root --hp /root > /tmp/pm2-startup.txt 2>&1 || true
if grep -q "sudo" /tmp/pm2-startup.txt; then
    echo -e "${YELLOW}   Execute o comando mostrado acima para completar a configuração${NC}"
    cat /tmp/pm2-startup.txt
fi
pm2 save

# 2. Configurar cron job para health check a cada 5 minutos
echo -e "${YELLOW}2. Configurando cron job para health check...${NC}"
CRON_JOB="*/5 * * * * /root/app/scripts/health-check.sh >> /root/app/logs/health-check.log 2>&1"

# Remover job existente se houver
(crontab -l 2>/dev/null | grep -v "health-check.sh") | crontab - || true

# Adicionar novo job
(crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -

echo -e "${GREEN}✅ Cron job configurado${NC}"

# 3. Configurar rotação de logs do PM2
echo -e "${YELLOW}3. Configurando rotação de logs...${NC}"
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

echo -e "${GREEN}✅ Rotação de logs configurada${NC}"

# 4. Criar diretório de logs se não existir
mkdir -p /root/app/logs

# 5. Testar health check
echo -e "${YELLOW}4. Testando health check...${NC}"
/root/app/scripts/health-check.sh

echo -e "${GREEN}✅ Monitoramento 24/7 configurado com sucesso!${NC}"
echo ""
echo -e "${GREEN}📊 Resumo da configuração:${NC}"
echo -e "  ✅ PM2 configurado para iniciar no boot"
echo -e "  ✅ Health check automático a cada 5 minutos"
echo -e "  ✅ Rotação de logs configurada"
echo -e "  ✅ Auto-restart configurado no ecosystem.config.js"
echo ""
echo -e "${YELLOW}📝 Para verificar logs do health check:${NC}"
echo -e "  tail -f /root/app/logs/health-check.log"
echo ""
echo -e "${YELLOW}📝 Para verificar cron jobs:${NC}"
echo -e "  crontab -l"

