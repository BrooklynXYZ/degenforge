use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::management_canister::{
    bitcoin::{BitcoinNetwork, GetBalanceRequest, GetUtxosRequest},
    ecdsa::{EcdsaCurve, EcdsaKeyId},
};
use ic_stable_structures::{memory_manager::{MemoryManager, VirtualMemory, MemoryId}, StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use serde_bytes::ByteBuf;
use std::cell::RefCell;
use std::borrow::Cow;

mod bitcoin_address;

const KEY_NAME: &str = "test_key_1";
const BTC_NETWORK: BitcoinNetwork = BitcoinNetwork::Testnet;

#[derive(Clone, Debug, CandidType, Deserialize)]
struct DerivationPath(Vec<Vec<u8>>);

impl Storable for DerivationPath {
    const BOUND: Bound = Bound::Unbounded;
    
    fn to_bytes(&self) -> Cow<[u8]> {
        match bincode::serialize(&self.0) {
            Ok(bytes) => Cow::Owned(bytes),
            Err(e) => {
                ic_cdk::println!("Error serializing DerivationPath: {:?}", e);
                ic_cdk::trap("Failed to serialize DerivationPath");
            }
        }
    }

    fn from_bytes(bytes: Cow<[u8]>) -> Self {
        match bincode::deserialize(&bytes) {
            Ok(path) => DerivationPath(path),
            Err(e) => {
                ic_cdk::trap(&format!("Failed to deserialize DerivationPath: {:?}. This could lead to using the wrong Bitcoin address.", e));
            }
        }
    }
}

thread_local! {
    static MEMORY_MANAGER: RefCell<MemoryManager<DefaultMemoryImpl>> =
        RefCell::new(MemoryManager::init(DefaultMemoryImpl::default()));
    
    static BTC_ADDRESSES: RefCell<StableBTreeMap<Principal, String, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(0)))
        ));
    
    static DERIVATION_PATHS: RefCell<StableBTreeMap<Principal, DerivationPath, VirtualMemory<DefaultMemoryImpl>>> =
        RefCell::new(StableBTreeMap::init(
            MEMORY_MANAGER.with(|m| m.borrow().get(MemoryId::new(1)))
        ));
}

#[derive(CandidType, Deserialize, Clone, Debug)]
pub struct UTXOInfo {
    pub outpoint: ByteBuf,
    pub value: u64,
    pub height: u64,
}

#[derive(CandidType, Deserialize, Debug)]
pub struct CanisterStats {
    pub network: String,
    pub key_name: String,
    pub total_addresses_generated: u64,
}

#[ic_cdk::update]
async fn generate_btc_address() -> String {
    let caller = ic_cdk::caller();
    
    if let Some(addr) = BTC_ADDRESSES.with(|map| map.borrow().get(&caller)) {
        return addr;
    }
    
    let derivation_path = DerivationPath(vec![caller.as_slice().to_vec()]);
    
    let public_key_response = match ic_cdk::api::management_canister::ecdsa::ecdsa_public_key(
        ic_cdk::api::management_canister::ecdsa::EcdsaPublicKeyArgument {
            canister_id: None,
            derivation_path: derivation_path.0.clone(),
            key_id: EcdsaKeyId {
                curve: EcdsaCurve::Secp256k1,
                name: KEY_NAME.to_string(),
            },
        },
    )
    .await
    {
        Ok((response,)) => response,
        Err(err) => {
            ic_cdk::trap(&format!("Failed to get ECDSA public key: {:?}", err));
        }
    };
    
    let btc_address = bitcoin_address::public_key_to_p2pkh(
        &public_key_response.public_key,
        BTC_NETWORK == BitcoinNetwork::Mainnet,
    );
    
    ic_cdk::println!("Generated BTC address: {}", btc_address);
    ic_cdk::println!("Network: {:?}", BTC_NETWORK);
    ic_cdk::println!("Address format: {}", if BTC_NETWORK == BitcoinNetwork::Mainnet { "Mainnet (1...)" } else { "Testnet (m... or n...)" });
    
    BTC_ADDRESSES.with(|map| {
        map.borrow_mut().insert(caller, btc_address.clone());
    });
    
    DERIVATION_PATHS.with(|map| {
        map.borrow_mut().insert(caller, derivation_path);
    });
    
    btc_address
}

#[ic_cdk::query]
fn get_my_btc_address() -> String {
    let caller = ic_cdk::caller();
    BTC_ADDRESSES.with(|map| {
        map.borrow().get(&caller).unwrap_or_default()
    })
}

