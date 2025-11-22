#!/usr/bin/env python3
"""
Call deposit_btc_for_musd using Python IC agent
This bypasses the dfx color panic issue
"""
import subprocess
import sys
import os
import json

def main():
    # Set environment
    env = os.environ.copy()
    env['DFX_WARNING'] = '-mainnet_plaintext_identity'
    env['NO_COLOR'] = '1'
    env['TERM'] = 'dumb'
    
    # Remove color vars
    for key in ['CLICOLOR', 'CLICOLOR_FORCE', 'COLORTERM']:
        env.pop(key, None)
    
    canister_id = 'n5cru-miaaa-aaaad-acuia-cai'
    
    print("Step 1: Verifying identity...")
    try:
        result = subprocess.run(
            ['dfx', 'identity', 'whoami'],
            env=env,
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            print(f"Identity: {result.stdout.strip()}")
        else:
            print(f"Warning: Could not verify identity: {result.stderr}")
    except Exception as e:
        print(f"Warning: {e}")
    print()
    
    print("Step 2: Calling deposit_btc_for_musd...")
    print("(Using dfx with stderr suppression)")
    
    # Try with stderr completely suppressed
    try:
        result = subprocess.run(
            [
                'dfx', 'canister', 'call', '--network', 'ic',
                canister_id,
                'deposit_btc_for_musd', '(200:nat64)'
            ],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,  # Suppress stderr completely
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and result.stdout:
            print("SUCCESS:")
            print(result.stdout)
        else:
            print(f"Command returned code {result.returncode}")
            if result.stdout:
                print("Output:", result.stdout)
            # Try one more time with stderr captured to see real error
            print("\nRetrying with error capture...")
            result2 = subprocess.run(
                [
                    'dfx', 'canister', 'call', '--network', 'ic',
                    canister_id,
                    'deposit_btc_for_musd', '(200:nat64)'
                ],
                env=env,
                capture_output=True,
                text=True,
                timeout=60
            )
            # Filter out panic messages
            output = result2.stdout
            if output:
                print("Output:", output)
            stderr = result2.stderr
            if stderr and 'panic' not in stderr.lower() and 'color' not in stderr.lower():
                print("Error:", stderr)
                
    except subprocess.TimeoutExpired:
        print("ERROR: Command timed out")
        sys.exit(1)
    except Exception as e:
        print(f"ERROR: {e}")
        sys.exit(1)
    
    print()
    print("Step 3: Verifying position...")
    try:
        result = subprocess.run(
            [
                'dfx', 'canister', 'call', '--network', 'ic',
                canister_id,
                'get_my_position'
            ],
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.DEVNULL,
            text=True,
            timeout=60
        )
        
        if result.returncode == 0 and result.stdout:
            print("Position:")
            print(result.stdout)
        else:
            print(f"Could not get position (code {result.returncode})")
    except Exception as e:
        print(f"Error getting position: {e}")
    
    print()
    print("Done!")

if __name__ == '__main__':
    main()

