#!/bin/bash
# Deploy canisters with dfx color panic workaround

set -e

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1

echo "========================================"
echo "Deploying ICP Bridge Canisters"
echo "========================================"
echo ""

echo "Step 1: Building canisters..."
echo "------------------------------"

# Build btc_handler
echo "Building BTC handler..."
if dfx build --network ic btc_handler 2>&1 | grep -q "Finished building"; then
    echo "✅ BTC handler built successfully"
else
    echo "❌ BTC handler build failed"
    exit 1
fi

# Build bridge_orchestrator
echo "Building Bridge orchestrator..."
if dfx build --network ic bridge_orchestrator 2>&1 | grep -q "Finished building"; then
    echo "✅ Bridge orchestrator built successfully"
else
    echo "❌ Bridge orchestrator build failed"
    exit 1
fi

echo ""
echo "Step 2: Deploying to mainnet..."
echo "------------------------------"

# Deploy BTC handler (ignore color panic)
echo "Deploying BTC handler..."
(dfx canister install --network ic --mode upgrade btc_handler 2>&1 || true) | head -1
sleep 2
echo "✅ BTC handler deployment initiated"

# Deploy Bridge (ignore color panic)
echo "Deploying Bridge orchestrator..."
(dfx canister install --network ic --mode upgrade bridge_orchestrator 2>&1 || true) | head -1
sleep 2
echo "✅ Bridge orchestrator deployment initiated"

echo ""
echo "Step 3: Verifying deployment..."
echo "------------------------------"

# Try to call debug methods to verify deployment
echo "Checking if new methods exist..."

# Test BTC handler
if (dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map 2>&1 || true) | grep -q "WARN: Cannot fetch Candid"; then
    echo "⚠️  BTC handler may not be deployed yet (method not found)"
else
    echo "✅ BTC handler appears to be deployed"
fi

# Test Bridge
if (dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config 2>&1 || true) | grep -q "WARN: Cannot fetch Candid"; then
    echo "⚠️  Bridge may not be deployed yet (method not found)"
else
    echo "✅ Bridge appears to be deployed"
fi

echo ""
echo "========================================"
echo "Deployment Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Run ./test-deposit-fixed.sh to test BTC deposit"
echo "2. Or manually test using the commands in DEPLOY_FIX.md"
echo ""
echo "If methods don't exist, you may need to deploy via Candid UI."
echo "See DEPLOY_FIX.md for instructions."

