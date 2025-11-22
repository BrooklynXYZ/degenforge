# Complete BTC → Mezo MUSD → Solana Workflow Guide

This guide explains the complete end-to-end workflow for bridging Bitcoin to MUSD on Mezo and then deploying to Solana using ICP canisters.

## Overview

The bridge operates in three stages:

1. **BTC Deposit**: User deposits BTC, which is verified and tracked as collateral
2. **MUSD Minting on Mezo**: BTC collateral is used to mint MUSD on Mezo (using tBTC)
3. **Solana Deployment**: MUSD is bridged to Solana for DeFi activities

## Architecture

```
Bitcoin Mainnet
    ↓ (user deposits)
ICP BTC Handler Canister
    ↓ (verifies balance)
ICP Bridge Orchestrator Canister
    ↓ (mints MUSD)
Mezo Network (tBTC → MUSD)
    ↓ (bridges to)
Solana Mainnet (via ICP Solana Canister)
```

## Network Configuration

### Mezo Mainnet
- **Chain ID**: 31612
- **Network Name**: Mezo Mainnet
- **Documentation**: [Mezo Mainnet Bridges](https://mezo.org/docs/users/mainnet/bridges#_top)

### Key Contracts
- **BorrowerOperations (BorrowManager)**: `0x44b1bac67dDA612a41a58AAf779143B181dEe031`
- **Bitcoin Depositor**: `0x1D50D75933b7b7C8AD94dbfb748B5756E3889C24`

### ICP Canisters
- **Bridge Orchestrator**: `n5cru-miaaa-aaaad-acuia-cai`
- **BTC Handler**: `ph6zi-syaaa-aaaad-acuha-cai`
- **Solana Handler**: `pa774-7aaaa-aaaad-acuhq-cai`

## Step-by-Step Workflow

### Phase 1: BTC Deposit and Verification

#### Prerequisites
- Bitcoin mainnet address with BTC balance
- dfx identity configured (use `dfx identity whoami` to check)

#### Steps

1. **Verify your BTC address and balance**:
   ```bash
   # Check balance on the BTC handler
   dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai \
     get_btc_balance '("YOUR_BTC_ADDRESS")'
   ```

2. **Register BTC deposit with Bridge**:
   ```bash
   # Option 1: Provide your BTC address explicitly
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     deposit_btc_for_musd '(200:nat64, opt "YOUR_BTC_ADDRESS")'
   
   # Option 2: Generate a new address for your principal first
   dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai generate_btc_address
   # Then call without address (it will use the generated one)
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     deposit_btc_for_musd '(200:nat64, null)'
   ```

   **Expected Response**:
   ```
   (
     record {
       status = "confirmed";
       message = "Deposit verified. Total balance: 6085 satoshis (newly recognized: 6085 satoshis)";
       btc_address = "YOUR_BTC_ADDRESS";
     },
   )
   ```

3. **Verify your position**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position
   ```

   **Expected Response**:
   ```
   (
     record {
       status = "btc_deposited";
       sol_address = "";
       user = principal "YOUR_PRINCIPAL";
       musd_minted = 0 : nat64;
       btc_collateral = 6085 : nat64;
       sol_deployed = 0 : nat64;
       btc_address = "YOUR_BTC_ADDRESS";
     },
   )
   ```

#### Technical Details

- The Bridge canister calls the BTC Handler's `get_btc_balance` method
- The BTC Handler queries the Bitcoin canister on ICP (mainnet)
- **Important**: The Bridge passes 15 billion cycles to the BTC Handler to cover the Bitcoin canister query cost (10 billion cycles)
- Minimum balance required: 1 satoshi
- Balance must have at least 6 confirmations (fallback to 0 confirmations if needed)

### Phase 2: Mint MUSD on Mezo

#### Understanding MUSD Minting

According to [Mezo's MUSD documentation](https://mezo.org/docs/users/musd/mint-musd), MUSD is a stablecoin backed by Bitcoin collateral on the Mezo network. Key points:

- **Collateral**: tBTC (tokenized Bitcoin on Ethereum/Mezo)
- **LTV (Loan-to-Value)**: Maximum 90% in our implementation
- **Fees**: Network gas fees + Mezo protocol fees
- **Architecture**: Based on Liquity's borrowing protocol
- **Risks**: Liquidation risk if collateral value drops

#### Steps

1. **Calculate maximum mintable MUSD**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     calculate_max_mintable '(6085:nat64)'
   ```

2. **Mint MUSD on Mezo**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     mint_musd_on_mezo '(6000:nat64)'
   ```

   **Expected Response**:
   ```
   (
     record {
       musd_amount = 5940 : nat64;  // 99% of BTC amount
       transaction_hash = "0xABC...";
       new_ltv = "97%";
       status = "pending";
     },
   )
   ```

3. **Poll for transaction confirmation**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     finalize_mint_transaction '("0xABC...")'
   ```

   Keep calling until status = "confirmed" (typically 1-5 minutes on Mezo).

   **Final Response**:
   ```
   (
     record {
       musd_amount = 5940 : nat64;
       transaction_hash = "0xABC...";
       new_ltv = "97%";
       status = "confirmed";
     },
   )
   ```

#### Technical Details

**Minting Process**:
1. **LTV Check**: Verifies that minting won't exceed 90% LTV
2. **Conversion**: Calculates MUSD amount (99% of BTC to account for fees)
3. **Transaction Building**:
   - Creates EIP-1559 transaction
   - Calls Mezo's BorrowerOperations contract
   - Uses `openTrove()` method with sorted trove hints
4. **Signing**: Uses ICP's threshold ECDSA to sign the transaction
5. **Submission**:
   - Primary: Chain Fusion (EVM RPC canister)
   - Fallback: HTTP outcall to Mezo RPC
6. **Status Tracking**: Position updated to `pending_mint:TX_HASH:AMOUNT`

**Mezo Integration Details**:
- **Contract**: BorrowerOperations at `0x44b1bac67dDA612a41a58AAf779143B181dEe031`
- **Method**: `openTrove(maxFeePercentage, lusdAmount, upperHint, lowerHint)`
- **Hints**: Using `0x0` for both hints (auto-search)
- **Collateral**: Sent as transaction value (in tBTC wei)

**According to Mezo Documentation**:
- **Fees** ([ref](https://mezo.org/docs/users/musd/fees)): 
  - Borrowing fee: 0.5% - 5% (variable)
  - Redemption fee: 0.5% minimum
  - Gas fees: Mezo network transaction costs
- **Liquidation** ([ref](https://mezo.org/docs/users/musd/liquidation-mechanics)):
  - Occurs when collateral ratio falls below 110%
  - Liquidation penalty: 10%
  - Users can avoid by maintaining higher collateral ratios
- **Architecture** ([ref](https://mezo.org/docs/users/musd/architecture-and-terminology)):
  - Based on Liquity protocol
  - Sorted troves for efficient liquidations
  - Stability pool mechanism

### Phase 3: Bridge to Solana

#### Steps

1. **Bridge MUSD to Solana**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai \
     bridge_musd_to_solana '(5000:nat64)'
   ```

   **Expected Response**:
   ```
   "Bridged 5000 mUSD to Solana address: YOUR_SOL_ADDRESS"
   ```

2. **Verify final position**:
   ```bash
   dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_my_position
   ```

   **Expected Response**:
   ```
   (
     record {
       status = "sol_deployed";
       sol_address = "YOUR_SOL_ADDRESS";
       user = principal "YOUR_PRINCIPAL";
       musd_minted = 5940 : nat64;
       btc_collateral = 6085 : nat64;
       sol_deployed = 5000 : nat64;
       btc_address = "YOUR_BTC_ADDRESS";
     },
   )
   ```

#### Technical Details

**Bridging Process**:
1. **Solana Address Generation**: Gets or generates Solana address for the user
2. **Cross-Canister Call**: Calls Solana canister's `send_sol` method
3. **State Update**: 
   - Decrements `musd_minted` by bridged amount
   - Increments `sol_deployed` by bridged amount
   - Updates `sol_address` and status

**Solana Integration**:
- Solana Handler canister manages keypairs and transactions
- Uses Solana mainnet RPC endpoints
- Tracks deployments per principal

## Troubleshooting

### Common Errors and Solutions

#### "BTC deposit verification failed: Insufficient BTC deposit. Required minimum: 1, Found: 0"

**Cause**: The Bridge couldn't verify your BTC balance.

**Solutions**:
1. Ensure you provided the correct BTC address
2. Verify the address has BTC: `dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai get_btc_balance '("YOUR_ADDRESS")'`
3. Check that transactions have at least 6 confirmations
4. Verify the canister has been deployed with the cycles fix (see DEPLOY_FIX.md)

#### "No position found. Please deposit BTC first."

**Cause**: You haven't registered a BTC deposit yet.

**Solution**: Complete Phase 1 first.

#### "Minting would exceed MAX_LTV"

**Cause**: Your requested MUSD amount would push your LTV above 90%.

**Solution**: 
1. Use `calculate_max_mintable` to find the safe amount
2. Request a lower amount
3. Or deposit more BTC collateral

#### "Failed to check receipt: ..."

**Cause**: The Mezo transaction status couldn't be verified.

**Solutions**:
1. Wait a bit longer and retry `finalize_mint_transaction`
2. Check the transaction on Mezo block explorer
3. Verify Mezo RPC endpoints are accessible

### Debug Commands

```bash
# Check Bridge configuration
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai debug_get_config

# Check BTC address mappings
dfx canister call --network ic ph6zi-syaaa-aaaad-acuha-cai debug_get_address_map

# Check canister cycles
dfx canister status --network ic ph6zi-syaaa-aaaad-acuha-cai
dfx canister status --network ic n5cru-miaaa-aaaad-acuia-cai

# Get bridge statistics
dfx canister call --network ic n5cru-miaaa-aaaad-acuia-cai get_bridge_stats
```

## Security Considerations

### From Mezo Documentation

**Risks** ([ref](https://mezo.org/docs/users/musd/risks)):
1. **Smart Contract Risk**: Bugs in Liquity/Mezo contracts
2. **Liquidation Risk**: Price volatility can trigger liquidations
3. **Tether Risk**: MUSD redemptions depend on BTC collateral
4. **Governance Risk**: Protocol parameters can change

**Best Practices**:
1. Maintain LTV well below 90% (recommend < 75%)
2. Monitor BTC price volatility
3. Have a plan to add collateral if needed
4. Understand redemption mechanics
5. Keep some MUSD liquid for repayment

### ICP-Specific Security

1. **Threshold ECDSA**: All transactions signed using ICP's chain-key cryptography
2. **Cycles Management**: Ensure canisters have sufficient cycles
3. **Controller Access**: Only controllers can configure canister IDs
4. **State Persistence**: Uses stable memory for positions

## Performance Metrics

**Typical Timings**:
- BTC deposit verification: 2-10 seconds
- MUSD mint transaction: 5-30 seconds
- Transaction confirmation: 1-5 minutes
- Solana bridge: 2-10 seconds

**Cost Estimates**:
- BTC verification: ~10 billion cycles (~$0.013 USD)
- Mezo transaction gas: ~0.001 tBTC (~$100 at $100k BTC)
- ICP canister calls: Minimal (< 1 billion cycles)

## Next Steps

After completing the workflow:

1. **Monitor Your Position**:
   - Check LTV regularly
   - Watch BTC price movements
   - Be prepared to add collateral if needed

2. **Use Your MUSD on Solana**:
   - Deploy to yield protocols
   - Provide liquidity
   - Trade on DEXes

3. **Redemption** (Future):
   - Repay MUSD to unlock BTC collateral
   - Close your trove on Mezo
   - Withdraw BTC back to Bitcoin mainnet

## References

- [Mezo Mainnet Bridges](https://mezo.org/docs/users/mainnet/bridges)
- [MUSD Minting Guide](https://mezo.org/docs/users/musd/mint-musd)
- [MUSD Fees](https://mezo.org/docs/users/musd/fees)
- [MUSD Architecture](https://mezo.org/docs/users/musd/architecture-and-terminology)
- [MUSD Liquidations](https://mezo.org/docs/users/musd/liquidation-mechanics)
- [MUSD Risks](https://mezo.org/docs/users/musd/risks)
- [MUSD Concepts](https://mezo.org/docs/users/musd/concepts)

