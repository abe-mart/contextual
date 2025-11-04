module.exports = {
  apps: [{
    name: 'contextual',
    script: 'npm',
    args: 'run preview',
    cwd: '/home/pi/contextual',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3007
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
