#!/usr/bin/env python3
"""Test BTC deposit with proper error handling"""

from ic.agent import Agent
from ic.identity import Identity
from ic.client import Client
from ic.candid import encode, decode, Types
import sys

# Bridge canister ID
BRIDGE_CANISTER_ID = "n5cru-miaaa-aaaad-acuia-cai"

# Load identity from default dfx identity
identity = Identity()

# Create agent for mainnet
agent = Agent(identity, Client(url="https://ic0.app"))

print("=" * 60)
print("Testing deposit_btc_for_musd with BTC address")
print("=" * 60)
print()

# Prepare arguments
btc_amount = 200
btc_address = "1BdR47799L1oy7t9fvpJ4vpvynsRgDoNP9"

print(f"Principal: {identity.sender().to_str()}")
print(f"BTC Amount: {btc_amount}")
print(f"BTC Address: {btc_address}")
print()

try:
    # Call deposit_btc_for_musd
    print("Calling deposit_btc_for_musd...")
    
    # Encode arguments: (nat64, opt text)
    params = encode([
        {'type': Types.Nat64, 'value': btc_amount},
        {'type': Types.Opt(Types.Text), 'value': [btc_address]}
    ])
    
    result = agent.update_raw(
        BRIDGE_CANISTER_ID,
        "deposit_btc_for_musd",
        params
    )
    
    print("✅ Call succeeded!")
    print(f"Raw result: {result}")
    print()
    
    # Decode result
    decoded = decode(result, DepositResponse)
    print(f"Decoded response:")
    print(f"  Status: {decoded.get('status')}")
    print(f"  Message: {decoded.get('message')}")
    print(f"  BTC Address: {decoded.get('btc_address')}")
    
except Exception as e:
    print(f"❌ Call failed!")
    print(f"Error: {e}")
    print()
    import traceback
    traceback.print_exc()

print()
print("=" * 60)
print("Checking position...")
print("=" * 60)
print()

try:
    result = agent.query_raw(
        BRIDGE_CANISTER_ID,
        "get_my_position",
        encode([])
    )
    
    print("✅ Position query succeeded!")
    print(f"Raw result: {result}")
    
except Exception as e:
    print(f"❌ Position query failed!")
    print(f"Error: {e}")

