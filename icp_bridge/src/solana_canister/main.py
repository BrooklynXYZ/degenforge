from kybra import (
    update, query, ic, nat64, Principal,
    CallResult, Record, blob, Vec, StableBTreeMap
)
from kybra.canisters.management import management_canister
import json
import base58
import hashlib

# Solana devnet RPC endpoint
SOLANA_DEVNET_RPC = "https://api.devnet.solana.com"

# SOL RPC Canister on ICP mainnet
SOL_RPC_CANISTER_ID = "titvo-eiaaa-aaaar-qaogq-cai"

# Threshold Schnorr key for Ed25519 (Solana uses Ed25519)
KEY_NAME = "test_key_1"

class CanisterStats(Record):
    total_addresses_generated: nat64
    network: str
    rpc_endpoint: str

# Type definitions
class SolanaAccount(Record):
    pubkey: str
    derivation_path: Vec[blob]

class SolanaBalance(Record):
    lamports: nat64
    sol: str

class TransactionResult(Record):
    signature: str
    status: str
    message: str

# Store generated Solana addresses
solana_addresses = StableBTreeMap[Principal, SolanaAccount](
    memory_id=0, max_key_size=100, max_value_size=1000
)

@update
def generate_solana_address() -> str:
    """Generate Ed25519 Solana address using threshold Schnorr"""
    caller = ic.caller()
    
    # Check if address already exists
    existing = solana_addresses.get(caller)
    if existing is not None:
        return existing["pubkey"]
    
    # Derive unique key for this caller
    derivation_path = [caller.bytes, b"solana"]
    
    try:
        # Request Ed25519 public key (Solana uses Ed25519)
        result: CallResult[any] = yield management_canister.schnorr_public_key({
            "canister_id": None,
            "derivation_path": derivation_path,
            "key_id": {
                "algorithm": {"ed25519": None},
                "name": KEY_NAME
            }
        })
        
        if result.Err:
            ic.trap(f"Failed to get Schnorr public key: {result.Err}")
        
        # Convert Ed25519 public key to Solana address (base58)
        pubkey = result.Ok["public_key"]
        solana_address = ed25519_to_solana_address(pubkey)
        
        # Store mapping
        solana_addresses.insert(caller, SolanaAccount(
            pubkey=solana_address,
            derivation_path=derivation_path
        ))
        
        return solana_address
    except Exception as e:
        ic.trap(f"Error generating Solana address: {str(e)}")

@query
def get_my_solana_address() -> str:
    """Get caller's Solana address"""
    caller = ic.caller()
    account = solana_addresses.get(caller)
    
    if account is None:
        return ""
    
    return account["pubkey"]

@update
def get_solana_balance(address: str) -> SolanaBalance:
    """Query Solana devnet balance via SOL RPC canister"""
    try:
        # Prepare JSON-RPC request for getBalance
        json_rpc_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getBalance",
            "params": [address]
        }
        
        # Call SOL RPC canister with devnet provider
        sol_rpc_principal = Principal.from_str(SOL_RPC_CANISTER_ID)
        
        result: CallResult[any] = yield ic.call(
            sol_rpc_principal,
            "request",
            ({
                "Custom": {
                    "urls": [SOLANA_DEVNET_RPC],
                    "headers": None
                }
            }, json.dumps(json_rpc_request), 1000)
        )
        
        if result.Err:
            ic.trap(f"Failed to query Solana balance: {result.Err}")
        
        response_body = result.Ok.decode('utf-8') if isinstance(result.Ok, bytes) else result.Ok
        response = json.loads(response_body)
        
        lamports = response.get("result", {}).get("value", 0)
        sol_amount = lamports / 1_000_000_000  # Convert lamports to SOL
        
        return SolanaBalance(
            lamports=lamports,
            sol=f"{sol_amount:.9f}"
        )
    except Exception as e:
        ic.print(f"Error fetching Solana balance: {str(e)}")
        return SolanaBalance(lamports=0, sol="0.0")

@update
def get_recent_blockhash() -> str:
    """Get recent blockhash for transaction from Solana devnet"""
    try:
        json_rpc_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getLatestBlockhash",
            "params": []
        }
        
        sol_rpc_principal = Principal.from_str(SOL_RPC_CANISTER_ID)
        
        result: CallResult[any] = yield ic.call(
            sol_rpc_principal,
            "request",
            ({
                "Custom": {
                    "urls": [SOLANA_DEVNET_RPC],
                    "headers": None
                }
            }, json.dumps(json_rpc_request), 1000)
        )
        
        if result.Err:
            ic.trap(f"Failed to get blockhash: {result.Err}")
        
        response_body = result.Ok.decode('utf-8') if isinstance(result.Ok, bytes) else result.Ok
        response = json.loads(response_body)
        
        blockhash = response.get("result", {}).get("value", {}).get("blockhash", "")
        return blockhash
    except Exception as e:
        ic.trap(f"Error fetching recent blockhash: {str(e)}")

