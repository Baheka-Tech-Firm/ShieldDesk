import { createServer } from 'vite';
import { resolve } from 'path';

async function startDevServer() {
  const server = await createServer({
    root: './client',
    server: {
      port: 3000,
      host: '0.0.0.0',
      strictPort: true
    },
    resolve: {
      alias: {
        '@': resolve('./client/src'),
        '@assets': resolve('./attached_assets')
      }
    },
    define: {
      'process.env': {}
    }
  });

  await server.listen();
  console.log('Vite dev server running on http://0.0.0.0:3000');
}

startDevServer().catch(console.error);