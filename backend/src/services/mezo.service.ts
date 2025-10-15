import { ethers } from 'ethers';
import { config } from '@/config/env';
import { mezoConfig, contractABIs, mezoConstants } from '@/config/mezo.config';
import {
  LoanPosition,
  DepositRequest,
  MintRequest,
  TransactionResponse,
  DepositResponse,
  MintResponse,
  MaxMintableResponse,
  InsufficientCollateralError,
  LTVExceededError,
  TransactionFailedError,
  CollateralDepositedEvent,
  MUSDMintedEvent
} from '@/types';

export class MezoService {
  private provider!: ethers.JsonRpcProvider;
  private wallet!: ethers.Wallet;
  private borrowManagerContract!: ethers.Contract;
  private musdTokenContract!: ethers.Contract;

  constructor() {
    this.initializeProvider();
    this.initializeContracts();
  }

  private initializeProvider(): void {
    try {
      // Initialize provider with Boar RPC and disable ENS
      this.provider = new ethers.JsonRpcProvider(mezoConfig.rpcUrl, undefined, {
        staticNetwork: true
      });
      
      // Initialize wallet for backend operations
      this.wallet = new ethers.Wallet(mezoConfig.privateKey, this.provider);
      
      console.log('✅ Mezo provider initialized with wallet:', this.wallet.address);
    } catch (error) {
      console.error('❌ Failed to initialize Mezo provider:', error);
      throw new Error('Failed to initialize Mezo service');
    }
  }

  private initializeContracts(): void {
    try {
      // Initialize mUSD Token contract (this should work)
      this.musdTokenContract = new ethers.Contract(
        mezoConfig.musdTokenAddress,
        contractABIs.musdToken,
        this.provider
      );

      // Initialize BorrowManager contract only if address is valid
      if (mezoConfig.borrowManagerAddress && mezoConfig.borrowManagerAddress !== '<to_be_found>') {
        this.borrowManagerContract = new ethers.Contract(
          mezoConfig.borrowManagerAddress,
          contractABIs.borrowManager,
          this.wallet
        );
        console.log('✅ Mezo contracts initialized');
      } else {
        console.log('⚠️  BorrowManager contract address not configured - some features will be limited');
        console.log('📋 Please update MUSD_BORROW_MANAGER_ADDRESS in .env file');
      }
    } catch (error) {
      console.error('❌ Failed to initialize Mezo contracts:', error);
      console.log('⚠️  Continuing without contract initialization - some features will be limited');
    }
  }

