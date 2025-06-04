import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 5000;

console.log('Starting ShieldDesk standalone server...');

// Start PHP backend
console.log('Starting PHP backend on port 8000...');
const phpServer = spawn('php', ['-S', '0.0.0.0:8000', 'simple-server.php'], {
  cwd: path.join(__dirname, 'laravel-backend'),
  stdio: 'inherit'
});

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Add vulnerability scanning API routes (dynamic import for ES modules)
const { default: vulnerabilityRouter } = await import('./server/api/vulnerability.js');
app.use('/api/vulnerability', vulnerabilityRouter);

// Proxy other API requests to PHP backend (excluding vulnerability endpoints)
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/vulnerability')) {
    return next(); // Skip proxy for vulnerability endpoints
  }
  
  createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      console.log('Proxying:', req.method, req.url, '-> PHP backend');
    }
  })(req, res, next);
});

// Handle client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`ShieldDesk running on http://0.0.0.0:${PORT}`);
  console.log(`Frontend accessible on all interfaces`);
  console.log('Vulnerability Scanner API endpoints available at /api/vulnerability/*');
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