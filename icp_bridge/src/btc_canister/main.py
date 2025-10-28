from kybra import (
    update, query, ic, nat64, Principal, 
    CallResult, StableBTreeMap, blob, Record, Vec, Opt, Variant
)
from kybra.canisters.management import management_canister
import hashlib
import base58

# Bitcoin testnet configuration
BTC_NETWORK = "testnet"
KEY_NAME = "test_key_1"  # Test key for Bitcoin testnet

# Type definitions
class UTXOInfo(Record):
    outpoint: blob
    value: nat64
    height: nat64

class CanisterStats(Record):
    total_addresses_generated: nat64
    network: str
    key_name: str


# Store generated BTC addresses
btc_addresses = StableBTreeMap[Principal, str](
    memory_id=0, max_key_size=100, max_value_size=100
)

derivation_paths = StableBTreeMap[Principal, Vec[blob]](
    memory_id=1, max_key_size=100, max_value_size=1000
)

@update
def generate_btc_address() -> str:
    """Generate P2PKH Bitcoin testnet address for canister"""
    caller = ic.caller()
    
    # Check if address already exists
    existing = btc_addresses.get(caller)
    if existing is not None:
        return existing
    
    # Derive unique path for this caller
    derivation_path = [caller.bytes]
    
    try:
        # Request ECDSA public key from ICP
        result: CallResult[any] = yield management_canister.ecdsa_public_key({
            "canister_id": None,
            "derivation_path": derivation_path,
            "key_id": {
                "curve": {"secp256k1": None},
                "name": KEY_NAME
            }
        })
        
        if result.Err:
            ic.trap(f"Failed to get ECDSA public key: {result.Err}")
        
        public_key = result.Ok["public_key"]
        
        # Convert public key to P2PKH address
        btc_address = public_key_to_p2pkh(public_key, BTC_NETWORK)
        
        # Store mapping
        btc_addresses.insert(caller, btc_address)
        derivation_paths.insert(caller, derivation_path)
        
        return btc_address
    except Exception as e:
        ic.trap(f"Error generating BTC address: {str(e)}")

@query
def get_my_btc_address() -> str:
    """Get caller's BTC address"""
    caller = ic.caller()
    addr = btc_addresses.get(caller)
    
    if addr is None:
        return ""
    
    return addr

@update
def get_btc_balance(address: str) -> nat64:
    """Query Bitcoin testnet balance via ICP Bitcoin API"""
    try:
        result: CallResult[any] = yield management_canister.bitcoin_get_balance({
            "address": address,
            "network": {"testnet": None},
            "min_confirmations": 6
        })
        
        if result.Err:
            ic.print(f"Failed to fetch balance: {result.Err}")
            return 0
        
        return result.Ok
    except Exception as e:
        ic.print(f"Error fetching balance: {str(e)}")
        return 0

@update  
def get_utxos(address: str) -> Vec[UTXOInfo]:
    """Fetch UTXOs for address from Bitcoin testnet"""
    try:
        result: CallResult[any] = yield management_canister.bitcoin_get_utxos({
            "address": address,
            "network": {"testnet": None},
            "filter": None
        })
        
        if result.Err:
            ic.trap(f"Failed to fetch UTXOs: {result.Err}")
        
        utxos = []
        for utxo in result.Ok["utxos"]:
            utxos.append(UTXOInfo(
                outpoint=utxo["outpoint"]["txid"] + bytes([utxo["outpoint"]["vout"]]),
                value=utxo["value"],
                height=utxo["height"]
            ))
        
        return utxos
    except Exception as e:
        ic.trap(f"Error fetching UTXOs: {str(e)}")

@update
def sign_transaction(message_hash: blob) -> blob:
    """Sign Bitcoin transaction using threshold ECDSA"""
    caller = ic.caller()
    
    # Get caller's derivation path
    derivation_path = derivation_paths.get(caller)
    if derivation_path is None:
        ic.trap("No BTC address found for caller")
    
    try:
        result: CallResult[any] = yield management_canister.sign_with_ecdsa({
            "message_hash": message_hash,
            "derivation_path": derivation_path,
            "key_id": {
                "curve": {"secp256k1": None},
                "name": KEY_NAME
            }
        })
        
        if result.Err:
            ic.trap(f"Failed to sign transaction: {result.Err}")
        
        return result.Ok["signature"]
    except Exception as e:
        ic.trap(f"Error signing transaction: {str(e)}")

