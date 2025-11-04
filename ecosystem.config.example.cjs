// PM2 Ecosystem Configuration Example
// Copy this file to ecosystem.config.cjs and update the paths as needed

module.exports = {
  apps: [{
    name: 'contextual',
    script: 'npm',
    args: 'run preview',
    cwd: '/absolute/path/to/your/contextual/directory',  // Update this path!
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3007  // Change this if you want a different port
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
