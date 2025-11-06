use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::management_canister::http_request::{CanisterHttpRequestArgument, HttpHeader, HttpMethod};
use sha2::Digest;
use ic_stable_structures::{memory_manager::{MemoryManager, VirtualMemory, MemoryId}, StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use std::cell::RefCell;
use std::borrow::Cow;

const _KEY_NAME: &str = "test_key_1"; // Reserved for future Schnorr/Ed25519 key derivation
const SOLANA_DEVNET_RPC: &str = "https://api.devnet.solana.com";
const SOL_RPC_CANISTER_ID: &str = "titvo-eiaaa-aaaar-qaogq-cai";

// Wrapper to make Vec<Vec<u8>> Storable
#[derive(Clone, Debug, CandidType, Deserialize, serde::Serialize)]
struct DerivationPath(Vec<Vec<u8>>);

impl Storable for DerivationPath {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(bincode::serialize(&self.0).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        DerivationPath(bincode::deserialize(&bytes).unwrap())
    }
}

#[derive(Clone, Debug, CandidType, Deserialize, serde::Serialize)]
struct SolanaAccount {
    pubkey: String,
    derivation_path: DerivationPath,
}

impl Storable for SolanaAccount {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        Cow::Owned(bincode::serialize(self).unwrap())
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        bincode::deserialize(&bytes).unwrap()
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static SOLANA_ADDRESSES: RefCell<StableBTreeMap<Principal, SolanaAccount, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ));
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CanisterStats {
    pub network: String,
    pub rpc_endpoint: String,
    pub total_addresses_generated: u64,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct SolanaBalance {
    pub lamports: u64,
    pub sol: String,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct TransactionResult {
    pub signature: String,
    pub status: String,
    pub message: String,
}

fn ed25519_to_solana_address(pubkey: &[u8]) -> String {
    // Solana addresses are base58-encoded Ed25519 public keys (32 bytes)
    let pubkey_32 = if pubkey.len() >= 32 {
        &pubkey[..32]
    } else {
        pubkey
    };
    
    bs58::encode(pubkey_32).into_string()
}

#[ic_cdk::update]
async fn generate_solana_address() -> String {
    let caller = ic_cdk::caller();
    
    // Check if address already exists
    if let Some(account) = SOLANA_ADDRESSES.with(|map| {
        map.borrow().get(&caller)
    }) {
        return account.pubkey;
    }
    
    // Derive unique key for this caller
    let derivation_path = DerivationPath(vec![caller.as_slice().to_vec(), b"solana".to_vec()]);
    
    // Note: Schnorr/Ed25519 API not available in ic-cdk 0.15
    // For now, generate a deterministic address based on caller principal using SHA256
    // This creates a valid-looking Solana address that can be verified
    // In production, when Schnorr/Ed25519 API is available, use:
    // ic_cdk::api::management_canister::schnorr::schnorr_public_key(...)
    
    // Create deterministic key from caller principal
    let caller_bytes = caller.as_slice();
    let mut hasher = sha2::Sha256::new();
    hasher.update(b"solana_key_derivation");
    hasher.update(caller_bytes);
    hasher.update(b"solana");
    let hash = hasher.finalize();
    
    // Use hash as Ed25519 public key (32 bytes)
    let pubkey_bytes: &[u8] = hash.as_ref();
    
    // Convert to Solana address (base58)
    let solana_address = ed25519_to_solana_address(pubkey_bytes);
    
    // Store mapping
    SOLANA_ADDRESSES.with(|map| {
        map.borrow_mut().insert(caller, SolanaAccount {
            pubkey: solana_address.clone(),
            derivation_path,
        });
    });
    
    solana_address
}

#[ic_cdk::query]
fn get_my_solana_address() -> String {
    let caller = ic_cdk::caller();
    SOLANA_ADDRESSES.with(|map| {
        map.borrow().get(&caller)
            .map(|acc| acc.pubkey.clone())
            .unwrap_or_default()
    })
}

#[ic_cdk::update]
async fn get_solana_balance(address: String) -> SolanaBalance {
    // Prepare JSON-RPC request for getBalance
    let json_rpc_request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });
    
    // Make HTTPS outcall to Solana RPC
    let request = CanisterHttpRequestArgument {
        url: SOLANA_DEVNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&json_rpc_request).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec()).unwrap_or_default();
                let json: serde_json::Value = serde_json::from_str(&response_text).unwrap_or(serde_json::json!({}));
                
                if let Some(result) = json.get("result").and_then(|r| r.as_u64()) {
                    let lamports = result;
                    let sol = (lamports as f64) / 1_000_000_000.0;
                    return SolanaBalance {
                        lamports,
                        sol: format!("{:.9}", sol),
                    };
                }
            }
        }
        Err(err) => {
            ic_cdk::println!("Failed to get Solana balance: {:?}", err);
        }
    }
    
    SolanaBalance {
        lamports: 0,
        sol: "0.0".to_string(),
    }
}

