import express from 'express';
import path from 'path';
import { createServer } from 'vite';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 5000;

  // Basic middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS headers for all requests
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    next();
  });

  if (process.env.NODE_ENV === 'development') {
    // Use Vite dev server
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
          '@shared': path.join(__dirname, 'shared'),
          '@assets': path.join(__dirname, 'attached_assets')
        }
      }
    });

    app.use(vite.ssrFixStacktrace);
    app.use(vite.middlewares);
  } else {
    // Serve built files
    app.use(express.static(path.join(__dirname, 'dist/client')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist/client/index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
    console.log(`External access: https://130a9921-c16e-4e96-afd6-bab723873bee-00-es8cxb1r6vsx.janeway.replit.dev`);
  });

  server.on('error', (err) => {
    console.error('Server error:', err);
  });

  return server;
}

startServer().catch(console.error);