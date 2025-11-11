# Frontend Setup Guide

## Quick Start for Frontend Engineers

This guide will help you set up the mobile app to connect to the deployed ICP canisters.

---

## Prerequisites

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Expo CLI**: `npm install -g expo-cli`
4. **ICP Agent**: The app uses `@dfinity/agent` for canister communication

---

## Environment Setup

### 1. Copy Environment Template

```bash
cd Mobile
cp .env.example .env
```

### 2. Configure Environment Variables

The `.env.example` file contains all the production canister IDs. For local development, you'll need to:

1. **For Production/Testnet Testing**:
   - Use the values in `.env.example` (already configured)
   - These point to the deployed mainnet canisters

2. **For Local Development**:
   - Deploy canisters locally: `cd ../icp_bridge && dfx deploy`
   - Copy canister IDs from `icp_bridge/.dfx/local/canister_ids.json`
   - Update `.env` with local canister IDs
   - Set `EXPO_PUBLIC_ICP_HOST=http://YOUR_LOCAL_IP:4943`

---

## Production Canister IDs

The following canisters are deployed on ICP mainnet:

| Canister | ID | Purpose |
|----------|-----|---------|
| **BTC Handler** | `ph6zi-syaaa-aaaad-acuha-cai` | Bitcoin address generation & balance |
| **Bridge Orchestrator** | `n5cru-miaaa-aaaad-acuia-cai` | Main bridge logic & coordination |
| **Solana Canister** | `pa774-7aaaa-aaaad-acuhq-cai` | Solana address generation & transactions |

### Canister URLs

- **Candid UI**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai
- **Web Interface**: https://n5cru-miaaa-aaaad-acuia-cai.ic0.app

---

## Installation

```bash
cd Mobile
npm install
# or
yarn install
```

---

## Running the App

### Development Mode

```bash
npm start
# or
yarn start
```

### Production Build

```bash
npm run build:production
# or
yarn build:production
```

---

## Connecting to Canisters

The app uses the ICP Agent library to communicate with canisters. Example:

```typescript
import { Actor, HttpAgent } from '@dfinity/agent';
import { idlFactory } from './declarations/bridge_orchestrator';

const agent = new HttpAgent({
  host: process.env.EXPO_PUBLIC_ICP_HOST || 'https://icp-api.io',
});

// For production, you don't need to fetch root key
if (process.env.NODE_ENV !== 'production') {
  await agent.fetchRootKey();
}

const bridgeActor = Actor.createActor(idlFactory, {
  agent,
  canisterId: process.env.EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID!,
});
```

---

## Available Canister Methods

### Bridge Orchestrator (`n5cru-miaaa-aaaad-acuia-cai`)

#### Query Methods (Read-only)
- `health_check()` - Check canister health and status
- `get_my_position()` - Get current user's bridge position
- `get_position(principal)` - Get position for a specific principal
- `get_bridge_stats()` - Get overall bridge statistics
- `get_cycles_balance()` - Get canister cycles balance
- `calculate_max_mintable(btc_amount)` - Calculate max mUSD mintable

#### Update Methods (State-changing)
- `deposit_btc_for_musd(btc_amount)` - Deposit BTC and get mUSD
- `mint_musd_on_mezo(musd_amount)` - Mint mUSD on Mezo network
- `bridge_musd_to_solana(musd_amount)` - Bridge mUSD to Solana
- `deploy_to_yield_protocol(amount, protocol)` - Deploy to yield protocol
- `set_canister_ids(btc_canister, solana_canister)` - Configure canister IDs (controller only)

### BTC Handler (`ph6zi-syaaa-aaaad-acuha-cai`)

- `generate_btc_address()` - Generate a new Bitcoin address
- `get_btc_balance(address)` - Get BTC balance for an address
- `get_my_btc_address()` - Get current user's BTC address
- `get_utxos(address)` - Get UTXOs for an address

### Solana Canister (`pa774-7aaaa-aaaad-acuhq-cai`)

- `generate_solana_address()` - Generate a new Solana address
- `get_solana_balance(address)` - Get SOL balance for an address
- `get_my_solana_address()` - Get current user's Solana address
- `send_sol(address, amount)` - Send SOL to an address
- `request_airdrop(address, amount)` - Request airdrop (devnet only)

---

## Testing Checklist

### Basic Connectivity
- [ ] App can connect to ICP mainnet
- [ ] Can call `health_check()` on bridge orchestrator
- [ ] Can query canister stats

### BTC Operations
- [ ] Can generate BTC address
- [ ] Can query BTC balance
- [ ] Can deposit BTC (testnet)

### Bridge Operations
- [ ] Can deposit BTC for mUSD
- [ ] Can mint mUSD on Mezo
- [ ] Can query position
- [ ] Can calculate max mintable

### Solana Operations
- [ ] Can generate Solana address
- [ ] Can query SOL balance
- [ ] Can bridge mUSD to Solana
- [ ] Can send SOL (devnet)

---

## Troubleshooting

### "Failed to fetch root key"
- **Solution**: For production, you don't need to fetch root key. Only fetch it for local development.

### "Cannot connect to canister"
- **Check**: Verify `EXPO_PUBLIC_ICP_HOST` is set correctly
- **Check**: Verify canister IDs are correct
- **Check**: Ensure you're connected to the internet

### "Unauthorized" errors
- **Check**: Ensure user is authenticated with Internet Identity
- **Check**: Verify principal is correct

### "Insufficient cycles" errors
- **Note**: This is a canister-side issue, not frontend
- **Action**: Contact backend team to top up cycles

---

## Network Configuration

### Current Network Setup

- **ICP**: Mainnet (production canisters)
- **Bitcoin**: Testnet
- **Mezo**: Testnet
- **Solana**: Devnet

### Switching Networks

To switch to local development:

1. Update `.env`:
   ```env
   EXPO_PUBLIC_ICP_HOST=http://YOUR_LOCAL_IP:4943
   ```

2. Deploy canisters locally:
   ```bash
   cd ../icp_bridge
   dfx deploy
   ```

3. Update canister IDs in `.env` with local IDs

---

## Security Notes

1. **Never commit `.env` or `.env.production`** - These contain sensitive canister IDs
2. **Use `.env.example`** as a template for team members
3. **Production canister IDs are public** - They're on mainnet, so it's okay to share
4. **Local canister IDs** - Keep these private if using for development

---

## Resources

- [ICP Agent Documentation](https://agent-js.icp.xyz/)
- [Candid Interface](https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai)
- [Deployment Summary](../icp_bridge/DEPLOYMENT_SUMMARY.md)
- [ICP Documentation](https://internetcomputer.org/docs)

---

## Support

For issues:
1. Check canister status: `dfx canister --network ic status <CANISTER_ID>`
2. Review canister logs via Candid interface
3. Check `DEPLOYMENT_SUMMARY.md` for deployment details
4. Contact backend team for canister-related issues