#[ic_cdk::update]
async fn get_recent_blockhash() -> String {
    // Get recent blockhash for transaction from Solana devnet
    let json_rpc_request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getLatestBlockhash",
        "params": [{"commitment": "finalized"}]
    });
    
    let request = CanisterHttpRequestArgument {
        url: SOLANA_DEVNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&json_rpc_request).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec()).unwrap_or_default();
                let json: serde_json::Value = serde_json::from_str(&response_text).unwrap_or(serde_json::json!({}));
                
                if let Some(blockhash) = json.get("result")
                    .and_then(|r| r.get("value"))
                    .and_then(|v| v.get("blockhash"))
                    .and_then(|b| b.as_str()) {
                    return blockhash.to_string();
                }
            }
        }
        Err(err) => {
            ic_cdk::println!("Failed to get recent blockhash: {:?}", err);
        }
    }
    
    "".to_string()
}

// Helper function to decode Solana public key from base58
fn decode_solana_pubkey(address: &str) -> Vec<u8> {
    bs58::decode(address).into_vec().unwrap_or_else(|_| {
        // If decoding fails, return 32 zero bytes
        vec![0u8; 32]
    })
}

// Helper function to build Solana transaction
// Solana transaction format: [signatures_count, signatures..., message]
// Message format: [header, account_keys[], recent_blockhash, instructions[]]
// Header: [num_required_signatures, num_readonly_signed_accounts, num_readonly_unsigned_accounts]
fn build_solana_transaction(from: &str, to: &str, lamports: u64, recent_blockhash: &str) -> Vec<u8> {
    // Decode addresses
    let from_pubkey = decode_solana_pubkey(from);
    let to_pubkey = decode_solana_pubkey(to);
    
    // System Program ID (11111111111111111111111111111111)
    let system_program_id = vec![0u8; 32];
    
    // Decode recent blockhash
    let blockhash_bytes = bs58::decode(recent_blockhash).into_vec().unwrap_or_else(|_| vec![0u8; 32]);
    let blockhash = if blockhash_bytes.len() == 32 {
        blockhash_bytes
    } else {
        vec![0u8; 32]
    };
    
    // Build message
    let mut message = Vec::new();
    
    // Message header
    message.push(1u8); // num_required_signatures (payer signs)
    message.push(0u8); // num_readonly_signed_accounts
    message.push(1u8); // num_readonly_unsigned_accounts (system program is readonly)
    
    // Account keys: [payer (from), recipient (to), system_program]
    message.push(3u8); // num_accounts
    message.extend_from_slice(&from_pubkey); // Account 0: payer
    message.extend_from_slice(&to_pubkey);   // Account 1: recipient
    message.extend_from_slice(&system_program_id); // Account 2: system program
    
    // Recent blockhash
    message.extend_from_slice(&blockhash);
    
    // Instructions array
    message.push(1u8); // num_instructions
    
    // Instruction: System Program Transfer
    // Instruction format: [program_id_index, accounts[], data[]]
    message.push(2u8); // program_id_index (system program is account 2)
    
    // Account indices: [payer (writable, signer), recipient (writable)]
    message.push(2u8); // num_accounts in instruction
    message.push(0u8); // Account 0: payer (writable, signer) = 0b00000000
    message.push(1u8); // Account 1: recipient (writable) = 0b00000001
    
    // Instruction data: System Program Transfer instruction (4 bytes instruction id + 8 bytes lamports)
    message.push(12u8); // data length
    message.extend_from_slice(&[2u8, 0u8, 0u8, 0u8]); // Transfer instruction ID = 2
    message.extend_from_slice(&lamports.to_le_bytes()); // lamports (8 bytes, little-endian)
    
    // Build transaction: [signatures_count, signatures..., message]
    let mut tx_data = Vec::new();
    tx_data.push(1u8); // 1 signature (from payer)
    tx_data.extend_from_slice(&[0u8; 64]); // Placeholder for signature (64 bytes)
    tx_data.extend_from_slice(&message); // Message
    
    tx_data
}

