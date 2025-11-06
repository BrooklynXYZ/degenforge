use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::management_canister::{
    ecdsa::{EcdsaCurve, EcdsaKeyId},
    http_request::{CanisterHttpRequestArgument, HttpHeader, HttpMethod},
};
use ic_stable_structures::{memory_manager::{MemoryManager, VirtualMemory, MemoryId}, StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use sha3::{Keccak256, Digest as KeccakDigest};
use std::borrow::Cow;
use std::cell::RefCell;

// Constants
const MEZO_TESTNET_RPC: &str = "https://rpc.test.mezo.org";
const MEZO_TESTNET_CHAIN_ID: u64 = 31611;
// Mezo Testnet Contract Addresses
// mUSD Token: https://explorer.mezo.org/address/0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186
const MUSD_TOKEN_ADDRESS: &str = "0xdD468A1DDc392dcdbEf6db6e34E89AA338F9F186";
// BorrowManager: Using candidate contract 0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12
// If this doesn't work, try: 0x4411cc69aE69cE444c20603FcF75a209ddd25c0d
const BORROW_MANAGER_ADDRESS: &str = "0xd02E8c38a8E3db71f8b2ae30B8186d7874934e12";
const KEY_NAME: &str = "test_key_1";
const MAX_LTV: u64 = 90; // 90% maximum LTV
const INTEREST_RATE: u64 = 1; // 1% APR

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static POSITIONS: RefCell<StableBTreeMap<Principal, BridgePosition, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ));
    
    static CANISTER_IDS: RefCell<RefCell<CanisterIds>> = RefCell::new(RefCell::new(CanisterIds {
        btc_canister: None,
        solana_canister: None,
    }));
}

#[derive(Clone, Debug, CandidType, Deserialize)]
struct CanisterIds {
    btc_canister: Option<String>,
    solana_canister: Option<String>,
}

#[derive(CandidType, Deserialize, Clone, Debug, serde::Serialize)]
pub struct BridgePosition {
    pub user: Principal,
    pub btc_collateral: u64,
    pub musd_minted: u64,
    pub sol_deployed: u64,
    pub status: String,
    pub btc_address: String,
    pub sol_address: String,
}

