#!/bin/bash

# Deploy ICP canisters to local replica for development

set -e

echo "======================================"
echo "Deploying DegenForge ICP Canisters"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Check if dfx is running
if ! dfx ping local &> /dev/null; then
    echo -e "${YELLOW}Starting local dfx replica...${NC}"
    dfx start --clean --background
    sleep 5
else
    echo -e "${GREEN}✓ Local dfx replica is running${NC}"
fi

echo ""
echo -e "${YELLOW}Step 1: Deploying BTC Handler Canister...${NC}"
dfx deploy btc_handler
BTC_CANISTER_ID=$(dfx canister id btc_handler)
echo -e "${GREEN}✓ BTC Handler deployed: ${BTC_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 2: Deploying Solana Canister...${NC}"
dfx deploy solana_canister
SOLANA_CANISTER_ID=$(dfx canister id solana_canister)
echo -e "${GREEN}✓ Solana Canister deployed: ${SOLANA_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 3: Deploying Bridge Orchestrator Canister...${NC}"
dfx deploy bridge_orchestrator
BRIDGE_CANISTER_ID=$(dfx canister id bridge_orchestrator)
echo -e "${GREEN}✓ Bridge Orchestrator deployed: ${BRIDGE_CANISTER_ID}${NC}"
echo ""

echo -e "${YELLOW}Step 4: Configuring Bridge Orchestrator with dependent canister IDs...${NC}"
dfx canister call bridge_orchestrator set_canister_ids "(\"${BTC_CANISTER_ID}\", \"${SOLANA_CANISTER_ID}\")"
echo -e "${GREEN}✓ Configuration complete${NC}"
echo ""

echo "======================================"
echo -e "${GREEN}Deployment Complete!${NC}"
echo "======================================"
echo ""
echo "Canister IDs:"
echo "  BTC Handler:        ${BTC_CANISTER_ID}"
echo "  Bridge Orchestrator: ${BRIDGE_CANISTER_ID}"
echo "  Solana Canister:    ${SOLANA_CANISTER_ID}"
echo ""
echo "Save these IDs to your .env file:"
echo ""
echo "BTC_HANDLER_CANISTER_ID=${BTC_CANISTER_ID}"
echo "BRIDGE_ORCHESTRATOR_CANISTER_ID=${BRIDGE_CANISTER_ID}"
echo "SOLANA_CANISTER_ID=${SOLANA_CANISTER_ID}"
echo ""
echo "Next steps:"
echo "  1. Run: ./test-flow.sh"
echo "  2. Integrate with Mobile app"
echo "  3. Deploy to mainnet: ./deploy-mainnet.sh"
echo ""