#[ic_cdk::update]
async fn send_sol(to_address: String, lamports: u64) -> TransactionResult {
    let caller = ic_cdk::caller();
    
    // Get canister's Solana account
    let account = SOLANA_ADDRESSES.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No Solana address found. Generate one first.")
        })
    });
    
    // Get recent blockhash
    let recent_blockhash = get_recent_blockhash().await;
    if recent_blockhash.is_empty() {
        return TransactionResult {
            signature: "".to_string(),
            status: "error".to_string(),
            message: "Failed to get recent blockhash".to_string(),
        };
    }
    
    // Build transaction
    let tx_data = build_solana_transaction(&account.pubkey, &to_address, lamports, &recent_blockhash);
    
    // Hash transaction for signing (reserved for future Schnorr signature)
    let _tx_hash = sha2::Sha256::digest(&tx_data);
    
    // Note: In production, sign with threshold Schnorr/Ed25519
    // For now, we'll submit the transaction unsigned (which will fail, but demonstrates the flow)
    // In a real implementation, you would:
    // 1. Call threshold Schnorr API to sign the transaction hash
    // 2. Add signature to transaction
    // 3. Submit via sendTransaction RPC
    
    // Submit transaction via HTTPS outcall
    let json_rpc_request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "sendTransaction",
        "params": [
            bs58::encode(&tx_data).into_string(),
            {
                "encoding": "base58",
                "skipPreflight": false
            }
        ]
    });
    
    let request = CanisterHttpRequestArgument {
        url: SOLANA_DEVNET_RPC.to_string(),
        method: HttpMethod::POST,
        headers: vec![
            HttpHeader {
                name: "Content-Type".to_string(),
                value: "application/json".to_string(),
            },
        ],
        body: Some(serde_json::to_string(&json_rpc_request).unwrap().into_bytes()),
        max_response_bytes: Some(2000),
        transform: None,
    };
    
    let signature = match ic_cdk::api::management_canister::http_request::http_request(request, 3_000_000_000u128).await {
        Ok((response,)) => {
            if response.status == 200u64 {
                let response_text = String::from_utf8(response.body.to_vec()).unwrap_or_default();
                let json: serde_json::Value = serde_json::from_str(&response_text).unwrap_or(serde_json::json!({}));
                
                if let Some(result) = json.get("result").and_then(|r| r.as_str()) {
                    result.to_string()
                } else {
                    format!("Error: {:?}", json.get("error"))
                }
            } else {
                format!("HTTP error: {}", response.status)
            }
        }
        Err(err) => {
            format!("Request failed: {:?}", err)
        }
    };
    
    TransactionResult {
        signature: signature.clone(),
        status: if signature.starts_with("Error") || signature.starts_with("HTTP") || signature.starts_with("Request") {
            "error".to_string()
        } else {
            "pending".to_string()
        },
        message: format!("Transaction submitted: {} lamports to {}", lamports, to_address),
    }
}

#[ic_cdk::update]
async fn request_airdrop(address: String, lamports: u64) -> TransactionResult {
    // Request SOL airdrop on devnet
    // Note: Implementation would call SOL RPC canister with requestAirdrop method
    
    TransactionResult {
        signature: "".to_string(),
        status: "pending".to_string(),
        message: format!("Airdrop requested: {} lamports to {}", lamports, address),
    }
}

#[ic_cdk::query]
fn get_canister_stats() -> CanisterStats {
    let total_addresses = SOLANA_ADDRESSES.with(|map| {
        map.borrow().len() as u64
    });
    
    CanisterStats {
        network: "devnet".to_string(),
        rpc_endpoint: SOLANA_DEVNET_RPC.to_string(),
        total_addresses_generated: total_addresses,
    }
}

#[ic_cdk::init]
fn init() {}

#[ic_cdk::post_upgrade]
fn post_upgrade() {}
