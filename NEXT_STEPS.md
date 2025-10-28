# DegenForge - Next Steps for ICP Integration

## 🎉 Implementation Complete!

Your ICP canister integration is fully implemented and ready for deployment. Here's what you need to do next to have it running for your November 2nd hackathon demo.

## 📁 What Has Been Created

### New Directory: `icp_bridge/`

Your project now has a complete ICP canister implementation:

```
degenforge/
├── icp_bridge/              # ← NEW: ICP canisters
│   ├── src/
│   │   ├── btc_canister/    # Bitcoin testnet integration
│   │   ├── bridge_canister/ # Bridge orchestrator
│   │   └── solana_canister/ # Solana devnet integration
│   ├── dfx.json             # Canister configuration
│   ├── setup.sh             # Setup script
│   ├── deploy-local.sh      # Local deployment
│   ├── deploy-mainnet.sh    # Mainnet deployment
│   ├── test-flow.sh         # Integration tests
│   └── *.md                 # Documentation
├── Mobile/                  # Your existing mobile app
│   └── utils/
│       └── icpAgent.ts      # ← NEW: ICP integration utilities
└── backend/                 # Your existing Express backend
```

## 🚀 Quick Start (Do This Now!)

### 1. Navigate to ICP Bridge Directory

```bash
cd /Users/apple/Desktop/PG/data2dreams/degenforge/icp_bridge
```

### 2. Run Setup Script

```bash
./setup.sh
```

This will:
- Check Python version (needs 3.10+)
- Install dfx (ICP SDK)
- Create Python virtual environment
- Install Kybra and dependencies
- Create `.env` file

**Expected time**: 3-5 minutes

### 3. Activate Virtual Environment

```bash
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

### 4. Deploy Locally

```bash
./deploy-local.sh
```

This will:
- Start local dfx replica
- Deploy all three canisters
- Configure canister IDs
- Display canister IDs

**Expected time**: 5-10 minutes

**⚠️ IMPORTANT**: Save the canister IDs displayed at the end!

### 5. Test Basic Functions

```bash
# Generate BTC testnet address
dfx canister call btc_handler generate_btc_address

# You should see output like: ("tb1q7x8...")

# Generate Solana devnet address
dfx canister call solana_canister generate_solana_address

# You should see output like: ("7xKX...")

# Check bridge stats
dfx canister call bridge_orchestrator get_bridge_stats
```

**If all commands work, you're ready to proceed! 🎊**

## 📅 Day-by-Day Timeline (6 Days to Nov 2)

### Day 1 (Today): Setup & Local Testing

**Morning** (You just did this! ✅)
- [x] Run setup script
- [x] Deploy locally
- [x] Test basic functions

**Afternoon** (Do this next)
- [ ] Fund BTC testnet address
- [ ] Request Solana devnet airdrop
- [ ] Run integration test

**Commands**:
```bash
# Get your BTC address
BTC_ADDR=$(dfx canister call btc_handler generate_btc_address | tr -d '(")')
echo "Send testnet BTC to: $BTC_ADDR"

# Fund from: https://coinfaucet.eu/en/btc-testnet/
# Wait 60 mins for 6 confirmations

# Get your Solana address
SOL_ADDR=$(dfx canister call solana_canister generate_solana_address | tr -d '(")')

