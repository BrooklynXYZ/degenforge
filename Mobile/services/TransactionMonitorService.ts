import ICPBridgeService from './ICPBridgeService';
import EthereumWalletService from './EthereumWalletService';
import transactionStore, { Transaction } from '@/utils/transactionStore';
import logger from '@/utils/logger';

export type TransactionStatus = 'pending' | 'confirming' | 'confirmed' | 'failed';

interface MonitoredTransaction {
  txId: string;
  type: 'bridge' | 'mint';
  startTime: number;
  pollingCount: number;
  lastError?: string;
}

class TransactionMonitorService {
  private monitoredTxs: Map<string, MonitoredTransaction> = new Map();
  private pollingInterval: NodeJS.Timeout | null = null;
  private readonly POLL_INTERVAL_MS = 10000;
  private readonly MAX_POLLING_TIME_MS = 1800000;
  private readonly MAX_RETRIES = 3;
  private isMonitoring = false;

  startMonitoring(txId: string, type: 'bridge' | 'mint'): void {
    if (this.monitoredTxs.has(txId)) {
      logger.debug('Transaction already being monitored', { txId });
      return;
    }

    logger.info('Starting transaction monitoring', { txId, type });
    
    this.monitoredTxs.set(txId, {
      txId,
      type,
      startTime: Date.now(),
      pollingCount: 0,
    });

    if (!this.isMonitoring) {
      this.startPolling();
    }
  }

  stopMonitoring(txId: string): void {
    logger.debug('Stopping transaction monitoring', { txId });
    this.monitoredTxs.delete(txId);

    if (this.monitoredTxs.size === 0) {
      this.stopPolling();
    }
  }

  private startPolling(): void {
    if (this.pollingInterval) return;

    logger.info('Starting transaction polling loop');
    this.isMonitoring = true;

    this.pollingInterval = setInterval(() => {
      this.pollTransactions();
    }, this.POLL_INTERVAL_MS);

    this.pollTransactions();
  }

  private stopPolling(): void {
    if (this.pollingInterval) {
      logger.info('Stopping transaction polling loop');
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
      this.isMonitoring = false;
    }
  }

  private async pollTransactions(): Promise<void> {
    if (this.monitoredTxs.size === 0) {
      this.stopPolling();
      return;
    }

    logger.debug('Polling transactions', { count: this.monitoredTxs.size });

    const promises = Array.from(this.monitoredTxs.values()).map((monitoredTx) =>
      this.checkTransactionStatus(monitoredTx)
    );

    await Promise.allSettled(promises);
  }

  private async checkTransactionStatus(monitoredTx: MonitoredTransaction): Promise<void> {
    const { txId, type, startTime, pollingCount } = monitoredTx;

    if (Date.now() - startTime > this.MAX_POLLING_TIME_MS) {
      logger.warn('Transaction polling timeout', { txId, type });
      await this.handleTransactionTimeout(txId);
      return;
    }

    monitoredTx.pollingCount++;

    try {
      logger.debug('Checking transaction status', { txId, type, pollingCount });

      let status: TransactionStatus = 'pending';
      let txHash: string | undefined;
      let errorMessage: string | undefined;

      if (type === 'bridge') {
        const result = await this.checkBridgeStatus(txId);
        status = result.status;
        txHash = result.txHash;
        errorMessage = result.error;
      } else if (type === 'mint') {
        const result = await this.checkMintStatus(txId);
        status = result.status;
        txHash = result.txHash;
        errorMessage = result.error;
      }

      if (status === 'confirmed') {
        logger.info('Transaction confirmed', { txId, type, txHash });
        await transactionStore.updateTransaction(txId, {
          status: 'confirmed',
          ...(type === 'bridge' ? { solanaTxSig: txHash } : { mezoTxHash: txHash }),
        });
        this.stopMonitoring(txId);
      } else if (status === 'failed') {
        logger.error('Transaction failed', { txId, type, errorMessage });
        await transactionStore.updateTransaction(txId, {
          status: 'failed',
          errorMessage: errorMessage || 'Transaction failed',
        });
        this.stopMonitoring(txId);
      }
    } catch (error) {
      logger.error('Error checking transaction status', error, { txId, type });
      monitoredTx.lastError = error instanceof Error ? error.message : String(error);

      if (pollingCount >= this.MAX_RETRIES) {
        await transactionStore.updateTransaction(txId, {
          status: 'failed',
          errorMessage: `Failed after ${this.MAX_RETRIES} retries: ${monitoredTx.lastError}`,
        });
        this.stopMonitoring(txId);
      }
    }
  }

