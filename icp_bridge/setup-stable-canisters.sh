#!/bin/bash

# Setup script to get stable canister IDs for local development
# These IDs will persist until you run dfx start --clean

set -e

echo "======================================"
echo "Setting Up Stable Canister IDs"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

cd /Users/apple/Desktop/PG/data2dreams/degenforge/icp_bridge

# Activate virtual environment if exists
if [ -d "venv" ]; then
    source venv/bin/activate
fi

# Check if dfx is running
if ! dfx ping local &> /dev/null; then
    echo -e "${YELLOW}Starting dfx local replica...${NC}"
    dfx start --background
    sleep 5
else
    echo -e "${GREEN}✓ dfx is already running${NC}"
fi

# Deploy canisters
echo ""
echo -e "${YELLOW}Deploying canisters...${NC}"
dfx deploy

# Get canister IDs
echo ""
echo -e "${YELLOW}Getting canister IDs...${NC}"
BTC_ID=$(dfx canister id btc_handler)
BRIDGE_ID=$(dfx canister id bridge_orchestrator)
SOL_ID=$(dfx canister id solana_canister)

echo ""
echo "======================================"
echo -e "${GREEN}Canister IDs (SAVE THESE!)${NC}"
echo "======================================"
echo ""
echo "BTC Handler:        $BTC_ID"
echo "Bridge Orchestrator: $BRIDGE_ID"
echo "Solana Canister:    $SOL_ID"
echo ""

# Save to .env file
cat > .env.local << EOF
# Stable Canister IDs for Local Development
# Generated: $(date)
# These IDs persist until you run: dfx start --clean

BTC_HANDLER_CANISTER_ID=$BTC_ID
BRIDGE_ORCHESTRATOR_CANISTER_ID=$BRIDGE_ID
SOLANA_CANISTER_ID=$SOL_ID

# Local network configuration
ICP_HOST=http://localhost:4943
ICP_NETWORK=local

# Mezo Testnet Configuration
MEZO_TESTNET_RPC=https://rpc.test.mezo.org
MEZO_TESTNET_CHAIN_ID=31611
MUSD_TOKEN_ADDRESS=0x7f557e8c8fb8e55aa6f54676b4f7c5a08e8f1a2c
BORROW_MANAGER_ADDRESS=

# Solana Configuration
SOLANA_DEVNET_RPC=https://api.devnet.solana.com
SOL_RPC_CANISTER_ID=titvo-eiaaa-aaaar-qaogq-cai

# Bitcoin Configuration
BTC_NETWORK=testnet
BTC_KEY_NAME=test_key_1
EOF

echo -e "${GREEN}✓ Saved to .env.local${NC}"
echo ""

# Create Mobile app .env template
MOBILE_ENV="../Mobile/.env.icp"
cat > "$MOBILE_ENV" << EOF
# ICP Canister Configuration for Mobile App
# Copy these to your Mobile/.env file

# Canister IDs
BTC_HANDLER_CANISTER_ID=$BTC_ID
BRIDGE_ORCHESTRATOR_CANISTER_ID=$BRIDGE_ID
SOLANA_CANISTER_ID=$SOL_ID

# Network
ICP_HOST=http://localhost:4943
DEV=true
EOF

echo -e "${GREEN}✓ Created Mobile/.env.icp${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}Setup Complete!${NC}"
echo "======================================"
echo ""
echo "These canister IDs will persist across sessions."
echo ""
echo "To use in Mobile app:"
echo "  1. Copy $MOBILE_ENV to Mobile/.env"
echo "  2. Update Mobile app to use these IDs"
echo ""
echo "To stop dfx:  dfx stop"
echo "To restart:   dfx start --background"
echo "To clean:     dfx start --clean (⚠️  This will delete canisters)"
echo ""