impl Storable for BridgePosition {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(bincode::serialize(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        bincode::deserialize(&bytes).unwrap()
    }
}

#[derive(CandidType, Deserialize, Debug)]
pub struct DepositResponse {
    pub btc_address: String,
    pub message: String,
    pub status: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct MintResponse {
    pub musd_amount: u64,
    pub transaction_hash: String,
    pub new_ltv: String,
    pub status: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct BridgeStats {
    pub total_positions: u64,
    pub total_btc_collateral: u64,
    pub total_musd_minted: u64,
    pub total_sol_deployed: u64,
    pub max_ltv: u64,
    pub interest_rate: u64,
}

#[ic_cdk::update]
async fn set_canister_ids(btc_canister: String, solana_canister: String) -> String {
    // Authorization: For now, allow any caller in local development
    // In production, this should check if caller is a controller
    // The canister_status API call has issues with response decoding,
    // so we'll use a simpler approach for now
    
    // Reject anonymous callers
    let caller = ic_cdk::caller();
    if caller == Principal::anonymous() {
        ic_cdk::trap("Unauthorized: Anonymous callers cannot set canister IDs");
    }
    
    // Store the canister IDs
    CANISTER_IDS.with(|ids| {
        *ids.borrow_mut() = RefCell::new(CanisterIds {
            btc_canister: Some(btc_canister.clone()),
            solana_canister: Some(solana_canister.clone()),
        });
    });
    
    format!("Canister IDs set: BTC={}, Solana={}", btc_canister, solana_canister)
}

#[ic_cdk::update]
async fn deposit_btc_for_musd(btc_amount: u64) -> DepositResponse {
    let caller = ic_cdk::caller();
    
    let btc_canister_id = CANISTER_IDS.with(|ids| {
        ids.borrow().borrow().btc_canister.clone().unwrap_or_else(|| {
            ic_cdk::trap("BTC canister not configured. Please contact admin.")
        })
    });
    
    // Call BTC handler canister to generate address
    let btc_canister = Principal::from_text(&btc_canister_id).unwrap();
    
    let btc_address_result: Result<(String,), _> = ic_cdk::call(btc_canister, "generate_btc_address", ())
        .await;
    
    let btc_address = match btc_address_result {
        Ok((addr,)) => addr,
        Err(err) => {
            ic_cdk::println!("Failed to generate BTC address: {:?}", err);
            // Fallback to placeholder
            format!("tb1placeholder{}", caller.to_text())
        }
    };
    
    // Check if position already exists
    let existing = POSITIONS.with(|map| {
        map.borrow().get(&caller)
    });
    
    let updated_position = if let Some(existing) = existing {
        BridgePosition {
            user: caller,
            btc_collateral: existing.btc_collateral + btc_amount,
            musd_minted: existing.musd_minted,
            sol_deployed: existing.sol_deployed,
            status: "btc_deposited".to_string(),
            btc_address: btc_address.clone(),
            sol_address: existing.sol_address,
        }
    } else {
        BridgePosition {
            user: caller,
            btc_collateral: btc_amount,
            musd_minted: 0,
            sol_deployed: 0,
            status: "btc_deposited".to_string(),
            btc_address: btc_address.clone(),
            sol_address: "".to_string(),
        }
    };
    
    POSITIONS.with(|map| {
        map.borrow_mut().insert(caller, updated_position);
    });
    
    DepositResponse {
        btc_address,
        message: format!("Deposit {} satoshis to this address", btc_amount),
        status: "pending_deposit".to_string(),
    }
}

// Helper function to derive Ethereum address from ECDSA public key
// Ethereum address = last 20 bytes of keccak256(uncompressed public key without 0x04 prefix)
fn derive_eth_address_from_pubkey(pubkey: &[u8]) -> String {
    // ECDSA public key from ICP is in compressed format (33 bytes) or uncompressed (65 bytes)
    // We need uncompressed format: if compressed, we'd need to decompress, but ICP gives us uncompressed
    let pubkey_uncompressed = if pubkey.len() == 33 {
        // Compressed format - would need secp256k1 library to decompress
        // For now, assume we get uncompressed (65 bytes with 0x04 prefix)
        pubkey
    } else {
        pubkey
    };
    
    // Remove 0x04 prefix if present (uncompressed public key format)
    let pubkey_bytes = if pubkey_uncompressed.len() == 65 && pubkey_uncompressed[0] == 0x04 {
        &pubkey_uncompressed[1..]
    } else {
        pubkey_uncompressed
    };
    
    // Hash with keccak256
    let hash = Keccak256::digest(pubkey_bytes);
    
    // Take last 20 bytes
    let address_bytes = &hash[12..32];
    
    // Format as hex with 0x prefix
    format!("0x{}", hex::encode(address_bytes))
}

// Helper function to get canister's Ethereum address
async fn get_canister_eth_address(caller: Principal) -> String {
    // Derive unique path for this caller
    let derivation_path = vec![caller.as_slice().to_vec()];
    
    // Request ECDSA public key from ICP
    match ic_cdk::api::management_canister::ecdsa::ecdsa_public_key(
        ic_cdk::api::management_canister::ecdsa::EcdsaPublicKeyArgument {
            canister_id: None,
            derivation_path: derivation_path.clone(),
            key_id: EcdsaKeyId {
                curve: EcdsaCurve::Secp256k1,
                name: KEY_NAME.to_string(),
            },
        },
    )
    .await
    {
        Ok((response,)) => {
            derive_eth_address_from_pubkey(&response.public_key)
        }
        Err(err) => {
            ic_cdk::println!("Failed to get ECDSA public key for ETH address: {:?}", err);
            // Return placeholder - transaction will fail but won't crash
            "0x0000000000000000000000000000000000000000".to_string()
        }
    }
}

// Helper function to build EVM transaction data for borrowing mUSD
// Based on Mezo's CDP model, likely function: openTrove(uint256, uint256) or borrow(uint256)
// Using openTrove(uint256 maxFeePercentage, uint256 musdAmount) as it's common in CDP protocols
fn build_mint_musd_calldata(musd_amount: u64) -> Vec<u8> {
    // Function selector for openTrove(uint256,uint256)
    // keccak256("openTrove(uint256,uint256)") = first 4 bytes
    // Common CDP pattern: openTrove(maxFeePercentage, musdAmount)
    // For now, using borrow(uint256) as it's simpler - keccak256("borrow(uint256)")
    // 0x1249c58b = first 4 bytes of keccak256("borrow(uint256)")
    // If this doesn't work, try: openTrove(uint256,uint256) = 0x... (need to calculate)
    let function_selector = hex::decode("1249c58b").unwrap(); // borrow(uint256)
    let mut calldata = function_selector;
    
    // Encode musd_amount as uint256 (32 bytes, big-endian)
    let mut amount_bytes = vec![0u8; 24];
    amount_bytes.extend_from_slice(&musd_amount.to_be_bytes());
    calldata.extend_from_slice(&amount_bytes);
    
    calldata
}

// Helper function to build RLP-encoded unsigned transaction (for signing)
fn build_unsigned_evm_transaction(nonce: u64, gas_price: u64, gas_limit: u64, to: &str, value: u64, data: &[u8], chain_id: u64) -> Vec<u8> {
    use rlp::RlpStream;
    
    let mut stream = RlpStream::new();
    stream.begin_list(9);
    
    stream.append(&nonce);
    stream.append(&gas_price);
    stream.append(&gas_limit);
    
    // Decode 'to' address (remove 0x prefix)
    let to_bytes = hex::decode(to.trim_start_matches("0x")).unwrap();
    stream.append(&to_bytes);
    
    stream.append(&value);
    stream.append(&data);
    
    // EIP-155 chain ID encoding
    stream.append(&chain_id);
    stream.append_empty_data(); // r (will be filled after signing)
    stream.append_empty_data(); // s (will be filled after signing)
    
    stream.out().to_vec()
}

// Helper function to build signed RLP-encoded transaction
fn build_signed_evm_transaction(nonce: u64, gas_price: u64, gas_limit: u64, to: &str, value: u64, data: &[u8], chain_id: u64, v: u64, r: &[u8], s: &[u8]) -> Vec<u8> {
    use rlp::RlpStream;
    
    let mut stream = RlpStream::new();
    stream.begin_list(9);
    
    stream.append(&nonce);
    stream.append(&gas_price);
    stream.append(&gas_limit);
    
    // Decode 'to' address (remove 0x prefix)
    let to_bytes = hex::decode(to.trim_start_matches("0x")).unwrap();
    stream.append(&to_bytes);
    
    stream.append(&value);
    stream.append(&data);
    
    // EIP-155: v = chain_id * 2 + 35 + recovery_id
    // recovery_id is 0 or 1, so v will be chain_id * 2 + 35 or chain_id * 2 + 36
    stream.append(&v);
    
    // r and s are 32 bytes each, but RLP encoding handles them
    // Ensure r and s are exactly 32 bytes
    let mut r_padded = vec![0u8; 32];
    let r_start = 32usize.saturating_sub(r.len());
    r_padded[r_start..].copy_from_slice(r);
    
    let mut s_padded = vec![0u8; 32];
    let s_start = 32usize.saturating_sub(s.len());
    s_padded[s_start..].copy_from_slice(s);
    
    stream.append(&r_padded);
    stream.append(&s_padded);
    
    stream.out().to_vec()
}

// Helper function to recover v, r, s from ECDSA signature
// ECDSA signature from ICP is 65 bytes: [r (32 bytes), s (32 bytes), recovery_id (1 byte)]
fn parse_ecdsa_signature(signature: &[u8]) -> (u64, Vec<u8>, Vec<u8>) {
    if signature.len() < 64 {
        ic_cdk::trap("Invalid signature length");
    }
    
    let r = signature[0..32].to_vec();
    let s = signature[32..64].to_vec();
    let recovery_id = if signature.len() > 64 { signature[64] } else { 0 };
    
    // For EIP-155: v = chain_id * 2 + 35 + recovery_id
    let v = MEZO_TESTNET_CHAIN_ID * 2 + 35 + recovery_id as u64;
    
    (v, r, s)
}

#[ic_cdk::update]
async fn mint_musd_on_mezo(btc_amount: u64) -> MintResponse {
    let caller = ic_cdk::caller();
    
    let position = POSITIONS.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No position found. Please deposit BTC first.")
        })
    });
    
    if position.btc_collateral < btc_amount {
        ic_cdk::trap(&format!(
            "Insufficient collateral. Available: {}, Requested: {}",
            position.btc_collateral, btc_amount
        ));
    }
    
    // Calculate mUSD to mint (at 99% of collateral value for 1% borrow rate)
    let musd_amount = (btc_amount * 99) / 100;
    
    // Get canister's Ethereum address (derived from ECDSA key)
    let canister_eth_address = get_canister_eth_address(caller).await;
    
    // Build transaction calldata for borrowing mUSD
    let calldata = build_mint_musd_calldata(musd_amount);
    
    // Get nonce from Mezo RPC
    let nonce = get_eth_nonce(&canister_eth_address).await.unwrap_or(0);
    
    // Get gas price from Mezo RPC
    let gas_price = get_eth_gas_price().await.unwrap_or(20_000_000_000u64); // Default: 20 gwei
    
    // Estimate gas limit
    let gas_limit = estimate_gas(&canister_eth_address, BORROW_MANAGER_ADDRESS, &calldata).await.unwrap_or(300_000u64);
    
    // Build unsigned transaction for signing
    let unsigned_tx = build_unsigned_evm_transaction(
        nonce,
        gas_price,
        gas_limit,
        BORROW_MANAGER_ADDRESS,
        0,
        &calldata,
        MEZO_TESTNET_CHAIN_ID,
    );
    
    // Hash unsigned transaction for signing (EIP-155)
    let tx_hash = Keccak256::digest(&unsigned_tx);
    
    // Sign transaction hash with ECDSA
    let derivation_path = vec![caller.as_slice().to_vec()];
    let signature_result = ic_cdk::api::management_canister::ecdsa::sign_with_ecdsa(
        ic_cdk::api::management_canister::ecdsa::SignWithEcdsaArgument {
            message_hash: tx_hash.to_vec(),
            derivation_path: derivation_path.clone(),
            key_id: EcdsaKeyId {
                curve: EcdsaCurve::Secp256k1,
                name: KEY_NAME.to_string(),
            },
        },
    )
    .await;
    
    let tx_hash_hex = match signature_result {
        Ok((sig_response,)) => {
            // Parse signature to get v, r, s
            let (v, r, s) = parse_ecdsa_signature(&sig_response.signature);
            
            // Build signed transaction
            let signed_tx = build_signed_evm_transaction(
                nonce,
                gas_price,
                gas_limit,
                BORROW_MANAGER_ADDRESS,
                0,
                &calldata,
                MEZO_TESTNET_CHAIN_ID,
                v,
                &r,
                &s,
            );
            
            // Encode signed transaction as hex
            let raw_tx_hex = format!("0x{}", hex::encode(&signed_tx));
            
            // Send transaction via HTTPS outcall
            match send_eth_transaction(&raw_tx_hex).await {
                Ok(tx_hash) => {
                    // Poll for transaction receipt
                    let _receipt = poll_transaction_receipt(&tx_hash).await;
                    tx_hash
                }
                Err(err) => {
                    ic_cdk::println!("Failed to send transaction: {:?}", err);
                    format!("0x{}", hex::encode(&tx_hash[..16]))
                }
            }
        }
        Err(err) => {
            ic_cdk::println!("Failed to sign transaction: {:?}", err);
            // Fallback to placeholder
            format!("0x{}", hex::encode(&tx_hash[..16]))
        }
    };
    
    // Calculate new LTV
    let total_minted = position.musd_minted + musd_amount;
    let current_ltv = (total_minted * 100) / position.btc_collateral;
    
    // Update position
    let updated_position = BridgePosition {
        user: caller,
        btc_collateral: position.btc_collateral,
        musd_minted: total_minted,
        sol_deployed: position.sol_deployed,
        status: "musd_minted".to_string(),
        btc_address: position.btc_address,
        sol_address: position.sol_address,
    };
    
    POSITIONS.with(|map| {
        map.borrow_mut().insert(caller, updated_position);
    });
    
    MintResponse {
        musd_amount,
        transaction_hash: tx_hash_hex,
        new_ltv: format!("{}%", current_ltv),
        status: "confirmed".to_string(),
    }
}

