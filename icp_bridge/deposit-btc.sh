#!/bin/bash
# Script to call deposit_btc_for_musd on Bridge canister
# This works around dfx color and security warnings

# Don't exit on error - we want to see if commands succeed despite panic
set +e

cd "$(dirname "$0")"

# Set environment variables to avoid dfx issues
export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1
export TERM=dumb
unset CLICOLOR
unset CLICOLOR_FORCE
unset COLORTERM

echo "Step 1: Verifying identity..."
dfx identity whoami
echo ""

echo "Step 2: Calling deposit_btc_for_musd..."
echo "(Note: dfx may show a color panic, but the command may still succeed)"
# Redirect stderr to suppress panic, but capture stdout
OUTPUT=$(dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)' 2>/dev/null)
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ] || [ -n "$OUTPUT" ]; then
    echo "SUCCESS:"
    echo "$OUTPUT"
else
    echo "Command failed. Trying alternative method..."
    # Try with stderr redirected but still showing stdout
    dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)' 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "thread 'main' panicked" | grep -v "note: run with"
fi
echo ""

echo "Step 3: Verifying position with get_my_position..."
POSITION=$(dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position 2>/dev/null)
if [ -n "$POSITION" ]; then
    echo "$POSITION"
else
    dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "thread 'main' panicked" | grep -v "note: run with"
fi
echo ""

echo "Done!"