@update
def send_sol(to_address: str, lamports: nat64) -> TransactionResult:
    """Send SOL on devnet using threshold Schnorr signatures"""
    caller = ic.caller()
    
    # Get canister's Solana account
    account = solana_addresses.get(caller)
    if account is None:
        ic.trap("No Solana address found. Generate one first.")
    
    from_address = account["pubkey"]
    derivation_path = account["derivation_path"]
    
    try:
        # Get recent blockhash
        blockhash = yield get_recent_blockhash()
        
        if not blockhash:
            ic.trap("Failed to get recent blockhash")
        
        # Build Solana transaction
        tx_data = build_solana_transaction(
            from_address, 
            to_address, 
            lamports, 
            blockhash
        )
        
        # Sign with threshold Schnorr
        result: CallResult[any] = yield management_canister.sign_with_schnorr({
            "message": tx_data,
            "derivation_path": derivation_path,
            "key_id": {
                "algorithm": {"ed25519": None},
                "name": KEY_NAME
            }
        })
        
        if result.Err:
            ic.trap(f"Failed to sign Solana transaction: {result.Err}")
        
        signature = result.Ok["signature"]
        
        # Finalize transaction
        signed_tx = finalize_solana_transaction(tx_data, signature)
        
        # Submit via SOL RPC canister
        json_rpc_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "sendTransaction",
            "params": [signed_tx, {"encoding": "base64"}]
        }
        
        sol_rpc_principal = Principal.from_str(SOL_RPC_CANISTER_ID)
        
        send_result: CallResult[any] = yield ic.call(
            sol_rpc_principal,
            "request",
            ({
                "Custom": {
                    "urls": [SOLANA_DEVNET_RPC],
                    "headers": None
                }
            }, json.dumps(json_rpc_request), 1000)
        )
        
        if send_result.Err:
            ic.trap(f"Failed to send Solana transaction: {send_result.Err}")
        
        response_body = send_result.Ok.decode('utf-8') if isinstance(send_result.Ok, bytes) else send_result.Ok
        response = json.loads(response_body)
        
        tx_signature = response.get("result", "unknown")
        
        return TransactionResult(
            signature=tx_signature,
            status="confirmed",
            message=f"Sent {lamports} lamports to {to_address}"
        )
    except Exception as e:
        return TransactionResult(
            signature="",
            status="failed",
            message=f"Error: {str(e)}"
        )

@update
def request_airdrop(address: str, lamports: nat64) -> TransactionResult:
    """Request SOL airdrop on devnet"""
    try:
        json_rpc_request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "requestAirdrop",
            "params": [address, lamports]
        }
        
        sol_rpc_principal = Principal.from_str(SOL_RPC_CANISTER_ID)
        
        result: CallResult[any] = yield ic.call(
            sol_rpc_principal,
            "request",
            ({
                "Custom": {
                    "urls": [SOLANA_DEVNET_RPC],
                    "headers": None
                }
            }, json.dumps(json_rpc_request), 1000)
        )
        
        if result.Err:
            ic.trap(f"Failed to request airdrop: {result.Err}")
        
        response_body = result.Ok.decode('utf-8') if isinstance(result.Ok, bytes) else result.Ok
        response = json.loads(response_body)
        
        tx_signature = response.get("result", "unknown")
        
        return TransactionResult(
            signature=tx_signature,
            status="confirmed",
            message=f"Airdrop of {lamports} lamports requested"
        )
    except Exception as e:
        return TransactionResult(
            signature="",
            status="failed",
            message=f"Error: {str(e)}"
        )

@query
def get_canister_stats() -> CanisterStats:
    """Get canister statistics"""
    return {
        "total_addresses_generated": len(solana_addresses.items()),
        "network": "devnet",
        "rpc_endpoint": SOLANA_DEVNET_RPC
    }

# Helper functions
def ed25519_to_solana_address(pubkey: blob) -> str:
    """Convert Ed25519 public key to Solana base58 address"""
    # Solana addresses are base58-encoded Ed25519 public keys (32 bytes)
    if len(pubkey) != 32:
        # If key is longer, take first 32 bytes
        pubkey = pubkey[:32]
    
    return base58.b58encode(pubkey).decode('ascii')

def build_solana_transaction(from_addr: str, to_addr: str, lamports: nat64, blockhash: str) -> blob:
    """Build Solana transaction (simplified version)"""
    # This is a placeholder - in production, use proper Solana transaction building
    # with libraries like solana-py
    
    # Solana transaction structure:
    # - Compact array of signatures (placeholder)
    # - Message (header + accounts + blockhash + instructions)
    
    # For demo purposes, return a basic structure
    tx = bytearray()
    
    # Number of signatures (1)
    tx.append(1)
    
    # Placeholder signature (64 bytes of zeros)
    tx.extend(bytes(64))
    
    # Message header (3 bytes)
    tx.append(1)  # num_required_signatures
    tx.append(0)  # num_readonly_signed_accounts
    tx.append(1)  # num_readonly_unsigned_accounts
    
    # Account addresses compact array (2 accounts)
    tx.append(2)
    
    # From address (32 bytes)
    from_bytes = base58.b58decode(from_addr)
    tx.extend(from_bytes)
    
    # To address (32 bytes)
    to_bytes = base58.b58decode(to_addr)
    tx.extend(to_bytes)
    
    # Recent blockhash (32 bytes)
    blockhash_bytes = base58.b58decode(blockhash)
    tx.extend(blockhash_bytes)
    
    # Instructions compact array (1 instruction)
    tx.append(1)
    
    # Transfer instruction placeholder
    tx.append(2)  # System program index
    tx.append(2)  # Accounts in instruction
    tx.append(0)  # From account index
    tx.append(1)  # To account index
    tx.append(12) # Data length
    tx.extend((2).to_bytes(4, 'little'))  # Transfer instruction
    tx.extend(lamports.to_bytes(8, 'little'))  # Amount
    
    return bytes(tx)

def finalize_solana_transaction(tx: blob, signature: blob) -> str:
    """Add signature to Solana transaction and encode to base64"""
    # Replace placeholder signature with actual signature
    tx_bytes = bytearray(tx)
    
    # Signature starts at byte 1 (after the signature count)
    if len(signature) == 64:
        tx_bytes[1:65] = signature
    
    # Encode to base64 for RPC submission
    import base64
    return base64.b64encode(bytes(tx_bytes)).decode('ascii')

