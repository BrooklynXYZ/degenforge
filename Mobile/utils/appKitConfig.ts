import '@walletconnect/react-native-compat';
import { createAppKit } from '@reown/appkit-react-native';
import { SolanaAdapter, PhantomConnector, SolflareConnector } from '@reown/appkit-solana-react-native';
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

const solanaMainnet = {
    id: 'solana:5eykt4UsFv8P8NJdTREpY1vzqKqZKvdp' as const,
    name: 'Solana',
    chainNamespace: 'solana' as const,
    nativeCurrency: { decimals: 9, name: 'Solana', symbol: 'SOL' },
    rpcUrls: { default: { http: ['https://api.mainnet-beta.solana.com'] } },
    blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io' } },
    testnet: false,
};

const solanaDevnet = {
    id: 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1' as const,
    name: 'Solana Devnet',
    chainNamespace: 'solana' as const,
    nativeCurrency: { decimals: 9, name: 'Solana', symbol: 'SOL' },
    rpcUrls: { default: { http: ['https://api.devnet.solana.com'] } },
    blockExplorers: { default: { name: 'Solscan', url: 'https://solscan.io/?cluster=devnet' } },
    testnet: true,
};

const solanaAdapter = new SolanaAdapter();

export const appKit = createAppKit({
    projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',
    storage,
    metadata: {
        name: 'Ghala',
        description: 'Transform your Bitcoin into productive capital with MUSD',
        url: 'https://ghala.app',
        icons: ['https://ghala.app/icon.png'],
        redirect: {
            native: 'ghala://',
            universal: 'https://ghala.app',
        },
    },
    adapters: [solanaAdapter],
    networks: [solanaMainnet, solanaDevnet],
    defaultNetwork: solanaMainnet,
    extraConnectors: [
        new PhantomConnector({
            cluster: 'mainnet-beta',
        }),
        new SolflareConnector({
            cluster: 'mainnet-beta',
        }),
    ],
    featuredWalletIds: ['a797aa35c0fadbfc1a53e7f675162ed5226968b44a19ee3d24385c64d1d3c393'],
    enableAnalytics: true,
});