  private async checkBridgeStatus(txId: string): Promise<{
    status: TransactionStatus;
    txHash?: string;
    error?: string;
  }> {
    try {
      if (!ICPBridgeService.isReady()) {
        return { status: 'pending' };
      }

      const transactions = await transactionStore.getTransactions();
      const targetTx = transactions.find(t => t.id === txId);
      
      if (!targetTx) {
        return { status: 'failed', error: 'Transaction not found' };
      }

      if (!targetTx.solanaTxSig) {
        return { status: 'pending' };
      }

      const solanaStatus = await ICPBridgeService.getSolanaTransactionStatus(targetTx.solanaTxSig);

      if (solanaStatus === 'finalized') {
        return { status: 'confirmed', txHash: targetTx.solanaTxSig };
      } else if (solanaStatus === 'error') {
        return { status: 'failed', error: 'Solana transaction failed', txHash: targetTx.solanaTxSig };
      }

      return { status: 'pending' };
    } catch (error) {
      logger.error('Error checking bridge status', error);
      return { status: 'pending', error: error instanceof Error ? error.message : String(error) };
    }
  }

  private async checkMintStatus(txId: string): Promise<{
    status: TransactionStatus;
    txHash?: string;
    error?: string;
  }> {
    try {
      const tx = await transactionStore.getTransactions();
      const targetTx = tx.find(t => t.id === txId);
      
      if (!targetTx || !targetTx.mezoTxHash) {
        return { status: 'pending' };
      }

      const receipt = await EthereumWalletService.getTransactionReceipt(targetTx.mezoTxHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }

      if (receipt.status === 1) {
        return { status: 'confirmed', txHash: targetTx.mezoTxHash };
      } else {
        return { status: 'failed', error: 'Transaction reverted', txHash: targetTx.mezoTxHash };
      }
    } catch (error) {
      logger.error('Error checking mint status', error);
      return { status: 'pending' };
    }
  }

  private async handleTransactionTimeout(txId: string): Promise<void> {
    logger.warn('Transaction timeout', { txId });
    
    await transactionStore.updateTransaction(txId, {
      status: 'failed',
      errorMessage: 'Transaction timeout - please check manually',
    });

    this.stopMonitoring(txId);
  }

  async resumePendingTransactions(): Promise<void> {
    logger.info('Resuming monitoring of pending transactions');

    const transactions = await transactionStore.getTransactions();
    const pendingTxs = transactions.filter(tx => tx.status === 'pending');

    logger.info('Found pending transactions', { count: pendingTxs.length });

    for (const tx of pendingTxs) {
      const age = Date.now() - tx.timestamp;
      if (age < 3600000) {
        this.startMonitoring(tx.id, tx.type as 'bridge' | 'mint');
      } else {
        await transactionStore.updateTransaction(tx.id, {
          status: 'failed',
          errorMessage: 'Transaction expired',
        });
      }
    }
  }

  getMonitoringStatus(): {
    isMonitoring: boolean;
    monitoredCount: number;
    transactions: string[];
  } {
    return {
      isMonitoring: this.isMonitoring,
      monitoredCount: this.monitoredTxs.size,
      transactions: Array.from(this.monitoredTxs.keys()),
    };
  }

  cleanup(): void {
    logger.info('Cleaning up transaction monitor service');
    this.monitoredTxs.clear();
    this.stopPolling();
  }
}

export default new TransactionMonitorService();

