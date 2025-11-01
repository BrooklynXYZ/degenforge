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

# Check cycles balance
echo -e "${YELLOW}Checking cycles balance...${NC}"
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

echo -e "${YELLOW}Step 1: Deploying BTC Handler Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 btc_handler
BTC_CANISTER_ID=$(dfx canister --network ic id btc_handler)
echo -e "${GREEN}✓ BTC Handler deployed: ${BTC_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 2: Deploying Solana Canister to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 solana_canister
SOLANA_CANISTER_ID=$(dfx canister --network ic id solana_canister)
echo -e "${GREEN}✓ Solana Canister deployed: ${SOLANA_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 3: Deploying Bridge Orchestrator to mainnet...${NC}"
dfx deploy --network ic --with-cycles 3000000000000 bridge_orchestrator
BRIDGE_CANISTER_ID=$(dfx canister --network ic id bridge_orchestrator)
echo -e "${GREEN}✓ Bridge Orchestrator deployed: ${BRIDGE_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 4: Configuring Bridge Orchestrator...${NC}"
dfx canister --network ic call bridge_orchestrator set_canister_ids "(\"${BTC_CANISTER_ID}\", \"${SOLANA_CANISTER_ID}\")"
echo -e "${GREEN}✓ Configuration complete${NC}"
echo ""

echo -e "${YELLOW}Step 5: Verifying deployments...${NC}"
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
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
echo "Save these IDs to your production .env file!"
echo ""
echo "Next steps:"
echo "  1. Update Mobile app with production canister IDs"
echo "  2. Test with real testnet funds"
echo "  3. Monitor cycles usage"
echo "  4. Record demo video"
echo ""
echo "Monitor cycles:"
echo "  dfx canister --network ic status <CANISTER_ID>"
echo ""
echo "Top up cycles:"
echo "  dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0"
echo ""