  /**
   * Deposit BTC as collateral for mUSD minting
   */
  async depositCollateral(request: DepositRequest): Promise<DepositResponse> {
    try {
      if (!this.borrowManagerContract) {
        throw new Error('BorrowManager contract not initialized. Please configure MUSD_BORROW_MANAGER_ADDRESS in .env file');
      }

      const { btcAmount, walletAddress } = request;

      // Validate minimum collateral requirement
      const btcValueUSD = await this.getBTCPriceUSD();
      const collateralValueUSD = parseFloat(btcAmount) * btcValueUSD;
      
      if (collateralValueUSD < mezoConstants.MIN_COLLATERAL_USD) {
        throw new InsufficientCollateralError(
          `Minimum collateral required: $${mezoConstants.MIN_COLLATERAL_USD}. Provided: $${collateralValueUSD.toFixed(2)}`
        );
      }

      // Convert BTC amount to wei
      const collateralAmountWei = ethers.parseUnits(btcAmount, mezoConstants.BTC_DECIMALS);

      // Estimate gas for the transaction
      const gasEstimate = await this.borrowManagerContract.depositCollateral.estimateGas(
        collateralAmountWei,
        { value: collateralAmountWei } // Send BTC as native currency
      );

      // Execute deposit transaction
      const tx = await this.borrowManagerContract.depositCollateral(
        collateralAmountWei,
        {
          value: collateralAmountWei,
          gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
          gasPrice: ethers.parseUnits(mezoConstants.GAS_PRICE_GWEI.toString(), 'gwei')
        }
      );

      console.log(`📤 Collateral deposit transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new TransactionFailedError('Transaction receipt not found');
      }

      // Emit event for monitoring
      const depositEvent: CollateralDepositedEvent = {
        user: walletAddress,
        amount: btcAmount,
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: tx.hash
      };

      return {
        transactionHash: tx.hash,
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        collateralDeposited: btcAmount
      };

    } catch (error) {
      console.error('❌ Collateral deposit failed:', error);
      throw error;
    }
  }

  /**
   * Mint mUSD against deposited collateral
   */
  async mintMUSD(request: MintRequest): Promise<MintResponse> {
    try {
      if (!this.borrowManagerContract) {
        throw new Error('BorrowManager contract not initialized. Please configure MUSD_BORROW_MANAGER_ADDRESS in .env file');
      }

      const { musdAmount, walletAddress } = request;

      // Get current position to validate LTV
      const position = await this.getLoanPosition(walletAddress);
      const currentLTV = parseFloat(position.currentLTV.replace('%', ''));
      
      if (currentLTV >= mezoConstants.MAX_LTV) {
        throw new LTVExceededError(
          `LTV cannot exceed ${mezoConstants.MAX_LTV}%. Current: ${currentLTV}%`
        );
      }

      // Calculate new LTV after minting
      const musdAmountFloat = parseFloat(musdAmount);
      const newTotalDebt = parseFloat(position.musdMinted) + musdAmountFloat;
      const collateralValueUSD = parseFloat(position.collateralValueUSD);
      const newLTV = (newTotalDebt / collateralValueUSD) * 100;

      if (newLTV > mezoConstants.MAX_LTV) {
        throw new LTVExceededError(
          `Minting ${musdAmount} mUSD would exceed ${mezoConstants.MAX_LTV}% LTV. New LTV would be: ${newLTV.toFixed(2)}%`
        );
      }

      // Convert mUSD amount to wei
      const musdAmountWei = ethers.parseUnits(musdAmount, mezoConstants.MUSD_DECIMALS);

      // Estimate gas for the transaction
      const gasEstimate = await this.borrowManagerContract.mintMUSD.estimateGas(musdAmountWei);

      // Execute mint transaction
      const tx = await this.borrowManagerContract.mintMUSD(musdAmountWei, {
        gasLimit: gasEstimate * 120n / 100n, // Add 20% buffer
        gasPrice: ethers.parseUnits(mezoConstants.GAS_PRICE_GWEI.toString(), 'gwei')
      });

      console.log(`📤 mUSD mint transaction sent: ${tx.hash}`);

      // Wait for confirmation
      const receipt = await tx.wait();
      
      if (!receipt) {
        throw new TransactionFailedError('Transaction receipt not found');
      }

      // Emit event for monitoring
      const mintEvent: MUSDMintedEvent = {
        user: walletAddress,
        amount: musdAmount,
        timestamp: Math.floor(Date.now() / 1000),
        transactionHash: tx.hash
      };

      return {
        transactionHash: tx.hash,
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString(),
        blockNumber: receipt.blockNumber,
        timestamp: new Date(),
        musdMinted: musdAmount,
        newLTV: `${newLTV.toFixed(2)}%`,
        interestRate: `${mezoConstants.INTEREST_RATE}%`
      };

    } catch (error) {
      console.error('❌ mUSD minting failed:', error);
      throw error;
    }
  }

  /**
   * Get user's loan position details
   */
  async getLoanPosition(userAddress: string): Promise<LoanPosition> {
    try {
      // Call contract to get position data
      const positionData = await this.borrowManagerContract.getUserPosition(userAddress);
      
      // Get BTC price for USD conversion
      const btcPriceUSD = await this.getBTCPriceUSD();
      
      // Convert from wei to readable amounts
      const collateralAmountBTC = ethers.formatUnits(positionData.collateralAmount, mezoConstants.BTC_DECIMALS);
      const debtAmountMUSD = ethers.formatUnits(positionData.debtAmount, mezoConstants.MUSD_DECIMALS);
      
      // Calculate values
      const collateralValueUSD = parseFloat(collateralAmountBTC) * btcPriceUSD;
      const currentLTV = positionData.ltv.toNumber() / 100; // Convert from basis points
      const healthFactor = collateralValueUSD / (parseFloat(debtAmountMUSD) * 1.1); // 10% buffer for liquidation

      return {
        collateralBTC: collateralAmountBTC,
        collateralValueUSD: collateralValueUSD.toFixed(2),
        musdMinted: debtAmountMUSD,
        currentLTV: `${currentLTV.toFixed(2)}%`,
        interestRate: `${mezoConstants.INTEREST_RATE}%`,
        liquidationThreshold: `${mezoConstants.MAX_LTV}%`,
        healthFactor: healthFactor.toFixed(3),
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('❌ Failed to get loan position:', error);
      throw error;
    }
  }

  /**
   * Calculate maximum mUSD mintable for given BTC collateral
   */
  async getMaxMintable(btcAmount: string): Promise<MaxMintableResponse> {
    try {
      const btcAmountWei = ethers.parseUnits(btcAmount, mezoConstants.BTC_DECIMALS);
      
      // Call contract to calculate max mintable
      const maxMintableWei = await this.borrowManagerContract.calculateMaxMintable(btcAmountWei);
      const maxMintable = ethers.formatUnits(maxMintableWei, mezoConstants.MUSD_DECIMALS);
      
      // Get BTC price for USD conversion
      const btcPriceUSD = await this.getBTCPriceUSD();
      const collateralValueUSD = parseFloat(btcAmount) * btcPriceUSD;
      
      return {
        maxMintable,
        atLTV: `${mezoConstants.MAX_LTV}%`,
        currentCollateral: btcAmount,
        estimatedValue: collateralValueUSD.toFixed(2)
      };

    } catch (error) {
      console.error('❌ Failed to calculate max mintable:', error);
      throw error;
    }
  }

  /**
   * Get BTC price in USD (placeholder - integrate with price oracle)
   */
  private async getBTCPriceUSD(): Promise<number> {
    // TODO: Integrate with actual price oracle (CoinGecko, Chainlink, etc.)
    // For now, return a placeholder value
    return 50000; // $50,000 per BTC
  }

  /**
   * Get LTV ratio for user
   */
  async getLTV(userAddress: string): Promise<number> {
    try {
      const position = await this.getLoanPosition(userAddress);
      return parseFloat(position.currentLTV.replace('%', ''));
    } catch (error) {
      console.error('❌ Failed to get LTV:', error);
      throw error;
    }
  }

  /**
   * Check if position is at liquidation risk
   */
  async isLiquidationRisk(userAddress: string): Promise<boolean> {
    try {
      const ltv = await this.getLTV(userAddress);
      return ltv >= mezoConstants.MAX_LTV * 0.95; // 95% of max LTV as warning threshold
    } catch (error) {
      console.error('❌ Failed to check liquidation risk:', error);
      return false;
    }
  }

  /**
   * Get network status and connection info
   */
  async getNetworkStatus(): Promise<{
    connected: boolean;
    chainId: number;
    blockNumber: number;
    gasPrice: string;
  }> {
    try {
      const blockNumber = await this.provider.getBlockNumber();
      const feeData = await this.provider.getFeeData();
      
      return {
        connected: true,
        chainId: mezoConfig.chainId,
        blockNumber,
        gasPrice: feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, 'gwei') : '0'
      };
    } catch (error) {
      console.error('❌ Network status check failed:', error);
      return {
        connected: false,
        chainId: 0,
        blockNumber: 0,
        gasPrice: '0'
      };
    }
  }
}

// Export singleton instance
export const mezoService = new MezoService();
