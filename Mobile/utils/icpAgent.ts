/**
 * ICP Agent - Utilities for interacting with Internet Computer canisters
 * Handles connection, authentication, and canister calls
 */

import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';

// Import canister interfaces (generated from .did files)
// These will be generated after canister deployment
// import { idlFactory as btcIdlFactory } from '../declarations/btc_handler';
// import { idlFactory as bridgeIdlFactory } from '../declarations/bridge_orchestrator';
// import { idlFactory as solanaIdlFactory } from '../declarations/solana_canister';

// Configuration
const ICP_HOST = __DEV__ 
  ? 'http://localhost:4943'  // Local replica for development
  : 'https://icp-api.io';      // Mainnet for production

// Canister IDs (update after deployment)
export const CANISTER_IDS = {
  BTC_HANDLER: process.env.BTC_HANDLER_CANISTER_ID || '',
  BRIDGE_ORCHESTRATOR: process.env.BRIDGE_ORCHESTRATOR_CANISTER_ID || '',
  SOLANA_CANISTER: process.env.SOLANA_CANISTER_ID || '',
};

/**
 * Initialize ICP agent
 */
export const createAgent = async (identity?: Identity): Promise<HttpAgent> => {
  const agent = new HttpAgent({
    host: ICP_HOST,
    identity,
  });

  // Fetch root key for local development
  if (__DEV__) {
    await agent.fetchRootKey();
  }

  return agent;
};

/**
 * Create actor for canister interaction
 */
export const createActor = <T>(
  canisterId: string,
  idlFactory: any,
  identity?: Identity
): Promise<T> => {
  return createAgent(identity).then((agent) => {
    return Actor.createActor<T>(idlFactory, {
      agent,
      canisterId,
    });
  });
};

/**
 * ICP Bridge API - Type definitions
 */
export interface BridgePosition {
  user: Principal;
  btc_collateral: bigint;
  musd_minted: bigint;
  sol_deployed: bigint;
  status: string;
  btc_address: string;
  sol_address: string;
}

export interface DepositResponse {
  btc_address: string;
  message: string;
  status: string;
}

export interface MintResponse {
  musd_amount: bigint;
  transaction_hash: string;
  new_ltv: string;
  status: string;
}

export interface SolanaBalance {
  lamports: bigint;
  sol: string;
}

export interface TransactionResult {
  signature: string;
  status: string;
  message: string;
}

/**
 * BTC Handler Canister API
 */
export class BTCHandlerAPI {
  private actor: any;

  constructor(identity?: Identity) {
    // TODO: Replace with actual idlFactory after canister deployment
    // this.actor = createActor(CANISTER_IDS.BTC_HANDLER, btcIdlFactory, identity);
  }

  async generateBTCAddress(): Promise<string> {
    try {
      const address = await this.actor.generate_btc_address();
      return address;
    } catch (error) {
      console.error('Error generating BTC address:', error);
      throw error;
    }
  }

  async getMyBTCAddress(): Promise<string> {
    try {
      const address = await this.actor.get_my_btc_address();
      return address;
    } catch (error) {
      console.error('Error getting BTC address:', error);
      throw error;
    }
  }

  async getBTCBalance(address: string): Promise<bigint> {
    try {
      const balance = await this.actor.get_btc_balance(address);
      return balance;
    } catch (error) {
      console.error('Error getting BTC balance:', error);
      throw error;
    }
  }

  async sendBTC(toAddress: string, amount: bigint): Promise<string> {
    try {
      const result = await this.actor.send_btc(toAddress, amount);
      return result;
    } catch (error) {
      console.error('Error sending BTC:', error);
      throw error;
    }
  }
}

/**
 * Bridge Orchestrator Canister API
 */
export class BridgeOrchestratorAPI {
  private actor: any;

  constructor(identity?: Identity) {
    // TODO: Replace with actual idlFactory after canister deployment
    // this.actor = createActor(CANISTER_IDS.BRIDGE_ORCHESTRATOR, bridgeIdlFactory, identity);
  }

  async depositBTCForMUSD(btcAmount: bigint): Promise<DepositResponse> {
    try {
      const response = await this.actor.deposit_btc_for_musd(btcAmount);
      return response;
    } catch (error) {
      console.error('Error depositing BTC:', error);
      throw error;
    }
  }

  async mintMUSDOnMezo(btcAmount: bigint): Promise<MintResponse> {
    try {
      const response = await this.actor.mint_musd_on_mezo(btcAmount);
      return response;
    } catch (error) {
      console.error('Error minting mUSD:', error);
      throw error;
    }
  }

