#!/bin/bash

# Obsidian Plugin Build Script

echo "🔨 Build started..."

# TypeScript Compilation
npx tsc

# Bundling
npx esbuild main.ts --bundle --outfile=dist/main.js --format=cjs --external=obsidian

# Copy manifest.json
cp manifest.json dist/

# Create styles.css (empty)
echo "" > dist/styles.css

echo "✅ Build completed!"
echo "📁 Contents of dist/ folder:"
ls -la dist/
