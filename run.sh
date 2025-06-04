#!/bin/bash

# Check if Laravel backend is needed
if [ ! -f "laravel-backend/vendor/autoload.php" ]; then
    echo "Installing Laravel dependencies..."
    cd laravel-backend && composer install --no-dev --optimize-autoloader
    cd ..
fi

# Start Laravel backend
echo "Starting Laravel backend on port 8000..."
cd laravel-backend && php -S 0.0.0.0:8000 -t public &
LARAVEL_PID=$!
cd ..

# Wait for Laravel to start
sleep 3

# Start Vite development server with API proxy
echo "Starting Vite frontend with Laravel API proxy..."
exec npx vite --host 0.0.0.0 --port 5000 --config vite.config.ts

# Cleanup on exit
trap "kill $LARAVEL_PID 2>/dev/null" EXIT