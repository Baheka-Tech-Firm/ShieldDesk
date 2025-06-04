import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 5000;

// Start PHP backend
console.log('Starting PHP backend on port 8000...');
const phpServer = spawn('php', ['-S', '0.0.0.0:8000', 'simple-server.php'], {
  cwd: path.join(__dirname, 'laravel-backend'),
  stdio: 'inherit'
});

// Proxy API requests to PHP backend
app.use('/api', createProxyMiddleware({
  target: 'http://localhost:8000',
  changeOrigin: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log('Proxying:', req.method, req.url, '-> PHP backend');
  }
}));

// Serve static files from client source during development
app.use(express.static(path.join(__dirname, 'client')));

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShieldDesk running on http://0.0.0.0:${PORT}`);
  console.log(`Frontend accessible on all interfaces`);
});

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\nShutting down servers...');
  phpServer.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  phpServer.kill();
  process.exit(0);
});