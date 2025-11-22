# ICP Bridge: Bitcoin → Mezo MUSD → Solana

A decentralized bridge connecting Bitcoin, Mezo (for MUSD minting), and Solana using Internet Computer Protocol (ICP) canisters.

## Overview

This project enables users to:
1. **Deposit BTC** on Bitcoin mainnet
2. **Mint MUSD** on Mezo using BTC as collateral
3. **Deploy to Solana** for DeFi activities

All operations are secured using ICP's threshold ECDSA signatures and chain-key cryptography.

## Architecture

```
Bitcoin Mainnet
    ↓ (verification)
ICP BTC Handler Canister (ph6zi-syaaa-aaaad-acuha-cai)
    ↓ (balance checks)
ICP Bridge Orchestrator (n5cru-miaaa-aaaad-acuia-cai)
    ↓ (minting transactions)
Mezo Network (Chain ID: 31612)
    ↓ (bridging)
ICP Solana Handler (pa774-7aaaa-aaaad-acuhq-cai)
    ↓ (deployment)
Solana Mainnet
```

## Key Features

- **Bitcoin Integration**: Direct integration with Bitcoin mainnet via ICP's Bitcoin canister
- **Mezo MUSD Minting**: Automated MUSD minting using Liquity-based protocol on Mezo
- **Solana Deployment**: Seamless bridging to Solana for DeFi activities
- **Threshold ECDSA**: Secure transaction signing using ICP's chain-key cryptography
- **LTV Management**: Automatic loan-to-value ratio checks (max 90%)
- **State Persistence**: Reliable position tracking using stable memory

## Quick Start

### Prerequisites

- dfx CLI installed and configured
- Bitcoin mainnet address with BTC balance
- Access to controller identity for initial setup

### 1. Configure the Bridge (First Time Only)

```bash
cd icp_bridge
./configure-bridge-canister.sh
```

Or see [CONFIGURE_BRIDGE.md](./CONFIGURE_BRIDGE.md) for manual steps.

### 2. Deposit BTC

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  deposit_btc_for_musd '(200:nat64, opt "YOUR_BTC_ADDRESS")'
```

### 3. Mint MUSD

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  mint_musd_on_mezo '(6000:nat64)'
```

