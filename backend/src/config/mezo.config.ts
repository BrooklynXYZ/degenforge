import { MezoConfig } from '@/types';
import { config } from './env';

// Mezo testnet configuration
export const mezoConfig: MezoConfig = {
  rpcUrl: config.mezo.rpcUrl,
  privateKey: config.mezo.privateKey,
  apiKey: config.mezo.apiKey,
  chainId: config.mezo.chainId,
  musdTokenAddress: config.mezo.musdTokenAddress,
  borrowManagerAddress: config.mezo.borrowManagerAddress,
};

// Contract ABIs - These will be updated once we get the actual ABIs from Mezo
export const contractABIs = {
  // BorrowManager contract ABI (placeholder - needs to be updated with actual ABI)
  borrowManager: [
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        }
      ],
      "name": "depositCollateral",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "musdAmount",
          "type": "uint256"
        }
      ],
      "name": "mintMUSD",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        }
      ],
      "name": "getUserPosition",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "collateralAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "debtAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "ltv",
              "type": "uint256"
            }
          ],
          "internalType": "struct BorrowManager.UserPosition",
          "name": "",
          "type": "tuple"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "collateralAmount",
          "type": "uint256"
        }
      ],
      "name": "calculateMaxMintable",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const,

  // mUSD Token contract ABI (placeholder - needs to be updated with actual ABI)
  musdToken: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "account",
          "type": "address"
        }
      ],
      "name": "balanceOf",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "totalSupply",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ] as const
};

// Mezo network parameters
export const mezoConstants = {
  // LTV parameters
  MAX_LTV: 90, // 90% maximum LTV
  MIN_COLLATERAL_USD: 1800, // Minimum $1,800 USD collateral
  
  // Interest rates
  INTEREST_RATE: 1, // 1% APR
  
  // Gas settings
  GAS_LIMIT: 300000,
  GAS_PRICE_GWEI: 20,
  
  // Contract addresses (testnet)
  BTC_ADDRESS: '0x0000000000000000000000000000000000000000', // Native BTC on Mezo
  WRAPPED_BTC_ADDRESS: '0x1234567890abcdef1234567890abcdef12345678', // To be updated
  
  // Decimals
  BTC_DECIMALS: 18,
  MUSD_DECIMALS: 18,
} as const;

// Event topics for monitoring
export const eventTopics = {
  COLLATERAL_DEPOSITED: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef12',
  MUSDMINTED: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab',
  POSITION_UPDATED: '0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234',
} as const;

export default mezoConfig;
