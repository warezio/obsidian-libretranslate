#!/bin/bash

# Obsidian plugin build script

echo "🔨 Building..."

# Bundle with esbuild
npx esbuild main.ts --bundle --outfile=main.js --format=cjs --external:obsidian

# Create styles.css (empty)
echo "" > styles.css

echo "✅ Build complete!"
echo "📁 Output files:"
ls -la main.js manifest.json styles.css