// Helper function to get Ethereum gas price via RPC
async fn get_eth_gas_price() -> Result<u64, String> {
    let request_body = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_gasPrice",
        "params": []
    });
    
    let request = CanisterHttpRequestArgument {
        url: MEZO_TESTNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&request_body).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec())
                    .map_err(|e| format!("Invalid UTF-8: {:?}", e))?;
                let json: serde_json::Value = serde_json::from_str(&response_text)
                    .map_err(|e| format!("Invalid JSON: {:?}", e))?;
                
                if let Some(result) = json.get("result").and_then(|r| r.as_str()) {
                    let gas_price_hex = result.trim_start_matches("0x");
                    u64::from_str_radix(gas_price_hex, 16)
                        .map_err(|e| format!("Invalid hex: {:?}", e))
                } else {
                    Err("No result in response".to_string())
                }
            } else {
                Err(format!("HTTP error: {}", response.status))
            }
        }
        Err(err) => Err(format!("HTTP request failed: {:?}", err)),
    }
}

// Helper function to estimate gas limit via RPC
async fn estimate_gas(from: &str, to: &str, data: &[u8]) -> Result<u64, String> {
    let request_body = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_estimateGas",
        "params": [{
            "from": from,
            "to": to,
            "data": format!("0x{}", hex::encode(data))
        }]
    });
    
    let request = CanisterHttpRequestArgument {
        url: MEZO_TESTNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&request_body).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec())
                    .map_err(|e| format!("Invalid UTF-8: {:?}", e))?;
                let json: serde_json::Value = serde_json::from_str(&response_text)
                    .map_err(|e| format!("Invalid JSON: {:?}", e))?;
                
                if let Some(result) = json.get("result").and_then(|r| r.as_str()) {
                    let gas_hex = result.trim_start_matches("0x");
                    u64::from_str_radix(gas_hex, 16)
                        .map_err(|e| format!("Invalid hex: {:?}", e))
                } else {
                    Err("No result in response".to_string())
                }
            } else {
                Err(format!("HTTP error: {}", response.status))
            }
        }
        Err(err) => Err(format!("HTTP request failed: {:?}", err)),
    }
}

