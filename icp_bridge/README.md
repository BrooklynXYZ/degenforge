# Ghala ICP Bridge - Bitcoin & Solana Integration

This directory contains the Internet Computer Protocol (ICP) canisters that power Ghala's cross-chain bridge, enabling BTC deposits to mint mUSD on Mezo and bridge to Solana devnet for yield generation.

## Architecture

### Canisters

1. **BTC Handler Canister** (`btc_handler`)
   - Generates Bitcoin testnet addresses using threshold ECDSA
   - Manages UTXO tracking and balance queries
   - Signs and broadcasts Bitcoin transactions
   - Native ICP Bitcoin integration (no external APIs needed)

2. **Bridge Orchestrator Canister** (`bridge_orchestrator`)
   - Coordinates BTC → mUSD → Solana flow
   - Makes HTTPS outcalls to Mezo testnet RPC
   - Manages user positions and bridge state
   - Calculates LTV and minting limits

3. **Solana Canister** (`solana_canister`)
   - Generates Solana devnet addresses using threshold Schnorr (Ed25519)
   - Queries Solana balances via SOL RPC canister
   - Signs and submits Solana transactions
   - Handles SPL token operations for wrapped mUSD

## Prerequisites

### Install dfx SDK

```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
dfx --version
```

### Install Kybra (Python CDK)

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install Kybra
pip install kybra

# Install dfx extension
python -m kybra install-dfx-extension
```

### Install Dependencies

```bash
pip install base58 hashlib
```

## Quick Start

### WSL Setup (for Mobile App Development)

If you're developing on Windows with WSL and need to connect from a mobile device:

1. **Start dfx with network access:**
   ```bash
   dfx start --host 0.0.0.0:4943 --background --clean
   ```

2. **Find your WSL IP address:**
   ```bash
   ip addr show eth0 | grep "inet " | awk '{print $2}' | cut -d/ -f1
   ```

3. **Set WSL IP in Mobile app `.env` file:**
   ```bash
   EXPO_PUBLIC_WSL_IP=<your-wsl-ip>
   EXPO_PUBLIC_ICP_PORT=4943
   ```

4. **Note:** Port 4943 is the correct ICP local replica port (not 4393)

### 1. Start Local Replica

```bash
# Start dfx in background (with network access for WSL)
dfx start --host 0.0.0.0:4943 --background --clean

# Check status
dfx ping local
```

**Note on Bitcoin Integration Canister Errors:**

When starting `dfx start`, you may see errors like:
```
[Canister g4xu7-jiaaa-aaaan-aaaaq-cai] Error fetching blocks: [SysTransient] ConnectionBroken
```

These errors are **expected and harmless** in local development. The Bitcoin integration canister (a system canister) automatically initializes and tries to connect to Bitcoin regtest network, which isn't available in local development. This canister is only needed for mainnet Bitcoin operations and can be safely ignored during local testing.

### 2. Deploy Canisters Locally

```bash
# Deploy all canisters
dfx deploy

# Or deploy individually
dfx deploy btc_handler
dfx deploy bridge_orchestrator
dfx deploy solana_canister
```

### 3. Configure Bridge Canister

After deployment, set the dependent canister IDs:

```bash
# Get canister IDs
BTC_ID=$(dfx canister id btc_handler)
SOL_ID=$(dfx canister id solana_canister)

# Set in bridge orchestrator
dfx canister call bridge_orchestrator set_canister_ids "(\"$BTC_ID\", \"$SOL_ID\")"
```

### 4. Test Bitcoin Integration

```bash
# Generate BTC testnet address
dfx canister call btc_handler generate_btc_address

# Output: "tb1q..."

# Fund the address from a testnet faucet

# Check balance (wait 10-60 mins for confirmations)
dfx canister call btc_handler get_btc_balance '("tb1q...")'
```

### 5. Test Solana Integration

```bash
# Generate Solana devnet address
dfx canister call solana_canister generate_solana_address

