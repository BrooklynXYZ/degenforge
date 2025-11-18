# Ghala - Non-Custodial BTC-Backed DeFi Yield Platform

> **Unlock Your Bitcoin's Earning Potential Without Selling**

Ghala is a fully non-custodial platform that enables Bitcoin holders to access Solana DeFi yields without wrapping, selling, or giving up control of their Bitcoin. Built on Mezo's BTC-backed stablecoin (mUSD), Internet Computer's chain fusion technology, and Solana's high-performance DeFi ecosystem.

## Overview

Bitcoin holders face a fundamental challenge: their BTC sits idle while DeFi protocols offer attractive yields. Existing solutions require trusting centralized custodians, wrapping Bitcoin into synthetic tokens, or navigating complex multi-chain processes.

Ghala solves this by creating a trustless bridge that:
- Keeps your BTC in your control via Mezo's collateral system
- Mints mUSD stablecoin against your Bitcoin at ~1% APR
- Bridges mUSD to Solana for yield deployment
- All without centralized intermediaries

## Architecture

### Three-Layer System

**Layer 1: Mezo Network (Bitcoin L2)**
- Native BTC collateral without wrapping
- Mint mUSD stablecoin at fixed ~1% APR
- Maintain ownership through smart contracts

**Layer 2: Internet Computer Protocol (Bridge)**
- Trustless cross-chain coordination
- Direct interaction with Bitcoin, Mezo, and Solana
- No centralized operators or multisig committees

**Layer 3: Solana DeFi Ecosystem**
- High-performance blockchain with sub-second finality
- Rich yield-generating protocol ecosystem
- Low transaction fees (< $0.01)

### User Flow

1. **Deposit BTC** → Lock BTC as collateral on Mezo Network
2. **Mint mUSD** → Generate stablecoin against collateral
3. **Bridge** → Transfer mUSD to Solana via ICP canisters
4. **Deploy** → Invest in Solana DeFi yield strategies
5. **Exit** → Reverse the process anytime to reclaim BTC

## Key Features

- **Non-Custodial**: Your BTC remains under your control
- **Trustless Bridge**: ICP canisters coordinate automatically
- **Low Fixed Rate**: ~1% APR borrowing cost (vs. 10-30% variable rates)
- **Mobile-First**: Simple one-tap operations
- **Bitcoin Native**: Real BTC collateral via Mezo L2
- **Closed-Loop Security**: Only internally-minted mUSD can be bridged

## Technical Components

### 1. Mobile Application
- Cross-platform React Native app (iOS/Android)
- Wallet integration (Bitcoin, Ethereum, Solana)
- Biometric authentication
- Real-time position tracking

### 2. Backend API
- Node.js/TypeScript with Express
- Mezo Network integration
- Position management and health monitoring
- Price oracle integration

### 3. ICP Bridge Canisters
- **BTC Handler**: Bitcoin address generation and monitoring
- **Bridge Orchestrator**: Cross-chain coordination and position tracking
- **Solana Handler**: Solana transaction signing and SPL token operations

### 4. mUSD Protocol Contracts
- ERC20 stablecoin implementation on Mezo
- Collateral management and liquidation
- Interest rate management
- Stability pool mechanism

## Getting Started

### Prerequisites

- Node.js 20+
- Rust 1.70+
- dfx CLI (Internet Computer SDK)

### Quick Start

```bash
# Backend
cd backend
npm install
cp .env.example .env
npm run dev

# ICP Canisters
cd icp_bridge
dfx start --background
dfx deploy

# Mobile App
cd Mobile
npm install
npm run ios  # or npm run android
```

For detailed setup instructions, see:
- [Backend README](./backend/README.md)
- [ICP Bridge README](./icp_bridge/README.md)
- [Mobile Build Guide](./Mobile/BUILD.md)

## Current Status

### Completed ✅
- Mobile application (iOS/Android) with wallet integration
- Backend API with Mezo Network integration
- ICP bridge canisters deployed to mainnet
- mUSD protocol contracts deployed and tested
- Bridge relay service operational

### In Progress 🔄
- End-to-end testing on testnets
- Solana DeFi protocol integrations
- Security audits

### Roadmap
- **Q1 2026**: Beta launch with limited users
- **Q2 2026**: Public mobile app release
- **Q3 2026**: Multi-protocol yield strategies
- **Q4 2026**: Automated position management

## Technology Stack

- **Frontend**: React Native, Expo, TypeScript
- **Backend**: Node.js, Express, TypeScript, Ethers.js
- **Smart Contracts**: Rust (ICP), Solidity (Mezo)
- **Infrastructure**: Internet Computer, Mezo Network, Bitcoin, Solana

## Contributing

We welcome contributions from developers, designers, and Bitcoin enthusiasts.

- Report bugs and issues
- Suggest features and improvements
- Contribute to documentation
- Share feedback on user experience

## License

MIT License - This project is open source and available for anyone to use, modify, and distribute.

## Acknowledgments

Built for the ICP Hackathon, bringing together Bitcoin security, Internet Computer innovation, and Solana DeFi performance.

---

**Ghala - Your Bitcoin, Now Earning**
