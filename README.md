# Ghala - Non-Custodial BTC-Backed DeFi Yield Platform

> **Unlock Your Bitcoin's Earning Potential Without Selling**

Ghala is the first fully non-custodial platform that enables BTC holders to access Solana DeFi yields without wrapping, selling, or giving up control of their Bitcoin. By leveraging Mezo's native BTC-backed stablecoin (mUSD), ICP's chain fusion technology, and Solana's high-performance DeFi ecosystem, Ghala creates a trustless bridge between Bitcoin's security and DeFi's yield opportunities.

---

## 🎯 The Problem

**Millions of BTC holders cannot access DeFi yields without selling or wrapping their BTC.**

Current solutions require users to:

- ❌ Trust centralized bridges with their assets
- ❌ Wrap BTC on other chains (losing native Bitcoin custody)
- ❌ Navigate complex multi-chain workflows manually
- ❌ Accept high risks and fees

**The market needs a solution that lets users keep their BTC while earning yields from DeFi protocols.**

---

## 💡 Our Solution

Ghala enables users to:

1. **Deposit BTC as collateral** on Mezo Network (native Bitcoin L2)
2. **Mint mUSD stablecoin** with a fixed, low interest rate (~1% APR)
3. **Automatically bridge mUSD to Solana** via ICP canisters
4. **Deploy into top yield platforms** (Kamino, Meteora, Marinade)
5. **Receive yields directly** back to their wallet - all automated and trustless

### 🔑 Key Differentiators

| Feature                 | Ghala                                                | Traditional Solutions             |
| ----------------------- | ---------------------------------------------------- | --------------------------------- |
| **Custody**       | Non-custodial (BTC never leaves your control)        | Centralized or wrapped BTC        |
| **Bridge**        | Trustless ICP canisters (Rust-based smart contracts) | Centralized bridges or validators |
| **Automation**    | Fully automated yield deployment                     | Manual multi-step processes       |
| **Native BTC**    | Direct BTC collateral via Mezo                       | Wrapped tokens (wBTC, tBTC)       |
| **Chain Focus**   | Bitcoin → Solana DeFi                               | Primarily ETH ecosystem           |
| **Interest Rate** | Fixed low rate (1% APR on mUSD mint)                 | Variable, often higher            |

---

## 🏗️ Architecture Overview

Ghala consists of four major components that work together to deliver a seamless Bitcoin-to-Solana DeFi experience:

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER FLOW                                 │
└─────────────────────────────────────────────────────────────────────┘
           │
           ▼
  ┌─────────────────┐
  │  Mobile App     │  React Native + Expo
  │  (Ghala)        │  - WalletConnect Integration
  │                 │  - Biometric Auth
  └────────┬────────┘  - Cross-chain UI
           │
           ▼
  ┌─────────────────┐
  │  Backend API    │  Node.js + TypeScript
  │  (Express)      │  - Mezo RPC Integration
  │                 │  - Position Management
  └────────┬────────┘  - Transaction Orchestration
           │
           ▼
  ┌─────────────────────────────────────────────────────────────────┐
  │                    ICP CANISTERS (RUST)                         │
  │  ┌──────────────┐  ┌─────────────────┐  ┌──────────────────┐  │
  │  │ BTC Handler  │  │ Bridge          │  │ Solana Handler   │  │
  │  │ Canister     │  │ Orchestrator    │  │ Canister         │  │
  │  │              │  │ Canister        │  │                  │  │
  │  │ - Threshold  │  │ - Flow Control  │  │ - Threshold      │  │
  │  │   ECDSA      │  │ - Mezo HTTPS    │  │   Schnorr        │  │
  │  │ - UTXO Mgmt  │  │   Outcalls      │  │ - SPL Token Ops  │  │
  │  │ - BTC Tx     │  │ - Position      │  │ - Solana Tx      │  │
  │  │   Signing    │  │   Tracking      │  │   Signing        │  │
  │  └──────────────┘  └─────────────────┘  └──────────────────┘  │
  └─────────────────────────────────────────────────────────────────┘
           │                    │                      │
           ▼                    ▼                      ▼
  ┌──────────────┐    ┌──────────────┐    ┌────────────────────┐
  │ Bitcoin      │    │ Mezo Network │    │ Solana             │
  │ Testnet      │    │ (BTC L2)     │    │ Devnet             │
  │              │    │              │    │                    │
  │ - BTC Wallet │    │ - mUSD Token │    │ - Wrapped mUSD SPL │
  │ - Collateral │    │ - Borrowing  │    │ - Yield Protocols  │
  │   Deposits   │    │ - LTV Mgmt   │    │   (Kamino, etc)    │
  └──────────────┘    └──────────────┘    └────────────────────┘
