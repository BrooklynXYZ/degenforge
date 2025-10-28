# DegenForge ICP Canister Deployment Guide

This guide walks you through deploying the ICP canisters for DegenForge's Bitcoin-to-Solana bridge.

## Prerequisites

### 1. Install Required Tools

```bash
# Install dfx (ICP SDK)
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
dfx --version

# Install Python 3.10+
python3 --version  # Should be 3.10 or higher
```

### 2. Get Cycles for Deployment

For mainnet deployment, you need ICP cycles:

**Option 1: Free Cycles Faucet**
- Visit: https://faucet.dfinity.org
- Request 20T cycles (enough for development)

**Option 2: Convert ICP to Cycles**
```bash
# Convert ICP to cycles
dfx ledger --network ic create-canister <YOUR_PRINCIPAL> --amount 0.5
```

## Local Development Deployment

### Step 1: Setup Environment

```bash
cd icp_bridge
./setup.sh
```

This will:
- Check Python version
- Install dfx if not present
- Create Python virtual environment
- Install Kybra and dependencies
- Create `.env` file

### Step 2: Activate Virtual Environment

```bash
source venv/bin/activate
```

### Step 3: Deploy Locally

```bash
./deploy-local.sh
```

This will:
1. Start local dfx replica
2. Deploy BTC Handler canister
3. Deploy Solana canister
4. Deploy Bridge Orchestrator canister
5. Configure canister IDs

**Save the canister IDs displayed at the end!**

### Step 4: Test Deployment

```bash
# Test BTC address generation
dfx canister call btc_handler generate_btc_address

# Test Solana address generation
dfx canister call solana_canister generate_solana_address

# Check bridge stats
dfx canister call bridge_orchestrator get_bridge_stats
```

## Mainnet Production Deployment

### Step 1: Ensure Sufficient Cycles

```bash
# Check balance
dfx ledger --network ic balance

# Should show at least 9T cycles (3T per canister)
```

If insufficient, request from faucet: https://faucet.dfinity.org

### Step 2: Update Configuration

Before mainnet deployment, update contract addresses in:

**File: `src/bridge_canister/main.py`**

```python
# Update these with actual Mezo testnet contract addresses
MUSD_TOKEN_ADDRESS = "0x..."  # Get from Mezo docs or backend config
BORROW_MANAGER_ADDRESS = "0x..."  # Get from Mezo docs or backend config
```

Copy from your existing `backend/src/config/mezo.config.ts`:

```bash
# View current addresses
cat ../backend/src/config/mezo.config.ts
```

### Step 3: Deploy to Mainnet

```bash
./deploy-mainnet.sh
```

This will:
1. Verify cycles balance
2. Confirm deployment
3. Deploy all three canisters to IC mainnet
4. Configure canister IDs
5. Verify deployments
6. Display canister URLs

**Important**: Save the production canister IDs and URLs!

### Step 4: Verify Mainnet Deployment

```bash
# Check canister status
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister

# Test with a simple query
dfx canister --network ic call bridge_orchestrator get_bridge_stats
```

## Integration with Mobile App

### Step 1: Install Dependencies

```bash
cd ../Mobile
npm install @dfinity/agent @dfinity/candid @dfinity/principal
```

### Step 2: Configure Canister IDs

Create/update `Mobile/.env`:

```bash
# For local development
BTC_HANDLER_CANISTER_ID=<local_btc_canister_id>
BRIDGE_ORCHESTRATOR_CANISTER_ID=<local_bridge_canister_id>
SOLANA_CANISTER_ID=<local_solana_canister_id>

# For production
BTC_HANDLER_CANISTER_ID_PROD=<mainnet_btc_canister_id>
BRIDGE_ORCHESTRATOR_CANISTER_ID_PROD=<mainnet_bridge_canister_id>
SOLANA_CANISTER_ID_PROD=<mainnet_solana_canister_id>
```

### Step 3: Generate Candid Declarations

After deployment, generate TypeScript declarations:

```bash
cd ../icp_bridge

# Generate declarations for all canisters
dfx generate btc_handler
dfx generate bridge_orchestrator
dfx generate solana_canister

# Copy to Mobile app
cp -r .dfx/local/canisters/*/declarations ../Mobile/declarations/
```

### Step 4: Update Mobile App Code

The ICP agent utilities are already created at `Mobile/utils/icpAgent.ts`.

Uncomment the import statements after generating declarations:

```typescript
// In Mobile/utils/icpAgent.ts
import { idlFactory as btcIdlFactory } from '../declarations/btc_handler';
import { idlFactory as bridgeIdlFactory } from '../declarations/bridge_orchestrator';
import { idlFactory as solanaIdlFactory } from '../declarations/solana_canister';
```

## Testing End-to-End Flow

### Run Integration Test

```bash
cd icp_bridge
./test-flow.sh
```

This will guide you through:
1. Generating BTC testnet address
2. Funding from faucet
3. Checking balance
4. Depositing BTC for mUSD
5. Minting mUSD on Mezo
6. Generating Solana address
7. Bridging to Solana
8. Verifying final balances

### Manual Testing Steps

#### 1. Generate Addresses

