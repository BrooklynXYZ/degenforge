/**
 * Get the ICP host URL for local development
 * Supports WSL IP address via environment variable
 * Defaults to localhost:4943 if WSL_IP is not set
 */
function getLocalICPHost(): string {
  const wslIp = process.env.EXPO_PUBLIC_WSL_IP;
  const port = process.env.EXPO_PUBLIC_ICP_PORT || '4943';
  
  if (wslIp) {
    return `http://${wslIp}:${port}`;
  }
  
  // Fallback to localhost for same-machine development
  return `http://localhost:${port}`;
}

// Placeholder canister IDs (for development only)
const PLACEHOLDER_IDS = {
  BTC_HANDLER: 'u6s2n-gx777-77774-qaaba-cai',
  BRIDGE_ORCHESTRATOR: 'uxrrr-q7777-77774-qaaaq-cai',
  SOLANA_CANISTER: 'uzt4z-lp777-77774-qaabq-cai',
};

export const CANISTER_CONFIG = {
  BTC_HANDLER: process.env.EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID || PLACEHOLDER_IDS.BTC_HANDLER,
  BRIDGE_ORCHESTRATOR: process.env.EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID || PLACEHOLDER_IDS.BRIDGE_ORCHESTRATOR,
  SOLANA_CANISTER: process.env.EXPO_PUBLIC_SOLANA_CANISTER_ID || PLACEHOLDER_IDS.SOLANA_CANISTER,
  ICP_HOST: process.env.EXPO_PUBLIC_ICP_HOST || (__DEV__ ? getLocalICPHost() : 'https://icp-api.io'),
};

export function validateCanisterConfig(): boolean {
  const { BTC_HANDLER, BRIDGE_ORCHESTRATOR, SOLANA_CANISTER } = CANISTER_CONFIG;
  
  if (!BTC_HANDLER || !BRIDGE_ORCHESTRATOR || !SOLANA_CANISTER) {
    // Use console.error here as logger may not be initialized yet
    if (__DEV__) {
      console.error('Missing canister IDs');
    }
    return false;
  }
  
  // Check if using placeholder IDs in production (warning)
  if (!__DEV__) {
    const isUsingPlaceholders = 
      BTC_HANDLER === PLACEHOLDER_IDS.BTC_HANDLER ||
      BRIDGE_ORCHESTRATOR === PLACEHOLDER_IDS.BRIDGE_ORCHESTRATOR ||
      SOLANA_CANISTER === PLACEHOLDER_IDS.SOLANA_CANISTER;
    
    if (isUsingPlaceholders) {
      console.warn(
        '⚠️ WARNING: Using placeholder canister IDs in production build!\n' +
        'Please set production canister IDs in .env.production or environment variables.\n' +
        'Run: cd ../icp_bridge && ./deploy-mainnet.sh to deploy and get production IDs.'
      );
    }
  }
  
  // Only log in dev mode to avoid excessive logging
  if (__DEV__) {
    console.log('Canister config loaded:', { BTC_HANDLER, BRIDGE_ORCHESTRATOR, SOLANA_CANISTER, ICP_HOST: CANISTER_CONFIG.ICP_HOST });
  }
  return true;
}

