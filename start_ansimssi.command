#!/bin/bash

# Navigate to the script's directory (absolute path to project)
cd "$(dirname "$0")"

echo "🚀 Starting Ansimssi AI..."
echo "--------------------------------"

# 1. Start Backend and Frontend concurrently
# We use 'npm run dev' which is configured to run both
# But to ensure the terminal stays open and we can see logs:

# Check if node_modules exists, simple check
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "✅ Launching Servers..."
echo "Google Chrome will open automatically when ready."

# Open Browser after a slight delay
(sleep 5 && open "http://localhost:5173") &

# Run the dev server
npm run dev
