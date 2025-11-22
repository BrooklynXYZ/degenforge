#!/bin/bash
# Direct deployment script - bypasses dfx color issues by using raw HTTP calls

set -e

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity

BTC_HANDLER_ID="ph6zi-syaaa-aaaad-acuha-cai"
BRIDGE_ID="n5cru-miaaa-aaaad-acuia-cai"

BTC_WASM=".dfx/ic/canisters/btc_handler/btc_handler.wasm"
BRIDGE_WASM=".dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm"

echo "========================================"
echo "Direct Canister Deployment"
echo "========================================"
echo ""

# Check WASM files
if [ ! -f "$BTC_WASM" ]; then
    echo "❌ BTC WASM not found. Building..."
    dfx build --network ic btc_handler
fi

if [ ! -f "$BRIDGE_WASM" ]; then
    echo "❌ Bridge WASM not found. Building..."
    dfx build --network ic bridge_orchestrator
fi

echo "✅ WASM files ready"
echo ""

# Try using dfx with minimal output
echo "Attempting deployment with dfx (suppressing all output)..."
echo ""

# Deploy BTC Handler - try multiple times with different approaches
echo "1. Deploying BTC Handler..."
for i in 1 2 3; do
    echo "   Attempt $i..."
    if RUST_BACKTRACE=0 NO_COLOR=1 TERM=dumb dfx canister install --network ic --mode upgrade btc_handler --wasm "$BTC_WASM" 2>&1 | grep -q "Installing\|Upgrading"; then
        echo "   ✅ BTC Handler deployment initiated"
        break
    fi
    sleep 2
done

sleep 3

# Deploy Bridge
echo ""
echo "2. Deploying Bridge Orchestrator..."
for i in 1 2 3; do
    echo "   Attempt $i..."
    if RUST_BACKTRACE=0 NO_COLOR=1 TERM=dumb dfx canister install --network ic --mode upgrade bridge_orchestrator --wasm "$BRIDGE_WASM" 2>&1 | grep -q "Installing\|Upgrading"; then
        echo "   ✅ Bridge deployment initiated"
        break
    fi
    sleep 2
done

echo ""
echo "Waiting for canisters to stabilize..."
sleep 10

echo ""
echo "========================================"
echo "Verifying Deployment"
echo "========================================"
echo ""

# Test methods
echo "Testing Bridge debug method..."
if dfx canister call --network ic "$BRIDGE_ID" debug_get_config 2>/dev/null | grep -q "Bridge Configuration"; then
    echo "✅ Bridge deployed successfully!"
else
    echo "⚠️  Bridge debug method not found - deployment may still be processing"
fi

echo ""
echo "Testing BTC Handler debug method..."
if dfx canister call --network ic "$BTC_HANDLER_ID" debug_get_address_map 2>/dev/null | head -1 | grep -q "vec"; then
    echo "✅ BTC Handler deployed successfully!"
else
    echo "⚠️  BTC Handler debug method not found - deployment may still be processing"
fi

echo ""
echo "========================================"
echo "Next Steps"
echo "========================================"
echo ""
echo "If deployment succeeded, test with:"
echo '  dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd \'(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")\''
echo ""
echo "If methods still don't exist, the deployment failed."
echo "You may need to use the IC Dashboard: https://dashboard.internetcomputer.org/"

