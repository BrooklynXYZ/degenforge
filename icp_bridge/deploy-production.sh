#!/bin/bash

# Comprehensive Production Deployment Workflow
# This script:
# 1. Deploys all canisters to ICP mainnet
# 2. Gets canister IDs
# 3. Configures bridge_orchestrator
# 4. Generates Mobile/.env.production with IDs
# 5. Validates deployments
# 6. Provides next steps for APK build

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
ICP_BRIDGE_DIR="$SCRIPT_DIR"
MOBILE_DIR="$PROJECT_ROOT/Mobile"

echo "======================================"
echo "Production Deployment Workflow"
echo "======================================"
echo ""
echo "This script will:"
echo "  1. Deploy canisters to ICP mainnet"
echo "  2. Configure bridge orchestrator"
echo "  3. Generate production .env file"
echo "  4. Validate deployments"
echo "  5. Provide APK build instructions"
echo ""

# Check cycles balance
echo -e "${BLUE}Step 0: Checking cycles balance...${NC}"
BALANCE=$(dfx ledger --network ic balance 2>&1 || echo "0")
echo "Cycles balance: ${BALANCE}"
echo ""

if [[ "$BALANCE" == "0" ]] || [[ "$BALANCE" == *"error"* ]]; then
    echo -e "${RED}Warning: Insufficient cycles balance${NC}"
    echo "Request cycles from: https://faucet.dfinity.org"
    echo "Minimum required: 9T cycles (3T per canister)"
    echo ""
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

# Confirm deployment
echo -e "${YELLOW}This will deploy to ICP mainnet with the following configuration:${NC}"
echo "  Network: IC Mainnet"
echo "  Cycles per canister: 3T"
echo "  Total cost: ~9T cycles"
echo ""
read -p "Proceed with mainnet deployment? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi
echo ""

# Change to ICP bridge directory
cd "$ICP_BRIDGE_DIR"

# Step 1: Build canisters
echo -e "${BLUE}Step 1: Building Rust canisters...${NC}"
dfx build --network ic btc_handler
dfx build --network ic solana_canister
dfx build --network ic bridge_orchestrator
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Step 2: Deploy BTC Handler
echo -e "${BLUE}Step 2: Deploying BTC Handler Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 btc_handler
BTC_CANISTER_ID=$(dfx canister --network ic id btc_handler)
echo -e "${GREEN}✓ BTC Handler deployed: ${BTC_CANISTER_ID}${NC}"
echo ""

# Step 3: Deploy Solana Canister
echo -e "${BLUE}Step 3: Deploying Solana Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 solana_canister
SOLANA_CANISTER_ID=$(dfx canister --network ic id solana_canister)
echo -e "${GREEN}✓ Solana Canister deployed: ${SOLANA_CANISTER_ID}${NC}"
echo ""

# Step 4: Deploy Bridge Orchestrator
echo -e "${BLUE}Step 4: Deploying Bridge Orchestrator to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 bridge_orchestrator
BRIDGE_CANISTER_ID=$(dfx canister --network ic id bridge_orchestrator)
echo -e "${GREEN}✓ Bridge Orchestrator deployed: ${BRIDGE_CANISTER_ID}${NC}"
echo ""

# Step 5: Configure Bridge Orchestrator
echo -e "${BLUE}Step 5: Configuring Bridge Orchestrator...${NC}"
CONFIG_RESULT=$(dfx canister --network ic call bridge_orchestrator set_canister_ids "(\"${BTC_CANISTER_ID}\", \"${SOLANA_CANISTER_ID}\")" 2>&1 || echo "error")
if echo "$CONFIG_RESULT" | grep -q "error\|Error"; then
    echo -e "${RED}✗ Configuration failed:${NC}"
    echo "$CONFIG_RESULT"
    exit 1
else
    echo -e "${GREEN}✓ Bridge orchestrator configured${NC}"
fi
echo ""

# Step 6: Verify deployments
echo -e "${BLUE}Step 6: Verifying deployments...${NC}"
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
echo ""

# Step 7: Health check
echo -e "${BLUE}Step 7: Running health checks...${NC}"
HEALTH_CHECK=$(dfx canister --network ic call bridge_orchestrator health_check 2>&1 || echo "error")
if echo "$HEALTH_CHECK" | grep -q "error\|Error"; then
    echo -e "${YELLOW}⚠ Health check failed (may need time to initialize)${NC}"
else
    echo -e "${GREEN}✓ Health check passed${NC}"
fi
echo ""

# Step 8: Generate production .env file
echo -e "${BLUE}Step 8: Generating production .env file...${NC}"
PROD_ENV_FILE="$MOBILE_DIR/.env.production"

# Create .env.production file
cat > "$PROD_ENV_FILE" << EOF
# Production Environment Configuration
# Generated: $(date)
# DO NOT COMMIT THIS FILE - Contains production canister IDs

# ICP Network Configuration
EXPO_PUBLIC_ICP_HOST=https://icp-api.io

# Production Canister IDs (from mainnet deployment)
EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID=${BTC_CANISTER_ID}
EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID=${BRIDGE_CANISTER_ID}
EXPO_PUBLIC_SOLANA_CANISTER_ID=${SOLANA_CANISTER_ID}

# Note: These IDs are for production use only
# For local development, use .env file with local canister IDs
EOF

echo -e "${GREEN}✓ Production .env file generated: $PROD_ENV_FILE${NC}"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}Production Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Production Canister IDs:"
echo "  BTC Handler:        ${BTC_CANISTER_ID}"
echo "  Bridge Orchestrator: ${BRIDGE_CANISTER_ID}"
echo "  Solana Canister:    ${SOLANA_CANISTER_ID}"
echo ""
echo "Canister URLs:"
echo "  BTC Handler:        https://${BTC_CANISTER_ID}.ic0.app"
echo "  Bridge Orchestrator: https://${BRIDGE_CANISTER_ID}.ic0.app"
echo "  Solana Canister:    https://${SOLANA_CANISTER_ID}.ic0.app"
echo ""
echo -e "${GREEN}✓ Production .env file created at: $PROD_ENV_FILE${NC}"
echo ""

# Next steps
echo "======================================"
echo "Next Steps: Build Production APK"
echo "======================================"
echo ""
echo "1. Review the generated .env.production file:"
echo "   cat $PROD_ENV_FILE"
echo ""
echo "2. Set EAS environment variables (optional, for cloud builds):"
echo "   eas secret:create --scope project --name EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID --value ${BTC_CANISTER_ID}"
echo "   eas secret:create --scope project --name EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID --value ${BRIDGE_CANISTER_ID}"
echo "   eas secret:create --scope project --name EXPO_PUBLIC_SOLANA_CANISTER_ID --value ${SOLANA_CANISTER_ID}"
echo ""
echo "3. Build production APK:"
echo "   cd $MOBILE_DIR"
echo "   npm run build:production"
echo ""
echo "   Or for app bundle (Play Store):"
echo "   npm run build:production-bundle"
echo ""
echo "4. Test the APK:"
echo "   - Install on a physical device"
echo "   - Verify connection to mainnet canisters"
echo "   - Test with real testnet funds"
echo ""
echo "5. Monitor cycles usage:"
echo "   dfx canister --network ic status <CANISTER_ID>"
echo ""
echo "6. Top up cycles if needed:"
echo "   dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0"
echo ""
echo "For detailed build instructions, see: Mobile/BUILD.md"
echo ""




