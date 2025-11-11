#!/bin/bash

# Deploy ICP canisters to mainnet for production

set -e

echo "======================================"
echo "Deploying to ICP Mainnet"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Verify identity is set for mainnet
CURRENT_IDENTITY=$(dfx identity whoami 2>&1)
echo -e "${YELLOW}Current identity: ${CURRENT_IDENTITY}${NC}"
if [[ "$CURRENT_IDENTITY" == "default" ]]; then
    echo -e "${YELLOW}Warning: Using default identity. For security, consider using a dedicated mainnet identity.${NC}"
    echo "To use a different identity: dfx identity use <identity-name>"
    echo ""
fi

# Check cycles balance
echo -e "${YELLOW}Checking cycles balance...${NC}"
BALANCE_OUTPUT=$(dfx cycles --network ic balance 2>&1 || echo "error")
echo "Cycles balance: ${BALANCE_OUTPUT}"
echo ""

# Check if balance is sufficient (need at least 9T cycles)
# The balance output format is "X.XXX TC (trillion cycles)."
if [[ "$BALANCE_OUTPUT" == *"error"* ]] || [[ "$BALANCE_OUTPUT" == *"insufficient"* ]] || [[ "$BALANCE_OUTPUT" != *"TC"* ]]; then
    echo -e "${RED}Warning: Insufficient cycles balance or error reading balance${NC}"
    echo "Current balance: ${BALANCE_OUTPUT}"
    echo "Minimum required: 9.0 TC (3T per canister)"
    echo "Request cycles from: https://faucet.dfinity.org"
    echo ""
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
else
    # Extract the numeric value (e.g., "10.000" from "10.000 TC")
    BALANCE_NUM=$(echo "$BALANCE_OUTPUT" | grep -oE '[0-9]+\.[0-9]+' | head -1)
    if [ -n "$BALANCE_NUM" ]; then
        # Simple comparison: if balance >= 9.0, we're good
        INT_PART=$(echo "$BALANCE_NUM" | cut -d. -f1)
        if [ "$INT_PART" -ge 9 ] 2>/dev/null; then
            echo -e "${GREEN}✓ Sufficient cycles available: ${BALANCE_OUTPUT}${NC}"
            echo ""
        else
            echo -e "${YELLOW}Warning: Balance may be low (${BALANCE_OUTPUT})${NC}"
            echo "Minimum recommended: 9.0 TC"
            echo ""
        fi
    else
        echo -e "${GREEN}✓ Cycles balance detected: ${BALANCE_OUTPUT}${NC}"
        echo ""
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

echo -e "${YELLOW}Step 1: Creating canisters on mainnet...${NC}"
# Create canisters if they don't exist
if ! dfx canister --network ic id btc_handler &>/dev/null; then
    echo "Creating btc_handler canister..."
    dfx canister --network ic create btc_handler --with-cycles 3000000000000 || echo "Canister may already exist"
fi
if ! dfx canister --network ic id solana_canister &>/dev/null; then
    echo "Creating solana_canister canister..."
    dfx canister --network ic create solana_canister --with-cycles 3000000000000 || echo "Canister may already exist"
fi
if ! dfx canister --network ic id bridge_orchestrator &>/dev/null; then
    echo "Creating bridge_orchestrator canister..."
    dfx canister --network ic create bridge_orchestrator --with-cycles 3000000000000 || echo "Canister may already exist"
fi
echo -e "${GREEN}✓ Canisters created${NC}"
echo ""

echo -e "${YELLOW}Step 2: Building Rust canisters...${NC}"
dfx build --network ic btc_handler
dfx build --network ic solana_canister
dfx build --network ic bridge_orchestrator
echo -e "${GREEN}✓ Build complete${NC}"
echo ""

echo -e "${YELLOW}Step 3: Deploying BTC Handler Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 btc_handler
BTC_CANISTER_ID=$(dfx canister --network ic id btc_handler)
echo -e "${GREEN}✓ BTC Handler deployed: ${BTC_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 4: Deploying Solana Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 solana_canister
SOLANA_CANISTER_ID=$(dfx canister --network ic id solana_canister)
echo -e "${GREEN}✓ Solana Canister deployed: ${SOLANA_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 5: Deploying Bridge Orchestrator to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 bridge_orchestrator
BRIDGE_CANISTER_ID=$(dfx canister --network ic id bridge_orchestrator)
echo -e "${GREEN}✓ Bridge Orchestrator deployed: ${BRIDGE_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 6: Configuring Bridge Orchestrator...${NC}"
dfx canister --network ic call bridge_orchestrator set_canister_ids "(\"${BTC_CANISTER_ID}\", \"${SOLANA_CANISTER_ID}\")"
echo -e "${GREEN}✓ Configuration complete${NC}"
echo ""

echo -e "${YELLOW}Step 7: Verifying deployments...${NC}"
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
echo ""

echo -e "${YELLOW}Step 8: Running health checks...${NC}"
HEALTH_CHECK=$(dfx canister --network ic call bridge_orchestrator health_check 2>&1 || echo "error")
if echo "$HEALTH_CHECK" | grep -q "error\|Error"; then
    echo -e "${YELLOW}⚠ Health check failed (may need time to initialize)${NC}"
else
    echo -e "${GREEN}✓ Health check passed${NC}"
fi
echo ""

echo -e "${YELLOW}Step 9: Generating production .env file...${NC}"
# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
MOBILE_DIR="$PROJECT_ROOT/Mobile"
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

echo "======================================"
echo -e "${GREEN}Mainnet Deployment Complete!${NC}"
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
echo "Next steps:"
echo "  1. Review the generated .env.production file"
echo "  2. Build production APK: cd Mobile && npm run build:production"
echo "  3. Test with real testnet funds"
echo "  4. Monitor cycles usage"
echo ""
echo "Monitor cycles:"
echo "  dfx canister --network ic status <CANISTER_ID>"
echo ""
echo "Top up cycles:"
echo "  dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0"
echo ""

