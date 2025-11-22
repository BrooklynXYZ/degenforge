#!/usr/bin/env python3
"""
Call deposit_btc_for_musd on the Bridge canister using IC agent
"""
import subprocess
import sys
import os

# Set environment to avoid color issues
env = os.environ.copy()
env['NO_COLOR'] = '1'
env['TERM'] = 'dumb'
# Remove color-related vars
for key in ['CLICOLOR', 'CLICOLOR_FORCE', 'COLORTERM']:
    env.pop(key, None)

# Try using dfx with clean environment
try:
    result = subprocess.run(
        [
            'dfx', 'canister', 'call', '--network', 'ic',
            'n5cru-miaaa-aaaad-acuia-cai',
            'deposit_btc_for_musd', '(200:nat64)'
        ],
        env=env,
        capture_output=True,
        text=True,
        timeout=60
    )
    
    if result.returncode == 0:
        print("SUCCESS:")
        print(result.stdout)
        if result.stderr:
            print("STDERR:", result.stderr)
    else:
        print("ERROR (return code {}):".format(result.returncode))
        print("STDOUT:", result.stdout)
        print("STDERR:", result.stderr)
        sys.exit(result.returncode)
        
except subprocess.TimeoutExpired:
    print("ERROR: Command timed out")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: {e}")
    sys.exit(1)

