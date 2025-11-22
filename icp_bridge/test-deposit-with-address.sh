#!/bin/bash
# Test deposit_btc_for_musd with known BTC address

cd "$(dirname "$0")"

export DFX_WARNING=-mainnet_plaintext_identity
export NO_COLOR=1

echo "Testing deposit_btc_for_musd with known BTC address..."
echo "Using address: 1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9"
echo ""

dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")'

echo ""
echo "Checking position..."
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position

