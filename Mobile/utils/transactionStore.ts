import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Transaction {
  id: string;
  type: 'mint' | 'bridge' | 'deposit' | 'send';
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  mezoTxHash?: string;
  solanaTxSig?: string;
  btcAddress?: string;
  solanaAddress?: string;
  errorMessage?: string;
}

const TRANSACTIONS_KEY = '@degenforge_transactions';
const MAX_TRANSACTIONS = 100;

class TransactionStore {
  private transactions: Transaction[] = [];
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      const stored = await AsyncStorage.getItem(TRANSACTIONS_KEY);
      if (stored) {
        this.transactions = JSON.parse(stored);
      }
      this.initialized = true;
    } catch (error) {
      console.error('Failed to load transactions:', error);
      this.transactions = [];
    }
  }

  async addTransaction(tx: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    await this.initialize();
    
    const newTx: Transaction = {
      ...tx,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.transactions.unshift(newTx);
    
    if (this.transactions.length > MAX_TRANSACTIONS) {
      this.transactions = this.transactions.slice(0, MAX_TRANSACTIONS);
    }

    await this.save();
    return newTx;
  }

  async updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
    await this.initialize();
    
    const index = this.transactions.findIndex(tx => tx.id === id);
    if (index !== -1) {
      this.transactions[index] = { ...this.transactions[index], ...updates };
      await this.save();
    }
  }

  async getTransactions(): Promise<Transaction[]> {
    await this.initialize();
    return [...this.transactions];
  }

  async clearTransactions(): Promise<void> {
    this.transactions = [];
    await this.save();
  }

  private async save(): Promise<void> {
    try {
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(this.transactions));
    } catch (error) {
      console.error('Failed to save transactions:', error);
    }
  }
}

export default new TransactionStore();

