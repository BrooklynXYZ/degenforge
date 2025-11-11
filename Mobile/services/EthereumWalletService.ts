import { appKit } from '@/utils/appKitConfig';
import { BrowserProvider, Contract, formatEther, parseUnits, parseEther } from 'ethers';

const BORROWER_OPERATIONS_ADDRESS = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5";
const MUSD_TOKEN_ADDRESS = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";
const MEZO_CHAIN_ID = 31611;

const borrowerOperationsAbi = ["function openTrove(uint256 _debtAmount, address _upperHint, address _lowerHint) payable"];
const musdAbi = ["function balanceOf(address account) view returns (uint256)"];

export interface MezoBalances {
    btcBalance: string;
    musdBalance: string;
    btcBalanceRaw: bigint;
    musdBalanceRaw: bigint;
}

export interface BorrowParams {
    btcAmount: string;
    musdAmount: string;
}

export interface TransactionReceipt {
    status: number;
    blockNumber: number;
    transactionHash: string;
    gasUsed: string;
}

class EthereumWalletService {
    async getProvider(): Promise<BrowserProvider | null> {
        try {
            const walletProvider = (appKit as any).getWalletProvider();
            if (!walletProvider) throw new Error('No wallet provider available');
            return new BrowserProvider(walletProvider);
        } catch (error) {
            console.error('Error getting provider:', error);
            return null;
        }
    }

    async getTransactionReceipt(txHash: string): Promise<TransactionReceipt | null> {
        try {
            const provider = await this.getProvider();
            if (!provider) return null;

            const receipt = await provider.getTransactionReceipt(txHash);
            if (!receipt) return null;

            return {
                status: receipt.status || 0,
                blockNumber: receipt.blockNumber,
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString(),
            };
        } catch (error) {
            console.error('Error getting transaction receipt:', error);
            return null;
        }
    }

    async getSigner() {
        const provider = await this.getProvider();
        if (!provider) throw new Error('No provider available');
        return provider.getSigner();
    }

    async isConnectedToMezo(): Promise<boolean> {
        try {
            const provider = await this.getProvider();
            if (!provider) return false;
            const network = await provider.getNetwork();
            return Number(network.chainId) === MEZO_CHAIN_ID;
        } catch (error) {
            console.error('Error checking network:', error);
            return false;
        }
    }

    async switchToMezo(): Promise<boolean> {
        try {
            const walletProvider = (appKit as any).getWalletProvider();
            if (!walletProvider) return false;

            await walletProvider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${MEZO_CHAIN_ID.toString(16)}` }],
            });
            return true;
        } catch (error: any) {
            if (error.code === 4902) return await this.addMezoNetwork();
            console.error('Error switching network:', error);
            return false;
        }
    }

    async addMezoNetwork(): Promise<boolean> {
        try {
            const walletProvider = (appKit as any).getWalletProvider();
            if (!walletProvider) return false;

            await walletProvider.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: `0x${MEZO_CHAIN_ID.toString(16)}`,
                    chainName: 'Mezo Testnet',
                    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
                    rpcUrls: ['https://rpc.test.mezo.org'],
                    blockExplorerUrls: ['https://explorer.test.mezo.org'],
                }],
            });
            return true;
        } catch (error) {
            console.error('Error adding network:', error);
            return false;
        }
    }

    async getBalances(address: string): Promise<MezoBalances> {
        try {
            const provider = new BrowserProvider({
                request: async ({ method, params }: any) => {
                    const response = await fetch('https://rpc.test.mezo.org', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            jsonrpc: '2.0',
                            id: 1,
                            method,
                            params: params || []
                        })
                    });
                    const data = await response.json();
                    if (data.error) throw new Error(data.error.message);
                    return data.result;
                }
            } as any);

            const musdContract = new Contract(MUSD_TOKEN_ADDRESS, musdAbi, provider);

            const [btcBalanceRaw, musdBalanceRaw] = await Promise.all([
                provider.getBalance(address),
                musdContract.balanceOf(address)
            ]);

            console.log(`💰 Raw balances fetched:`, {
                btcRaw: btcBalanceRaw.toString(),
                musdRaw: musdBalanceRaw.toString(),
                btcFormatted: formatEther(btcBalanceRaw),
                musdFormatted: formatEther(musdBalanceRaw)
            });

            const result = {
                btcBalance: formatEther(btcBalanceRaw),
                musdBalance: formatEther(musdBalanceRaw),
                btcBalanceRaw,
                musdBalanceRaw
            };

            console.log(`✅ Returning balances:`, result);
            return result;
        } catch (error: any) {
            console.error('Error fetching balances:', error);
            throw new Error(`Failed to fetch balances: ${error?.message || 'Unknown error'}`);
        }
    }

    async borrowMUSD(params: BorrowParams): Promise<string> {
        try {
            const isMezo = await this.isConnectedToMezo();
            if (!isMezo) {
                const switched = await this.switchToMezo();
                if (!switched) throw new Error('Please switch to Mezo Testnet network');
            }

            const signer = await this.getSigner();
            const address = await signer.getAddress();
            const borrowerOperations = new Contract(BORROWER_OPERATIONS_ADDRESS, borrowerOperationsAbi, signer);

            const btcToDeposit = parseEther(params.btcAmount);
            const musdToBorrow = parseUnits(params.musdAmount, 18);
            const hint = "0x0000000000000000000000000000000000000000";

            const provider = await this.getProvider();
            if (!provider) throw new Error('No provider available');

            const balance = await provider.getBalance(address);
            if (balance < btcToDeposit) throw new Error('Insufficient BTC balance for deposit');

            const tx = await borrowerOperations.openTrove(musdToBorrow, hint, hint, { value: btcToDeposit });
            console.log(`Transaction sent! Hash: ${tx.hash}`);
            await tx.wait();
            return tx.hash;
        } catch (error: any) {
            console.error('Error borrowing MUSD:', error);
            if (error.message?.includes('insufficient funds')) {
                throw new Error('Insufficient BTC balance for transaction');
            } else if (error.message?.includes('user rejected')) {
                throw new Error('Transaction rejected by user');
            } else {
                throw new Error(error.message || 'Failed to borrow MUSD');
            }
        }
    }

    async hasMinimumBTCBalance(address: string): Promise<boolean> {
        try {
            const provider = await this.getProvider();
            if (!provider) return false;
            const balance = await provider.getBalance(address);
            const minRequired = parseEther("0.031");
            return balance >= minRequired;
        } catch (error) {
            console.error('Error checking BTC balance:', error);
            return false;
        }
    }

    getFaucetUrl(): string {
        return "https://faucet.test.mezo.org/";
    }

    getNetworkConfig() {
        return {
            chainId: MEZO_CHAIN_ID,
            rpcUrl: 'https://rpc.test.mezo.org',
            borrowerOperationsAddress: BORROWER_OPERATIONS_ADDRESS,
            musdTokenAddress: MUSD_TOKEN_ADDRESS
        };
    }
}

export default new EthereumWalletService();

