# Deploy Canisters via IC Dashboard

Since dfx is experiencing color panic issues, you can deploy directly through the IC Dashboard web interface.

## Step 1: Access IC Dashboard

1. Go to: **https://dashboard.internetcomputer.org/**

2. **Connect your wallet** or **use Internet Identity** to authenticate

3. Navigate to your canisters:
   - Search for: `n5cru-miaaa-aaaad-acuia-cai` (Bridge)
   - Search for: `ph6zi-syaaa-aaaad-acuha-cai` (BTC Handler)

## Step 2: Upload WASM Files

### For Bridge Canister (n5cru-miaaa-aaaad-acuia-cai)

1. In the dashboard, find the Bridge canister
2. Click on **"Settings"** or **"Manage"** tab
3. Look for **"Upgrade Canister"** or **"Install Code"** option
4. Click **"Choose File"** or **"Upload WASM"**
5. Select: `.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`
6. Select **"Upgrade"** mode (not "Install")
7. Click **"Upgrade"** or **"Deploy"**

### For BTC Handler Canister (ph6zi-syaaa-aaaad-acuha-cai)

1. Repeat the same steps for the BTC Handler
2. Upload: `.dfx/ic/canisters/btc_handler/btc_handler.wasm`
3. Select **"Upgrade"** mode
4. Click **"Upgrade"**

## Step 3: Verify Deployment

After deployment, test the new methods:

```bash
# Test Bridge debug method
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config

# Test BTC Handler debug method  
dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map

# Test BTC deposit
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")'
```

## Alternative: Using IC CLI (if available)

If you have `ic` CLI installed (different from dfx):

```bash
# Install IC CLI if needed
# npm install -g @dfinity/ic-cli

# Deploy Bridge
ic canister install n5cru-miaaa-aaaad-acuia-cai \
  --wasm .dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm \
  --mode upgrade \
  --network ic

# Deploy BTC Handler
ic canister install ph6zi-syaaa-aaaad-acuha-cai \
  --wasm .dfx/ic/canisters/btc_handler/btc_handler.wasm \
  --mode upgrade \
  --network ic
```

## Troubleshooting

### "Permission Denied" in Dashboard

- Make sure you're logged in with an identity that is a **controller** of the canister
- Check canister controllers: `dfx canister --network ic status <canister-id>`

### WASM File Not Found

Make sure you've built the canisters first:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
dfx build --network ic btc_handler
dfx build --network ic bridge_orchestrator
```

The WASM files should be in:
- `.dfx/ic/canisters/btc_handler/btc_handler.wasm`
- `.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`

### Still Getting Errors After Deployment

1. Wait 30-60 seconds for the canister to stabilize
2. Check canister logs in the dashboard
3. Verify the WASM was actually uploaded (check canister version/hash)

## Quick Reference

**WASM File Locations:**
- Bridge: `/Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`
- BTC Handler: `/Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/btc_handler/btc_handler.wasm`

**Canister IDs:**
- Bridge: `n5cru-miaaa-aaaad-acuia-cai`
- BTC Handler: `ph6zi-syaaa-aaaad-acuha-cai`

**Dashboard URL:**
- https://dashboard.internetcomputer.org/

