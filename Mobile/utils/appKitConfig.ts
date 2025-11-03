import '@walletconnect/react-native-compat';
import { createAppKit } from '@reown/appkit-react-native';
import { SolanaAdapter, PhantomConnector } from '@reown/appkit-solana-react-native';
import { EthersAdapter } from '@reown/appkit-ethers-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const storage = {
    getKeys: async () => {
        const keys = await AsyncStorage.getAllKeys();
        return keys as string[];
    },
    getEntries: async () => {
        const keys = await AsyncStorage.getAllKeys();
        const entries = await AsyncStorage.multiGet(keys);
        return entries.map(([key, value]) => [key, JSON.parse(value || 'null')] as [string, any]);
    },
    setItem: async (key: string, value: any) => await AsyncStorage.setItem(key, JSON.stringify(value)),
    getItem: async (key: string) => {
        const item = await AsyncStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    },
    removeItem: async (key: string) => await AsyncStorage.removeItem(key),
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