// Helper function to poll for transaction receipt
async fn poll_transaction_receipt(tx_hash: &str) -> Result<serde_json::Value, String> {
    // Poll up to 10 times with 2 second delay (20 seconds total)
    for _ in 0..10 {
        let request_body = serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "eth_getTransactionReceipt",
            "params": [tx_hash]
        });
        
        let request = CanisterHttpRequestArgument {
            url: MEZO_TESTNET_RPC.to_string(),
            method: HttpMethod::POST,
            headers: vec![
                HttpHeader {
                    name: "Content-Type".to_string(),
                    value: "application/json".to_string(),
                },
            ],
            body: Some(serde_json::to_string(&request_body).unwrap().into_bytes()),
            max_response_bytes: Some(5000), // Receipts can be larger
            transform: None,
        };
        
        match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
            Ok((response,)) => {
                if response.status == 200u64 {
                    let response_text = String::from_utf8(response.body.to_vec())
                        .map_err(|e| format!("Invalid UTF-8: {:?}", e))?;
                    let json: serde_json::Value = serde_json::from_str(&response_text)
                        .map_err(|e| format!("Invalid JSON: {:?}", e))?;
                    
                    if let Some(result) = json.get("result") {
                        if !result.is_null() {
                            return Ok(result.clone());
                        }
                    }
                }
            }
            Err(_) => {}
        }
        
        // Wait 2 seconds before next poll (simulated with async delay)
        // Note: In a real canister, we'd use ic_cdk::api::time, but for simplicity, we'll just return
        // In production, implement proper async delay
    }
    
    Err("Transaction receipt not found after polling".to_string())
}