# Output: "7xKX..."

# Request airdrop (1 SOL = 1,000,000,000 lamports)
dfx canister call solana_canister request_airdrop '("7xKX...", 1000000000: nat64)'

# Check balance
dfx canister call solana_canister get_solana_balance '("7xKX...")'
```

### 6. Test Bridge Flow

```bash
# Step 1: Deposit BTC for mUSD (100,000 satoshis)
dfx canister call bridge_orchestrator deposit_btc_for_musd '(100000: nat64)'

# Step 2: Mint mUSD on Mezo testnet
dfx canister call bridge_orchestrator mint_musd_on_mezo '(100000: nat64)'

# Step 3: Bridge mUSD to Solana (99,000 at 99% LTV)
dfx canister call bridge_orchestrator bridge_musd_to_solana '(99000: nat64)'

# Check position
dfx canister call bridge_orchestrator get_my_position
```

## Deploy to ICP Mainnet

### 1. Get Cycles

Request free cycles from the faucet (minimum 3T cycles per canister, 9T total recommended)

### 2. Deploy to Mainnet

```bash
# Check cycles balance
dfx ledger --network ic balance

# Deploy all canisters with cycles
dfx deploy --network ic --with-cycles 3000000000000

# Verify deployment
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
```

### 3. Top Up Cycles

```bash
# Top up individual canister
dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0

# Check canister balance
dfx canister --network ic status <CANISTER_ID>
```

## Integration with Mobile App

### Install Dependencies

```bash
cd ../Mobile
npm install @dfinity/agent @dfinity/candid @dfinity/principal
```

### Example Usage

```typescript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './bridge.did.js';

// Initialize agent
const agent = new HttpAgent({ 
  host: 'https://icp-api.io'  // or 'http://localhost:4943' for local
});

// Create actor for bridge canister
const bridgeActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: 'YOUR_BRIDGE_CANISTER_ID'
});

// Call canister methods
const depositResult = await bridgeActor.deposit_btc_for_musd(BigInt(100000));
console.log('BTC Address:', depositResult.btc_address);

const position = await bridgeActor.get_my_position();
console.log('Position:', position);
```

## Testing Script

Run the end-to-end integration test:

```bash
chmod +x test-flow.sh
./test-flow.sh
```

This script:
1. Generates BTC testnet address
2. Prompts user to fund the address with testnet BTC (wait for 6 confirmations)
3. Initiates bridge flow
4. Mints mUSD on Mezo testnet
5. Generates Solana devnet address
6. Bridges mUSD to Solana
7. Verifies final balances
8. Displays explorer links for verification

**Verification Steps:**
- Check BTC address on a testnet explorer
- Check Mezo transaction on the Mezo explorer
- Check Solana address/transaction on Solana Explorer

## API Reference

### BTC Handler Canister

- `generate_btc_address()` → `text` - Generate P2PKH testnet address
- `get_my_btc_address()` → `text` - Query caller's BTC address
- `get_btc_balance(address: text)` → `nat64` - Query balance in satoshis
- `get_utxos(address: text)` → `Vec[UTXOInfo]` - Fetch unspent outputs
- `send_btc(to: text, amount: nat64)` → `text` - Send BTC transaction

### Bridge Orchestrator Canister

- `deposit_btc_for_musd(amount: nat64)` → `DepositResponse` - Initiate BTC deposit
- `mint_musd_on_mezo(amount: nat64)` → `MintResponse` - Mint mUSD on Mezo
- `bridge_musd_to_solana(amount: nat64)` → `text` - Bridge to Solana
- `get_my_position()` → `BridgePosition` - Query user's position
- `calculate_max_mintable(btc: nat64)` → `nat64` - Calculate max mUSD mintable

### Solana Canister

- `generate_solana_address()` → `text` - Generate Ed25519 address
- `get_my_solana_address()` → `text` - Query caller's Solana address
- `get_solana_balance(address: text)` → `SolanaBalance` - Query balance
- `send_sol(to: text, lamports: nat64)` → `TransactionResult` - Send SOL
- `request_airdrop(address: text, lamports: nat64)` → `TransactionResult` - Request devnet airdrop

## Configuration

### Mezo Testnet

- RPC: `https://rpc.test.mezo.org`
- Chain ID: `31611`
- mUSD Token: `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186`
- BorrowManager: `0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12`
  - Alternative candidate: `0x4411cc69aE69cE444c20603FcF75a209ddd25c0d`

