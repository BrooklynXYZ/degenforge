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

Manages Bitcoin testnet interactions using ICP's native Bitcoin integration.

**Capabilities:**

- 🔑 Generate Bitcoin addresses using threshold ECDSA
- 📊 Query UTXO balances
- ✍️ Sign and broadcast Bitcoin transactions
- 🔒 Track user BTC deposits

**Key Functions:**

```python
generate_btc_address() -> str
get_btc_balance(address: str) -> nat64
get_utxos(address: str) -> Vec[UTXOInfo]
sign_transaction(message_hash: blob) -> blob
send_btc(to_address: str, amount: nat64) -> str
```

##### b) **Bridge Orchestrator Canister** (`bridge_orchestrator`)

Coordinates the entire BTC → mUSD → Solana flow.

**Capabilities:**

- 🌉 Multi-step bridge orchestration
- 📞 HTTPS outcalls to Mezo RPC
- 📈 LTV and collateral calculations
- 🗂️ User position management

**Key Functions:**

```python
deposit_btc_for_musd(amount: nat64) -> DepositResponse
mint_musd_on_mezo(amount: nat64) -> MintResponse
bridge_musd_to_solana(amount: nat64) -> str
get_my_position() -> BridgePosition
calculate_max_mintable(btc: nat64) -> nat64
```

##### c) **Solana Canister** (`solana_canister`)

Manages Solana devnet interactions using threshold Schnorr signatures.

**Capabilities:**

- 🔑 Generate Solana addresses using Ed25519
- 📊 Query SOL and SPL token balances
- ✍️ Sign and submit Solana transactions
- 💧 Request devnet airdrops

**Key Functions:**

```python
generate_solana_address() -> str
get_solana_balance(address: str) -> SolanaBalance
send_sol(to_address: str, lamports: nat64) -> TransactionResult
request_airdrop(address: str, lamports: nat64) -> TransactionResult
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
