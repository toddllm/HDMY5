#!/bin/bash

# Script to set up the development container

echo "Setting up the development container..."

# Install dependencies
echo "Installing npm dependencies..."
npm install

# Install Playwright browsers
echo "Installing Playwright browsers..."
npx playwright install --with-deps chromium

# Make scripts executable
echo "Making scripts executable..."
chmod +x *.sh

# Fix TypeScript errors in TerrainGenerator.ts
echo "Fixing TypeScript errors in TerrainGenerator.ts..."
if grep -q "const worldX = x;" src/engine/terrain/TerrainGenerator.ts; then
  sed -i '/const worldX = x;/d' src/engine/terrain/TerrainGenerator.ts
  sed -i '/const worldY = y;/d' src/engine/terrain/TerrainGenerator.ts
  sed -i '/const worldZ = z;/d' src/engine/terrain/TerrainGenerator.ts
  echo "Fixed unused variables in TerrainGenerator.ts"
fi

# Update Jest configuration to exclude Playwright tests
echo "Updating Jest configuration..."
if ! grep -q "testPathIgnorePatterns" jest.config.js; then
  sed -i 's/extensionsToTreatAsEsm: \[\x27.ts\x27, \x27.tsx\x27\]/extensionsToTreatAsEsm: \[\x27.ts\x27, \x27.tsx\x27\],\n  testPathIgnorePatterns: \[\n    "\/node_modules\/",\n    "\/tests\/" \/\/ Exclude Playwright tests\n  \]/' jest.config.js
  echo "Updated Jest configuration to exclude Playwright tests"
fi

echo "Dev container setup complete!" 