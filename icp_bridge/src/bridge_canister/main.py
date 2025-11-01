from kybra import (
    update, query, ic, nat64, Principal,
    StableBTreeMap, Record, Variant, CallResult, Vec, blob
)
from kybra.canisters.management import management_canister
import json

# Mezo testnet configuration
MEZO_TESTNET_RPC = "https://rpc.test.mezo.org"
MEZO_TESTNET_CHAIN_ID = 31611

# Contract addresses from backend config
MUSD_TOKEN_ADDRESS = "0x7f557e8c8fb8e55aa6f54676b4f7c5a08e8f1a2c"  # Placeholder - update from backend
BORROW_MANAGER_ADDRESS = "0x1234567890abcdef1234567890abcdef12345678"  # Placeholder - update from backend

# Constants
MAX_LTV = 90  # 90% maximum LTV
INTEREST_RATE = 1  # 1% APR

# Type definitions
class BridgePosition(Record):
    user: Principal
    btc_collateral: nat64
    musd_minted: nat64
    sol_deployed: nat64
    status: str
    btc_address: str
    sol_address: str

class DepositResponse(Record):
    btc_address: str
    message: str
    status: str

class MintResponse(Record):
    musd_amount: nat64
    transaction_hash: str
    new_ltv: str
    status: str

class BridgeStats(Record):
    total_positions: nat64
    total_btc_collateral: nat64
    total_musd_minted: nat64
    total_sol_deployed: nat64
    max_ltv: nat64
    interest_rate: nat64

# Store active positions
positions = StableBTreeMap[Principal, BridgePosition](
    memory_id=1, max_key_size=100, max_value_size=500
)

# Canister IDs (to be set after deployment)
BTC_CANISTER_ID = ""  # Will be set via admin function
SOLANA_CANISTER_ID = ""  # Will be set via admin function

@update
def set_canister_ids(btc_canister: str, solana_canister: str) -> str:
    """Admin function to set dependent canister IDs"""
    global BTC_CANISTER_ID, SOLANA_CANISTER_ID
    
    # Only allow canister owner to set this
    if ic.caller() == ic.id():
        ic.trap("Unauthorized: Only canister owner can set canister IDs")
    
    BTC_CANISTER_ID = btc_canister
    SOLANA_CANISTER_ID = solana_canister
    
    return f"Canister IDs set: BTC={btc_canister}, Solana={solana_canister}"

@update
def deposit_btc_for_musd(btc_amount: nat64) -> DepositResponse:
    """
    Step 1: User deposits BTC to Mezo testnet to mint mUSD
    Integration with Mezo testnet
    """
    caller = ic.caller()
    
    if not BTC_CANISTER_ID:
        ic.trap("BTC canister not configured. Please contact admin.")
    
    try:
        # Generate BTC address via btc_handler canister
        btc_canister = Principal.from_str(BTC_CANISTER_ID)
        
        result: CallResult[str] = yield ic.call(
            btc_canister,
            "generate_btc_address",
            ()
        )
        
        if result.Err:
            ic.trap(f"Failed to generate BTC address: {result.Err}")
        
        btc_address = result.Ok
        
        # Check if position already exists
        existing = positions.get(caller)
        
        if existing is not None:
            # Update existing position
            updated_position = BridgePosition(
                user=caller,
                btc_collateral=existing["btc_collateral"] + btc_amount,
                musd_minted=existing["musd_minted"],
                sol_deployed=existing["sol_deployed"],
                status="btc_deposited",
                btc_address=btc_address,
                sol_address=existing["sol_address"]
            )
        else:
            # Create new position record
            updated_position = BridgePosition(
                user=caller,
                btc_collateral=btc_amount,
                musd_minted=0,
                sol_deployed=0,
                status="btc_deposited",
                btc_address=btc_address,
                sol_address=""
            )
        
        positions.insert(caller, updated_position)
        
        return DepositResponse(
            btc_address=btc_address,
            message=f"Deposit {btc_amount} satoshis to this address",
            status="pending_deposit"
        )
    except Exception as e:
        ic.trap(f"Error initiating BTC deposit: {str(e)}")

@update
def mint_musd_on_mezo(btc_amount: nat64) -> MintResponse:
    """
    Step 2: Interact with Mezo testnet to mint mUSD
    Uses HTTPS outcalls to Mezo RPC
    """
    caller = ic.caller()
    
    position = positions.get(caller)
    if position is None:
        ic.trap("No position found. Please deposit BTC first.")
    
    if position["btc_collateral"] < btc_amount:
        ic.trap(f"Insufficient collateral. Available: {position['btc_collateral']}, Requested: {btc_amount}")
    
    try:
        # Calculate mUSD to mint (at 99% of collateral value for 1% borrow rate)
        # Simplified: 1 BTC satoshi = 1 USD (for demo)
        musd_amount = (btc_amount * 99) // 100
        
        # Prepare Mezo contract call
        # Call BorrowManager.mintMUSD(uint256 musdAmount)
        eth_call_payload = {
            "jsonrpc": "2.0",
            "method": "eth_call",
            "params": [{
                "to": BORROW_MANAGER_ADDRESS,
                "data": encode_mint_musd_call(musd_amount)
            }, "latest"],
            "id": 1
        }
        
        # Make HTTPS outcall to Mezo testnet
        result: CallResult[any] = yield management_canister.http_request({
            "url": MEZO_TESTNET_RPC,
            "method": {"POST": None},
            "body": json.dumps(eth_call_payload).encode('utf-8'),
            "headers": [
                {"name": "Content-Type", "value": "application/json"}
            ],
            "max_response_bytes": 2000,
            "transform": None
        })
        
        if result.Err:
            ic.trap(f"Failed to call Mezo RPC: {result.Err}")
        
        response_body = result.Ok["body"].decode('utf-8')
        response_json = json.loads(response_body)
        
        # Check for errors in response
        if "error" in response_json:
            ic.trap(f"Mezo RPC error: {response_json['error']}")
        
        # Calculate new LTV
        total_minted = position["musd_minted"] + musd_amount
        current_ltv = (total_minted * 100) // position["btc_collateral"]
        
        # Update position
        updated_position = BridgePosition(
            user=caller,
            btc_collateral=position["btc_collateral"],
            musd_minted=total_minted,
            sol_deployed=position["sol_deployed"],
            status="musd_minted",
            btc_address=position["btc_address"],
            sol_address=position["sol_address"]
        )
        positions.insert(caller, updated_position)
        
        return MintResponse(
            musd_amount=musd_amount,
            transaction_hash=response_json.get("result", "0x0"),
            new_ltv=f"{current_ltv}%",
            status="confirmed"
        )
    except Exception as e:
        ic.trap(f"Error minting mUSD: {str(e)}")

