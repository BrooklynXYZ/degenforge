#!/bin/bash
# Workaround script for dfx color issue

cd "$(dirname "$0")"

# Disable all color-related environment variables
export NO_COLOR=1
export TERM=dumb
unset CLICOLOR
unset CLICOLOR_FORCE
unset COLORTERM

# Call the canister
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai deposit_btc_for_musd '(200:nat64)' 2>&1

