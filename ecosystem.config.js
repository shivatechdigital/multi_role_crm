module.exports = {
  apps: [
    {
      name: 'crm-frontend',
      script: 'npm',
      args: 'start',
      cwd: '/home/sriprashantpsit/shivatech-crm/multi_role_crm',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NEXTAUTH_URL: 'https://multicrm.shivatechdigital.com',
        AUTH_URL: 'https://multicrm.shivatechdigital.com',
        APP_URL: 'https://multicrm.shivatechdigital.com',
        NEXT_PUBLIC_SITE_URL: 'https://multicrm.shivatechdigital.com',
      },
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
}
