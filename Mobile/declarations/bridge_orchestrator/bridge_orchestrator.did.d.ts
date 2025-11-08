import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface BridgePosition {
  'status' : string,
  'sol_address' : string,
  'user' : Principal,
  'musd_minted' : bigint,
  'btc_collateral' : bigint,
  'sol_deployed' : bigint,
  'btc_address' : string,
}
export interface BridgeStats {
  'total_musd_minted' : bigint,
  'total_btc_collateral' : bigint,
  'total_sol_deployed' : bigint,
  'interest_rate' : bigint,
  'max_ltv' : bigint,
  'total_positions' : bigint,
}
export interface DepositResponse {
  'status' : string,
  'message' : string,
  'btc_address' : string,
}
export interface MintResponse {
  'new_ltv' : string,
  'status' : string,
  'transaction_hash' : string,
  'musd_amount' : bigint,
}
export interface _SERVICE {
  'bridge_musd_to_solana' : ActorMethod<[bigint], string>,
  'calculate_max_mintable' : ActorMethod<[bigint], bigint>,
  'deploy_to_yield_protocol' : ActorMethod<[bigint, string], string>,
  'deposit_btc_for_musd' : ActorMethod<[bigint], DepositResponse>,
  'get_bridge_stats' : ActorMethod<[], BridgeStats>,
  'get_my_position' : ActorMethod<[], BridgePosition>,
  'get_position' : ActorMethod<[Principal], BridgePosition>,
  'mint_musd_on_mezo' : ActorMethod<[bigint], MintResponse>,
  'set_canister_ids' : ActorMethod<[string, string], string>,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
