import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { createServer } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 5000;

console.log('Starting ShieldDesk with Vite development server...');

async function startServer() {
  // Start PHP backend
  console.log('Starting PHP backend on port 8000...');
  const phpServer = spawn('php', ['-S', '0.0.0.0:8000', 'simple-server.php'], {
    cwd: path.join(__dirname, 'laravel-backend'),
    stdio: 'inherit'
  });

  // Create Vite server in middleware mode
  const vite = await createServer({
    server: { 
      middlewareMode: true,
      host: '0.0.0.0',
      allowedHosts: 'all'
    },
    appType: 'spa',
    root: path.join(__dirname, 'client'),
    resolve: {
      alias: {
        '@': path.join(__dirname, 'client/src'),
        '@assets': path.join(__dirname, 'attached_assets')
      }
    }
  });

  // Middleware
  app.use(express.json());

  // Use Vite's connect instance as middleware for React development
  app.use(vite.middlewares);

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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShieldDesk running on http://0.0.0.0:${PORT}`);
    console.log(`React development server with hot reload active`);
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
}

startServer().catch(console.error);