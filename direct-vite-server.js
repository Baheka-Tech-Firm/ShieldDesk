import { createServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startViteServer() {
  const server = await createServer({
    root: path.join(__dirname, 'client'),
    server: {
      host: '0.0.0.0',
      port: 5000,
      allowedHosts: 'all'
    },
    resolve: {
      alias: {
        '@': path.join(__dirname, 'client/src'),
        '@shared': path.join(__dirname, 'shared'),
        '@assets': path.join(__dirname, 'attached_assets')
      }
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify('development')
    }
  });

  await server.listen();
  
  console.log('Vite dev server running on:');
  console.log('- Local: http://localhost:5000');
  console.log('- Network: http://0.0.0.0:5000');
  console.log('- Replit: https://130a9921-c16e-4e96-afd6-bab723873bee-00-es8cxb1r6vsx.janeway.replit.dev');
}

startViteServer().catch(console.error);