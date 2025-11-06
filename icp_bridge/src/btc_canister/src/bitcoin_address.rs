use sha2::{Sha256, Digest};
use ripemd::Ripemd160;

pub fn public_key_to_p2pkh(public_key: &[u8], is_mainnet: bool) -> String {
    // SHA256 hash of public key
    let sha256_hash = Sha256::digest(public_key);
    
    // RIPEMD160 hash of SHA256 hash
    let mut ripemd160 = Ripemd160::new();
    ripemd160.update(sha256_hash);
    let pubkey_hash = ripemd160.finalize();
    
    // Add version byte (0x6F for testnet, 0x00 for mainnet)
    let version_byte: u8 = if is_mainnet { 0x00 } else { 0x6F };
    let mut versioned_hash = vec![version_byte];
    versioned_hash.extend_from_slice(&pubkey_hash);
    
    // Double SHA256 for checksum
    let checksum = Sha256::digest(Sha256::digest(&versioned_hash));
    
    // Concatenate and encode to base58
    let mut address_bytes = versioned_hash;
    address_bytes.extend_from_slice(&checksum[..4]);
    
    bs58::encode(&address_bytes).into_string()
}

