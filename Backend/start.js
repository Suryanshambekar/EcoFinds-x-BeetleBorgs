#!/usr/bin/env node

// Simple startup script for EcoFinds Backend
console.log('🌱 Starting EcoFinds Backend API...\n');

// Check if .env file exists
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  Warning: .env file not found!');
  console.log('📝 Please copy .env.example to .env and configure your settings.\n');
}

// Start the server
require('./server.js');
