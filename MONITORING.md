# 📊 Monitoramento 24/7 - PKG System

Este documento descreve as configurações de monitoramento e alta disponibilidade do sistema PKG.

## ✅ Configurações Implementadas

### 1. PM2 - Gerenciamento de Processos

**Auto-restart configurado:**
- `autorestart: true` - Reinicia automaticamente em caso de falha
- `min_uptime: 10s` - Tempo mínimo antes de considerar estável
- `max_restarts: 10` - Limite de restarts para evitar loops
- `restart_delay: 4000ms` - Delay entre restarts
- `max_memory_restart: 1G` - Reinicia se exceder 1GB de memória

**Inicialização no boot:**
- PM2 configurado para iniciar automaticamente no boot do sistema
- Status: `systemctl is-enabled pm2-root` → `enabled`

### 2. Health Check Automático

**Script:** `/root/app/scripts/health-check.sh`

**Funcionalidades:**
- Verifica se a aplicação está respondendo na porta 3002
- Verifica se o domínio está acessível
- Reinicia automaticamente se detectar problemas
- Retry automático (3 tentativas com delay de 5 segundos)

**Cron Job:**
- Executa a cada 5 minutos
- Logs salvos em: `/root/app/logs/health-check.log`

**Verificar cron job:**
```bash
crontab -l | grep health-check
```

**Ver logs do health check:**
```bash
tail -f /root/app/logs/health-check.log
```

### 3. Rotação de Logs

**Módulo PM2:** `pm2-logrotate`

**Configurações:**
- Tamanho máximo: 10MB por arquivo
- Retenção: 7 dias
- Compressão: Habilitada
- Rotação automática diária

**Verificar logs:**
```bash
pm2 logs ara-mes-system --lines 50
```

### 4. Monitoramento de Recursos

**PM2 Monitor:**
```bash
pm2 monit
```

**Status detalhado:**
```bash
pm2 describe ara-mes-system
```

**Métricas disponíveis:**
- CPU usage
- Memory usage
- Uptime
- Restart count
- Status (online/stopped/errored)

## 🔍 Verificações Manuais

### Verificar se aplicação está online:
```bash
curl http://localhost:3002
```

### Verificar domínio:
```bash
curl https://enord.app
```

### Verificar PM2:
```bash
pm2 status
pm2 logs ara-mes-system --lines 50
```

### Verificar Traefik:
```bash
docker service ls | grep traefik
docker service ps traefik
```

## 🚨 Troubleshooting

### Aplicação não está respondendo

1. **Verificar status PM2:**
   ```bash
   pm2 status
   ```

2. **Ver logs de erro:**
   ```bash
   pm2 logs ara-mes-system --err --lines 100
   ```

3. **Reiniciar manualmente:**
   ```bash
   pm2 restart ara-mes-system
   ```

4. **Verificar porta:**
   ```bash
   netstat -tlnp | grep 3002
   ```

### PM2 não inicia no boot

1. **Reconfigurar startup:**
   ```bash
   pm2 unstartup systemd
   pm2 startup systemd -u root --hp /root
   pm2 save
   ```

2. **Verificar serviço systemd:**
   ```bash
   systemctl status pm2-root
   ```

### Health check falhando

1. **Executar manualmente:**
   ```bash
   /root/app/scripts/health-check.sh
   ```

2. **Verificar logs:**
   ```bash
   tail -f /root/app/logs/health-check.log
   ```

3. **Verificar cron:**
   ```bash
   crontab -l
   ```

## 📈 Métricas e Alertas

### Logs importantes:
- `/root/app/logs/pm2-error.log` - Erros da aplicação
- `/root/app/logs/pm2-out.log` - Output da aplicação
- `/root/app/logs/health-check.log` - Logs do health check

### Comandos úteis:

**Ver uso de recursos:**
```bash
pm2 monit
```

**Estatísticas:**
```bash
pm2 describe ara-mes-system
```

**Listar todos os processos:**
```bash
pm2 list
```

**Salvar configuração atual:**
```bash
pm2 save
```

## 🔄 Manutenção

### Atualizar configuração de monitoramento:
```bash
cd /root/app
./scripts/setup-monitoring.sh
```

### Reiniciar health check:
```bash
pm2 restart ara-mes-system
/root/app/scripts/health-check.sh
```

### Limpar logs antigos:
```bash
pm2 flush  # Limpa logs do PM2
```

## 📝 Notas Importantes

1. **PM2 Update:** Há um aviso sobre versão desatualizada do PM2 em memória. Para atualizar:
   ```bash
   pm2 update
   ```

2. **Backup:** A configuração do PM2 é salva automaticamente em `/root/.pm2/dump.pm2`

3. **Restart Graceful:** O PM2 usa `kill_timeout: 5000ms` para encerrar graciosamente

4. **Memory Limit:** Aplicação reinicia automaticamente se exceder 1GB de memória

## ✅ Checklist de Disponibilidade 24/7

- [x] PM2 configurado com auto-restart
- [x] PM2 configurado para iniciar no boot
- [x] Health check automático (cada 5 minutos)
- [x] Rotação de logs configurada
- [x] Limite de memória configurado
- [x] Delay entre restarts configurado
- [x] Logs estruturados e rotacionados
- [x] Verificação de saúde automática

