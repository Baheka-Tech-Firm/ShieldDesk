import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startViteServer() {
  // Clear Vite cache to prevent issues
  console.log('Clearing Vite cache...');
  
  const server = await createServer({
    configFile: path.join(__dirname, 'vite.config.cloud.ts'),
    root: path.join(__dirname, 'client'),
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: 'all',
      strictPort: false,
      force: true,
      cors: true,
      fs: {
        strict: false,
        allow: ['..']
      }
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'client/src'),
        '@shared': path.join(__dirname, 'shared'),
        '@assets': path.join(__dirname, 'attached_assets')
      }
    },
    optimizeDeps: {
      force: true
    },
    clearScreen: false,
    logLevel: 'info'
  });

  await server.listen();
  
  console.log('Vite dev server running on:');
  console.log('- Local: http://localhost:5000');
  console.log('- Network: http://0.0.0.0:5000');
  console.log('- Replit: https://130a9921-c16e-4e96-afd6-bab723873bee-00-es8cxb1r6vsx.janeway.replit.dev');
}

startViteServer().catch(console.error);