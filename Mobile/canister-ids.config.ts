export const CANISTER_CONFIG = {
  BTC_HANDLER: process.env.EXPO_PUBLIC_BTC_HANDLER_CANISTER_ID || 'u6s2n-gx777-77774-qaaba-cai',
  BRIDGE_ORCHESTRATOR: process.env.EXPO_PUBLIC_BRIDGE_ORCHESTRATOR_CANISTER_ID || 'uxrrr-q7777-77774-qaaaq-cai',
  SOLANA_CANISTER: process.env.EXPO_PUBLIC_SOLANA_CANISTER_ID || 'uzt4z-lp777-77774-qaabq-cai',
  ICP_HOST: process.env.EXPO_PUBLIC_ICP_HOST || (__DEV__ ? 'http://localhost:4943' : 'https://icp-api.io'),
};

export function validateCanisterConfig(): boolean {
  const { BTC_HANDLER, BRIDGE_ORCHESTRATOR, SOLANA_CANISTER } = CANISTER_CONFIG;
  
  if (!BTC_HANDLER || !BRIDGE_ORCHESTRATOR || !SOLANA_CANISTER) {
    console.error('❌ Missing canister IDs');
    return false;
  }
  
  console.log('✅ Canister config loaded:', { BTC_HANDLER, BRIDGE_ORCHESTRATOR, SOLANA_CANISTER, ICP_HOST: CANISTER_CONFIG.ICP_HOST });
  return true;
}