### 4. Bridge to Solana

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  bridge_musd_to_solana '(5000:nat64)'
```

## Documentation

- **[WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md)**: Complete end-to-end workflow guide with detailed explanations
- **[CONFIGURE_BRIDGE.md](./CONFIGURE_BRIDGE.md)**: Initial configuration and troubleshooting
- **[DEPLOY_FIX.md](./DEPLOY_FIX.md)**: Deployment guide for latest fixes
- **[fix.plan.md](./fix.plan.md)**: Technical implementation plan for BTC detection fix

## Recent Fixes

### BTC Balance Detection Fix (Latest)

**Problem**: Bridge canister was unable to verify BTC balances, always returning 0.

**Root Cause**: The Bridge wasn't passing cycles to the BTC Handler when calling `get_btc_balance`. The BTC Handler needs 10 billion cycles to query the Bitcoin canister, but the Bridge wasn't providing any.

**Solution**: Modified `verify_btc_deposit` in the Bridge canister to pass 15 billion cycles when calling the BTC Handler's `get_btc_balance` method.

**Changes**:
- Updated `src/bridge_canister/src/lib.rs`: Added cycles payment in `verify_btc_deposit`
- Added debug logging throughout the deposit flow
- Added `debug_get_config()` query method to Bridge canister
- Added `debug_get_address_map()` query method to BTC Handler

See [DEPLOY_FIX.md](./DEPLOY_FIX.md) for deployment instructions.

## Project Structure

```
icp_bridge/
├── src/
│   ├── bridge_canister/      # Main orchestrator
│   │   ├── src/lib.rs        # Bridge logic
│   │   └── bridge.did        # Candid interface
│   ├── btc_canister/         # Bitcoin handler
│   │   ├── src/lib.rs        # BTC integration
│   │   └── btc_handler.did   # Candid interface
│   └── solana_canister/      # Solana handler
│       ├── src/lib.rs        # Solana integration
│       └── solana_handler.did # Candid interface
├── CONFIGURE_BRIDGE.md       # Configuration guide
├── WORKFLOW_GUIDE.md         # Complete workflow guide
├── DEPLOY_FIX.md            # Deployment instructions
└── README.md                # This file
```

## Canister IDs (IC Mainnet)

- **Bridge Orchestrator**: `n5cru-miaaa-aaaad-acuia-cai`
- **BTC Handler**: `ph6zi-syaaa-aaaad-acuha-cai`
- **Solana Handler**: `pa774-7aaaa-aaaad-acuhq-cai`

## Mezo Network Details

- **Chain ID**: 31612 (Mezo Mainnet)
- **BorrowerOperations**: `0x44b1bac67dDA612a41a58AAf779143B181dEe031`
- **Bitcoin Depositor**: `0x1D50D75933b7b7C8AD94dbfb748B5756E3889C24`

## Key Concepts

### Loan-to-Value (LTV)
- Maximum allowed: 90%
- Recommended: < 75% to avoid liquidation risk
- Formula: `(MUSD Minted / BTC Collateral) * 100`

### MUSD Minting
- 1% fee applied (receive 99% of requested amount)
- Based on Liquity protocol architecture
- Requires sufficient collateral to maintain LTV

### Liquidation Risk
According to [Mezo documentation](https://mezo.org/docs/users/musd/liquidation-mechanics):
- Occurs when collateral ratio falls below 110%
- Liquidation penalty: 10%
- Maintain higher collateral ratios to avoid liquidation

## Security Considerations

1. **Threshold ECDSA**: All transactions signed using ICP's decentralized key management
2. **Controller Access**: Only controllers can modify canister configuration
3. **LTV Limits**: Automatic enforcement of 90% maximum LTV
4. **Stable Memory**: Persistent state storage survives canister upgrades
5. **Cycle Management**: Automatic cycle passing for inter-canister calls

## Common Operations

### Check Your Position

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position
```

### Calculate Max Mintable MUSD

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai calculate_max_mintable '(6085:nat64)'
```

### Check BTC Balance

```bash
dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai get_btc_balance '("YOUR_BTC_ADDRESS")'
```

### Debug Configuration

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config
```

## Troubleshooting

### dfx Color Panic

If you encounter `Failed to set stderr output color.: ColorOutOfRange`, this is a known bug in dfx 0.29.2. Solutions:

1. Use the Candid UI directly
2. Redirect stderr: `command 2>/dev/null`
3. Use the provided deployment scripts

### BTC Balance Shows 0

1. Verify the address has BTC: `dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai get_btc_balance '("ADDRESS")'`
2. Check confirmations (need 6+ for mainnet)
3. Ensure canisters are deployed with latest code (see DEPLOY_FIX.md)
4. Provide address explicitly in `deposit_btc_for_musd`

### Transaction Stuck as Pending

Wait 1-5 minutes for Mezo confirmations, then call:

```bash
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai finalize_mint_transaction '("TX_HASH")'
```

## Development

### Build

```bash
dfx build --network ic
```

### Deploy

```bash
# See DEPLOY_FIX.md for complete instructions
./deploy-canisters.sh
```

### Test

```bash
./test-deposit-fixed.sh
```

## References

- [Mezo Documentation](https://mezo.org/docs)
- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [Bitcoin Integration on ICP](https://internetcomputer.org/bitcoin-integration)
- [Threshold ECDSA](https://internetcomputer.org/docs/current/developer-docs/integrations/t-ecdsa/)

## License

[Specify your license here]

## Support

For issues and questions:
1. Check [WORKFLOW_GUIDE.md](./WORKFLOW_GUIDE.md) for detailed workflows
2. Review [CONFIGURE_BRIDGE.md](./CONFIGURE_BRIDGE.md) for configuration issues
3. See [DEPLOY_FIX.md](./DEPLOY_FIX.md) for deployment problems
4. Contact the development team

## Contributing

[Specify contribution guidelines here]
