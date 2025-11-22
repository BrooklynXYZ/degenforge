#!/bin/bash
# Fixed script to call deposit_btc_for_musd
# This version tries multiple workarounds for the dfx color panic

cd "$(dirname "$0")"

# Set environment variables
export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1
export TERM=dumb
export RUST_BACKTRACE=0
unset CLICOLOR
unset CLICOLOR_FORCE
unset COLORTERM

echo "Step 1: Verifying identity..."
dfx identity whoami
echo ""

echo "Step 2: Calling deposit_btc_for_musd..."
echo "Attempting workaround for dfx color panic..."

# Method 1: Try with script command (creates clean terminal)
if command -v script &> /dev/null; then
    echo "Trying with 'script' command..."
    script -q /dev/null bash -c 'export DFX_WARNING=-mainnet_plaintext_identity; export NO_COLOR=1; export TERM=dumb; dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd "(200:nat64)"' 2>&1 | grep -v "Script started" | grep -v "Script done" || true
fi

# Method 2: Try updating dfx first
echo ""
echo "If the above failed, try updating dfx:"
echo "  dfxvm update"
echo ""
echo "Then run this script again, or try manually:"
echo ""
echo "  export DFX_WARNING=-mainnet_plaintext_identity"
echo "  export NO_COLOR=1"
echo "  dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)'"
echo ""

echo "Step 3: Verifying position..."
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position 2>/dev/null || echo "Could not get position"

