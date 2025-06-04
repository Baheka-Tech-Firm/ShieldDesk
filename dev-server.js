#!/usr/bin/env node

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting ShieldDesk development servers...');

// Start PHP backend server
console.log('🐘 Starting PHP backend on port 8000...');
const phpServer = spawn('php', ['-S', '0.0.0.0:8000', 'simple-server.php'], {
  cwd: path.join(__dirname, 'laravel-backend'),
  stdio: 'inherit'
});

// Wait a moment for PHP server to start
setTimeout(() => {
  // Start Vite frontend server
  console.log('⚡ Starting Vite frontend on port 5000...');
  const viteServer = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000'], {
    stdio: 'inherit'
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\n🔄 Shutting down servers...');
    phpServer.kill();
    viteServer.kill();
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    phpServer.kill();
    viteServer.kill();
    process.exit(0);
  });

}, 2000);