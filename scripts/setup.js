#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ensure data directories exist
const dataDir = path.join(__dirname, '..', 'data');
const archiveDir = path.join(dataDir, 'archive');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('✅ Created data directory');
}

if (!fs.existsSync(archiveDir)) {
  fs.mkdirSync(archiveDir, { recursive: true });
  console.log('✅ Created archive directory');
}

// Create initial empty messages file if it doesn't exist
const messagesFile = path.join(dataDir, 'messages.json');
if (!fs.existsSync(messagesFile)) {
  fs.writeFileSync(messagesFile, '[]');
  console.log('✅ Created initial messages.json');
}

console.log('🎉 Setup complete! You can now run: npm run dev');