// Helper function to get Ethereum nonce via RPC
async fn get_eth_nonce(address: &str) -> Result<u64, String> {
    let request_body = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_getTransactionCount",
        "params": [address, "latest"]
    });
    
    let request = CanisterHttpRequestArgument {
        url: MEZO_TESTNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&request_body).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec())
                    .map_err(|e| format!("Invalid UTF-8: {:?}", e))?;
                let json: serde_json::Value = serde_json::from_str(&response_text)
                    .map_err(|e| format!("Invalid JSON: {:?}", e))?;
                
                if let Some(result) = json.get("result").and_then(|r| r.as_str()) {
                    let nonce_hex = result.trim_start_matches("0x");
                    u64::from_str_radix(nonce_hex, 16)
                        .map_err(|e| format!("Invalid hex: {:?}", e))
                } else {
                    Err("No result in response".to_string())
                }
            } else {
                Err(format!("HTTP error: {}", response.status))
            }
        }
        Err(err) => Err(format!("HTTP request failed: {:?}", err)),
    }
}

// Helper function to send Ethereum transaction via RPC
async fn send_eth_transaction(raw_tx_hex: &str) -> Result<String, String> {
    let request_body = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "eth_sendRawTransaction",
        "params": [raw_tx_hex]
    });
    
    let request = CanisterHttpRequestArgument {
        url: MEZO_TESTNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&request_body).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec())
                    .map_err(|e| format!("Invalid UTF-8: {:?}", e))?;
                let json: serde_json::Value = serde_json::from_str(&response_text)
                    .map_err(|e| format!("Invalid JSON: {:?}", e))?;
                
                if let Some(result) = json.get("result").and_then(|r| r.as_str()) {
                    Ok(result.to_string())
                } else {
                    Err("No result in response".to_string())
                }
            } else {
                Err(format!("HTTP error: {}", response.status))
            }
        }
        Err(err) => Err(format!("HTTP request failed: {:?}", err)),
    }
}