@update
def send_btc(to_address: str, amount_satoshis: nat64) -> str:
    """Send Bitcoin on testnet"""
    caller = ic.caller()
    
    from_address = btc_addresses.get(caller)
    if from_address is None:
        ic.trap("No BTC address found for caller")
    
    try:
        # Fetch UTXOs
        utxos_result = yield get_utxos(from_address)
        
        if not utxos_result or len(utxos_result) == 0:
            ic.trap("No UTXOs available for transaction")
        
        # Build transaction (simplified - in production use proper Bitcoin library)
        tx_bytes = build_btc_transaction(utxos_result, to_address, amount_satoshis, from_address)
        
        # Calculate transaction hash for signing
        tx_hash = hashlib.sha256(hashlib.sha256(tx_bytes).digest()).digest()
        
        # Sign transaction
        signature = yield sign_transaction(tx_hash)
        
        # Finalize transaction with signature
        signed_tx = finalize_transaction(tx_bytes, signature)
        
        # Broadcast transaction
        result: CallResult[any] = yield management_canister.bitcoin_send_transaction({
            "transaction": signed_tx,
            "network": {"testnet": None}
        })
        
        if result.Err:
            ic.trap(f"Failed to send transaction: {result.Err}")
        
        return "Transaction sent successfully"
    except Exception as e:
        ic.trap(f"Error sending BTC: {str(e)}")

# Helper functions
def public_key_to_p2pkh(public_key: blob, network: str) -> str:
    """Convert ECDSA public key to Bitcoin P2PKH address"""
    # SHA256 hash of public key
    sha256_hash = hashlib.sha256(public_key).digest()
    
    # RIPEMD160 hash of SHA256 hash
    ripemd160 = hashlib.new('ripemd160')
    ripemd160.update(sha256_hash)
    pubkey_hash = ripemd160.digest()
    
    # Add version byte (0x6F for testnet, 0x00 for mainnet)
    version_byte = b'\x6F' if network == "testnet" else b'\x00'
    versioned_hash = version_byte + pubkey_hash
    
    # Double SHA256 for checksum
    checksum = hashlib.sha256(hashlib.sha256(versioned_hash).digest()).digest()[:4]
    
    # Concatenate and encode to base58
    address_bytes = versioned_hash + checksum
    address = base58.b58encode(address_bytes).decode('ascii')
    
    return address

def build_btc_transaction(utxos: Vec[UTXOInfo], to_address: str, amount: nat64, from_address: str) -> blob:
    """Build Bitcoin transaction from UTXOs (simplified version)"""
    # This is a placeholder - in production, use proper Bitcoin transaction building
    # with libraries like python-bitcoinlib
    
    # Transaction structure:
    # Version (4 bytes) + Input count + Inputs + Output count + Outputs + Locktime (4 bytes)
    
    # For demo purposes, return a basic structure
    tx = bytearray()
    
    # Version (little-endian)
    tx.extend((2).to_bytes(4, 'little'))
    
    # Input count (1 input for simplicity)
    tx.append(1)
    
    # Input (UTXO reference + script + sequence)
    if len(utxos) > 0:
        tx.extend(utxos[0]["outpoint"])
    
    # Script length (placeholder)
    tx.append(0)
    
    # Sequence
    tx.extend((0xFFFFFFFF).to_bytes(4, 'little'))
    
    # Output count (2: recipient + change)
    tx.append(2)
    
    # Output 1: Recipient
    tx.extend(amount.to_bytes(8, 'little'))
    # Script length and script (placeholder)
    tx.append(0)
    
    # Output 2: Change (placeholder)
    if len(utxos) > 0:
        change = utxos[0]["value"] - amount - 10000  # 10000 satoshi fee
        tx.extend(change.to_bytes(8, 'little'))
    tx.append(0)
    
    # Locktime
    tx.extend((0).to_bytes(4, 'little'))
    
    return bytes(tx)

def finalize_transaction(tx_bytes: blob, signature: blob) -> blob:
    """Add signature to transaction"""
    # In production, properly insert signature into transaction script
    # For demo, just concatenate (placeholder)
    return tx_bytes + signature

@query
def get_canister_stats() -> CanisterStats:
    """Get canister statistics"""
    return CanisterStats(
        total_addresses_generated=len(btc_addresses.items()),
        network=BTC_NETWORK,
        key_name=KEY_NAME
    )

