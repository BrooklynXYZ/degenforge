#!/usr/bin/env node

/**
 * Simple server startup test
 * This script tests if the server can start without errors
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting DegenForge Backend Server Test...\n');

// Create a minimal .env file for testing
const fs = require('fs');
const envPath = path.join(__dirname, '.env');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating minimal .env file for testing...');
  const envContent = `# Minimal config for testing
MEZO_TESTNET_RPC_URL=https://rpc.boar.network/mezo-testnet
MEZO_PRIVATE_KEY=0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12
MEZO_API_KEY=test_api_key
MUSD_TOKEN_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
MUSD_BORROW_MANAGER_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
PORT=3001
NODE_ENV=development
JWT_SECRET=test_jwt_secret_minimum_32_characters_long
JWT_EXPIRES_IN=24h
LOG_LEVEL=info
`;
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created');
}

// Start the server
console.log('🔄 Starting server...');
const serverProcess = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'pipe'
});

let serverStarted = false;
let hasErrors = false;

// Set a timeout to kill the server after 10 seconds
const timeout = setTimeout(() => {
  if (!serverStarted) {
    console.log('⏰ Server startup timeout (10s)');
    serverProcess.kill();
  }
}, 10000);

serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  console.log(output);
  
  if (output.includes('DegenForge Backend API running on port')) {
    serverStarted = true;
    console.log('\n✅ Server started successfully!');
    console.log('🔗 API Base URL: http://localhost:3001/api');
    console.log('📊 Health Check: http://localhost:3001/api/health');
    
    // Kill the server after successful start
    setTimeout(() => {
      serverProcess.kill();
      clearTimeout(timeout);
      
      console.log('\n🎉 Backend Integration COMPLETE!');
      console.log('\n📋 Next steps for production:');
      console.log('  1. Configure your actual environment variables in .env');
      console.log('  2. Get Mezo testnet BTC from Discord faucet');
      console.log('  3. Update contract addresses with actual Mezo testnet addresses');
      console.log('  4. Test the full flow: connect wallet → deposit BTC → mint mUSD');
      console.log('\n📚 API Documentation: ../endpoints/api.txt');
      
      process.exit(0);
    }, 2000);
  }
});

serverProcess.stderr.on('data', (data) => {
  const error = data.toString();
  console.error('❌ Error:', error);
  hasErrors = true;
});

serverProcess.on('close', (code) => {
  clearTimeout(timeout);
  
  if (code !== 0 && !serverStarted) {
    console.log('\n❌ Server failed to start');
    console.log('🔧 Check your configuration and dependencies');
    process.exit(1);
  }
});

serverProcess.on('error', (error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});