```

---

## 📦 Component Breakdown

### 1. **Mobile Application** (`/Mobile`)

**React Native + Expo** cross-platform mobile app with a modern, polished UI.

#### Features:

- 🔐 **Biometric Authentication** (Face ID / Fingerprint)
- 👛 **Multi-Chain Wallet Support** (WalletConnect, Phantom, Solflare)
- 📊 **Real-time Position Tracking** (BTC collateral, mUSD debt, Solana yields)
- 🎨 **Dark/Light Theme** with smooth animations
- 💸 **Complete DeFi Workflow**:
  - Mint mUSD from BTC collateral
  - Bridge mUSD to Solana
  - Deploy to yield pools
  - Track earnings

#### Key Technologies:

- React Native 0.81
- Expo 54
- Reown AppKit (WalletConnect v2)
- React Native Reanimated
- @dfinity/agent (ICP integration)
- @solana/web3.js

#### Screens:

- `HomeScreen.tsx` - Dashboard with portfolio overview
- `MintScreen.tsx` - BTC collateral deposit & mUSD minting
- `BridgeScreen.tsx` - Cross-chain bridge flow visualization
- `PoolDetailScreen.tsx` - Yield pool information
- `ActivityScreen.tsx` - Transaction history

#### How It Ties Together:

The mobile app serves as the **user interface layer**, connecting to:

- **Backend API** for Mezo interactions and position management
- **ICP Canisters** directly via `@dfinity/agent` for trustless bridge operations
- **Solana RPC** for yield protocol interactions

---

### 2. **Backend API** (`/backend`)

**Node.js + TypeScript + Express** API server that handles Mezo Network integration.

#### Features:

- 📡 **Mezo RPC Integration** (Boar testnet)
- 💰 **mUSD Token Management** (ERC20 interactions)
- 🏦 **Borrow Manager** (collateral deposits, minting, LTV calculations)
- 🔄 **Position Tracking** (user loan positions, health factors)
- 🛡️ **Security Middleware** (Helmet, CORS, rate limiting)
- 📊 **Price Oracle Integration** (BTC/USD price feeds)

#### Key Technologies:

- Express.js 4.x
- Ethers.js v6 (Ethereum JSON-RPC)
- TypeScript 5.3
- JWT Authentication
- Winston Logger

#### Services:

- `mezo.service.ts` - Core Mezo blockchain interactions
- `wallet.service.ts` - User wallet management
- `lending.controller.ts` - Loan position endpoints

#### API Endpoints:

```
GET  /api/health                    - Health check
POST /api/auth/login               - User authentication
POST /api/lending/deposit          - Deposit BTC collateral
POST /api/lending/mint             - Mint mUSD
GET  /api/lending/position/:addr   - Get user position
GET  /api/lending/max-mintable     - Calculate max mUSD mintable
```

#### How It Ties Together:

The backend acts as the **Mezo Network gateway**:

- Receives requests from mobile app
- Executes smart contract calls to Mezo testnet
- Manages user authentication and sessions
- Calculates collateral ratios and liquidation risks
- Forwards bridge requests to ICP canisters

---

### 3. **ICP Canisters** (`/icp_bridge`)

**Kybra (Python CDK)** canisters deployed on Internet Computer for trustless cross-chain operations.

#### Canisters:

##### a) **BTC Handler Canister** (`btc_handler`)

**Purpose**: Native Bitcoin Integration Layer

This canister provides direct interaction with the Bitcoin testnet without any external APIs or centralized services. It uses ICP's threshold ECDSA to generate Bitcoin addresses and sign transactions in a fully decentralized manner.

**What it does:**

- 🔑 **Generates Bitcoin addresses** - Creates unique BTC addresses for each user using threshold cryptography (no private keys stored!)
- 💰 **Checks BTC balances** - Queries Bitcoin network for address balances via ICP's native Bitcoin integration
- 📦 **Tracks UTXOs** - Monitors unspent transaction outputs for accurate balance tracking
- ✍️ **Signs transactions** - Uses threshold ECDSA to sign Bitcoin transactions securely across multiple ICP nodes
- 📡 **Broadcasts to Bitcoin network** - Sends signed transactions directly to Bitcoin testnet

**Key Functions:**

```python
generate_btc_address() -> str                    # Create new BTC address for user
get_my_btc_address() -> str                      # Retrieve user's existing address
get_btc_balance(address: str) -> nat64           # Check BTC balance (in satoshis)
get_utxos(address: str) -> Vec[UTXOInfo]         # Get unspent outputs
send_btc(to_address: str, amount: nat64) -> str  # Send BTC transaction
```

##### b) **Bridge Orchestrator Canister** (`bridge_orchestrator`)

**Purpose**: Bridge Coordination & Flow Management

This is the "brain" of the bridge that orchestrates the complete cross-chain flow. It coordinates interactions between Bitcoin, Mezo, and Solana, making HTTPS outcalls to Mezo's RPC and managing user positions across all three chains.

**What it does:**

- 🎯 **Orchestrates bridge flow** - Manages the complete BTC → mUSD → Solana journey in sequential steps
- 🔗 **Connects to Mezo** - Makes HTTPS outcalls to Mezo testnet RPC to interact with mUSD contracts
- 📊 **Tracks positions** - Maintains user bridge positions (BTC collateral, mUSD minted, SOL deployed)
- 🧮 **Calculates LTV** - Computes Loan-to-Value ratios and determines max mintable amounts based on collateral
- 📈 **Bridge statistics** - Aggregates total volume, users, and activity across the bridge
- 🎛️ **Configuration** - Stores references to BTC Handler and Solana canisters for coordination

**Key Functions:**

```python
deposit_btc_for_musd(amount: nat64) -> DepositResponse    # Step 1: Deposit BTC
mint_musd_on_mezo(amount: nat64) -> MintResponse          # Step 2: Mint mUSD on Mezo
bridge_musd_to_solana(amount: nat64) -> str               # Step 3: Bridge to Solana
get_my_position() -> BridgePosition                       # Get user's current position
calculate_max_mintable(btc: nat64) -> nat64               # Calculate max mUSD for given BTC
get_bridge_stats() -> BridgeStats                         # Get overall bridge statistics
set_canister_ids(btc_id: str, sol_id: str) -> str        # Configure dependent canisters
```

##### c) **Solana Canister** (`solana_canister`)

**Purpose**: Solana Network Integration Layer

This canister provides direct interaction with Solana devnet using ICP's threshold Schnorr (Ed25519) signatures. It handles the final step of the bridge by managing mUSD tokens and interactions with Solana DeFi protocols.

**What it does:**

- 🔑 **Generates Solana addresses** - Creates Ed25519 keypairs using threshold Schnorr signatures (decentralized key generation)
- 💎 **Checks SOL balances** - Queries Solana RPC for native SOL and SPL token balances
- 🪙 **Manages SPL tokens** - Handles wrapped mUSD tokens and other SPL token operations
- ✍️ **Signs transactions** - Uses threshold signatures to sign Solana transactions securely
- 📡 **Submits to Solana** - Broadcasts signed transactions to Solana devnet
- 🪂 **Testnet airdrops** - Requests SOL airdrops for testing purposes

**Key Functions:**

```python
generate_solana_address() -> str                                 # Create new Solana address
get_my_solana_address() -> str                                   # Retrieve user's address
get_solana_balance(address: str) -> SolanaBalance               # Check SOL balance
send_sol(to_address: str, lamports: nat64) -> TransactionResult # Send SOL transaction
request_airdrop(address: str, lamports: nat64) -> TransactionResult # Get testnet SOL
get_recent_blockhash() -> str                                    # Get blockhash for tx
```

#### 🔗 How the Canisters Work Together

```
User deposits BTC
       ↓
