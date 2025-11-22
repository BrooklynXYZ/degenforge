# 🚀 Deploy Now - Step by Step

## The Issue

dfx 0.29.2 has a bug that causes it to crash with "Abort trap: 6" when deploying. **The IC Dashboard is the most reliable solution.**

## ✅ Recommended: Use IC Dashboard

### Step 1: Open Dashboard
1. Go to: **https://dashboard.internetcomputer.org/**
2. **Sign in** with your Internet Identity or wallet

### Step 2: Find Your Canisters
1. Click **"Canisters"** in the left sidebar
2. In the search box, type: `n5cru-miaaa-aaaad-acuia-cai`
3. Click on the Bridge canister when it appears

### Step 3: Upgrade Bridge Canister
1. Click the **"Settings"** tab (or look for "Upgrade" / "Manage")
2. Scroll down to find **"Upgrade Canister"** or **"Install Code"**
3. Click **"Choose File"** or **"Upload WASM"**
4. Navigate to and select:
   ```
   /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm
   ```
5. Make sure **"Upgrade"** is selected (NOT "Install" - that would wipe data!)
6. Click **"Upgrade"** or **"Deploy"** button
7. Wait for confirmation (usually 10-30 seconds)

### Step 4: Upgrade BTC Handler Canister
1. Go back to Canisters list
2. Search for: `ph6zi-syaaa-aaaad-acuha-cai`
3. Click on the BTC Handler canister
4. Repeat steps 1-7 from above, but select:
   ```
   /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge/.dfx/ic/canisters/btc_handler/btc_handler.wasm
   ```

### Step 5: Verify Deployment
Open a terminal and run:

```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity

# Test 1: Check Bridge debug method (should return config text)
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>/dev/null

# Test 2: Test BTC deposit (should work now!)
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
  deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")' 2>/dev/null
```

**Expected Result:**
- `debug_get_config` should return a string with configuration details
- `deposit_btc_for_musd` should return a success message with your BTC balance (6085 satoshis)

## 🔍 If You Can't Find "Upgrade" in Dashboard

The dashboard interface may vary. Look for:
- **"Settings"** tab → **"Upgrade Canister"**
- **"Manage"** tab → **"Install Code"**
- **"Actions"** menu → **"Upgrade"**
- A button labeled **"Upgrade"** or **"Install Code"**

If you still can't find it:
1. Make sure you're logged in with an identity that is a **controller** of the canister
2. Check canister controllers: `dfx canister --network ic status n5cru-miaaa-aaaad-acuia-cai 2>/dev/null | grep controllers`

## 📋 Quick Checklist

- [ ] Built canisters: `dfx build --network ic btc_handler && dfx build --network ic bridge_orchestrator`
- [ ] WASM files exist in `.dfx/ic/canisters/`
- [ ] Logged into IC Dashboard
- [ ] Upgraded Bridge canister via dashboard
- [ ] Upgraded BTC Handler canister via dashboard
- [ ] Tested `debug_get_config` method
- [ ] Tested `deposit_btc_for_musd` method

## 🆘 Still Having Issues?

1. **Check WASM files exist:**
   ```bash
   ls -lh .dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm
   ls -lh .dfx/ic/canisters/btc_handler/btc_handler.wasm
   ```

2. **Rebuild if needed:**
   ```bash
   cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
   dfx build --network ic btc_handler
   dfx build --network ic bridge_orchestrator
   ```

3. **Check your identity:**
   ```bash
   dfx identity whoami
   dfx identity use default  # Use your controller identity
   ```

4. **Verify you're a controller:**
   ```bash
   dfx canister --network ic status n5cru-miaaa-aaaad-acuia-cai 2>/dev/null
   ```

## 📞 Need More Help?

The deployment via dashboard is the most reliable method. If you're still stuck:
1. Check the dashboard for any error messages
2. Verify your identity has controller permissions
3. Make sure you're selecting "Upgrade" mode, not "Install" mode

Once deployed, the BTC detection fix will work and you'll be able to deposit BTC successfully! 🎉

