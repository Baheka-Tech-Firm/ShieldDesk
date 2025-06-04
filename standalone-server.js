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
      hmr: {
        port: 24678,
        host: '0.0.0.0'
      }
    },
    appType: 'spa',
    root: path.join(__dirname, 'client'),
    resolve: {
      alias: {
        '@': path.join(__dirname, 'client/src'),
        '@assets': path.join(__dirname, 'attached_assets')
      }
    },
    optimizeDeps: {
      include: ['react', 'react-dom']
    }
  });

  // Performance and security middleware
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  
  // Security headers
  app.use((req, res, next) => {
    res.set({
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Cache-Control': 'public, max-age=300, stale-while-revalidate=60'
    });
    next();
  });

  // Serve PWA manifest and service worker
  app.get('/manifest.json', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'manifest.json'));
  });

  app.get('/sw.js', (req, res) => {
    res.setHeader('Content-Type', 'application/javascript');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
  });

  // Serve PWA icons
  app.use('/icons', express.static(path.join(__dirname, 'public', 'icons')));

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

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShieldDesk running on http://0.0.0.0:${PORT}`);
    console.log(`External URL: https://130a9921-c16e-4e96-afd6-bab723873bee-00-es8cxb1r6vsx.janeway.replit.dev`);
    console.log(`React development server with hot reload active`);
    console.log('Vulnerability Scanner API endpoints available at /api/vulnerability/*');
  });

  // Handle server errors
  server.on('error', (err) => {
    console.error('Server error:', err);
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