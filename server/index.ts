// Compatibility shim for old workflow - redirects to new PHP backend setup
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting ShieldDesk with PHP/Laravel backend...');

// Start PHP backend server
console.log('Starting PHP backend on port 8000...');
const phpServer = spawn('php', ['-S', '0.0.0.0:8000', 'simple-server.php'], {
  cwd: path.join(__dirname, '../laravel-backend'),
  stdio: 'inherit'
});

// Wait for PHP server to start
setTimeout(() => {
  // Start Vite frontend server
  console.log('Starting Vite frontend on port 5000...');
  const viteServer = spawn('npx', ['vite', '--host', '0.0.0.0', '--port', '5000', '--config', 'vite.config.local.ts'], {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });

  // Handle process cleanup
  process.on('SIGINT', () => {
    console.log('\nShutting down servers...');
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