### Bitcoin Testnet

- Network: `testnet`
- Key Name: `test_key_1` (threshold ECDSA)
- Confirmations: 6 blocks

### Solana Devnet

- RPC: `https://api.devnet.solana.com`
- SOL RPC Canister: `titvo-eiaaa-aaaar-qaogq-cai`
- Rate Limit: 100 requests per 10 seconds

## Cost Estimates

### Cycles Usage

- Threshold ECDSA signature: ~10B cycles
- Threshold Schnorr signature: ~10B cycles
- HTTPS outcall: ~3M cycles
- Storage: ~4M cycles per GB per year

### Recommended Budget

- BTC Handler: 5T cycles
- Bridge Orchestrator: 5T cycles (due to HTTPS outcalls)
- Solana Canister: 3T cycles

## Testing Guide

### Testing with Real Wallets and Faucets

#### 1. BTC Handler Canister Testing

1. **Deploy canister locally:**
   ```bash
   dfx deploy btc_handler
   ```

2. **Generate BTC testnet address:**
   ```bash
   dfx canister call btc_handler generate_btc_address
   ```

3. **Fund address from Bitcoin testnet faucet**

4. **Wait for 6 confirmations (~60 minutes)**

5. **Test balance query:**
   ```bash
   dfx canister call btc_handler get_btc_balance '("YOUR_BTC_ADDRESS")'
   ```

6. **Test UTXO query:**
   ```bash
   dfx canister call btc_handler get_utxos '("YOUR_BTC_ADDRESS")'
   ```

#### 2. Bridge Orchestrator Testing

1. **Ensure canister IDs are configured:**
   ```bash
   dfx canister call bridge_orchestrator set_canister_ids '("BTC_ID", "SOL_ID")'
   ```

2. **Test deposit flow:**
   ```bash
   dfx canister call bridge_orchestrator deposit_btc_for_musd '(100000 : nat64)'
   ```

3. **Test mUSD minting (requires real BTC deposit):**
   ```bash
   dfx canister call bridge_orchestrator mint_musd_on_mezo '(100000 : nat64)'
   ```

4. **Verify transaction on Mezo explorer**
   - Check transaction hash in response

#### 3. Solana Canister Testing

1. **Generate Solana devnet address:**
   ```bash
   dfx canister call solana_canister generate_solana_address
   ```

2. **Request SOL airdrop:**
   ```bash
   dfx canister call solana_canister request_airdrop '("YOUR_SOL_ADDRESS", 1000000000 : nat64)'
   ```

3. **Test balance query:**
   ```bash
   dfx canister call solana_canister get_solana_balance '("YOUR_SOL_ADDRESS")'
   ```

4. **Verify on Solana explorer**

### Integration Testing

Run the comprehensive test flow:

```bash
./test-flow.sh
```

This script tests the complete BTC → mUSD → Solana flow.

## Troubleshooting

### Port Configuration Issues

**Problem:** Mobile app can't connect to canisters

**Solution:**
1. Ensure dfx is started with `--host 0.0.0.0:4943` (not 127.0.0.1)
2. Verify WSL IP is set correctly in Mobile/.env
3. Check firewall settings allow port 4943
4. Use port 4943 (not 4393) - this is the correct ICP local replica port

### ECDSA Signature Fails

**Problem:** `Failed to get ECDSA public key`

