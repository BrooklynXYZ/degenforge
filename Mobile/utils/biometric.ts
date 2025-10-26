/**
 * Biometric authentication utility
 * Handles Face ID / Touch ID authentication
 */

import * as LocalAuthentication from 'expo-local-authentication';
import { Platform } from 'react-native';

export interface BiometricCapability {
  isAvailable: boolean;
  biometricType: 'faceId' | 'touchId' | 'iris' | 'fingerprint' | 'none';
  isEnrolled: boolean;
}

/**
 * Check if biometric authentication is available on the device
 */
export const checkBiometricCapability = async (): Promise<BiometricCapability> => {
  try {
    const compatible = await LocalAuthentication.hasHardwareAsync();

    if (!compatible) {
      return {
        isAvailable: false,
        biometricType: 'none',
        isEnrolled: false,
      };
    }

    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    // Determine biometric type
    let biometricType: BiometricCapability['biometricType'] = 'none';

    if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      biometricType = Platform.OS === 'ios' ? 'faceId' : 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      biometricType = Platform.OS === 'ios' ? 'touchId' : 'fingerprint';
    } else if (supportedTypes.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      biometricType = 'iris';
    }

    return {
      isAvailable: compatible && enrolled,
      biometricType,
      isEnrolled: enrolled,
    };
  } catch (error) {
    console.error('Error checking biometric capability:', error);
    return {
      isAvailable: false,
      biometricType: 'none',
      isEnrolled: false,
    };
  }
};

/**
 * Authenticate using biometrics
 */
export const authenticateWithBiometric = async (): Promise<{
  success: boolean;
  error?: string;
}> => {
  try {
    const capability = await checkBiometricCapability();

    if (!capability.isAvailable) {
      return {
        success: false,
        error: capability.isEnrolled
          ? 'Biometric authentication is not available on this device'
          : 'No biometric data enrolled. Please set up Face ID or Touch ID in your device settings.',
      };
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to access Ghala',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
      fallbackLabel: 'Use Passcode',
    });

    if (result.success) {
      return { success: true };
    } else {
      return {
        success: false,
        error: result.error || 'Authentication failed',
      };
    }
  } catch (error: any) {
    console.error('Error during biometric authentication:', error);
    return {
      success: false,
      error: error.message || 'An unexpected error occurred',
    };
  }
};

/**
 * Get user-friendly biometric type name
 */
export const getBiometricTypeName = (type: BiometricCapability['biometricType']): string => {
  switch (type) {
    case 'faceId':
      return 'Face ID';
    case 'touchId':
      return 'Touch ID';
    case 'fingerprint':
      return 'Fingerprint';
    case 'iris':
      return 'Iris Scanner';
    default:
      return 'Biometric';
  }
};

/**
 * Get prompt message based on biometric type
 */
export const getBiometricPromptMessage = (type: BiometricCapability['biometricType']): string => {
  const typeName = getBiometricTypeName(type);
  return `Use ${typeName} to unlock Ghala`;
};

/**
 * Get icon name for biometric type (for UI display)
 */
export const getBiometricIcon = (type: BiometricCapability['biometricType']): string => {
  switch (type) {
    case 'faceId':
      return '👤';
    case 'touchId':
    case 'fingerprint':
      return '👆';
    case 'iris':
      return '👁️';
    default:
      return '🔐';
  }
};