# Request airdrop
dfx canister call solana_canister request_airdrop "($SOL_ADDR, 1000000000: nat64)"
```

**Blockers**: 
- BTC confirmations take 60 minutes
- Use this time to review documentation

**Evening**
- [ ] Check BTC balance (after confirmations)
- [ ] Check Solana balance
- [ ] Run `./test-flow.sh`

### Day 2: Bridge Flow Testing

**Tasks**:
- [ ] Test BTC → mUSD flow
- [ ] Test mUSD → Solana bridge
- [ ] Verify position state
- [ ] Test all canister functions

**Commands**:
```bash
# Run full integration test
./test-flow.sh
```

**Expected outcome**:
- Complete bridge flow works end-to-end
- Position shows correct amounts
- All transactions successful

**If tests pass**: You're ready for mainnet! 🚀

### Day 3: Mainnet Deployment

**Morning: Get Cycles**
1. Visit: https://faucet.dfinity.org
2. Request 20T cycles (free for development)
3. Verify balance:
   ```bash
   dfx ledger --network ic balance
   ```

**Afternoon: Update Configuration**

Edit `src/bridge_canister/main.py`:
```python
# Update these lines with actual Mezo addresses:
MUSD_TOKEN_ADDRESS = "0x..."  # From your backend config
BORROW_MANAGER_ADDRESS = "0x..."  # From your backend config
```

Get addresses from:
```bash
cat ../backend/src/config/mezo.config.ts
```

**Evening: Deploy to Mainnet**
```bash
./deploy-mainnet.sh
```

**⚠️ CRITICAL**: Save the production canister IDs!

### Day 4: Mobile App Integration

**Morning: Install Dependencies**
```bash
cd ../Mobile
npm install @dfinity/agent @dfinity/candid @dfinity/principal
```

**Afternoon: Configure Canister IDs**

Create `Mobile/.env` (or update existing):
```
BTC_HANDLER_CANISTER_ID=<your_mainnet_btc_id>
BRIDGE_ORCHESTRATOR_CANISTER_ID=<your_mainnet_bridge_id>
SOLANA_CANISTER_ID=<your_mainnet_solana_id>
```

**Evening: Generate Candid Declarations**
```bash
cd ../icp_bridge

# Generate TypeScript declarations
dfx generate btc_handler
dfx generate bridge_orchestrator
dfx generate solana_canister

