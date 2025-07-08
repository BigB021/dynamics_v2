#!/bin/bash
set -e  # Exit on any error

echo "🔧 Installing backend dependencies..."
cd music-server
npm install --production || { echo "❌ Failed to install backend dependencies"; exit 1; }
cd ..

echo "⚙️ Building frontend..."
npm run build || { echo "❌ Frontend build failed"; exit 1; }

echo "📦 Building Electron app..."
npm run build-electron || { echo "❌ Electron build failed"; exit 1; }

echo "✅ Build completed successfully!"
