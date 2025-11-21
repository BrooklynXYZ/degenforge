#!/bin/bash

# Deploy Solana Canister to ICP Mainnet
# This script deploys the updated Solana canister with security fixes

set -e

echo "======================================"
echo "Deploying Solana Canister to ICP Mainnet"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Fix dfx color issue
export TERM=xterm-256color

# Verify identity
CURRENT_IDENTITY=$(dfx identity whoami 2>&1 || echo "unknown")
echo -e "${YELLOW}Current identity: ${CURRENT_IDENTITY}${NC}"
echo ""

# Check cycles balance
echo -e "${YELLOW}Checking cycles balance...${NC}"
BALANCE_OUTPUT=$(dfx cycles --network ic balance 2>&1 || echo "error")
echo "Cycles balance: ${BALANCE_OUTPUT}"
echo ""

# Check if balance is sufficient
if [[ "$BALANCE_OUTPUT" == *"error"* ]] || [[ "$BALANCE_OUTPUT" == *"insufficient"* ]]; then
    echo -e "${RED}Warning: Could not read cycles balance${NC}"
    echo "Please ensure you have at least 3T cycles available"
    echo ""
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi

# Check if canister exists
echo -e "${YELLOW}Checking if canister exists...${NC}"
CANISTER_ID=$(dfx canister --network ic id solana_canister 2>&1 || echo "")
if [ -z "$CANISTER_ID" ] || [[ "$CANISTER_ID" == *"error"* ]]; then
    echo -e "${YELLOW}Canister does not exist, will create it...${NC}"
    CREATE_CANISTER=true
else
    echo -e "${GREEN}Canister exists: ${CANISTER_ID}${NC}"
    CREATE_CANISTER=false
fi
echo ""

# Confirm deployment
echo -e "${YELLOW}This will deploy/upgrade the Solana canister with security fixes:${NC}"
echo "  - Fixed panic-prone error handling"
echo "  - Added input validation"
echo "  - Added balance verification"
echo "  - Added transaction size validation"
echo "  - Improved error messages"
echo "  - Network: Solana Devnet"
echo ""
read -p "Proceed with deployment? (y/n): " confirm
if [ "$confirm" != "y" ]; then
    echo "Deployment cancelled"
    exit 0
fi
echo ""

# Create canister if needed
if [ "$CREATE_CANISTER" = true ]; then
    echo -e "${YELLOW}Creating solana_canister...${NC}"
    dfx canister --network ic create solana_canister --with-cycles 3000000000000 || echo "Canister may already exist"
    echo -e "${GREEN}✓ Canister created${NC}"
    echo ""
fi

# Build the canister
echo -e "${YELLOW}Building Solana canister...${NC}"
dfx build --network ic solana_canister
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

# Deploy/upgrade the canister
echo -e "${YELLOW}Deploying/upgrading Solana canister...${NC}"
if [ "$CREATE_CANISTER" = true ]; then
    dfx deploy --network ic --with-cycles 3000000000000 solana_canister
else
    dfx canister install solana_canister --mode upgrade --network ic
fi
SOLANA_CANISTER_ID=$(dfx canister --network ic id solana_canister)
echo -e "${GREEN}✓ Solana Canister deployed: ${SOLANA_CANISTER_ID}${NC}"
echo ""

# Verify deployment
echo -e "${YELLOW}Verifying deployment...${NC}"
dfx canister --network ic status solana_canister
echo ""

# Test basic functionality
echo -e "${YELLOW}Testing basic functionality...${NC}"
echo "Testing get_canister_stats..."
STATS=$(dfx canister --network ic call solana_canister get_canister_stats 2>&1 || echo "error")
if echo "$STATS" | grep -q "error\|Error"; then
    echo -e "${YELLOW}⚠ Stats check failed (may need time to initialize)${NC}"
else
    echo -e "${GREEN}✓ Stats check passed${NC}"
    echo "$STATS"
fi
echo ""

echo "======================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Solana Canister ID: ${SOLANA_CANISTER_ID}"
echo "Canister URL: https://${SOLANA_CANISTER_ID}.ic0.app"
echo ""
echo "Next steps:"
echo "  1. Test transaction signing:"
echo "     dfx canister --network ic call solana_canister generate_solana_address"
echo "     dfx canister --network ic call solana_canister send_sol '(\"RECIPIENT_ADDRESS\", 1000000)'"
echo ""
echo "  2. Verify transaction on Solana Devnet Explorer:"
echo "     https://explorer.solana.com/?cluster=devnet"
echo ""
echo "  3. Test error handling:"
echo "     - Invalid address"
echo "     - Zero lamports"
echo "     - Insufficient balance"
echo ""
echo "  4. Monitor cycles usage:"
echo "     dfx canister --network ic status solana_canister"
echo ""


