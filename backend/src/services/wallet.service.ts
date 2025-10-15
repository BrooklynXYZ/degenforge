import { ethers } from 'ethers';
import jwt from 'jsonwebtoken';
import { config } from '@/config/env';
import { WalletAuthRequest, AuthResponse, WalletNotConnectedError } from '@/types';

export class WalletService {
  private jwtSecret: string;
  private jwtExpiresIn: string;

  constructor() {
    this.jwtSecret = config.jwt.secret;
    this.jwtExpiresIn = config.jwt.expiresIn;
  }

  /**
   * Verify wallet signature and authenticate user
   */
  async authenticateWallet(request: WalletAuthRequest): Promise<AuthResponse> {
    try {
      const { address, signature, message, walletType } = request;

      // Validate wallet type
      if (!['mezo-passport', 'phantom'].includes(walletType)) {
        throw new Error('Invalid wallet type');
      }

      // Verify signature based on wallet type
      const isValidSignature = await this.verifySignature(address, signature, message, walletType);
      
      if (!isValidSignature) {
        throw new WalletNotConnectedError('Invalid wallet signature');
      }

      // Generate JWT token
      const token = this.generateJWTToken(address, walletType);

      return {
        token,
        expiresIn: this.jwtExpiresIn,
        user: {
          address,
          walletType
        }
      };

    } catch (error) {
      console.error('❌ Wallet authentication failed:', error);
      throw error;
    }
  }

  /**
   * Verify wallet signature using ethers.js
   */
  private async verifySignature(
    address: string, 
    signature: string, 
    message: string, 
    walletType: string
  ): Promise<boolean> {
    try {
      // For Mezo Passport (EVM-compatible)
      if (walletType === 'mezo-passport') {
        const recoveredAddress = ethers.verifyMessage(message, signature);
        return recoveredAddress.toLowerCase() === address.toLowerCase();
      }

      // For Phantom Wallet (Solana)
      if (walletType === 'phantom') {
        // TODO: Implement Solana signature verification
        // This would require @solana/web3.js and proper message verification
        console.warn('⚠️ Phantom wallet verification not yet implemented');
        return true; // Placeholder for now
      }

      return false;
    } catch (error) {
      console.error('❌ Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Generate JWT token for authenticated user
   */
  private generateJWTToken(address: string, walletType: string): string {
    const payload = {
      address: address.toLowerCase(),
      walletType,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + this.parseExpirationTime(this.jwtExpiresIn)
    };

    return jwt.sign(payload, this.jwtSecret, { algorithm: 'HS256' });
  }

  /**
   * Verify JWT token
   */
  async verifyJWTToken(token: string): Promise<{ address: string; walletType: string }> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      return {
        address: decoded.address,
        walletType: decoded.walletType
      };
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Generate message for wallet signing
   */
  generateSignMessage(address: string, timestamp: number): string {
    return `DegenForge Authentication\n\nWallet: ${address}\nTimestamp: ${timestamp}\n\nSign this message to authenticate with DegenForge BTC Yield Maximizer.`;
  }

  /**
   * Parse JWT expiration time string to seconds
   */
  private parseExpirationTime(expiresIn: string): number {
    const timeUnits: { [key: string]: number } = {
      s: 1,
      m: 60,
      h: 3600,
      d: 86400
    };

    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) {
      return 86400; // Default to 24 hours
    }

    const value = parseInt(match[1]);
    const unit = match[2];
    
    return value * timeUnits[unit];
  }

  /**
   * Extract address from token without verification (for logging)
   */
  extractAddressFromToken(token: string): string | null {
    try {
      const decoded = jwt.decode(token) as any;
      return decoded?.address || null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string): boolean {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) {
        return true;
      }
      
      return Date.now() >= decoded.exp * 1000;
    } catch (error) {
      return true;
    }
  }

  /**
   * Refresh JWT token
   */
  async refreshToken(token: string): Promise<AuthResponse> {
    try {
      const userData = await this.verifyJWTToken(token);
      const newToken = this.generateJWTToken(userData.address, userData.walletType);

      return {
        token: newToken,
        expiresIn: this.jwtExpiresIn,
        user: userData
      };
    } catch (error) {
      throw new Error('Cannot refresh invalid token');
    }
  }

  /**
   * Validate wallet address format
   */
  isValidAddress(address: string, walletType: string): boolean {
    try {
      if (walletType === 'mezo-passport') {
        // EVM address validation
        return ethers.isAddress(address);
      }
      
      if (walletType === 'phantom') {
        // Solana address validation (base58, 32-44 characters)
        return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get wallet type from address format
   */
  detectWalletType(address: string): 'mezo-passport' | 'phantom' | null {
    if (ethers.isAddress(address)) {
      return 'mezo-passport';
    }
    
    if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
      return 'phantom';
    }
    
    return null;
  }

  /**
   * Format address for display
   */
  formatAddress(address: string): string {
    if (!address) return '';
    
    // Check if it's a valid EVM address
    try {
      if (ethers.isAddress(address)) {
        return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
      }
    } catch {
      // Not an EVM address, continue with other formatting
    }
    
    // For other address types (like Solana)
    if (address.length > 16) {
      return `${address.substring(0, 8)}...${address.substring(address.length - 8)}`;
    }
    
    return address;
  }
}

// Export singleton instance
export const walletService = new WalletService();