  async bridgeMUSDToSolana(musdAmount: bigint): Promise<string> {
    try {
      const result = await this.actor.bridge_musd_to_solana(musdAmount);
      return result;
    } catch (error) {
      console.error('Error bridging to Solana:', error);
      throw error;
    }
  }

  async getMyPosition(): Promise<BridgePosition> {
    try {
      const position = await this.actor.get_my_position();
      return position;
    } catch (error) {
      console.error('Error getting position:', error);
      throw error;
    }
  }

  async calculateMaxMintable(btcCollateral: bigint): Promise<bigint> {
    try {
      const maxMintable = await this.actor.calculate_max_mintable(btcCollateral);
      return maxMintable;
    } catch (error) {
      console.error('Error calculating max mintable:', error);
      throw error;
    }
  }

  async getBridgeStats(): Promise<any> {
    try {
      const stats = await this.actor.get_bridge_stats();
      return stats;
    } catch (error) {
      console.error('Error getting bridge stats:', error);
      throw error;
    }
  }

  async deployToYieldProtocol(musdAmount: bigint, protocol: string): Promise<string> {
    try {
      const result = await this.actor.deploy_to_yield_protocol(musdAmount, protocol);
      return result;
    } catch (error) {
      console.error('Error deploying to yield protocol:', error);
      throw error;
    }
  }
}

/**
 * Solana Canister API
 */
export class SolanaCanisterAPI {
  private actor: any;

  constructor(identity?: Identity) {
    // TODO: Replace with actual idlFactory after canister deployment
    // this.actor = createActor(CANISTER_IDS.SOLANA_CANISTER, solanaIdlFactory, identity);
  }

  async generateSolanaAddress(): Promise<string> {
    try {
      const address = await this.actor.generate_solana_address();
      return address;
    } catch (error) {
      console.error('Error generating Solana address:', error);
      throw error;
    }
  }

  async getMySolanaAddress(): Promise<string> {
    try {
      const address = await this.actor.get_my_solana_address();
      return address;
    } catch (error) {
      console.error('Error getting Solana address:', error);
      throw error;
    }
  }

  async getSolanaBalance(address: string): Promise<SolanaBalance> {
    try {
      const balance = await this.actor.get_solana_balance(address);
      return balance;
    } catch (error) {
      console.error('Error getting Solana balance:', error);
      throw error;
    }
  }

  async sendSOL(toAddress: string, lamports: bigint): Promise<TransactionResult> {
    try {
      const result = await this.actor.send_sol(toAddress, lamports);
      return result;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw error;
    }
  }

  async requestAirdrop(address: string, lamports: bigint): Promise<TransactionResult> {
    try {
      const result = await this.actor.request_airdrop(address, lamports);
      return result;
    } catch (error) {
      console.error('Error requesting airdrop:', error);
      throw error;
    }
  }
}

/**
 * Utility functions
 */

/**
 * Convert satoshis to BTC
 */
export const satoshisToBTC = (satoshis: bigint): string => {
  return (Number(satoshis) / 100_000_000).toFixed(8);
};

/**
 * Convert BTC to satoshis
 */
export const btcToSatoshis = (btc: number): bigint => {
  return BigInt(Math.floor(btc * 100_000_000));
};

/**
 * Convert lamports to SOL
 */
export const lamportsToSOL = (lamports: bigint): string => {
  return (Number(lamports) / 1_000_000_000).toFixed(9);
};

/**
 * Convert SOL to lamports
 */
export const solToLamports = (sol: number): bigint => {
  return BigInt(Math.floor(sol * 1_000_000_000));
};

/**
 * Format Principal as short string
 */
export const formatPrincipal = (principal: Principal): string => {
  const text = principal.toText();
  if (text.length <= 12) return text;
  return `${text.slice(0, 6)}...${text.slice(-4)}`;
};

/**
 * Check if canister IDs are configured
 */
export const areCanistersConfigured = (): boolean => {
  return (
    CANISTER_IDS.BTC_HANDLER !== '' &&
    CANISTER_IDS.BRIDGE_ORCHESTRATOR !== '' &&
    CANISTER_IDS.SOLANA_CANISTER !== ''
  );
};

/**
 * Export singleton instances (will be initialized with user identity)
 */
export let btcHandlerAPI: BTCHandlerAPI;
export let bridgeOrchestratorAPI: BridgeOrchestratorAPI;
export let solanaCanisterAPI: SolanaCanisterAPI;

/**
 * Initialize all APIs with user identity
 */
export const initializeAPIs = (identity?: Identity) => {
  btcHandlerAPI = new BTCHandlerAPI(identity);
  bridgeOrchestratorAPI = new BridgeOrchestratorAPI(identity);
  solanaCanisterAPI = new SolanaCanisterAPI(identity);
};

