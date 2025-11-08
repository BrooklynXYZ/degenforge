export const idlFactory = ({ IDL }) => {
  const DepositResponse = IDL.Record({
    'status' : IDL.Text,
    'message' : IDL.Text,
    'btc_address' : IDL.Text,
  });
  const BridgeStats = IDL.Record({
    'total_musd_minted' : IDL.Nat64,
    'total_btc_collateral' : IDL.Nat64,
    'total_sol_deployed' : IDL.Nat64,
    'interest_rate' : IDL.Nat64,
    'max_ltv' : IDL.Nat64,
    'total_positions' : IDL.Nat64,
  });
  const BridgePosition = IDL.Record({
    'status' : IDL.Text,
    'sol_address' : IDL.Text,
    'user' : IDL.Principal,
    'musd_minted' : IDL.Nat64,
    'btc_collateral' : IDL.Nat64,
    'sol_deployed' : IDL.Nat64,
    'btc_address' : IDL.Text,
  });
  const MintResponse = IDL.Record({
    'new_ltv' : IDL.Text,
    'status' : IDL.Text,
    'transaction_hash' : IDL.Text,
    'musd_amount' : IDL.Nat64,
  });
  return IDL.Service({
    'bridge_musd_to_solana' : IDL.Func([IDL.Nat64], [IDL.Text], []),
    'calculate_max_mintable' : IDL.Func([IDL.Nat64], [IDL.Nat64], ['query']),
    'deploy_to_yield_protocol' : IDL.Func(
        [IDL.Nat64, IDL.Text],
        [IDL.Text],
        [],
      ),
    'deposit_btc_for_musd' : IDL.Func([IDL.Nat64], [DepositResponse], []),
    'get_bridge_stats' : IDL.Func([], [BridgeStats], ['query']),
    'get_my_position' : IDL.Func([], [BridgePosition], ['query']),
    'get_position' : IDL.Func([IDL.Principal], [BridgePosition], ['query']),
    'mint_musd_on_mezo' : IDL.Func([IDL.Nat64], [MintResponse], []),
    'set_canister_ids' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
  });
};
export const init = ({ IDL }) => { return []; };
