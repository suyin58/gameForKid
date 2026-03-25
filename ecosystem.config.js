/**
 * PM2 配置文件 - 生产环境
 * 用于非Docker部署的传统服务器环境
 */

module.exports = {
  apps: [
    {
      // 应用名称
      name: 'kidsgame-backend',

      // 启动脚本
      script: './src/server.js',

      // 实例数量（推荐使用CPU核心数-1或2）
      instances: 2,

      // 执行模式
      exec_mode: 'cluster',

      // 监听文件变化（生产环境建议关闭）
      watch: false,

      // 忽略监听的文件/目录
      ignore_watch: [
        'node_modules',
        'logs',
        'data',
        '.git'
      ],

      // 环境变量
      env: {
        NODE_ENV: 'production',
        PORT: 3001
      },

      // 日志配置
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,

      // 自动重启配置
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s',

      // 优雅关闭
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000,

      // 内存和CPU限制
      max_memory_restart: '500M',

      // 环境特定配置
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_TYPE: 'sqlite'
      },

      // 开发环境配置
      env_development: {
        NODE_ENV: 'development',
        PORT: 3001,
        DB_TYPE: 'sqlite'
      }
    }
  ],

  // 部署配置
  deploy: {
    production: {
      // SSH配置
      user: 'root',
      host: ['your-server-ip'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/kidsgame.git',
      path: '/var/www/kidsgame',

      // 部署后执行的命令
      'post-deploy': 'npm install && pm2 reload ecosystem.config.js --env production',

      // 部署前执行的命令
      'pre-setup': 'apt-get install git',

      // 环境变量
      env: {
        NODE_ENV: 'production'
      }
    }
  }
};
