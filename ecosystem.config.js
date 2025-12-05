module.exports = {
  apps: [
    {
      name: 'ara-mes-system',
      script: 'node_modules/next/dist/bin/next',
      args: 'start',
      cwd: '/root/app',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      min_uptime: '10s', // Tempo mínimo de uptime antes de considerar estável
      max_restarts: 10, // Máximo de restarts
      restart_delay: 4000, // Delay entre restarts (4 segundos)
      kill_timeout: 5000, // Tempo para matar o processo graciosamente
      listen_timeout: 10000, // Tempo para aguardar aplicação ficar online
      env: {
        NODE_ENV: 'production',
        PORT: 3002
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      // Rotação de logs para evitar crescimento excessivo
      log_type: 'json',
      // Health check automático
      health_check_grace_period: 3000
    }
  ]
};

