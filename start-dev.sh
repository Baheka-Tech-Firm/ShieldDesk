#!/bin/bash

# Start Laravel backend on port 8000
echo "Starting Laravel backend on port 8000..."
cd laravel-backend && php -S 0.0.0.0:8000 -t public &
LARAVEL_PID=$!

# Wait a moment for Laravel to start
sleep 2

# Start Vite frontend on port 5000  
echo "Starting Vite frontend on port 5000..."
cd ..
npx vite --host 0.0.0.0 --port 5000

# Clean up background process when script exits
trap "kill $LARAVEL_PID 2>/dev/null" EXIT