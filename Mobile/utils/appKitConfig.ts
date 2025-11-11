import '@walletconnect/react-native-compat';
import { createAppKit } from '@reown/appkit-react-native';
import { SolanaAdapter, PhantomConnector } from '@reown/appkit-solana-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
    getKeys: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            return keys.filter(k => k.startsWith('wc@2') || k.startsWith('@appkit'));
        } catch {
            return [];
        }
    },
    getEntries: async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const relevantKeys = keys.filter(k => k.startsWith('wc@2') || k.startsWith('@appkit'));
            const entries = await AsyncStorage.multiGet(relevantKeys);

            return entries
                .map(([key, value]): [string, any] => {
                    if (!value) return [key, undefined];
                    try {
                        return [key, JSON.parse(value)];
                    } catch {
                        return [key, undefined];
                    }
                })
                .filter(([, value]) => value !== undefined);
        } catch {
            return [];
        }
    },
    setItem: async (key: string, value: any) => {
        try {
            await AsyncStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error('Storage setItem error:', error);
        }
    },
    getItem: async (key: string) => {
        try {
            const item = await AsyncStorage.getItem(key);
            if (!item) return undefined;
            return JSON.parse(item);
        } catch {
            return undefined;
        }
    },
    removeItem: async (key: string) => {
        try {
            await AsyncStorage.removeItem(key);
        } catch (error) {
            console.error('Storage removeItem error:', error);
        }
    },
};

const mainnet = {
    id: 1,
    chainId: 1,
    name: 'Ethereum',
    chainNamespace: 'eip155' as const,
    currency: 'ETH',
    explorerUrl: 'https://etherscan.io',
    rpcUrl: 'https://cloudflare-eth.com',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://cloudflare-eth.com'] } }
};

const sepolia = {
    id: 11155111,
    chainId: 11155111,
    name: 'Sepolia',
    chainNamespace: 'eip155' as const,
    currency: 'ETH',
    explorerUrl: 'https://sepolia.etherscan.io',
    rpcUrl: 'https://rpc.sepolia.org',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } }
};

const mezoTestnet = {
    id: 31611,
    chainId: 31611,
    name: 'Mezo Testnet',
    chainNamespace: 'eip155' as const,
    currency: 'BTC',
    explorerUrl: 'https://explorer.test.mezo.org',
    rpcUrl: 'https://rpc.test.mezo.org',
    nativeCurrency: { name: 'Bitcoin', symbol: 'BTC', decimals: 18 },
    rpcUrls: { default: { http: ['https://rpc.test.mezo.org'] } }
};

const solanaMainnet = {
    id: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    chainId: '5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp',
    name: 'Solana',
    chainNamespace: 'solana' as const,
    currency: 'SOL',
    explorerUrl: 'https://solscan.io',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrls: { default: { http: ['https://api.mainnet-beta.solana.com'] } }
};

const solanaDevnet = {
    id: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    chainId: 'EtWTRABZaYq6iMfeYKouRu166VU2xqa1',
    name: 'Solana Devnet',
    chainNamespace: 'solana' as const,
    currency: 'SOL',
    explorerUrl: 'https://solscan.io/?cluster=devnet',
    rpcUrl: 'https://api.devnet.solana.com',
    nativeCurrency: { name: 'Solana', symbol: 'SOL', decimals: 9 },
    rpcUrls: { default: { http: ['https://api.devnet.solana.com'] } }
};

const solanaAdapter = new SolanaAdapter();
const ethersAdapter = new EthersAdapter();

export const appKit = createAppKit({
    projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',
    storage,
    metadata: {
        name: 'Ghala',
        description: 'Transform your Bitcoin into productive capital with MUSD',
        url: 'https://ghala.app',
        icons: ['https://ghala.app/icon.png'],
        redirect: { native: 'ghala://' },
    },
    adapters: [ethersAdapter, solanaAdapter],
    networks: [mezoTestnet, sepolia, solanaDevnet, mainnet, solanaMainnet],
    defaultNetwork: mezoTestnet,
    extraConnectors: [new PhantomConnector({ cluster: 'mainnet-beta' })],
    featuredWalletIds: [
        'a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393',
        'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96',
    ],
    enableAnalytics: true,
    features: { allWallets: false } as any,
});
