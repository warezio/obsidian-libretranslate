#!/bin/bash

# Obsidian 플러그인 빌드 스크립트

echo "🔨 빌드 시작..."

# TypeScript 컴파일
npx tsc

# 번들링
npx esbuild main.ts --bundle --outfile=dist/main.js --format=cjs --external=obsidian

# manifest.json 복사
cp manifest.json dist/

# styles.css 생성 (비어 있음)
echo "" > dist/styles.css

echo "✅ 빌드 완료!"
echo "📁 dist/ 폴더 내용:"
ls -la dist/
