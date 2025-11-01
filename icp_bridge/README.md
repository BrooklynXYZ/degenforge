# DegenForge ICP Bridge - Bitcoin & Solana Integration

This directory contains the Internet Computer Protocol (ICP) canisters that power DegenForge's cross-chain bridge, enabling BTC deposits to mint mUSD on Mezo and bridge to Solana devnet for yield generation.

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

### 1. Start Local Replica

```bash
# Start dfx in background
dfx start --clean --background

# Check status
dfx ping local
```

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

# Fund the address from faucet: https://coinfaucet.eu/en/btc-testnet/

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

Request free cycles from the faucet:
- Visit: https://faucet.dfinity.org
- Minimum 3T cycles per canister (9T total recommended)

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
2. Waits for manual funding
3. Checks BTC balance
4. Initiates bridge flow
5. Generates Solana devnet address
6. Bridges mUSD to Solana
7. Verifies final balances

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
- mUSD Token: Update in `bridge_canister/main.py`
- BorrowManager: Update in `bridge_canister/main.py`

### Bitcoin Testnet

- Network: `testnet`
- Key Name: `test_key_1` (threshold ECDSA)
- Confirmations: 6 blocks
- Faucet: https://coinfaucet.eu/en/btc-testnet/

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

## Troubleshooting

### ECDSA Signature Fails

```bash
# Verify using test_key_1
KEY_NAME = "test_key_1"  # Not production key
```

### HTTPS Outcall Timeout

```python
# Increase max_response_bytes
"max_response_bytes": 5000  # Default: 2000
```

### Out of Cycles

```bash
# Top up canister
dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0
```

### Solana RPC Rate Limit

Add retry logic with exponential backoff (devnet limit: 100 req/10s)

### Bitcoin Balance Shows 0

- Wait for confirmations (6 blocks, ~60 minutes)
- Verify address format (should start with `tb1` for testnet)
- Check faucet transaction on explorer

## Security Considerations

1. **Principal-based Access Control**: Each user can only access their own positions
2. **Rate Limiting**: Implement request throttling for HTTPS outcalls
3. **Reentrancy Protection**: State updates before external calls
4. **Error Handling**: Comprehensive error messages for debugging
5. **Cycles Monitoring**: Set up alerts for low cycles balance

## Resources

- [ICP Bitcoin Integration](https://internetcomputer.org/docs/references/bitcoin-how-it-works)
- [ICP Solana Integration](https://internetcomputer.org/docs/building-apps/chain-fusion/solana/overview/)
- [Kybra Documentation](https://demergent-labs.github.io/kybra/)
- [Mezo Testnet Docs](https://mezo.org/docs/developers/getting-started/)
- [Threshold Signatures](https://internetcomputer.org/docs/building-apps/network-features/signatures/t-ecdsa)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review ICP developer forum: https://forum.dfinity.org
3. Consult Mezo documentation: https://mezo.org/docs

## License

MIT

