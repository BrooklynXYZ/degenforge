# Debug Issues Found

## Issues Identified:

1. **Double borrow in bridge_canister** - Fixed: Changed `*ids.borrow_mut().borrow_mut()` to `RefCell::new(...)`

2. **Potential API type mismatches** - The types `GetBalanceRequest` and `GetUtxosRequest` may not exist in ic-cdk 0.15. Need to verify actual API.

3. **dfx color output issue** - dfx is panicking on color output. Use `NO_COLOR=1` environment variable.

## To Fix Deployment:

1. Kill all dfx processes: `pkill -f dfx`
2. Start dfx replica: `NO_COLOR=1 dfx start --clean --background`
3. Wait for it to start: `sleep 5`
4. Deploy: `NO_COLOR=1 dfx deploy btc_handler`

## Code Issues to Verify:

1. Check if `GetBalanceRequest` and `GetUtxosRequest` exist in ic-cdk 0.15
2. Verify `VirtualMemory` vs `DefaultMemoryImpl` usage is consistent
3. Check bridge_canister line 120 for correct double-borrow pattern