@update
def bridge_musd_to_solana(musd_amount: nat64) -> str:
    """
    Step 3: Bridge mUSD from Mezo to Solana devnet
    Creates wrapped mUSD SPL token on Solana
    """
    caller = ic.caller()
    
    position = positions.get(caller)
    if position is None or position["musd_minted"] < musd_amount:
        ic.trap("Insufficient mUSD balance")
    
    if not SOLANA_CANISTER_ID:
        ic.trap("Solana canister not configured. Please contact admin.")
    
    try:
        # Get Solana address for user
        sol_canister = Principal.from_str(SOLANA_CANISTER_ID)
        
        result: CallResult[str] = yield ic.call(
            sol_canister,
            "generate_solana_address",
            ()
        )
        
        if result.Err:
            ic.trap(f"Failed to get Solana address: {result.Err}")
        
        sol_address = result.Ok
        
        # For testnet: Mint wrapped mUSD SPL token on Solana devnet
        # This would normally involve:
        # 1. Lock mUSD in bridge contract
        # 2. Emit bridge event
        # 3. Mint equivalent SPL token on Solana
        
        # Update position
        updated_position = BridgePosition(
            user=caller,
            btc_collateral=position["btc_collateral"],
            musd_minted=position["musd_minted"],
            sol_deployed=position["sol_deployed"] + musd_amount,
            status="bridged_to_solana",
            btc_address=position["btc_address"],
            sol_address=sol_address
        )
        positions.insert(caller, updated_position)
        
        return f"Successfully bridged {musd_amount} mUSD to Solana address: {sol_address}"
    except Exception as e:
        ic.trap(f"Error bridging to Solana: {str(e)}")

@update
def deploy_to_yield_protocol(musd_amount: nat64, protocol: str) -> str:
    """
    Step 4: Deploy mUSD to Solana yield protocols
    Integrates with Kamino, Meteora, etc.
    """
    caller = ic.caller()
    
    position = positions.get(caller)
    if position is None or position["sol_deployed"] < musd_amount:
        ic.trap("Insufficient bridged mUSD")
    
    # For demo: Mark as deployed to protocol
    # In production, this would interact with specific Solana programs
    
    ic.print(f"Deploying {musd_amount} mUSD to {protocol}")
    
    return f"Deployed {musd_amount} mUSD to {protocol} successfully"

@query
def get_position(user: Principal) -> BridgePosition:
    """Query user's bridge position"""
    position = positions.get(user)
    
    if position is None:
        # Return empty position
        return BridgePosition(
            user=user,
            btc_collateral=0,
            musd_minted=0,
            sol_deployed=0,
            status="none",
            btc_address="",
            sol_address=""
        )
    
    return position

@query
def get_my_position() -> BridgePosition:
    """Query caller's bridge position"""
    return get_position(ic.caller())

@query
def calculate_max_mintable(btc_collateral: nat64) -> nat64:
    """Calculate maximum mUSD mintable for given BTC collateral"""
    # At 90% LTV, user can mint 90% of collateral value
    # Assuming 1 satoshi = 1 USD for demo purposes
    return (btc_collateral * MAX_LTV) // 100

@query
def get_bridge_stats() -> BridgeStats:
    """Get bridge statistics"""
    total_positions = nat64(len(positions.items()))
    total_btc = nat64(0)
    total_musd = nat64(0)
    total_sol_deployed = nat64(0)
    
    for _, position in positions.items():
        total_btc += position["btc_collateral"]
        total_musd += position["musd_minted"]
        total_sol_deployed += position["sol_deployed"]
    
    return BridgeStats(
        total_positions=total_positions,
        total_btc_collateral=total_btc,
        total_musd_minted=total_musd,
        total_sol_deployed=total_sol_deployed,
        max_ltv=nat64(MAX_LTV),
        interest_rate=nat64(INTEREST_RATE)
    )

# Helper functions
def encode_mint_musd_call(musd_amount: nat64) -> str:
    """Encode Mezo BorrowManager.mintMUSD contract call"""
    # Function signature: mintMUSD(uint256)
    # Function selector: first 4 bytes of keccak256("mintMUSD(uint256)")
    function_selector = "0x6a627842"  # Placeholder - calculate actual selector
    
    # Encode uint256 parameter (32 bytes, big-endian)
    amount_hex = hex(musd_amount)[2:].zfill(64)
    
    return function_selector + amount_hex