**Solution:**
```bash
# Verify using test_key_1
KEY_NAME = "test_key_1"  # Not production key

# Ensure key is configured in dfx.json
# Check dfx.json has:
# "schnorr": { "enabled": true }
```

### HTTPS Outcall Timeout

**Problem:** Mezo RPC calls timeout

**Solution:**
- Increase max_response_bytes in bridge_canister/src/lib.rs
- Check Mezo RPC endpoint is accessible
- Verify network connectivity

### Out of Cycles

**Problem:** Canister runs out of cycles

**Solution:**
```bash
# Check cycles balance
dfx canister call bridge_orchestrator get_cycles_balance

# Top up canister (mainnet)
dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0
```

### Canister Not Configured

**Problem:** `BTC canister not configured` or `Solana canister not configured`

**Solution:**
```bash
# Get canister IDs
BTC_ID=$(dfx canister id btc_handler)
SOL_ID=$(dfx canister id solana_canister)

# Configure bridge orchestrator
dfx canister call bridge_orchestrator set_canister_ids "(\"$BTC_ID\", \"$SOL_ID\")"
```

### Bitcoin Balance Shows 0

**Problem:** Balance query returns 0 after funding

**Solution:**
- Wait for 6 confirmations (~60 minutes)
- Verify address format (should start with `tb1` for testnet)
- Check faucet transaction on a testnet explorer
- Ensure min_confirmations is set correctly (default: 6)

### Solana RPC Rate Limit

**Problem:** Solana RPC calls fail with rate limit error

**Solution:**
- Add retry logic with exponential backoff (devnet limit: 100 req/10s)
- Use SOL RPC canister for better rate limits
- Implement request queuing

### dfx Color Output Panic

**Problem:** dfx panics on color output

**Solution:**
```bash
export NO_COLOR=1
dfx start --clean --background
```

### Health Check

Check canister health status:

```bash
dfx canister call bridge_orchestrator health_check
```

This returns:
- Status
- Cycles balance
- Canister configuration status
- Total positions
- Timestamp

## Production Deployment Checklist

### Pre-Deployment

- [ ] All canisters compile without errors
- [ ] All tests pass (unit + integration)
- [ ] Security audit completed
- [ ] Code review completed
- [ ] Documentation updated

### Deployment Steps

1. **Deploy to Mainnet:**
   ```bash
   ./deploy-mainnet.sh
   ```

2. **Configure Canister IDs:**
   ```bash
   dfx canister call bridge_orchestrator set_canister_ids \
     --network ic \
     "(\"$BTC_ID\", \"$SOL_ID\")"
   ```

3. **Verify Health:**
   ```bash
   dfx canister call bridge_orchestrator health_check --network ic
   ```

4. **Check Cycles Balance:**
   ```bash
   dfx canister call bridge_orchestrator get_cycles_balance --network ic
   ```

5. **Set Up Monitoring:**
   - Configure cycles alerts
   - Set up transaction tracking
   - Enable error logging

6. **Update Mobile App:**
   - Update canister IDs in production .env
   - Set `EXPO_PUBLIC_ICP_HOST=https://icp-api.io`
   - Test connection to mainnet canisters

### Post-Deployment

- [ ] Monitor cycles consumption
- [ ] Check error logs regularly
- [ ] Verify all canister methods work
- [ ] Test complete bridge flow
- [ ] Set up automated backups (if needed)

## Security Considerations

1. **Principal-based Access Control**: Each user can only access their own positions
2. **Authorization Checks**: `set_canister_ids` requires controller authentication (enabled in production)
3. **Input Validation**: All user inputs are validated before processing
4. **Rate Limiting**: Implement request throttling for HTTPS outcalls (basic implementation in place)
5. **Reentrancy Protection**: State updates before external calls
6. **Error Handling**: Comprehensive error messages for debugging
7. **Cycles Monitoring**: Health check endpoint provides cycles balance
8. **Secure Key Management**: ECDSA keys managed by ICP threshold cryptography

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Create a GitHub issue for bugs or feature requests

## License

MIT

