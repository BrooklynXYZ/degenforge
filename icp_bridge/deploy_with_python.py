#!/usr/bin/env python3
"""
Deploy canisters using Python IC Agent library (bypasses dfx color panic)
"""

import sys
import os
from pathlib import Path

try:
    from ic.agent import Agent
    from ic.identity import Identity
    from ic.client import Client
    from ic.candid import encode, Types
    from ic.principal import Principal
except ImportError:
    print("ERROR: IC agent library not installed.")
    print("Install it with: pip install ic-agent")
    sys.exit(1)

# Canister IDs
BTC_HANDLER_ID = "ph6zi-syaaa-aaaad-acuha-cai"
BRIDGE_ID = "n5cru-miaaa-aaaad-acuia-cai"

# WASM file paths
WASM_DIR = Path(__file__).parent / ".dfx/ic/canisters"
BTC_WASM = WASM_DIR / "btc_handler" / "btc_handler.wasm"
BRIDGE_WASM = WASM_DIR / "bridge_orchestrator" / "bridge_orchestrator.wasm"

def load_wasm(filepath):
    """Load WASM file as bytes"""
    if not filepath.exists():
        raise FileNotFoundError(f"WASM file not found: {filepath}")
    with open(filepath, 'rb') as f:
        return f.read()

def deploy_canister(agent, canister_id, wasm_bytes, mode="upgrade"):
    """Deploy WASM to a canister"""
    print(f"\n{'='*60}")
    print(f"Deploying to canister: {canister_id}")
    print(f"Mode: {mode}")
    print(f"WASM size: {len(wasm_bytes) / 1024:.2f} KB")
    print(f"{'='*60}\n")
    
    canister_principal = Principal.from_str(canister_id)
    
    # Build install_code arguments
    # install_code(InstallCodeArgs {
    #   mode: InstallMode,
    #   canister_id: Principal,
    #   wasm_module: Vec<u8>,
    #   arg: Vec<u8>,
    # })
    
    # InstallMode: upgrade = 1
    install_mode = 1 if mode == "upgrade" else 0
    
    # Encode arguments
    args = encode([
        {'type': Types.Variant, 'value': {'upgrade': None} if mode == "upgrade" else {'install': None}},
        {'type': Types.Principal, 'value': canister_principal},
        {'type': Types.Vec(Types.Nat8), 'value': list(wasm_bytes)},
        {'type': Types.Vec(Types.Nat8), 'value': []}  # Empty arg
    ])
    
    try:
        # Call management canister's install_code
        management_canister = Principal.from_str("aaaaa-aa")
        
        print("Calling install_code on management canister...")
        result = agent.update_raw(
            str(management_canister),
            "install_code",
            args
        )
        
        print("✅ Deployment successful!")
        return True
        
    except Exception as e:
        print(f"❌ Deployment failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    print("="*60)
    print("ICP Canister Deployment Tool (Python)")
    print("="*60)
    print()
    
    # Check identity
    try:
        identity = Identity()
        print(f"✅ Using identity: {identity.sender().to_str()}")
    except Exception as e:
        print(f"❌ Failed to load identity: {e}")
        print("Make sure you have dfx identity configured")
        sys.exit(1)
    
    # Create agent
    agent = Agent(identity, Client(url="https://ic0.app"))
    
    # Check WASM files
    if not BTC_WASM.exists():
        print(f"❌ BTC Handler WASM not found: {BTC_WASM}")
        sys.exit(1)
    
    if not BRIDGE_WASM.exists():
        print(f"❌ Bridge WASM not found: {BRIDGE_WASM}")
        sys.exit(1)
    
    print("✅ WASM files found")
    print()
    
    # Ask for confirmation
    print("This will upgrade the following canisters:")
    print(f"  1. BTC Handler: {BTC_HANDLER_ID}")
    print(f"  2. Bridge Orchestrator: {BRIDGE_ID}")
    print()
    
    response = input("Continue? (yes/no): ").strip().lower()
    if response != "yes":
        print("Cancelled.")
        sys.exit(0)
    
    # Deploy BTC Handler
    print("\n" + "="*60)
    print("STEP 1: Deploying BTC Handler")
    print("="*60)
    btc_wasm = load_wasm(BTC_WASM)
    if not deploy_canister(agent, BTC_HANDLER_ID, btc_wasm, "upgrade"):
        print("\n❌ BTC Handler deployment failed. Aborting.")
        sys.exit(1)
    
    # Deploy Bridge
    print("\n" + "="*60)
    print("STEP 2: Deploying Bridge Orchestrator")
    print("="*60)
    bridge_wasm = load_wasm(BRIDGE_WASM)
    if not deploy_canister(agent, BRIDGE_ID, bridge_wasm, "upgrade"):
        print("\n❌ Bridge deployment failed. Aborting.")
        sys.exit(1)
    
    print("\n" + "="*60)
    print("✅ ALL DEPLOYMENTS COMPLETE!")
    print("="*60)
    print()
    print("Next steps:")
    print("1. Test the deployment:")
    print(f'   dfx canister call --network ic {BRIDGE_ID} debug_get_config')
    print()
    print("2. Test BTC deposit:")
    print(f'   dfx canister call --network ic {BRIDGE_ID} deposit_btc_for_musd \'(200:nat64, opt "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9")\'')

if __name__ == "__main__":
    main()

