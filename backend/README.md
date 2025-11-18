# DegenForge Backend - BTC-Backed Cross-Chain Yield Maximizer

A Node.js/TypeScript backend service that integrates with Mezo testnet for BTC deposit and mUSD minting, providing a foundation for cross-chain yield deployment on Solana.

## 🚀 Features

- **Mezo Integration**: BTC deposits → mUSD minting at 1% APR via Mezo testnet
- **Authentication**: Mezo Passport + Phantom Wallet support with JWT tokens
- **Smart Contract Interaction**: Direct interaction with Mezo mUSD contracts
- **Risk Management**: LTV monitoring, liquidation risk assessment
- **RESTful API**: Comprehensive endpoints for frontend integration
- **Error Handling**: Structured error responses and logging
- **Security**: Input validation, rate limiting, CORS protection

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Access to Mezo testnet
- BTC testnet funds for testing

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Update `.env` with your configuration:
   ```env
   # Mezo Configuration
   MEZO_TESTNET_RPC_URL=https://rpc.boar.network/mezo-testnet
   MEZO_PRIVATE_KEY=your_private_key_here
   MEZO_API_KEY=your_mezo_api_key_here
   
   # Mezo Contract Addresses (Testnet)
   MUSD_TOKEN_ADDRESS=0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503
   MUSD_BORROW_MANAGER_ADDRESS=0x1234567890abcdef1234567890abcdef12345678
   
   # Network Configuration
   PORT=3001
   NODE_ENV=development
   
   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here
   JWT_EXPIRES_IN=24h
   ```

## 🚀 Development

**Start development server:**
```bash
npm run dev
```

**Build for production:**
```bash
npm run build
npm start
```

**Run tests:**
```bash
npm test
```

## 📡 API Endpoints

### Authentication
- `POST /api/auth/connect-wallet` - Connect wallet and authenticate
- `GET /api/auth/sign-message/:address` - Generate message for signing
- `GET /api/auth/verify-token` - Verify JWT token
- `POST /api/auth/refresh-token` - Refresh JWT token

### Lending Operations
- `POST /api/lending/deposit` - Deposit BTC as collateral
- `POST /api/lending/mint` - Mint mUSD against collateral
- `GET /api/lending/position/:address` - Get loan position
- `GET /api/lending/calculate-max` - Calculate max mintable
- `GET /api/lending/risk/:address` - Risk assessment
- `GET /api/lending/network-status` - Network status

### System
- `GET /api/health` - Health check
- `GET /` - API information

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MEZO_TESTNET_RPC_URL` | Boar Network RPC URL for Mezo testnet | ✅ |
| `MEZO_PRIVATE_KEY` | Private key for backend operations | ✅ |
| `MEZO_API_KEY` | Mezo API key | ✅ |
| `MUSD_TOKEN_ADDRESS` | mUSD token contract address | ✅ |
| `MUSD_BORROW_MANAGER_ADDRESS` | Borrow manager contract address | ✅ |
| `PORT` | Server port (default: 3001) | ❌ |
| `NODE_ENV` | Environment (development/production) | ❌ |
| `JWT_SECRET` | JWT signing secret | ✅ |
| `JWT_EXPIRES_IN` | JWT expiration time | ❌ |

### Mezo Network Configuration

The backend connects to Mezo testnet with the following settings:
- **Chain ID**: 123456 (to be verified)
- **Gas Price**: 20 Gwei
- **Gas Limit**: 300,000
- **Max LTV**: 90%
- **Interest Rate**: 1% APR
- **Min Collateral**: $1,800 USD

## 🏗️ Architecture

```
backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts       # Environment validation
│   │   └── mezo.config.ts # Mezo network config
│   ├── services/         # Business logic services
│   │   ├── mezo.service.ts    # Mezo blockchain integration
│   │   └── wallet.service.ts  # Wallet authentication
│   ├── controllers/      # Request handlers
│   │   ├── auth.controller.ts     # Authentication endpoints
│   │   └── lending.controller.ts  # Lending operations
│   ├── routes/          # Express routes
│   │   └── api.routes.ts
│   ├── middleware/      # Custom middleware
│   │   └── errorHandler.ts
│   ├── types/          # TypeScript type definitions
│   │   └── index.ts
│   └── index.ts        # Application entry point
├── package.json
├── tsconfig.json
└── .env.example
```

## 🔐 Security Features

- **Input Validation**: Joi schema validation for all inputs
- **Authentication**: JWT-based authentication with wallet signatures
- **CORS Protection**: Configurable CORS for cross-origin requests
- **Helmet Security**: Security headers with helmet.js
- **Rate Limiting**: Request rate limiting (to be implemented)
- **Error Handling**: Structured error responses without sensitive data

## 🧪 Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing
1. **Connect Wallet**: Use the sign message endpoint to get a message, sign it with your wallet, then authenticate
2. **Deposit BTC**: Deposit test BTC as collateral
3. **Mint mUSD**: Mint mUSD against your collateral
4. **Query Position**: Check your loan position and risk level

## 📊 Monitoring

### Logging
- Request/response logging
- Error tracking
- Transaction monitoring
- Performance metrics

### Health Checks
- Network connectivity
- Contract availability
- Database status
- External service status

## 🚧 Future Enhancements

### Phase 7: ICP Canister Bridge
- Cross-chain asset bridging
- ICP canister communication
- Solana integration hooks

### Phase 8: Solana Yield Integration
- Jupiter DEX aggregation
- Kamino yield farming
- Meteora liquidity pools
- Pendle yield tokenization

## 📚 Documentation

- [API Documentation](../endpoints/api.txt)
- [Mezo Documentation](https://mezo.org/docs/)
- [Mezo GitHub](https://github.com/mezo-org/)
- [Ethers.js Documentation](https://docs.ethers.io/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

- **Discord**: [Mezo Community](https://discord.mezo.org)
- **GitHub Issues**: Create an issue for bugs or feature requests
- **Email**: support@degenforge.com

## 🔄 Version History

- **v1.0.0** - Initial implementation with Mezo integration
  - BTC deposit and mUSD minting
  - Wallet authentication
  - Risk management
  - RESTful API endpoints
