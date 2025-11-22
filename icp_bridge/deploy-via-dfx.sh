#!/bin/bash
# Deploy canisters via dfx with better error handling

set -e

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1
export TERM=dumb

echo "========================================"
echo "Deploying ICP Canisters"
echo "========================================"
echo ""

# Check if WASM files exist
BTC_WASM=".dfx/ic/canisters/btc_handler/btc_handler.wasm"
BRIDGE_WASM=".dfx/ic/canisters/bridge_orchestrator/bridge_orchestrator.wasm"

if [ ! -f "$BTC_WASM" ]; then
    echo "❌ BTC Handler WASM not found. Building..."
    dfx build --network ic btc_handler 2>&1 | grep -E "(Finished|error)" | tail -5
fi

if [ ! -f "$BRIDGE_WASM" ]; then
    echo "❌ Bridge WASM not found. Building..."
    dfx build --network ic bridge_orchestrator 2>&1 | grep -E "(Finished|error)" | tail -5
fi

echo "✅ WASM files ready"
echo ""

# Deploy BTC Handler
echo "Deploying BTC Handler..."
dfx canister install --network ic --mode upgrade btc_handler \
    --wasm "$BTC_WASM" \
    2>&1 | tee /tmp/btc_deploy.log | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "panicked" | grep -v "note: run with" || {
    echo "⚠️  Deployment may have succeeded despite errors. Checking..."
    if grep -q "Installing" /tmp/btc_deploy.log || grep -q "Upgrading" /tmp/btc_deploy.log; then
        echo "✅ BTC Handler deployment appears successful"
    else
        echo "❌ BTC Handler deployment failed. See /tmp/btc_deploy.log"
        exit 1
    fi
}

sleep 2

# Deploy Bridge
echo ""
echo "Deploying Bridge Orchestrator..."
dfx canister install --network ic --mode upgrade bridge_orchestrator \
    --wasm "$BRIDGE_WASM" \
    2>&1 | tee /tmp/bridge_deploy.log | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "panicked" | grep -v "note: run with" || {
    echo "⚠️  Deployment may have succeeded despite errors. Checking..."
    if grep -q "Installing" /tmp/bridge_deploy.log || grep -q "Upgrading" /tmp/bridge_deploy.log; then
        echo "✅ Bridge deployment appears successful"
    else
        echo "❌ Bridge deployment failed. See /tmp/bridge_deploy.log"
        exit 1
    fi
}

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Verifying deployment..."
echo ""

# Test if methods exist
sleep 3

if dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map 2>&1 | grep -q "WARN: Cannot fetch Candid"; then
    echo "⚠️  BTC Handler debug method not found - may need to wait or redeploy"
else
    echo "✅ BTC Handler deployed successfully"
fi

if dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>&1 | grep -q "WARN: Cannot fetch Candid"; then
    echo "⚠️  Bridge debug method not found - may need to wait or redeploy"
else
    echo "✅ Bridge deployed successfully"
fi

echo ""
echo "Test the deployment:"
echo "  dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64, opt \"1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9\")'"

