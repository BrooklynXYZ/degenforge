# How to Call deposit_btc_for_musd (Workaround for dfx Color Panic)

## The Problem

dfx 0.29.2 has a bug that causes a panic when trying to set terminal colors, which prevents canister calls from working in some terminal environments.

## Solution Options

### Option 1: Use Candid UI (Easiest)

1. Open the Candid UI in your browser:
   ```
   https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai
   ```

2. Make sure you're authenticated with the `default` identity:
   - In the Candid UI, click on the identity/principal field
   - Select "Use default identity" or connect with the identity that owns the BTC

3. Find the `deposit_btc_for_musd` method and click on it

4. Enter the argument: `200` (as nat64)

5. Click "Call" or "Query"

6. After it succeeds, call `get_my_position` to verify:
   - Find `get_my_position` method
   - Click "Call" (no arguments needed)
   - You should see `btc_collateral = 6085`

### Option 2: Try Different Terminal

The dfx color panic might be specific to your current terminal. Try:

1. **iTerm2** (if you're using Terminal.app)
2. **VS Code integrated terminal**
3. **A new terminal window** with minimal configuration

Then run:
```bash
cd /Users/apple/Desktop/2025/data2dreams/degenforge/icp_bridge
export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1
dfx identity use default
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)'
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position
```

### Option 3: Use Python IC Agent (Advanced)

If you have `ic-py` installed:

```bash
pip install ic-py
```

Then create a Python script to call the canister directly using the IC agent library.

### Option 4: Wait for dfx Fix

This is a known issue in dfx 0.29.2. You can:
- Check for updates: `dfxvm update`
- Report the issue: https://github.com/dfinity/sdk/issues

## Expected Results

After successfully calling `deposit_btc_for_musd`, you should see:

```
(
  record {
    btc_address = "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9";
    message = "Deposit verified. Total balance: 6085 satoshis (newly recognized: 6085 satoshis)";
    status = "confirmed";
  },
)
```

After calling `get_my_position`, you should see:

```
(
  record {
    user = principal "oll4l-gdxnn-j4nhv-yjr7d-bvjlx-lsa2n-uhs3j-mso7p-cyhyx-uhtws-rqe";
    btc_collateral = 6085 : nat64;
    btc_address = "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9";
    musd_minted = 0 : nat64;
    sol_deployed = 0 : nat64;
    status = "btc_deposited";
    sol_address = "";
  },
)
```

## Quick Reference

- **Bridge Canister ID**: `n5cru-miaaa-aaaad-acuia-cai`
- **Candid UI**: https://a4gq6-oaaaa-aaaad-acuia-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai
- **Identity**: `default` (principal: `oll4l-gdxnn-j4nhv-yjr7d-bvjlx-lsa2n-uhs3j-mso7p-cyhyx-uhtws-rqe`)
- **BTC Address**: `1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9`
- **Expected Balance**: 6085 satoshis

