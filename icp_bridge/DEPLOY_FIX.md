# Deployment Guide for BTC Detection Fix

## What Was Fixed

The Bridge canister was not passing cycles to the BTC handler when calling `get_btc_balance`. The BTC handler needs 10 billion cycles to query the Bitcoin canister, but the Bridge wasn't providing any cycles, causing the balance check to fail.

### Changes Made:

1. **Bridge Canister (`src/bridge_canister/src/lib.rs`)**:
   - Modified `verify_btc_deposit` to pass 15 billion cycles when calling the BTC handler's `get_btc_balance` method
   - Added extensive debug logging to track the deposit flow
   - Added `debug_get_config()` query method to inspect canister configuration

2. **BTC Handler (`src/btc_canister/src/lib.rs`)**:
   - Added `debug_get_address_map()` query method to inspect principal-to-address mappings
   - Already had extensive logging in `get_btc_balance` method

3. **Candid Interfaces**:
   - Updated `bridge.did` to include `debug_get_config` method
   - Updated `btc_handler.did` to include `debug_get_address_map` method

## Deployment Steps

Due to the dfx color panic bug in version 0.29.2, we recommend one of the following approaches:

### Option 1: Deploy via Candid UI (Recommended)

1. **Build the canisters**:
   ```bash
   cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
   dfx build --network ic btc_handler
   dfx build --network ic bridge_orchestrator
   ```

2. **Get the Candid UI URLs**:
   - BTC Handler: `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=ph6zi-syaaa-aaaad-acuha-cai`
   - Bridge: `https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai`

3. **Install via Candid UI**:
   - Navigate to the canister's Candid UI
   - Look for the canister management interface
   - Upload the new WASM file from `.dfx/ic/canisters/<canister_name>/<canister_name>.wasm`

### Option 2: Deploy via Shell Script

We've created a deployment script that suppresses the color panic:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
./deploy-canisters.sh
```

### Option 3: Deploy via dfx (Manual)

If you have a working dfx setup:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1

# Deploy BTC handler
dfx canister install --network ic --mode upgrade btc_handler

# Deploy Bridge canister  
dfx canister install --network ic --mode upgrade bridge_orchestrator
```

## Testing the Fix

Once deployed, test with the provided BTC address:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity

# Make sure you're using the default identity
dfx identity use default
dfx identity whoami

# Call deposit with the known BTC address
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd \
  '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")'

# Check the position
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position
```

### Expected Result

After successful deployment and calling `deposit_btc_for_musd`, you should see:

**deposit_btc_for_musd response**:
```
(
  record {
    status = "confirmed";
    message = "Deposit verified. Total balance: 6085 satoshis (newly recognized: 6085 satoshis)";
    btc_address = "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9";
  },
)
```

**get_my_position response**:
```
(
  record {
    status = "btc_deposited";
    sol_address = "";
    user = principal "oll4l-gdxnn-j4nhv-yjr7d-bvjlx-lsa2n-uhs3j-mso7p-cyhyx-uhtws-rqe";
    musd_minted = 0 : nat64;
    btc_collateral = 6085 : nat64;
    sol_deployed = 0 : nat64;
    btc_address = "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9";
  },
)
```

## Debug Methods

To verify the canister configuration:

```bash
# Check Bridge configuration
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config

# Check BTC handler address mappings
dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map
```

## Troubleshooting

### "BTC deposit verification failed: Insufficient BTC deposit"
- This error should be fixed with the cycles payment in `verify_btc_deposit`
- Check that the BTC handler has enough cycles: `dfx canister status --network ic ph6zi-syaaa-aaaad-acuha-cai`
- Check the replica logs for detailed debug output

### "Method does not exist"
- The canister wasn't deployed with the new code
- Try redeploying using one of the methods above
- Verify the build completed successfully

### dfx Color Panic
- This is a known bug in dfx 0.29.2
- Use the Candid UI instead (Option 1)
- Or suppress stderr: `dfx ... 2>&1 | grep -v "Failed to set stderr output color"`

## Next Steps After Successful Deployment

1. Verify BTC deposit works with the known address
2. Test the MUSD minting flow on Mezo
3. Test the Solana bridging flow
4. Update the mobile app integration

