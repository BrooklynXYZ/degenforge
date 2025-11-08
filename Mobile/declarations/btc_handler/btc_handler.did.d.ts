import type { Principal } from '@dfinity/principal';
import type { ActorMethod } from '@dfinity/agent';
import type { IDL } from '@dfinity/candid';

export interface CanisterStats {
  'network' : string,
  'key_name' : string,
  'total_addresses_generated' : bigint,
}
export interface UTXOInfo {
  'height' : bigint,
  'value' : bigint,
  'outpoint' : Uint8Array | number[],
}
export interface _SERVICE {
  'generate_btc_address' : ActorMethod<[], string>,
  'get_btc_balance' : ActorMethod<[string], bigint>,
  'get_canister_stats' : ActorMethod<[], CanisterStats>,
  'get_my_btc_address' : ActorMethod<[], string>,
  'get_utxos' : ActorMethod<[string], Array<UTXOInfo>>,
  'send_btc' : ActorMethod<[string, bigint], string>,
  'sign_transaction' : ActorMethod<
    [Uint8Array | number[]],
    Uint8Array | number[]
  >,
}
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
