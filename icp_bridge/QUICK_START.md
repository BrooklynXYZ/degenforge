# DegenForge ICP Bridge - Quick Start

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.10+
- Internet connection

### Step 1: Setup (2 minutes)
```bash
cd icp_bridge
./setup.sh
source venv/bin/activate
```

### Step 2: Deploy Locally (2 minutes)
```bash
./deploy-local.sh
```

**Save the canister IDs displayed!**

### Step 3: Test (1 minute)
```bash
# Generate BTC address
dfx canister call btc_handler generate_btc_address

# Generate Solana address
dfx canister call solana_canister generate_solana_address

# Check stats
dfx canister call bridge_orchestrator get_bridge_stats
```

## ✅ Next Steps

### For Local Testing
```bash
# Run full integration test
./test-flow.sh
```

### For Mainnet Deployment
```bash
# 1. Get cycles from https://faucet.dfinity.org
# 2. Deploy to mainnet
./deploy-mainnet.sh
```

### For Mobile App Integration
```bash
cd ../Mobile
npm install @dfinity/agent @dfinity/candid @dfinity/principal

# Update .env with canister IDs
# See: Mobile/utils/icpAgent.ts
```

## 📚 Documentation

- **Full Documentation**: [README.md](README.md)
- **Deployment Guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **Implementation Details**: [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)

## 🔧 Common Commands

### Local Development
```bash
# Start dfx
dfx start --clean --background

# Deploy all canisters
dfx deploy

# Check canister status
dfx canister status btc_handler

# Call a function
dfx canister call btc_handler generate_btc_address
```

### Mainnet
```bash
# Deploy to mainnet
dfx deploy --network ic --with-cycles 3000000000000

# Check status
dfx canister --network ic status btc_handler

# Call a function
dfx canister --network ic call btc_handler generate_btc_address
```

## 🆘 Quick Troubleshooting

**Issue**: Command not found: dfx
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

**Issue**: Python version too old
```bash
# Install Python 3.10+ from python.org
```

**Issue**: Out of cycles
```bash
# Request from https://faucet.dfinity.org
# Or top up:
dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0
```

**Issue**: Canister rejected message
- Check you're calling the right network (local vs ic)
- Verify parameter types
- Review error message

## 📞 Get Help

1. Check [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) troubleshooting section
2. Review [README.md](README.md) API reference
3. ICP Forum: https://forum.dfinity.org
4. Mezo Docs: https://mezo.org/docs

## 🎯 Demo Checklist (Nov 2 Deadline)

- [ ] Day 1: Setup and local deployment
- [ ] Day 2: Fund BTC testnet address
- [ ] Day 3: Test Solana integration
- [ ] Day 4: Run integration tests
- [ ] Day 5: Deploy to mainnet + mobile integration
- [ ] Day 6: Record demo video + submit

## 🎬 Demo Video Flow

1. Show BTC deposit (30s)
2. Show mUSD minting (30s)
3. Show Solana bridge (30s)
4. Show mobile app (30s)
5. Explain architecture (30s)

**Total**: 2.5 minutes

---

**Ready to start?** Run `./setup.sh` now!

