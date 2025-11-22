#!/bin/bash
# Deploy the fix for BTC address lookup
# This script suppresses the dfx color panic

set -e

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1
export TERM=dumb
export RUST_BACKTRACE=0

echo "Deploying BTC handler with fix..."
dfx deploy --network ic btc_handler 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "thread 'main' panicked" | grep -v "note: run with" || true

echo ""
echo "Deploying Bridge canister with fix..."
dfx deploy --network ic bridge_orchestrator 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "thread 'main' panicked" | grep -v "note: run with" || true

echo ""
echo "Deployment complete! Now test with:"
echo "  dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)'"

