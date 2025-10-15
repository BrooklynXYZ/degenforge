import dotenv from 'dotenv';
import Joi from 'joi';

// Load environment variables
dotenv.config();

// Environment validation schema
const envSchema = Joi.object({
  // Mezo Configuration
  MEZO_TESTNET_RPC_ENDPOINT: Joi.string().uri().required(),
  MEZO_PRIVATE_KEY: Joi.string().pattern(/^0x[a-fA-F0-9]{64}$/).required(),
  MEZO_API_KEY: Joi.string().min(1).required(),
  
  // Contract Addresses
  MUSD_TOKEN_ADDRESS: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).required(),
  MUSD_BORROW_MANAGER_ADDRESS: Joi.string().pattern(/^0x[a-fA-F0-9]{40}$/).allow('<to_be_found>').default('0x0000000000000000000000000000000000000000'),
  
  // Network Configuration
  PORT: Joi.number().port().default(3001),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  
  // JWT Configuration
  JWT_SECRET: Joi.string().min(32).required(),
  JWT_EXPIRES_IN: Joi.string().default('24h'),
  
  // Logging
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
}).unknown();

// Validate environment variables
const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

// Export validated configuration
export const config = {
  mezo: {
    rpcUrl: envVars.MEZO_TESTNET_RPC_ENDPOINT,
    privateKey: envVars.MEZO_PRIVATE_KEY,
    apiKey: envVars.MEZO_API_KEY,
    chainId: 123456, // Mezo testnet chain ID - to be verified
    musdTokenAddress: envVars.MUSD_TOKEN_ADDRESS,
    borrowManagerAddress: envVars.MUSD_BORROW_MANAGER_ADDRESS,
  },
  server: {
    port: envVars.PORT,
    nodeEnv: envVars.NODE_ENV,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expiresIn: envVars.JWT_EXPIRES_IN,
  },
  logging: {
    level: envVars.LOG_LEVEL,
  },
} as const;

// Mezo network configuration
export const mezoNetworkConfig = {
  chainId: config.mezo.chainId,
  name: 'Mezo Testnet',
  rpcUrls: [config.mezo.rpcUrl],
  blockExplorerUrls: ['https://explorer.mezo.org'], // To be verified
  nativeCurrency: {
    name: 'Bitcoin',
    symbol: 'BTC',
    decimals: 18,
  },
};

export default config;
