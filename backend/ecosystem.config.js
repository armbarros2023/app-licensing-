module.exports = {
    apps: [
        {
            name: 'licensing-backend',
            script: './dist/server.js',
            cwd: '/var/www/app-licensing/backend',
            instances: 1,
            autorestart: true,
            watch: false,
            max_memory_restart: '256M',
            env: {
                NODE_ENV: 'production',
                PORT: 3001,
            },
        },
    ],
};
