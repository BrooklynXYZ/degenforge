/**
 * Wallet Configuration for Reown/WalletConnect
 * Mezo Network Configuration
 */

export const WALLET_CONFIG = {
  // Get your project ID from https://cloud.walletconnect.com
  projectId: process.env.EXPO_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID_HERE',

  // Mezo Testnet Configuration
  mezoTestnet: {
    chainId: 59902, // Mezo testnet chain ID
    name: 'Mezo Testnet',
    currency: 'BTC',
    explorerUrl: 'https://explorer.mezo.org',
    rpcUrl: 'https://testnet.mezo.io/rpc',
  },

  // Metadata for your app
  metadata: {
    name: 'Ghala',
    description: 'Transform your Bitcoin into productive capital with MUSD',
    url: 'https://ghala.app',
    icons: ['https://ghala.app/icon.png'],
  },

  // Supported wallet IDs (optional - shows these wallets first)
  recommendedWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '1ae92b26df02f0abca6304df07debccd18262fdf5fe82daa81593582dac9a369', // Rainbow
    'fd20dc426fb37566d803205b19bbc1d4096b248ac04548e3cfb6b3a38bd033aa', // Coinbase Wallet
  ],
};

// Chain configuration for WalletConnect
export const chains = [
  {
    chainId: WALLET_CONFIG.mezoTestnet.chainId,
    name: WALLET_CONFIG.mezoTestnet.name,
    currency: WALLET_CONFIG.mezoTestnet.currency,
    explorerUrl: WALLET_CONFIG.mezoTestnet.explorerUrl,
    rpcUrl: WALLET_CONFIG.mezoTestnet.rpcUrl,
  },
];

// Session configuration
export const SESSION_CONFIG = {
  // How long to keep user logged in (in milliseconds)
  sessionDuration: 7 * 24 * 60 * 60 * 1000, // 7 days

  // AsyncStorage keys
  storageKeys: {
    hasSeenOnboarding: '@ghala/hasSeenOnboarding',
    biometricEnabled: '@ghala/biometricEnabled',
    rememberMe: '@ghala/rememberMe',
    userProfile: '@ghala/userProfile',
    lastLoginTimestamp: '@ghala/lastLoginTimestamp',
  },

  // SecureStore keys (encrypted)
  secureKeys: {
    walletAddress: '@ghala/secure/walletAddress',
    sessionToken: '@ghala/secure/sessionToken',
  },
};