[BTC Handler Canister]
   • Generates BTC address
   • Receives BTC deposit
   • Tracks UTXO balances
       ↓
[Bridge Orchestrator Canister]
   • Coordinates minting process
   • Makes HTTPS call to Mezo RPC
   • Calls mUSD contract to mint
   • Tracks user position
       ↓
   Mezo mUSD minted ✓
       ↓
[Bridge Orchestrator Canister]
   • Initiates bridge to Solana
   • Communicates with Solana canister
       ↓
[Solana Canister]
   • Generates Solana address
   • Receives mUSD from bridge
   • Creates SPL token transaction
   • Broadcasts to Solana
       ↓
User has mUSD on Solana for DeFi yields ✨
```

#### Key Technologies:

- **Kybra** (Python CDK for ICP)
- **Threshold ECDSA** (Bitcoin signatures)
- **Threshold Schnorr** (Solana Ed25519 signatures)
- **HTTPS Outcalls** (Mezo RPC communication)
- **Stable Memory** (Persistent state management)

#### How It Ties Together:

ICP canisters provide the **trustless execution layer**:

- No centralized operators or bridges
- Direct integration with Bitcoin and Solana networks via threshold cryptography
- Immutable, auditable Rust/Python smart contracts
- Communicate with Mezo via HTTPS outcalls
- Store user positions in stable memory across all chains

#### 🔄 Updating Canister IDs and Declarations

When working with ICP canisters locally, you need to keep your Mobile app in sync with your canister deployments.

##### **When to Update Canister IDs**

Every time you redeploy canisters locally, their IDs change. Update them in your `.env` file:

```bash
# Get new canister IDs after deployment
wsl
cd ~/icp_bridge
dfx canister id btc_handler
dfx canister id bridge_orchestrator
dfx canister id solana_canister

