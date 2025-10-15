#!/usr/bin/env node

/**
 * Simple test script to verify backend setup
 * Run with: node test-setup.js
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Testing DegenForge Backend Setup...\n');

// Test 1: Check if required files exist
const requiredFiles = [
  'src/index.ts',
  'src/config/env.ts',
  'src/config/mezo.config.ts',
  'src/services/mezo.service.ts',
  'src/services/wallet.service.ts',
  'src/controllers/auth.controller.ts',
  'src/controllers/lending.controller.ts',
  'src/routes/api.routes.ts',
  'src/types/index.ts',
  'src/middleware/errorHandler.ts',
  'package.json',
  'tsconfig.json'
];

console.log('📁 Checking required files...');
let allFilesExist = true;

requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Test 2: Check package.json dependencies
console.log('\n📦 Checking package.json dependencies...');
try {
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf8'));
  const requiredDeps = [
    'express',
    'typescript',
    'dotenv',
    '@mezo-org/passport',
    'ethers',
    '@solana/web3.js'
  ];

  requiredDeps.forEach(dep => {
    if (packageJson.dependencies && packageJson.dependencies[dep]) {
      console.log(`  ✅ ${dep}: ${packageJson.dependencies[dep]}`);
    } else {
      console.log(`  ❌ ${dep} - MISSING`);
      allFilesExist = false;
    }
  });
} catch (error) {
  console.log('  ❌ Error reading package.json:', error.message);
  allFilesExist = false;
}

// Test 3: Check TypeScript configuration
console.log('\n⚙️  Checking TypeScript configuration...');
try {
  const tsconfig = JSON.parse(fs.readFileSync(path.join(__dirname, 'tsconfig.json'), 'utf8'));
  if (tsconfig.compilerOptions && tsconfig.compilerOptions.target === 'ES2020') {
    console.log('  ✅ TypeScript target: ES2020');
  } else {
    console.log('  ❌ TypeScript target not set to ES2020');
    allFilesExist = false;
  }
} catch (error) {
  console.log('  ❌ Error reading tsconfig.json:', error.message);
  allFilesExist = false;
}

// Test 4: Check environment example
console.log('\n🔧 Checking environment configuration...');
const envExamplePath = path.join(__dirname, '.env.example');
if (fs.existsSync(envExamplePath)) {
  console.log('  ✅ .env.example exists');
  const envContent = fs.readFileSync(envExamplePath, 'utf8');
  const requiredEnvVars = [
    'MEZO_TESTNET_RPC_URL',
    'MEZO_PRIVATE_KEY',
    'MEZO_API_KEY',
    'MUSD_TOKEN_ADDRESS',
    'MUSD_BORROW_MANAGER_ADDRESS',
    'JWT_SECRET'
  ];

  requiredEnvVars.forEach(envVar => {
    if (envContent.includes(envVar)) {
      console.log(`  ✅ ${envVar}`);
    } else {
      console.log(`  ❌ ${envVar} - MISSING`);
      allFilesExist = false;
    }
  });
} else {
  console.log('  ❌ .env.example - MISSING');
  allFilesExist = false;
}

// Test 5: Check API documentation
console.log('\n📚 Checking API documentation...');
const apiDocPath = path.join(__dirname, '..', 'endpoints', 'api.txt');
if (fs.existsSync(apiDocPath)) {
  console.log('  ✅ API documentation exists');
  const docContent = fs.readFileSync(apiDocPath, 'utf8');
  const requiredEndpoints = [
    'POST /auth/connect-wallet',
    'POST /lending/deposit',
    'POST /lending/mint',
    'GET /lending/position/:address',
    'GET /api/health'
  ];

  requiredEndpoints.forEach(endpoint => {
    if (docContent.includes(endpoint)) {
      console.log(`  ✅ ${endpoint}`);
    } else {
      console.log(`  ❌ ${endpoint} - MISSING`);
      allFilesExist = false;
    }
  });
} else {
  console.log('  ❌ API documentation - MISSING');
  allFilesExist = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 Backend setup is COMPLETE!');
  console.log('\n📋 Next steps:');
  console.log('  1. Copy .env.example to .env and configure your environment variables');
  console.log('  2. Run: npm install');
  console.log('  3. Run: npm run dev');
  console.log('  4. Test the API endpoints using the documentation in ../endpoints/api.txt');
  console.log('\n🔗 API will be available at: http://localhost:3001/api');
  console.log('📊 Health check: http://localhost:3001/api/health');
} else {
  console.log('❌ Backend setup has ISSUES that need to be resolved.');
  console.log('\n🔧 Please check the missing files and dependencies above.');
}
console.log('='.repeat(50));
