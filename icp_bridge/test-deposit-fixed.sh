#!/bin/bash
# Test deposit after fix

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1

echo "=========================================="
echo "Testing deposit_btc_for_musd with cycles fix"
echo "=========================================="
echo ""
echo "Calling deposit_btc_for_musd with address: 1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9"
echo ""

# Run in a script to capture output before color panic
script -q /dev/null dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")' 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "panicked" | grep -v "note: run with" | grep -v "Script " | head -20

echo ""
echo "=========================================="
echo "Checking position..."
echo "=========================================="
echo ""

script -q /dev/null dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position 2>&1 | grep -v "Failed to set stderr output color" | grep -v "ColorOutOfRange" | grep -v "panicked" | grep -v "note: run with" | grep -v "Script " | head -20

echo ""
echo "Done!"