```bash
# BTC address
BTC_ADDR=$(dfx canister --network ic call btc_handler generate_btc_address | tr -d '(")')
echo "BTC Address: $BTC_ADDR"

# Solana address
SOL_ADDR=$(dfx canister --network ic call solana_canister generate_solana_address | tr -d '(")')
echo "Solana Address: $SOL_ADDR"
```

#### 2. Fund BTC Address

Visit Bitcoin testnet faucet:
- https://coinfaucet.eu/en/btc-testnet/
- Request 0.001 BTC (100,000 satoshis)
- Wait 10-60 minutes for confirmations

#### 3. Check Balance

```bash
dfx canister --network ic call btc_handler get_btc_balance "($BTC_ADDR)"
```

#### 4. Execute Bridge Flow

```bash
# Deposit BTC
dfx canister --network ic call bridge_orchestrator deposit_btc_for_musd '(100000: nat64)'

# Mint mUSD
dfx canister --network ic call bridge_orchestrator mint_musd_on_mezo '(100000: nat64)'

# Bridge to Solana
dfx canister --network ic call bridge_orchestrator bridge_musd_to_solana '(99000: nat64)'

# Check position
dfx canister --network ic call bridge_orchestrator get_my_position
```

#### 5. Verify Solana Balance

```bash
dfx canister --network ic call solana_canister get_solana_balance "($SOL_ADDR)"
```

## Monitoring and Maintenance

### Check Cycles Balance

```bash
# Check all canisters
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
```

### Top Up Cycles

When cycles are low (< 1T):

```bash
# Top up individual canister
dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0
```

### Monitor Canister Logs

```bash
# View canister logs (requires canister controller permissions)
dfx canister --network ic logs <CANISTER_ID>
```

### Upgrade Canisters

When you need to update canister code:

```bash
# Build updated wasm
dfx build --network ic <CANISTER_NAME>

# Upgrade canister
dfx canister --network ic install <CANISTER_NAME> --mode upgrade
```

## Troubleshooting

### Issue: "Out of cycles" error

**Solution:**
```bash
dfx ledger top-up <CANISTER_ID> --network ic --amount 5.0
```

### Issue: "Canister rejected the message" 

**Causes:**
1. Threshold key not available (test_key_1 only works on testnet)
2. Insufficient permissions
3. Invalid parameters

**Solution:**
- Verify network (local vs mainnet)
- Check parameter types match Candid interface
- Review error message details

### Issue: HTTPS outcall fails

**Causes:**
1. Mezo testnet RPC unavailable
2. Insufficient cycles for outcall
3. Rate limiting

**Solution:**
```python
# In bridge_canister/main.py, increase:
"max_response_bytes": 5000  # Increase from 2000
```

### Issue: Bitcoin balance shows 0

**Causes:**
1. Transaction not confirmed (need 6 confirmations)
2. Wrong address format
3. Faucet transaction failed

**Solution:**
- Wait 60 minutes for confirmations
- Check address on testnet explorer
- Verify address starts with `tb1` for testnet

### Issue: Solana RPC rate limit

**Solution:**
- Add retry logic with exponential backoff
- Devnet limit is 100 requests per 10 seconds
- Consider using alternative RPC providers

## Demo Preparation (November 2 Deadline)

### Day-by-Day Checklist

**Day 1-2: Core Setup**
- [ ] Deploy all canisters locally
- [ ] Test BTC address generation
- [ ] Test Solana address generation
- [ ] Fund BTC testnet address

**Day 3-4: Bridge Testing**
- [ ] Test mUSD minting flow
- [ ] Test Solana bridging
- [ ] Verify end-to-end flow
- [ ] Deploy to mainnet

**Day 5: Mobile Integration**
- [ ] Update Mobile app with canister IDs
- [ ] Test mobile app calls
- [ ] Verify UI displays correctly

**Day 6: Demo & Documentation**
- [ ] Record demo video
- [ ] Prepare demo script
- [ ] Test with real testnet funds
- [ ] Submit to hackathon

### Demo Script

1. **Show BTC Deposit** (30 seconds)
   - Display testnet BTC address
   - Show transaction on explorer
   - Display canister balance

2. **Show mUSD Minting** (30 seconds)
   - Call mint function
   - Show Mezo transaction
   - Display position LTV

3. **Show Solana Bridge** (30 seconds)
   - Bridge mUSD to Solana
   - Show Solana address
   - Display wrapped mUSD balance

4. **Show Mobile App** (30 seconds)
   - Display position dashboard
   - Show real-time updates
   - Demonstrate user flow

## Resources

- **ICP Documentation**: https://internetcomputer.org/docs
- **Bitcoin Integration**: https://internetcomputer.org/docs/references/bitcoin-how-it-works
- **Solana Integration**: https://internetcomputer.org/docs/building-apps/chain-fusion/solana/overview/
- **Kybra Docs**: https://demergent-labs.github.io/kybra/
- **Mezo Docs**: https://mezo.org/docs
- **Cycles Faucet**: https://faucet.dfinity.org
- **Developer Forum**: https://forum.dfinity.org

## Support

For issues during deployment:
1. Check this troubleshooting guide
2. Review canister logs
3. Consult ICP developer forum
4. Check Mezo documentation

Good luck with your hackathon demo! 🚀

