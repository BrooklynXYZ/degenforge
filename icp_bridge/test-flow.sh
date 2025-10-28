#!/bin/bash

# DegenForge ICP Bridge Integration Test Script
# Tests the full flow: BTC deposit → mUSD mint → Solana bridge

set -e  # Exit on error

echo "======================================"
echo "DegenForge ICP Bridge Integration Test"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if dfx is installed
if ! command -v dfx &> /dev/null; then
    echo -e "${RED}Error: dfx is not installed${NC}"
    echo "Install with: sh -ci \"\$(curl -fsSL https://sdk.dfinity.org/install.sh)\""
    exit 1
fi

# Check if canisters are deployed
echo -e "${YELLOW}Checking canister deployments...${NC}"
if ! dfx canister id btc_handler &> /dev/null; then
    echo -e "${RED}Error: btc_handler canister not deployed${NC}"
    echo "Run: dfx deploy btc_handler"
    exit 1
fi

if ! dfx canister id bridge_orchestrator &> /dev/null; then
    echo -e "${RED}Error: bridge_orchestrator canister not deployed${NC}"
    echo "Run: dfx deploy bridge_orchestrator"
    exit 1
fi

if ! dfx canister id solana_canister &> /dev/null; then
    echo -e "${RED}Error: solana_canister canister not deployed${NC}"
    echo "Run: dfx deploy solana_canister"
    exit 1
fi

echo -e "${GREEN}✓ All canisters deployed${NC}"
echo ""

# Step 1: Generate BTC testnet address
echo -e "${YELLOW}Step 1: Generating BTC testnet address...${NC}"
BTC_ADDR=$(dfx canister call btc_handler generate_btc_address | tr -d '(")')
echo -e "${GREEN}✓ BTC Address: ${BTC_ADDR}${NC}"
echo ""

# Step 2: Fund address (manual step)
echo -e "${YELLOW}Step 2: Fund the BTC address${NC}"
echo "Please send testnet BTC to: ${BTC_ADDR}"
echo "Faucet: https://coinfaucet.eu/en/btc-testnet/"
echo ""
read -p "Press Enter after funding the address and waiting for confirmations (6 blocks, ~60 mins)..."
echo ""

# Step 3: Check BTC balance
echo -e "${YELLOW}Step 3: Checking BTC balance...${NC}"
BTC_BALANCE=$(dfx canister call btc_handler get_btc_balance "(\"${BTC_ADDR}\")" | tr -d '(: nat64)')
echo -e "${GREEN}✓ BTC Balance: ${BTC_BALANCE} satoshis${NC}"

if [ "$BTC_BALANCE" -eq 0 ]; then
    echo -e "${RED}Warning: Balance is 0. Make sure transaction is confirmed.${NC}"
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
        exit 1
    fi
fi
echo ""

# Step 4: Deposit BTC for mUSD
echo -e "${YELLOW}Step 4: Initiating BTC deposit for mUSD...${NC}"
DEPOSIT_AMOUNT=100000  # 100,000 satoshis
dfx canister call bridge_orchestrator deposit_btc_for_musd "(${DEPOSIT_AMOUNT}: nat64)"
echo -e "${GREEN}✓ Deposit initiated: ${DEPOSIT_AMOUNT} satoshis${NC}"
echo ""

# Step 5: Mint mUSD on Mezo testnet
echo -e "${YELLOW}Step 5: Minting mUSD on Mezo testnet...${NC}"
MINT_RESULT=$(dfx canister call bridge_orchestrator mint_musd_on_mezo "(${DEPOSIT_AMOUNT}: nat64)")
echo -e "${GREEN}✓ mUSD minting result:${NC}"
echo "${MINT_RESULT}"
echo ""

# Step 6: Generate Solana devnet address
echo -e "${YELLOW}Step 6: Generating Solana devnet address...${NC}"
SOL_ADDR=$(dfx canister call solana_canister generate_solana_address | tr -d '(")')
echo -e "${GREEN}✓ Solana Address: ${SOL_ADDR}${NC}"
echo ""

# Step 7: Request Solana airdrop (optional)
echo -e "${YELLOW}Step 7: Requesting Solana devnet airdrop...${NC}"
AIRDROP_AMOUNT=1000000000  # 1 SOL
dfx canister call solana_canister request_airdrop "(\"${SOL_ADDR}\", ${AIRDROP_AMOUNT}: nat64)"
echo -e "${GREEN}✓ Airdrop requested: 1 SOL${NC}"
echo ""

# Wait for airdrop confirmation
echo "Waiting 10 seconds for airdrop confirmation..."
sleep 10

# Step 8: Check Solana balance
echo -e "${YELLOW}Step 8: Checking Solana balance...${NC}"
SOL_BALANCE=$(dfx canister call solana_canister get_solana_balance "(\"${SOL_ADDR}\")")
echo -e "${GREEN}✓ Solana Balance:${NC}"
echo "${SOL_BALANCE}"
echo ""

# Step 9: Bridge mUSD to Solana
echo -e "${YELLOW}Step 9: Bridging mUSD to Solana...${NC}"
BRIDGE_AMOUNT=99000  # 99,000 (99% LTV)
BRIDGE_RESULT=$(dfx canister call bridge_orchestrator bridge_musd_to_solana "(${BRIDGE_AMOUNT}: nat64)")
echo -e "${GREEN}✓ Bridge result:${NC}"
echo "${BRIDGE_RESULT}"
echo ""

# Step 10: Check final position
echo -e "${YELLOW}Step 10: Checking final position...${NC}"
POSITION=$(dfx canister call bridge_orchestrator get_my_position)
echo -e "${GREEN}✓ Final Position:${NC}"
echo "${POSITION}"
echo ""

# Step 11: Get bridge statistics
echo -e "${YELLOW}Step 11: Getting bridge statistics...${NC}"
STATS=$(dfx canister call bridge_orchestrator get_bridge_stats)
echo -e "${GREEN}✓ Bridge Statistics:${NC}"
echo "${STATS}"
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}Integration Test Complete!${NC}"
echo "======================================"
echo ""
echo "Summary:"
echo "  BTC Address: ${BTC_ADDR}"
echo "  BTC Deposited: ${DEPOSIT_AMOUNT} satoshis"
echo "  Solana Address: ${SOL_ADDR}"
echo "  mUSD Bridged: ${BRIDGE_AMOUNT}"
echo ""
echo "Next steps:"
echo "  1. Verify transactions on block explorers"
echo "  2. Test mobile app integration"
echo "  3. Deploy to ICP mainnet for production"
echo "  4. Record demo video for hackathon"
echo ""