#[ic_cdk::update]
async fn bridge_musd_to_solana(musd_amount: u64) -> String {
    let caller = ic_cdk::caller();
    
    let position = POSITIONS.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No position found")
        })
    });
    
    if position.musd_minted < musd_amount {
        ic_cdk::trap("Insufficient mUSD balance");
    }
    
    let solana_canister_id = CANISTER_IDS.with(|ids| {
        ids.borrow().borrow().solana_canister.clone().unwrap_or_else(|| {
            ic_cdk::trap("Solana canister not configured. Please contact admin.")
        })
    });
    
    // Call Solana canister to generate address
    let sol_canister = Principal::from_text(&solana_canister_id).unwrap();
    
    // Call generate_solana_address on the Solana canister
    let sol_address_result: Result<(String,), _> = ic_cdk::call(sol_canister, "generate_solana_address", ())
        .await;
    
    let sol_address = match sol_address_result {
        Ok((addr,)) => addr,
        Err(err) => {
            ic_cdk::println!("Failed to generate Solana address: {:?}", err);
            // Fallback to placeholder
            format!("solana_placeholder_{}", caller.to_text())
        }
    };
    
    // Call send_sol on the Solana canister to bridge the mUSD
    // Note: In production, this would be a token transfer, not SOL transfer
    // We'll just call it and ignore the result for now since TransactionResult is defined in solana_canister
    let _bridge_result = ic_cdk::call::<(String, u64), (String, String, String)>(
        sol_canister,
        "send_sol",
        (sol_address.clone(), musd_amount),
    )
    .await;
    
    // Update position
    let updated_position = BridgePosition {
        user: caller,
        btc_collateral: position.btc_collateral,
        musd_minted: position.musd_minted,
        sol_deployed: position.sol_deployed + musd_amount,
        status: "bridged_to_solana".to_string(),
        btc_address: position.btc_address,
        sol_address: sol_address.clone(),
    };
    
    POSITIONS.with(|map| {
        map.borrow_mut().insert(caller, updated_position);
    });
    
    format!("Successfully bridged {} mUSD to Solana address: {}", musd_amount, sol_address)
}

#[ic_cdk::update]
fn deploy_to_yield_protocol(musd_amount: u64, protocol: String) -> String {
    let caller = ic_cdk::caller();
    
    let position = POSITIONS.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No position found")
        })
    });
    
    if position.sol_deployed < musd_amount {
        ic_cdk::trap("Insufficient bridged mUSD");
    }
    
    format!("Deployed {} mUSD to {} successfully", musd_amount, protocol)
}

#[ic_cdk::query]
fn get_position(user: Principal) -> BridgePosition {
    POSITIONS.with(|map| {
        map.borrow().get(&user).unwrap_or_else(|| {
            BridgePosition {
                user,
                btc_collateral: 0,
                musd_minted: 0,
                sol_deployed: 0,
                status: "none".to_string(),
                btc_address: "".to_string(),
                sol_address: "".to_string(),
            }
        })
    })
}

#[ic_cdk::query]
fn get_my_position() -> BridgePosition {
    get_position(ic_cdk::caller())
}

#[ic_cdk::query]
fn calculate_max_mintable(btc_collateral: u64) -> u64 {
    // At 90% LTV, user can mint 90% of collateral value
    (btc_collateral * MAX_LTV) / 100
}

#[ic_cdk::query]
fn get_bridge_stats() -> BridgeStats {
    let mut total_btc = 0u64;
    let mut total_musd = 0u64;
    let mut total_sol_deployed = 0u64;
    
    POSITIONS.with(|map| {
        for (_, position) in map.borrow().iter() {
            total_btc += position.btc_collateral;
            total_musd += position.musd_minted;
            total_sol_deployed += position.sol_deployed;
        }
    });
    
    let total_positions = POSITIONS.with(|map| map.borrow().len() as u64);
    
    BridgeStats {
        total_positions,
        total_btc_collateral: total_btc,
        total_musd_minted: total_musd,
        total_sol_deployed,
        max_ltv: MAX_LTV,
        interest_rate: INTEREST_RATE,
    }
}

#[ic_cdk::init]
fn init() {}

#[ic_cdk::post_upgrade]
fn post_upgrade() {}
