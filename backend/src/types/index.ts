// Core types for the BTC-Backed Cross-Chain Yield Maximizer

export interface MezoConfig {
  rpcUrl: string;
  privateKey: string;
  apiKey: string;
  chainId: number;
  musdTokenAddress: string;
  borrowManagerAddress: string;
}

export interface LoanPosition {
  collateralBTC: string;
  collateralValueUSD: string;
  musdMinted: string;
  currentLTV: string;
  interestRate: string;
  liquidationThreshold: string;
  healthFactor: string;
  positionId?: string;
  lastUpdated: Date;
}

export interface DepositRequest {
  btcAmount: string;
  walletAddress: string;
  signature?: string;
  message?: string;
}

export interface MintRequest {
  musdAmount: string;
  walletAddress: string;
  signature?: string;
  message?: string;
}

export interface WalletAuthRequest {
  address: string;
  signature: string;
  message: string;
  walletType: 'mezo-passport' | 'phantom';
}

export interface AuthResponse {
  token: string;
  expiresIn: string;
  user: {
    address: string;
    walletType: string;
  };
}

export interface TransactionResponse {
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  blockNumber?: number;
  timestamp: Date;
}

export interface DepositResponse extends TransactionResponse {
  collateralDeposited: string;
}

export interface MintResponse extends TransactionResponse {
  musdMinted: string;
  newLTV: string;
  interestRate: string;
}

export interface RiskAssessment {
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  liquidationRisk: number;
  healthFactor: string;
}

export interface MaxMintableResponse {
  maxMintable: string;
  atLTV: string;
  currentCollateral: string;
  estimatedValue: string;
}

// Error types
export class InsufficientCollateralError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCollateralError';
  }
}

export class LTVExceededError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'LTVExceededError';
  }
}

export class TransactionFailedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TransactionFailedError';
  }
}

export class WalletNotConnectedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WalletNotConnectedError';
  }
}

// Mezo contract events
export interface CollateralDepositedEvent {
  user: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

export interface MUSDMintedEvent {
  user: string;
  amount: string;
  timestamp: number;
  transactionHash: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: Date;
}