#[ic_cdk::update]
async fn get_btc_balance(address: String) -> u64 {
    if address.is_empty() {
        ic_cdk::trap("Address cannot be empty");
    }
    
    ic_cdk::println!("=== BTC BALANCE QUERY START ===");
    ic_cdk::println!("Address: {}", address);
    ic_cdk::println!("Network: {:?}", BTC_NETWORK);
    ic_cdk::println!("Address Length: {}", address.len());
    ic_cdk::println!("Address First Char: {}", address.chars().next().unwrap_or('?'));
    
    // First, check UTXOs to see if transaction is visible
    ic_cdk::println!("Step 1: Checking UTXOs...");
    let utxos_request = GetUtxosRequest {
        address: address.clone(),
        network: BTC_NETWORK,
        filter: None,
    };
    
    match ic_cdk::api::management_canister::bitcoin::bitcoin_get_utxos(utxos_request).await {
        Ok((utxos_response,)) => {
            ic_cdk::println!("✅ UTXOs Query Success: {} UTXOs found", utxos_response.utxos.len());
            for (i, utxo) in utxos_response.utxos.iter().enumerate() {
                ic_cdk::println!("  UTXO[{}]: value={} sats, height={}", i, utxo.value, utxo.height);
            }
            ic_cdk::println!("  Tip height: {}", utxos_response.tip_height);
        }
        Err(e) => {
            ic_cdk::println!("❌ UTXOs Query Failed: Code={:?}, Message={}", e.0, e.1);
        }
    }
    
    // Now try balance with 6 confirmations
    ic_cdk::println!("Step 2: Querying balance with 6 confirmations...");
    let request = GetBalanceRequest {
        address: address.clone(),
        network: BTC_NETWORK,
        min_confirmations: Some(6),
    };
    
    match ic_cdk::api::management_canister::bitcoin::bitcoin_get_balance(request).await {
        Ok((balance,)) => {
            ic_cdk::println!("✅ Balance with 6 confirmations: {} satoshis", balance);
            ic_cdk::println!("=== BTC BALANCE QUERY END ===");
            balance
        }
        Err(err) => {
            ic_cdk::println!("❌ Balance query failed");
            ic_cdk::println!("Error Code: {:?}", err.0);
            ic_cdk::println!("Error Message: {}", err.1);
            
            // Try with 0 confirmations as fallback
            ic_cdk::println!("Step 3: Retrying with 0 confirmations...");
            let request_zero = GetBalanceRequest {
                address: address.clone(),
                network: BTC_NETWORK,
                min_confirmations: Some(0),
            };
            
            match ic_cdk::api::management_canister::bitcoin::bitcoin_get_balance(request_zero).await {
                Ok((balance,)) => {
                    ic_cdk::println!("✅ Balance with 0 confirmations: {} satoshis", balance);
                    ic_cdk::println!("=== BTC BALANCE QUERY END ===");
                    balance
                }
                Err(err2) => {
                    ic_cdk::println!("❌ Balance query with 0 confirmations also failed");
                    ic_cdk::println!("Error Code: {:?}", err2.0);
                    ic_cdk::println!("Error Message: {}", err2.1);
                    ic_cdk::println!("=== BTC BALANCE QUERY END ===");
                    
                    let error_msg = format!(
                        "Bitcoin API Error - Code: {:?}, Message: {}, Address: {}",
                        err2.0, err2.1, address
                    );
                    ic_cdk::trap(&error_msg);
                }
            }
        }
    }
}

#[ic_cdk::update]
async fn get_utxos(address: String) -> Vec<UTXOInfo> {
    if address.is_empty() {
        ic_cdk::trap("Address cannot be empty");
    }
    
    let utxos_result = ic_cdk::api::management_canister::bitcoin::bitcoin_get_utxos(
        GetUtxosRequest {
            address: address.clone(),
            network: BTC_NETWORK,
            filter: None,
        },
    )
    .await;
    
    match utxos_result {
        Ok((response,)) => {
            response.utxos.into_iter().map(|utxo| {
                let mut outpoint = utxo.outpoint.txid.to_vec();
                outpoint.extend_from_slice(&utxo.outpoint.vout.to_le_bytes());
                UTXOInfo {
                    outpoint: ByteBuf::from(outpoint),
                    value: utxo.value,
                    height: utxo.height as u64,
                }
            }).collect()
        }
        Err(err) => {
            ic_cdk::trap(&format!("Failed to fetch UTXOs for address {}: {:?}", address, err));
        }
    }
}

#[ic_cdk::update]
async fn sign_transaction(message_hash: ByteBuf) -> ByteBuf {
    let caller = ic_cdk::caller();
    
    let derivation_path = DERIVATION_PATHS.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No BTC address found for caller")
        })
    });
    
    let signature_result = ic_cdk::api::management_canister::ecdsa::sign_with_ecdsa(
        ic_cdk::api::management_canister::ecdsa::SignWithEcdsaArgument {
            message_hash: message_hash.to_vec(),
            derivation_path: derivation_path.0.clone(),
            key_id: EcdsaKeyId {
                curve: EcdsaCurve::Secp256k1,
                name: KEY_NAME.to_string(),
            },
        },
    )
    .await;
    
    let signature = match signature_result {
        Ok((response,)) => response.signature,
        Err(err) => {
            ic_cdk::trap(&format!("Failed to sign transaction: {:?}", err));
        }
    };
    
    ByteBuf::from(signature)
}

#[ic_cdk::update]
async fn send_btc(_to_address: String, _amount_satoshis: u64) -> String {
    ic_cdk::trap("Bitcoin sending not implemented. Use external wallet for now.");
}

#[ic_cdk::query]
fn get_canister_stats() -> CanisterStats {
    let total_addresses = BTC_ADDRESSES.with(|map| {
        map.borrow().len() as u64
    });
    
    CanisterStats {
        network: match BTC_NETWORK {
            BitcoinNetwork::Mainnet => "mainnet".to_string(),
            BitcoinNetwork::Testnet => "testnet".to_string(),
            BitcoinNetwork::Regtest => "regtest".to_string(),
        },
        key_name: KEY_NAME.to_string(),
        total_addresses_generated: total_addresses,
    }
}

#[ic_cdk::init]
fn init() {}

#[ic_cdk::post_upgrade]
fn post_upgrade() {}
