// Direct server implementation to bypass Vite host restrictions
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('Starting ShieldDesk standalone server...');

// Start the standalone Express server
const server = spawn('node', ['standalone-server.js'], {
  cwd: path.join(__dirname, '..'),
  stdio: 'inherit'
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