# Update Mobile/.env with new IDs
EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID=<new-id>
EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID=<new-id>
EXPO_PUBLIC_SOLANA_CANISTER_ID=<new-id>
```

##### **When to Update Declarations**

Declarations are TypeScript/JavaScript bindings generated from your canister interfaces (`.did` files).

**Update declarations when:**
- ✅ You add, remove, or modify canister methods
- ✅ You change method parameters or return types
- ✅ You modify the `.did` interface files
- ✅ After running `dfx deploy` with interface changes

**Don't need to update if:**
- ❌ You only redeploy without changing the interface
- ❌ You only update canister IDs
- ❌ You only change internal canister logic without changing the public API

##### **How to Update Declarations**

```bash
# 1. Regenerate declarations in your ICP project
cd icp_bridge
dfx generate

# 2. Copy updated declarations to Mobile app
cd Mobile
# On Windows PowerShell:
Copy-Item -Path "..\icp_bridge\src\declarations\*" -Destination "declarations\" -Recurse -Force

# On WSL/Linux/Mac:
cp -r ../icp_bridge/src/declarations/* declarations/

# 3. Restart your Metro bundler
npm start --clear
```

##### **Quick Reference**

| Scenario | Update IDs? | Update Declarations? | Command |
|----------|-------------|---------------------|---------|
| Fresh deployment | ✅ Yes | ✅ Yes | `dfx deploy && dfx generate` |
| Redeploy (no interface changes) | ✅ Yes | ❌ No | Just update `.env` |
| Modified canister methods | ✅ Yes | ✅ Yes | `dfx deploy && dfx generate` then copy |
| Only internal logic changes | ✅ Yes | ❌ No | Just update `.env` |

**TIP**: If unsure, it's safer to regenerate and copy declarations. It won't hurt and ensures everything is in sync!

---

### 4. **mUSD Protocol** (`/musd`)

**Solidity smart contracts** for the Mezo-based mUSD stablecoin system.

#### Components:

- 📜 **MUSD Token** (ERC20 stablecoin)
- 🏦 **BorrowerOperations** (collateral management, minting)
- 📊 **TroveManager** (debt position tracking, liquidations)
- 💧 **StabilityPool** (liquidation buffer)
- 🎯 **PriceFeed** (oracle integration)
- 📈 **InterestRateManager** (dynamic interest rates)

#### Key Features:

- Over-collateralized lending protocol
- Variable interest rates based on utilization
- Governance-controlled parameters
- Comprehensive test suite
- Multi-network deployment (Matsnet, Sepolia)

#### How It Ties Together:

mUSD contracts are the **collateral and minting layer**:

- Deployed on Mezo Network (Bitcoin L2)
- Users deposit BTC to mint mUSD
- Backend API interacts with these contracts
- Bridge canister queries contract state
- mUSD is then bridged to Solana for yield farming

---

### 5. **Bridge Listener** (`/mezo-solana-hackathon`)

**TypeScript service** that listens for Mezo bridge events and mints wrapped mUSD on Solana.

#### Features:

- 👂 **Event Listener** for `MUSDLocked` events on Mezo
- 🪙 **SPL Token Minting** (wrapped mUSD on Solana)
- 🔄 **Decimal Conversion** (18 decimals → 6 decimals)
- 🎯 **Automatic Token Delivery** to destination addresses

#### Key Technologies:

- Ethers.js (Mezo event listening)
- @solana/web3.js (Solana RPC)
- @solana/spl-token (Token operations)

#### How It Ties Together:

The bridge listener acts as the **Mezo → Solana relay**:

- Monitors Mezo bridge contract for lock events
- Automatically mints equivalent wrapped mUSD SPL tokens on Solana
- Ensures 1:1 peg between chains
- Enables mUSD liquidity on Solana DEXs and yield protocols

---

## 💻 Complete Tech Stack

### Frontend & Mobile

- **React Native** 0.81 - Cross-platform mobile framework
- **Expo** 54 - Development tooling and deployment
- **TypeScript** 5.9 - Type safety
- **React Navigation** - Routing and navigation
- **Reown AppKit** - WalletConnect v2 integration
- **React Native Reanimated** - Smooth animations
- **Expo Local Authentication** - Biometric auth

### Backend & API

- **Node.js** 20+ - Runtime
- **Express.js** 4.x - Web framework
- **TypeScript** 5.3 - Type safety
- **Ethers.js** v6 - Ethereum JSON-RPC
- **JWT** - Authentication
- **Helmet** - Security headers
- **Winston** - Logging

### Blockchain & Smart Contracts

- **Solidity** - Smart contract language (mUSD protocol)
- **Hardhat** - Contract development and testing
- **Kybra (Python CDK)** - ICP canister development
- **@dfinity/agent** - ICP SDK
- **@solana/web3.js** - Solana SDK
- **@solana/spl-token** - SPL token operations

### Infrastructure

- **Internet Computer Protocol (ICP)** - Trustless compute and cross-chain
- **Mezo Network** - Bitcoin L2 for native BTC collateral
- **Bitcoin Testnet** - Bitcoin blockchain
- **Solana Devnet** - Solana blockchain
- **Threshold ECDSA** - Decentralized Bitcoin signatures
- **Threshold Schnorr** - Decentralized Solana signatures

---

## 🔄 How Components Work Together

### End-to-End User Flow

```
1. USER INITIATES MINT
   Mobile App → Backend API
   
2. DEPOSIT COLLATERAL
   Backend → Mezo Network
   BTC locked in BorrowManager contract
   
3. MINT mUSD
   Backend → Mezo mUSD Contract
   mUSD minted to user's address
   
4. BRIDGE INITIATION
   Mobile App → ICP Bridge Orchestrator
   User requests bridge to Solana
   
5. CROSS-CHAIN EXECUTION
   Bridge Orchestrator → BTC Handler (verify deposit)
   Bridge Orchestrator → Mezo (HTTPS outcall to verify mint)
   Bridge Orchestrator → Solana Handler (create destination address)
   
6. SOLANA TRANSFER
   Bridge Listener detects MUSDLocked event on Mezo
   Mints wrapped mUSD SPL token on Solana
   Delivers to user's Solana address
   
7. YIELD DEPLOYMENT
   User selects yield protocol (Kamino, Meteora, etc)
   Solana Handler executes deposit transaction
   User starts earning yield
   
8. YIELD DISTRIBUTION
   Protocols distribute rewards
   User can claim/compound via mobile app
```

### Component Dependencies

```
Mobile App
├── Depends on: Backend API (Mezo operations)
├── Depends on: ICP Canisters (Bridge operations)
└── Depends on: Solana RPC (Yield protocol interactions)

Backend API
├── Depends on: Mezo Network (mUSD contracts)
└── Depends on: ICP Bridge Orchestrator (Bridge status)

Bridge Orchestrator Canister
├── Depends on: BTC Handler (Bitcoin verification)
├── Depends on: Solana Handler (Solana operations)
└── Depends on: Mezo RPC (Contract state queries)

Bridge Listener
├── Depends on: Mezo Network (Event monitoring)
└── Depends on: Solana RPC (Token minting)

mUSD Contracts
└── Deployed on: Mezo Network
```

---

## 🚀 MVP Status & Development Roadmap

### ✅ Completed (MVP Stage)

#### Mobile Application

- [X] Full UI/UX implementation for all screens
- [X] WalletConnect integration (Bitcoin, Solana, Ethereum)
- [X] Biometric authentication
- [X] Mint, Bridge, and Pool screens
- [X] Activity tracking UI
- [X] Theme system (dark/light mode)

#### Backend API

- [X] Express.js server architecture
- [X] Mezo RPC integration
- [X] mUSD token contract interactions
- [X] Borrow Manager service
- [X] Position tracking
- [X] API endpoint structure

#### ICP Canisters

- [X] Three canister architecture (BTC, Bridge, Solana)
- [X] Threshold ECDSA integration (Bitcoin)
- [X] Threshold Schnorr integration (Solana)
- [X] HTTPS outcalls to Mezo
- [X] Position management in stable memory
- [X] Complete Candid interfaces

#### Smart Contracts

- [X] mUSD protocol contracts
- [X] Comprehensive test suite
- [X] Multi-network deployment scripts
- [X] Interest rate management

#### Bridge Infrastructure

- [X] Event listener for Mezo → Solana
- [X] SPL token minting logic
- [X] Decimal conversion handling

### 🔧 In Progress (Integration Phase)

The following integrations need to be completed to move from MVP to production:

#### 1. **End-to-End Testing**

- [ ] Test complete BTC → Mezo → Solana flow on testnets
- [ ] Validate threshold signature generation
- [ ] Verify event listener triggers correctly
- [ ] Test position tracking across all components

#### 2. **ICP ↔ Backend Integration**

- [ ] Connect mobile app to deployed ICP canisters
- [ ] Implement canister authentication flow
- [ ] Add canister status monitoring in backend
- [ ] Handle canister out-of-cycles scenarios

#### 3. **Mezo Contract Configuration**

- [ ] Finalize BorrowManager contract address
- [ ] Configure price oracle feeds
- [ ] Set production interest rates
- [ ] Deploy to Mezo mainnet

#### 4. **Solana Yield Protocol Integration**

- [ ] Integrate Kamino Finance SDK
- [ ] Integrate Meteora pools
- [ ] Integrate Marinade Finance
- [ ] Add protocol selection logic in mobile app

#### 5. **Security & Auditing**

- [ ] Smart contract security audit (mUSD)
- [ ] Canister code review
- [ ] Penetration testing
- [ ] Rate limiting implementation
- [ ] Multi-signature admin controls

#### 6. **Monitoring & Analytics**

- [ ] Transaction tracking system
- [ ] Error logging and alerting
- [ ] Performance metrics
- [ ] User analytics (privacy-preserving)

---

## 🎯 Why Ghala is Unique

1. **Native Bitcoin Focus**

   - First protocol to use Mezo's native BTC-backed mUSD (not wrapped BTC)
   - No need to bridge or wrap Bitcoin itself
   - Maintain Bitcoin custody while accessing DeFi
2. **Trustless Execution**

   - ICP canisters eliminate centralized bridge operators
   - Threshold cryptography ensures decentralized control
   - Auditable, immutable smart contracts
3. **Seamless UX**

   - One-tap flow from BTC collateral to Solana yield
   - Mobile-first design
   - Automated yield deployment
4. **Low Fees**

   - Fixed 1% APR on mUSD minting (vs. variable rates elsewhere)
   - No bridge operator fees (only gas costs)
   - Transparent fee structure
5. **Multi-Chain Innovation**

   - Combines strengths of Bitcoin (security), Mezo (BTC liquidity), ICP (trustless compute), and Solana (high-performance DeFi)
   - True chain fusion without compromises

---

## 🛠️ Setup & Development

### Prerequisites

```bash
# Node.js 20+
node --version

# Python 3.10+
python3 --version

# dfx (ICP SDK)
dfx --version

# Solana CLI (optional)
solana --version
```

### Installation

#### 1. Clone Repository

```bash
git clone https://github.com/yourusername/ghala.git
cd ghala
```

#### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env
# Configure environment variables
npm run dev
```

#### 3. Setup Mobile App

```bash
cd Mobile
npm install
# For iOS
npm run ios
# For Android
npm run android
```

#### 4. Setup ICP Canisters

```bash
cd icp_bridge
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
dfx start --clean --background
dfx deploy
```

#### 5. Setup Bridge Listener

```bash
cd mezo-solana-hackathon
npm install
# Configure wMUSD mint authority keypair
npm start
```

---

## 📚 Documentation

- **Backend API Docs**: See `backend/README.md`
- **ICP Canister Docs**: See `icp_bridge/README.md`
- **mUSD Protocol Docs**: See `musd/README.md`
- **Mobile App Setup**: See `Mobile/README.md` (to be added)

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🔗 Links

- **Website**: Coming soon
- **Documentation**: Coming soon
- **Twitter**: Coming soon
- **Discord**: Coming soon

---

## 👥 Team

Built with ❤️ by the Ghala team for the Mezo Hackathon

---

**Ghala - Your Bitcoin, Now Earning**
