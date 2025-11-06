use candid::{CandidType, Deserialize, Principal};
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
    // For now, generate a placeholder address based on caller principal
    // In production, this would need to use the appropriate key derivation API
    let caller_bytes = caller.as_slice();
    let mut pubkey_bytes = [0u8; 32];
    let len = caller_bytes.len().min(32);
    pubkey_bytes[..len].copy_from_slice(&caller_bytes[..len]);
    
    // Convert to Solana address (base58)
    let solana_address = ed25519_to_solana_address(&pubkey_bytes);
    
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
    let _json_rpc_request = serde_json::json!({
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getBalance",
        "params": [address]
    });
    
    // Call SOL RPC canister with devnet provider
    let _sol_rpc_principal = Principal::from_text(SOL_RPC_CANISTER_ID).unwrap();
    
    // Note: Actual implementation would call the sol-rpc-canister
    // For now, return a placeholder response
    // In production, use: ic_cdk::call(_sol_rpc_principal, "request", (rpc_config, _json_rpc_request, max_response_bytes))
    
    SolanaBalance {
        lamports: 0,
        sol: "0.0".to_string(),
    }
}

#[ic_cdk::update]
async fn get_recent_blockhash() -> String {
    // Get recent blockhash for transaction from Solana devnet
    // Following recommended pattern: use getSlot then getBlock
    // For now, return placeholder
    "".to_string()
}

#[ic_cdk::update]
async fn send_sol(to_address: String, lamports: u64) -> TransactionResult {
    let caller = ic_cdk::caller();
    
    // Get canister's Solana account
    let _account = SOLANA_ADDRESSES.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No Solana address found. Generate one first.")
        })
    });
    
    // Note: Full implementation would:
    // 1. Get recent blockhash
    // 2. Build Solana transaction
    // 3. Sign with threshold Schnorr
    // 4. Submit via SOL RPC canister
    
    TransactionResult {
        signature: "".to_string(),
        status: "pending".to_string(),
        message: format!("Prepared: {} lamports to {}", lamports, to_address),
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
