import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { SESSION_CONFIG } from '../constants/walletConfig';

export interface UserProfile {
  username?: string;
  walletAddress: string;
  createdAt: number;
}

interface AuthContextType {
  // State
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  walletAddress: string | null;
  hasSeenOnboarding: boolean;
  biometricEnabled: boolean;

  // Auth actions
  login: (walletAddress: string, profile?: Partial<UserProfile>) => Promise<void>;
  logout: () => Promise<void>;

  // Onboarding
  markOnboardingSeen: () => Promise<void>;

  // Biometric
  enableBiometric: () => Promise<void>;
  disableBiometric: () => Promise<void>;

  // User profile
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Initialize auth state on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      setIsLoading(true);

      // Check if user has seen onboarding
      const onboardingSeen = await AsyncStorage.getItem(
        SESSION_CONFIG.storageKeys.hasSeenOnboarding
      );
      setHasSeenOnboarding(onboardingSeen === 'true');

      // Check biometric preference
      const biometricPref = await AsyncStorage.getItem(
        SESSION_CONFIG.storageKeys.biometricEnabled
      );
      setBiometricEnabled(biometricPref === 'true');

      // Check if user has active session
      const rememberMe = await AsyncStorage.getItem(
        SESSION_CONFIG.storageKeys.rememberMe
      );
      const lastLogin = await AsyncStorage.getItem(
        SESSION_CONFIG.storageKeys.lastLoginTimestamp
      );

      if (rememberMe === 'true' && lastLogin) {
        const lastLoginTime = parseInt(lastLogin, 10);
        const now = Date.now();
        const sessionExpired = now - lastLoginTime > SESSION_CONFIG.sessionDuration;

        if (!sessionExpired) {
          // Restore session
          const storedAddress = await SecureStore.getItemAsync(
            SESSION_CONFIG.secureKeys.walletAddress
          );
          const storedProfile = await AsyncStorage.getItem(
            SESSION_CONFIG.storageKeys.userProfile
          );

          if (storedAddress) {
            setWalletAddress(storedAddress);
            setUser(storedProfile ? JSON.parse(storedProfile) : null);
            setIsAuthenticated(true);
          }
        } else {
          // Session expired, clear data
          await logout();
        }
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (address: string, profile?: Partial<UserProfile>) => {
    try {
      setIsLoading(true);

      // Store wallet address securely
      await SecureStore.setItemAsync(SESSION_CONFIG.secureKeys.walletAddress, address);

      // Create or update user profile
      const userProfile: UserProfile = {
        walletAddress: address,
        username: profile?.username,
        createdAt: profile?.createdAt || Date.now(),
      };

      await AsyncStorage.setItem(
        SESSION_CONFIG.storageKeys.userProfile,
        JSON.stringify(userProfile)
      );

      // Update session info
      await AsyncStorage.setItem(SESSION_CONFIG.storageKeys.rememberMe, 'true');
      await AsyncStorage.setItem(
        SESSION_CONFIG.storageKeys.lastLoginTimestamp,
        Date.now().toString()
      );

      setWalletAddress(address);
      setUser(userProfile);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);

      // Clear secure storage
      await SecureStore.deleteItemAsync(SESSION_CONFIG.secureKeys.walletAddress);

      // Clear async storage (except onboarding flag)
      await AsyncStorage.multiRemove([
        SESSION_CONFIG.storageKeys.rememberMe,
        SESSION_CONFIG.storageKeys.lastLoginTimestamp,
        SESSION_CONFIG.storageKeys.userProfile,
      ]);

      setWalletAddress(null);
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const markOnboardingSeen = async () => {
    try {
      await AsyncStorage.setItem(SESSION_CONFIG.storageKeys.hasSeenOnboarding, 'true');
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error('Error marking onboarding as seen:', error);
    }
  };

  const enableBiometric = async () => {
    try {
      await AsyncStorage.setItem(SESSION_CONFIG.storageKeys.biometricEnabled, 'true');
      setBiometricEnabled(true);
    } catch (error) {
      console.error('Error enabling biometric:', error);
      throw error;
    }
  };

  const disableBiometric = async () => {
    try {
      await AsyncStorage.setItem(SESSION_CONFIG.storageKeys.biometricEnabled, 'false');
      setBiometricEnabled(false);
    } catch (error) {
      console.error('Error disabling biometric:', error);
      throw error;
    }
  };

  const updateProfile = async (profileUpdates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('No user logged in');

      const updatedProfile: UserProfile = {
        ...user,
        ...profileUpdates,
      };

      await AsyncStorage.setItem(
        SESSION_CONFIG.storageKeys.userProfile,
        JSON.stringify(updatedProfile)
      );

      setUser(updatedProfile);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    user,
    walletAddress,
    hasSeenOnboarding,
    biometricEnabled,
    login,
    logout,
    markOnboardingSeen,
    enableBiometric,
    disableBiometric,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
