import React, { createContext, useContext, ReactNode } from 'react';
import { AppKitProvider, useAppKit, useAccount, AppKit } from '@reown/appkit-react-native';
import { appKit } from '../utils/appKitConfig';

interface WalletContextType {
  address: string | undefined;
  isConnected: boolean;
  open: () => void;
  close: () => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <AppKitProvider instance={appKit}>
      <WalletProviderInner>{children}</WalletProviderInner>
      <AppKit />
    </AppKitProvider>
  );
};

const WalletProviderInner: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { open, close } = useAppKit();
  const { address, isConnected } = useAccount();

  return <WalletContext.Provider value={{ address, isConnected, open, close }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) throw new Error('useWallet must be used within WalletProvider');
  return context;
};