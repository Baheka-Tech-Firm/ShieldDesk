import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    // CRITICAL: Bind to all interfaces for cloud platforms
    host: '0.0.0.0',
    port: 5000,
    strictPort: false,
    
    // CRITICAL: Allow all cloud platform domains
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'all', // Allow all hosts for maximum compatibility
      /\.replit\.dev$/,
      /\.janeway\.replit\.dev$/,
      /\.codesandbox\.io$/,
      /\.gitpod\.io$/,
      /\.stackblitz\.com$/
    ],
    
    // Prevent cache issues
    force: true,
    
    // CORS headers for all requests
    cors: {
      origin: true,
      credentials: true
    },
    
    fs: {
      strict: false, // Allow serving files outside root
      allow: ['..']
    },
    
    // HMR configuration for cloud platforms
    hmr: {
      port: 5000,
      host: '0.0.0.0'
    },
    
    // Watch configuration
    watch: {
      usePolling: true,
      interval: 100
    }
  },
  
  // Optimization for cloud platforms
  optimizeDeps: {
    force: true,
    include: [
      'react',
      'react-dom',
      'wouter',
      '@tanstack/react-query'
    ]
  },
  
  // Environment variables
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    global: 'globalThis',
  },
  
  // Clear screen configuration
  clearScreen: false,
  
  // Logging
  logLevel: 'info'
});