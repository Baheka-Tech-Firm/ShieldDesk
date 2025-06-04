// Direct server implementation to bypass Vite host restrictions
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting ShieldDesk direct Vite server...');

// Start the direct Vite server
const server = spawn('node', ['direct-vite-server.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'development'
  }
});

// Handle process cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down server...');
  server.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  server.kill();
  process.exit(0);
});