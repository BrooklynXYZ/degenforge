import { Identity } from '@dfinity/agent';
import {
  initializeAPIs,
  btcHandlerAPI,
  bridgeOrchestratorAPI,
  solanaCanisterAPI,
  satoshisToBTC,
  btcToSatoshis,
  solToLamports,
  type BridgePosition,
  type DepositResponse,
  type MintResponse,
  type SolanaBalance,
  type TransactionResult,
} from '@/utils/icpAgent';
import { validateCanisterConfig } from '@/canister-ids.config';

class ICPBridgeService {
  private isInitialized = false;

  async initialize(identity?: Identity): Promise<void> {
    try {
      if (!validateCanisterConfig()) {
        throw new Error('Invalid canister configuration. Check your .env file or canister-ids.config.ts');
      }
      initializeAPIs(identity);
      this.isInitialized = true;
      console.log('✅ ICP Bridge Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize ICP Bridge Service:', error);
      throw error;
    }
  }

  isReady(): boolean {
    return this.isInitialized;
  }

  async getBTCDepositAddress(): Promise<string> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      let address = await btcHandlerAPI.getMyBTCAddress();
      if (!address) {
        address = await btcHandlerAPI.generateBTCAddress();
        console.log('🔑 Generated BTC address:', address);
      }
      return address;
    } catch (error) {
      console.error('Error getting BTC address:', error);
      throw error;
    }
  }

  async getBTCBalance(address: string): Promise<{ satoshis: bigint; btc: string }> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      const satoshis = await btcHandlerAPI.getBTCBalance(address);
      return { satoshis, btc: satoshisToBTC(satoshis) };
    } catch (error) {
      console.error('Error getting BTC balance:', error);
      throw error;
    }
  }

  async depositBTCForMUSD(btcAmount: number): Promise<DepositResponse> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      const response = await bridgeOrchestratorAPI.depositBTCForMUSD(btcToSatoshis(btcAmount));
      console.log('💰 BTC deposited:', response);
      return response;
    } catch (error) {
      console.error('Error depositing BTC:', error);
      throw error;
    }
  }

  async mintMUSDOnMezo(btcAmount: number): Promise<MintResponse> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      const response = await bridgeOrchestratorAPI.mintMUSDOnMezo(btcToSatoshis(btcAmount));
      console.log('🏦 mUSD minted:', response);
      return response;
    } catch (error) {
      console.error('Error minting mUSD:', error);
      throw error;
    }
  }

  async bridgeMUSDToSolana(musdAmount: number): Promise<string> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      const signature = await bridgeOrchestratorAPI.bridgeMUSDToSolana(BigInt(Math.floor(musdAmount * 1e18)));
      console.log('🌉 Bridged to Solana:', signature);
      return signature;
    } catch (error) {
      console.error('Error bridging to Solana:', error);
      throw error;
    }
  }

  async getMyPosition(): Promise<BridgePosition> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    return bridgeOrchestratorAPI.getMyPosition();
  }

  async calculateMaxMintable(btcAmount: number): Promise<{ maxMintable: bigint; maxMintableFormatted: string }> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    const maxMintable = await bridgeOrchestratorAPI.calculateMaxMintable(btcToSatoshis(btcAmount));
    return { maxMintable, maxMintableFormatted: (Number(maxMintable) / 1e18).toFixed(2) };
  }

  async getBridgeStats(): Promise<any> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    return bridgeOrchestratorAPI.getBridgeStats();
  }

  async getSolanaAddress(): Promise<string> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      let address = await solanaCanisterAPI.getMySolanaAddress();
      if (!address) {
        address = await solanaCanisterAPI.generateSolanaAddress();
        console.log('🔑 Generated Solana address:', address);
      }
      return address;
    } catch (error) {
      console.error('Error getting Solana address:', error);
      throw error;
    }
  }

  async getSolanaBalance(address: string): Promise<SolanaBalance> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    return solanaCanisterAPI.getSolanaBalance(address);
  }

  async sendSOL(toAddress: string, solAmount: number): Promise<TransactionResult> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    return solanaCanisterAPI.sendSOL(toAddress, solToLamports(solAmount));
  }

  async requestSolanaAirdrop(address: string, solAmount: number): Promise<TransactionResult> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    return solanaCanisterAPI.requestAirdrop(address, solToLamports(solAmount));
  }

  async completeBridgeFlow(btcAmount: number): Promise<{
    deposit: DepositResponse;
    mint: MintResponse;
    bridge: string;
  }> {
    if (!this.isInitialized) throw new Error('Service not initialized');
    try {
      console.log('🚀 Starting bridge flow...');
      const deposit = await this.depositBTCForMUSD(btcAmount);
      const mint = await this.mintMUSDOnMezo(btcAmount);
      const bridge = await this.bridgeMUSDToSolana(Number(mint.musd_amount) / 1e18);
      console.log('✅ Bridge flow completed');
      return { deposit, mint, bridge };
    } catch (error) {
      console.error('❌ Bridge flow failed:', error);
      throw error;
    }
  }
}

export default new ICPBridgeService();

