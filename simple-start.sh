#!/bin/bash

# Start Laravel backend without Composer dependencies (using minimal PHP server)
echo "Starting PHP backend server on port 8000..."
cd laravel-backend && php -S 0.0.0.0:8000 simple-server.php &
LARAVEL_PID=$!
cd ..

# Wait for backend to initialize
sleep 2

# Start Vite frontend
echo "Starting Vite frontend on port 5000..."
npx vite --host 0.0.0.0 --port 5000 --config vite.config.dev.ts

# Cleanup on exit
trap "kill $LARAVEL_PID 2>/dev/null" EXIT