# Copy to Mobile app
cp -r .dfx/ic/canisters/*/declarations ../Mobile/declarations/
```

**Update Mobile app**:

Edit `Mobile/utils/icpAgent.ts` and uncomment:
```typescript
import { idlFactory as btcIdlFactory } from '../declarations/btc_handler';
import { idlFactory as bridgeIdlFactory } from '../declarations/bridge_orchestrator';
import { idlFactory as solanaIdlFactory } from '../declarations/solana_canister';
```

### Day 5: End-to-End Testing

**Tasks**:
- [ ] Test mainnet canisters with real testnet funds
- [ ] Test mobile app integration
- [ ] Verify all features work
- [ ] Monitor cycles usage

**Test Script**:
```bash
# Test mainnet deployment
dfx canister --network ic call btc_handler generate_btc_address
dfx canister --network ic call solana_canister generate_solana_address

# Fund addresses and test bridge flow
# (Similar to Day 1 but with --network ic)
```

**Mobile App Test**:
- Open Mobile app
- Connect wallet (Mezo Passport)
- Test deposit flow
- Test minting flow
- Test bridging flow

### Day 6: Demo Preparation & Submission

**Morning: Final Testing**
- [ ] Complete test run with fresh addresses
- [ ] Verify all features
- [ ] Check cycles balance
- [ ] Fix any bugs

**Afternoon: Record Demo Video** (2-3 minutes)

**Demo Script**:
1. **Intro** (15s)
   - "DegenForge: Bitcoin-backed yield on Solana"
   - "Powered by ICP canisters and Mezo"

2. **BTC Deposit** (30s)
   - Generate BTC address: `dfx canister --network ic call btc_handler generate_btc_address`
   - Show address on blockchain explorer
   - Show balance: `dfx canister --network ic call btc_handler get_btc_balance '("...")'`

3. **mUSD Minting** (30s)
   - Call mint: `dfx canister --network ic call bridge_orchestrator mint_musd_on_mezo '(100000: nat64)'`
   - Show transaction result
   - Show position: `dfx canister --network ic call bridge_orchestrator get_my_position`

4. **Solana Bridge** (30s)
   - Bridge to Solana: `dfx canister --network ic call bridge_orchestrator bridge_musd_to_solana '(99000: nat64)'`
   - Show Solana balance: `dfx canister --network ic call solana_canister get_solana_balance '("...")'`

5. **Mobile App** (30s)
   - Show mobile UI
   - Display position dashboard
   - Show real-time updates

6. **Architecture** (30s)
   - Explain ICP canisters
   - Threshold signatures (ECDSA, Schnorr)
   - Native Bitcoin integration
   - HTTPS outcalls to Mezo

**Evening: Submit**
- [ ] Finalize demo video
- [ ] Prepare submission
- [ ] Submit to hackathon
- [ ] 🎉 Celebrate!

## 📚 Documentation Reference

All documentation is in `icp_bridge/`:

1. **QUICK_START.md** - Fastest way to get started (read first!)
2. **README.md** - Complete API reference and usage guide
3. **DEPLOYMENT_GUIDE.md** - Step-by-step deployment instructions
4. **IMPLEMENTATION_SUMMARY.md** - Technical details and architecture

## 🔑 Key Files to Know

### Configuration
- `icp_bridge/dfx.json` - Canister configuration
- `icp_bridge/env.example` - Environment template
- `Mobile/.env` - Mobile app configuration (create this)

### Deployment
- `icp_bridge/setup.sh` - Initial setup
- `icp_bridge/deploy-local.sh` - Local deployment
- `icp_bridge/deploy-mainnet.sh` - Production deployment
- `icp_bridge/test-flow.sh` - Integration testing

### Code
- `icp_bridge/src/btc_canister/main.py` - Bitcoin handler
- `icp_bridge/src/bridge_canister/main.py` - Bridge orchestrator
- `icp_bridge/src/solana_canister/main.py` - Solana handler
- `Mobile/utils/icpAgent.ts` - Mobile integration

## 🆘 Common Issues & Solutions

### "Command not found: dfx"
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
source ~/.bashrc  # or ~/.zshrc
```

### "Python version too old"
- Install Python 3.10+ from python.org
- On Mac: `brew install python@3.10`

### "Out of cycles"
- Visit: https://faucet.dfinity.org
- Request 20T cycles
- Or top up: `dfx ledger top-up <CANISTER_ID> --network ic --amount 3.0`

### "Bitcoin balance is 0"
- Wait for 6 confirmations (~60 minutes)
- Check address on explorer
- Verify correct network (testnet)

### "Canister rejected message"
- Verify correct network (`local` vs `ic`)
- Check parameter types (use `nat64` not `number`)
- Review error message details

## 🎯 Success Checklist

Before November 2, ensure:

**Technical**:
- [ ] All canisters deployed to mainnet
- [ ] BTC testnet integration working
- [ ] Solana devnet integration working
- [ ] Bridge flow completes successfully
- [ ] Mobile app connects to canisters
- [ ] Sufficient cycles (>3T per canister)

**Demo**:
- [ ] Demo video recorded (<3 minutes)
- [ ] Shows real testnet transactions
- [ ] Mobile app UI demonstrated
- [ ] Architecture explained
- [ ] Video uploaded and ready

**Documentation**:
- [ ] README.md complete
- [ ] Canister IDs documented
- [ ] API reference available
- [ ] Troubleshooting guide ready

## 📞 Need Help?

1. **Documentation**: Check `icp_bridge/README.md` and `DEPLOYMENT_GUIDE.md`
2. **ICP Forum**: https://forum.dfinity.org
3. **Mezo Docs**: https://mezo.org/docs
4. **Cycles Faucet**: https://faucet.dfinity.org

## 🎬 Your Next Command

Start right now:

```bash
cd /Users/apple/Desktop/PG/data2dreams/degenforge/icp_bridge
./setup.sh
```

**Good luck with your hackathon demo! You've got this! 🚀**

---

**Status**: ✅ Implementation Complete
**Your Location**: `/Users/apple/Desktop/PG/data2dreams/degenforge/`
**Next**: `cd icp_bridge && ./setup.sh`
**Deadline**: November 2, 2025

