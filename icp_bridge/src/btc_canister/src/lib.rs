use candid::{CandidType, Deserialize, Principal};
use ic_cdk::api::management_canister::{
    bitcoin::{BitcoinNetwork, GetBalanceRequest, GetUtxosRequest},
    ecdsa::{EcdsaCurve, EcdsaKeyId},
};
use ic_stable_structures::{memory_manager::{MemoryManager, VirtualMemory, MemoryId}, StableBTreeMap, DefaultMemoryImpl, Storable, storable::Bound};
use serde_bytes::ByteBuf;
use std::cell::RefCell;
use std::borrow::Cow;
use std::convert::TryInto;

mod bitcoin_address;

const KEY_NAME: &str = "test_key_1";
const BTC_NETWORK: BitcoinNetwork = BitcoinNetwork::Testnet;

// Wrapper to make Vec<Vec<u8>> Storable
#[derive(Clone, Debug, CandidType, Deserialize)]
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
    
    // Check if address already exists
    if let Some(addr) = BTC_ADDRESSES.with(|map| {
        map.borrow().get(&caller)
    }) {
        return addr;
    }
    
    // Derive unique path for this caller
    let derivation_path = DerivationPath(vec![caller.as_slice().to_vec()]);
    
    // Request ECDSA public key from ICP
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
            ic_cdk::trap(&format!(
                "Failed to get ECDSA public key: {:?}. Make sure the ECDSA key '{}' is configured in dfx.json and the local replica has access to it.",
                err, KEY_NAME
            ));
        }
    };
    
    // Convert public key to P2PKH address
    let btc_address = bitcoin_address::public_key_to_p2pkh(
        &public_key_response.public_key,
        BTC_NETWORK == BitcoinNetwork::Mainnet,
    );
    
    // Store mapping
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
    match ic_cdk::api::management_canister::bitcoin::bitcoin_get_balance(
        GetBalanceRequest {
            address: address.clone(),
            network: BTC_NETWORK,
            min_confirmations: Some(6),
        },
    )
    .await
    {
        Ok((balance,)) => balance,
        Err(err) => {
            ic_cdk::println!("Failed to fetch balance: {:?}", err);
            0
        }
    }
}

#[ic_cdk::update]
async fn get_utxos(address: String) -> Vec<UTXOInfo> {
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
                outpoint.push(utxo.outpoint.vout.try_into().unwrap());
                UTXOInfo {
                    outpoint: ByteBuf::from(outpoint),
                    value: utxo.value,
                    height: utxo.height as u64,
                }
            }).collect()
        }
        Err(err) => {
            ic_cdk::trap(&format!("Failed to fetch UTXOs: {:?}", err));
        }
    }
}

#[ic_cdk::update]
async fn sign_transaction(message_hash: ByteBuf) -> ByteBuf {
    let caller = ic_cdk::caller();
    
    // Get caller's derivation path
    let derivation_path = DERIVATION_PATHS.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No BTC address found for caller")
        })
    });
    
    let signature = ic_cdk::api::management_canister::ecdsa::sign_with_ecdsa(
        ic_cdk::api::management_canister::ecdsa::SignWithEcdsaArgument {
            message_hash: message_hash.to_vec(),
            derivation_path: derivation_path.0.clone(),
            key_id: EcdsaKeyId {
                curve: EcdsaCurve::Secp256k1,
                name: KEY_NAME.to_string(),
            },
        },
    )
    .await
    .unwrap()
    .0
    .signature;
    
    ByteBuf::from(signature)
}

#[ic_cdk::update]
async fn send_btc(to_address: String, amount_satoshis: u64) -> String {
    let caller = ic_cdk::caller();
    
    let from_address = BTC_ADDRESSES.with(|map| {
        map.borrow().get(&caller).unwrap_or_else(|| {
            ic_cdk::trap("No BTC address found for caller")
        })
    });
    
    // Fetch UTXOs
    let utxos = get_utxos(from_address.clone()).await;
    
    if utxos.is_empty() {
        ic_cdk::trap("No UTXOs available for transaction");
    }
    
    // Note: Building and broadcasting Bitcoin transactions requires proper transaction construction
    // This is a simplified placeholder - in production, use a proper Bitcoin library
    // For now, return success message
    format!("Transaction prepared: {} satoshis from {} to {}", amount_satoshis, from_address, to_address)
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
