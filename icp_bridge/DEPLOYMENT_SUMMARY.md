# ICP Bridge Mainnet Deployment Summary

## Deployment Date
**November 11, 2025**

## Deployment Status

✅ **SUCCESSFULLY DEPLOYED TO ICP MAINNET**

---

## Canister IDs

### Production Canister IDs (Mainnet)

| Canister | Canister ID | Status |
|----------|-------------|--------|
| **BTC Handler** | `ph6zi-syaaa-aaaad-acuha-cai` | ✅ Running |
| **Bridge Orchestrator** | `n5cru-miaaa-aaaad-acuia-cai` | ✅ Running |
| **Solana Canister** | `pa774-7aaaa-aaaad-acuhq-cai` | ✅ Running |

### Canister URLs (Candid Interface)

- **BTC Handler**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=ph6zi-syaaa-aaaad-acuha-cai
- **Bridge Orchestrator**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=n5cru-miaaa-aaaad-acuia-cai
- **Solana Canister**: https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.icp0.io/?id=pa774-7aaaa-aaaad-acuhq-cai

### Canister URLs (Web Interface)

- **BTC Handler**: https://ph6zi-syaaa-aaaad-acuha-cai.ic0.app
- **Bridge Orchestrator**: https://n5cru-miaaa-aaaad-acuia-cai.ic0.app
- **Solana Canister**: https://pa774-7aaaa-aaaad-acuhq-cai.ic0.app

---

## Deployment Details

### Identity Used

- **Identity**: `mainnet-deploy`
- **Principal**: `w3j2q-cd22y-455zw-yagxp-trblj-rbfyx-nxpkb-62sbv-tybze-tducx-xqe`

### Cycles Allocation

- **Initial Cycles**: 10.000 TC (from voucher)
- **BTC Handler**: ~2.496 TC remaining
- **Bridge Orchestrator**: ~2.494 TC remaining
- **Solana Canister**: ~2.496 TC remaining
- **Total Used**: ~9.000 TC

### Canister Status

All canisters are **Running** with:

- ✅ Code installed successfully
- ✅ Health checks passing
- ✅ Sufficient cycles balance
- ✅ Controllers configured correctly

---

## Configuration

### Network Configuration

- **ICP Network**: Mainnet (`ic`)
- **Bitcoin Network**: Testnet (configured in `dfx.json`)
- **Mezo Network**: Testnet (RPC: `https://rpc.test.mezo.org`)
- **Solana Network**: Devnet (RPC: `https://api.devnet.solana.com`)

### Key Configuration

- **ECDSA Key Name**: `test_key_1` (for Bitcoin/EVM operations)
- **Schnorr Key**: Reserved for future Solana operations

### Contract Addresses (Mezo Testnet)

- **mUSD Token**: `0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186`
- **Borrow Manager**: `0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12`

---

## Frontend Integration

### Environment Variables

The production `.env.production` file has been generated at:
```
Mobile/.env.production
```

**⚠️ IMPORTANT**: This file is in `.gitignore` and should NOT be committed to GitHub.

### Required Environment Variables for Frontend

```env
# ICP Network Configuration
EXPO_PUBLIC_ICP_HOST=https://icp-api.io

# Production Canister IDs
EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID=ph6zi-syaaa-aaaad-acuha-cai
EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID=n5cru-miaaa-aaaad-acuia-cai
EXPO_PUBLIC_SOLANA_CANISTER_ID=pa774-7aaaa-aaaad-acuhq-cai
```

### For Local Development

Create a `.env` file in the `Mobile/` directory with local canister IDs (from `dfx deploy` on local network).

---

## Testing Checklist

### ✅ Completed
- [x] All canisters deployed to mainnet
- [x] Canister IDs configured in bridge orchestrator
- [x] Health checks passing
- [x] Production .env file generated
- [x] Cycles balance verified

### ⏳ Pending (Frontend Team)
- [ ] Test canister connectivity from mobile app
- [ ] Test BTC address generation
- [ ] Test Solana address generation
- [ ] Test deposit flow (BTC → mUSD)
- [ ] Test bridge flow (mUSD → Solana)
- [ ] Test position queries
- [ ] Test health check endpoint

---

## Monitoring

### Check Canister Status
```bash
dfx canister --network ic status btc_handler
dfx canister --network ic status bridge_orchestrator
dfx canister --network ic status solana_canister
```

### Check Cycles Balance
```bash
dfx cycles --network ic balance
```

### View Canister Logs
```bash
dfx canister --network ic call bridge_orchestrator health_check
```

---

## Troubleshooting

### If Canisters Stop Responding

1. Check cycles balance: `dfx cycles --network ic balance`
2. Check canister status: `dfx canister --network ic status <CANISTER_ID>`
3. Top up cycles if needed: `dfx cycles top-up <CANISTER_ID> --amount 3.0 --network ic`

### If Health Check Fails

1. Verify canister IDs are set: Check `set_canister_ids` was called
2. Check canister logs via Candid interface
3. Verify network connectivity

---

## Security Notes

1. **Canister Controllers**: All canisters are controlled by `mainnet-deploy` identity
2. **Authorization**: `set_canister_ids` requires controller authentication
3. **Key Management**: ECDSA keys managed by ICP threshold cryptography
4. **Environment Files**: Never commit `.env.production` or `canister_ids.json` to GitHub

---

## Next Steps

1. **Frontend Integration**: Update mobile app to use production canister IDs
2. **Testing**: Test complete bridge flow with testnet funds
3. **Monitoring**: Set up cycles monitoring and alerts
4. **Documentation**: Update API documentation with production endpoints

---

## Recent Updates (November 17, 2025)

### Critical Fixes

- **BTC Deposit Recognition**: Fixed issue where pre-existing funds on addresses were not recognized
- **Security Review**: Completed comprehensive security audit

### Changes

- Updated `deposit_btc_for_musd` to use actual balance from address
- Enhanced error handling and logging
- Improved transaction verification

For full changelog, see `CHANGELOG.md` in project root.

## Support

For issues or questions:

- Check canister status via Candid interface
- Review `CHANGELOG.md` for recent changes
- Consult `README.md` for development setup

