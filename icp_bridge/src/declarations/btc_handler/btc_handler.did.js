export const idlFactory = ({ IDL }) => {
  const CanisterStats = IDL.Record({
    'network' : IDL.Text,
    'key_name' : IDL.Text,
    'total_addresses_generated' : IDL.Nat64,
  });
  const UTXOInfo = IDL.Record({
    'height' : IDL.Nat64,
    'value' : IDL.Nat64,
    'outpoint' : IDL.Vec(IDL.Nat8),
  });
  return IDL.Service({
    'generate_btc_address' : IDL.Func([], [IDL.Text], []),
    'get_btc_balance' : IDL.Func([IDL.Text], [IDL.Nat64], []),
    'get_canister_stats' : IDL.Func([], [CanisterStats], ['query']),
    'get_my_btc_address' : IDL.Func([], [IDL.Text], ['query']),
    'get_utxos' : IDL.Func([IDL.Text], [IDL.Vec(UTXOInfo)], []),
    'send_btc' : IDL.Func([IDL.Text, IDL.Nat64], [IDL.Text], []),
    'sign_transaction' : IDL.Func([IDL.Vec(IDL.Nat8)], [IDL.Vec(IDL.Nat8)], []),
  });
};
export const init = ({ IDL }) => { return []; };
