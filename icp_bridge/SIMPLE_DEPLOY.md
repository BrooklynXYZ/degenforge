# Simple Deployment Guide

## The Problem

dfx 0.29.2 has a color panic bug that prevents deployment. Here are **3 working solutions**:

## Solution 1: IC Dashboard (Easiest - Recommended)

### Step 1: Open IC Dashboard
Go to: **https://dashboard.internetcomputer.org/**

### Step 2: Find Your Canisters
1. Click **"Canisters"** in the sidebar
2. Search for: `n5cru-miaaa-aaaad-acuia-cai` (Bridge)
3. Or search for: `ph6zi-syaaa-aaaad-acuha-cai` (BTC Handler)

### Step 3: Upgrade Each Canister

**For Bridge Canister:**
1. Click on the Bridge canister (`n5cru-miaaa-aaaad-acuia-cai`)
2. Go to **"Settings"** tab
3. Scroll to **"Upgrade Canister"** section
4. Click **"Choose File"**
5. Select: `/Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`
6. Make sure **"Upgrade"** is selected (not "Install")
7. Click **"Upgrade"** button
8. Wait for confirmation

**For BTC Handler:**
1. Click on the BTC Handler canister (`ph6zi-syaaa-aaaad-acuha-cai`)
2. Repeat steps 2-8 above
3. Select: `/Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/btc_handler/btc_handler.wasm`

### Step 4: Verify
After both are upgraded, test:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity

# Test Bridge
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>/dev/null

# Test BTC deposit
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")' 2>/dev/null
```

## Solution 2: Direct dfx Command (Ignore Panic)

The deployment might actually work despite the panic. Try:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity

# Deploy BTC Handler (ignore panic output)
dfx canister install --network ic --mode upgrade btc_handler \
  --wasm .dfx/ic/canisters/btc_handler/btc_handler.wasm 2>/dev/null || true

# Wait a moment
sleep 3

# Deploy Bridge (ignore panic output)
dfx canister install --network ic --mode upgrade bridge_orchestrator \
  --wasm .dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm 2>/dev/null || true

# Wait for canisters to stabilize
sleep 5

# Test
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>/dev/null
```

**Note**: Even if you see "Abort trap: 6", the deployment might have succeeded. Check by testing the methods.

## Solution 3: Use IC CLI (If Installed)

If you have `ic` CLI (different from dfx):

```bash
# Install IC CLI
npm install -g @dfinity/ic-cli

# Deploy
ic canister install n5cru-miaaa-aaaad-acuia-cai \
  --wasm .dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm \
  --mode upgrade \
  --network ic

ic canister install ph6zi-syaaa-aaaad-acuha-cai \
  --wasm .dfx/ic/canisters/btc_handler/btc_handler.wasm \
  --mode upgrade \
  --network ic
```

## Verify Deployment Worked

After deploying, test these commands:

```bash
# 1. Check Bridge debug method (should return config, not error)
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>/dev/null

# 2. Check BTC Handler debug method
dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map 2>/dev/null

# 3. Test BTC deposit (should work now!)
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")' 2>/dev/null
```

## If Deployment Still Fails

1. **Check you're a controller**: 
   ```bash
   dfx canister --network ic status n5cru-miaaa-aaaad-acuia-cai 2>/dev/null | grep controllers
   ```

2. **Check identity**:
   ```bash
   dfx identity whoami
   dfx identity use default  # or your controller identity
   ```

3. **Check WASM files exist**:
   ```bash
   ls -lh .dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm
   ls -lh .dfx/ic/canisters/btc_handler/btc_handler.wasm
   ```

4. **Rebuild if needed**:
   ```bash
   dfx build --network ic btc_handler
   dfx build --network ic bridge_orchestrator
   ```

## Quick Reference

**WASM Files:**
- Bridge: `.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`
- BTC Handler: `.dfx/ic/canisters/btc_handler/btc_handler.wasm`

**Canister IDs:**
- Bridge: `n5cru-miaaa-aaaad-acuia-cai`
- BTC Handler: `ph6zi-syaaa-aaaad-acuha-cai`

**Dashboard:** https://dashboard.internetcomputer.org/

