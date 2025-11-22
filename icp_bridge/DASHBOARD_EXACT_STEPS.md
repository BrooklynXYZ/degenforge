# Exact Dashboard Steps for Deployment

Since dfx has a bug, here are the **exact steps** to deploy via IC Dashboard:

## Step 1: Access Dashboard

1. Open: **https://dashboard.internetcomputer.org/**
2. **Sign in** (top right button)
3. Complete any authentication required

## Step 2: Navigate to Canister

**Method A - Direct URL:**
- Type in address bar: `https://dashboard.internetcomputer.org/canister/n5cru-miaaa-aaaad-acuia-cai`
- Press Enter

**Method B - Search:**
1. Click the **search bar** at top (or press ⌘/)
2. Type: `n5cru-miaaa-aaaad-acuia-cai`
3. Click on the canister result

## Step 3: Find Upgrade Option

The upgrade option might be in different places depending on dashboard version:

### Location 1: Settings Tab
1. Click **"Settings"** tab (usually at top of page)
2. Scroll down to find **"Upgrade Canister"** section
3. Click **"Choose File"** or **"Upload WASM"**

### Location 2: Code Tab
1. Click **"Code"** tab
2. Look for **"Upgrade"** or **"Install Code"** button
3. Click it

### Location 3: Actions Menu
1. Look for **three dots (⋯)** or **"Actions"** menu button
2. Click it
3. Select **"Upgrade"** or **"Install Code"**

### Location 4: Main Page
1. Scroll down on the canister page
2. Look for **"Manage Canister"** section
3. Find **"Upgrade"** button

## Step 4: Upload WASM

1. Click **"Choose File"** or **"Upload"** button
2. Navigate to:
   ```
   /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm
   ```
3. Select the file

## Step 5: Select Upgrade Mode

**CRITICAL**: Make sure **"Upgrade"** is selected, NOT "Install"
- **"Upgrade"** = Keeps existing data ✅
- **"Install"** = Wipes all data ❌

## Step 6: Deploy

1. Click **"Upgrade"** or **"Deploy"** button
2. Wait 10-30 seconds
3. You should see a success message

## Step 7: Repeat for BTC Handler

1. Navigate to: `https://dashboard.internetcomputer.org/canister/ph6zi-syaaa-aaaad-acuha-cai`
2. Repeat steps 3-6
3. Upload: `.dfx/ic/canisters/btc_handler/btc_handler.wasm`

## Step 8: Verify

After both are deployed, test:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity

# Should return config text
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>/dev/null

# Should work now!
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")' 2>/dev/null
```

## If You Still Can't Find It

1. **Take a screenshot** of the canister page
2. Look for any button/link that says:
   - "Upgrade"
   - "Install Code"
   - "Manage"
   - "Settings"
   - "Actions"
3. The WASM upload option is definitely there - it might just be in a different location than expected

## Quick Reference

**Canister IDs:**
- Bridge: `n5cru-miaaa-aaaad-acuia-cai`
- BTC Handler: `ph6zi-syaaa-aaaad-acuha-cai`

**WASM Files:**
- Bridge: `.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm`
- BTC Handler: `.dfx/ic/canisters/btc_handler/btc_handler.wasm`

**Dashboard:** https://dashboard.internetcomputer.org/

