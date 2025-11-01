from kybra import (
    update, query, ic, nat64, Principal, 
    CallResult, StableBTreeMap, blob, Record, Vec, Opt, Variant
)
from kybra.canisters.management import management_canister
import hashlib
import base58
from typing import List, Any

def rotate_left(x: int, s: int, size: int = 32) -> int:
    z = 0xFFFFFFFF if size == 32 else 0xFFFFFFFFFFFFFFFF
    return ((x << s) | (x >> (size - s))) & z

def modular_add(nums: List[int], size: int = 32) -> int:
    z = 0xFFFFFFFF if size == 32 else 0xFFFFFFFFFFFFFFFF
    return sum(nums) & z

def apply_message_padding(
    message: bytearray,
    message_length_byteorder: Any,
    message_length_padding_bits: int = 64,
    message_chunk_size_bits: int = 512,
) -> bytearray:
    original_message_length_in_bits = len(message) * 8
    message.append(0x80)
    while (
        len(message) * 8 + message_length_padding_bits
    ) % message_chunk_size_bits != 0:
        message.append(0)
    message += (original_message_length_in_bits).to_bytes(
        message_length_padding_bits // 8, byteorder=message_length_byteorder
    )
    return message

class RIPEMD160:
    def __init__(self) -> None:
        self.h0: int = 0x67452301
        self.h1: int = 0xEFCDAB89
        self.h2: int = 0x98BADCFE
        self.h3: int = 0x10325476
        self.h4: int = 0xC3D2E1F0
        self.K: List[int] = (
            [0x00000000] * 16
            + [0x5A827999] * 16
            + [0x6ED9EBA1] * 16
            + [0x8F1BBCDC] * 16
            + [0xA953FD4E] * 16
        )
        self.K_C: List[int] = (
            [0x50A28BE6] * 16
            + [0x5C4DD124] * 16
            + [0x6D703EF3] * 16
            + [0x7A6D76E9] * 16
            + [0x00000000] * 16
        )
        self.R = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13]
        self.R_C = [5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11]
        self.SHIFTS = [11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6]
        self.SHIFTS_C = [8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11]

    @staticmethod
    def split_message_block_into_words(message_block: bytearray, word_length_in_bytes: int = 4) -> List[int]:
        return [int.from_bytes(message_block[4 * i : 4 * i + word_length_in_bytes], byteorder="little") for i in range(len(message_block) // word_length_in_bytes)]

    @staticmethod
    def F(j: int, x: int, y: int, z: int) -> int:
        if 0 <= j and j < 16:
            f = x ^ y ^ z
        if 16 <= j and j < 32:
            f = (x & y) | (z & ~x)
        if 32 <= j and j < 48:
            f = (~y | x) ^ z
        if 48 <= j and j < 64:
            f = (x & z) | (y & ~z)
        if 64 <= j and j < 80:
            f = x ^ (y | ~z)
        return f

    def register_values_to_hex_string(self) -> str:
        digest = sum(register_value << (32 * i) for i, register_value in enumerate([self.h0, self.h1, self.h2, self.h3, self.h4]))
        return digest.to_bytes(20, byteorder="little").hex()

    def generate_hash(self, message_bytes: bytes) -> str:
        message_in_bytes = bytearray(message_bytes)
        message_chunk = apply_message_padding(message_in_bytes, "little")
        for block in range(len(message_chunk) // 64):
            message_words = self.split_message_block_into_words(message_chunk[block * 64 : block * 64 + 64])
            a, b, c, d, e = self.h0, self.h1, self.h2, self.h3, self.h4
            a_c, b_c, c_c, d_c, e_c = self.h0, self.h1, self.h2, self.h3, self.h4
            for j in range(80):
                w = modular_add([a, self.F(j, b, c, d), message_words[self.R[j]], self.K[j]])
                t = modular_add([rotate_left(w, self.SHIFTS[j]), e])
                a, e, d, c, b = e, d, rotate_left(c, 10), b, t
                w = modular_add([a_c, self.F(79 - j, b_c, c_c, d_c), message_words[self.R_C[j]], self.K_C[j]])
                t = modular_add([rotate_left(w, self.SHIFTS_C[j]), e_c])
                a_c, e_c, d_c, c_c, b_c = e_c, d_c, rotate_left(c_c, 10), b_c, t
            t = modular_add([self.h1, c, d_c])
            self.h1 = modular_add([self.h2, d, e_c])
            self.h2 = modular_add([self.h3, e, a_c])
            self.h3 = modular_add([self.h4, a, b_c])
            self.h4 = modular_add([self.h0, b, c_c])
            self.h0 = t
        return self.register_values_to_hex_string()

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
    ripemd160 = RIPEMD160()
    pubkey_hash_hex = ripemd160.generate_hash(sha256_hash)
    pubkey_hash = bytes.fromhex(pubkey_hash_hex)
    
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

