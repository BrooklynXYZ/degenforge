import { ethers } from "ethers";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from "@solana/spl-token";
import * as fs from 'fs';
import * as dotenv from 'dotenv';
dotenv.config();

// --- Configuration ---
const MEZO_RPC_URL = "https://rpc.test.mezo.org";
const SOLANA_RPC_URL = "https://api.devnet.solana.com";

const MEZO_BRIDGE_ADDRESS = "0x4876e8a7AF9a3eDB3c66F86746f1D905C251E0F8";
const WMUSD_MINT_ADDRESS = "CtNUcneZiAcW8q6npxgwmTdYkvZAojeLGjgfYnnHvrYX";
const MINT_AUTHORITY_KEYPAIR_PATH = "./wMUSD-mint-authority.json";

const mezoBridgeAbi = [
    "event MUSDLocked(address indexed from, string destinationSolanaAddress, uint256 amount)"
];

// --- Main Logic ---

async function main() {
    console.log("Starting bridge listener...");

    // 1. Setup Solana connection and load mint authority
    const solanaConnection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const mintAuthoritySecretKey = JSON.parse(fs.readFileSync(MINT_AUTHORITY_KEYPAIR_PATH, 'utf-8'));
    const mintAuthority = Keypair.fromSecretKey(Uint8Array.from(mintAuthoritySecretKey));
    const wMusdMintPublicKey = new PublicKey(WMUSD_MINT_ADDRESS);

    console.log(`Minter Authority PubKey: ${mintAuthority.publicKey.toBase58()}`);

    // 2. Setup Mezo provider and contract listener
    const mezoProvider = new ethers.JsonRpcProvider(MEZO_RPC_URL);
    const mezoBridgeContract = new ethers.Contract(MEZO_BRIDGE_ADDRESS, mezoBridgeAbi, mezoProvider);

    console.log(`Listening for MUSDLocked events on ${MEZO_BRIDGE_ADDRESS}...`);

    // 3. Listen for the MUSDLocked event
    mezoBridgeContract.on("MUSDLocked", async (from, destinationSolanaAddress, amount, event) => {
        console.log("\n--- MUSDLocked Event Detected! ---");
        console.log(`  From (Mezo): ${from}`);
        console.log(`  To (Solana): ${destinationSolanaAddress}`);
        console.log(`  Amount (wei): ${amount.toString()}`);
        console.log(`  Tx Hash: ${event.log.transactionHash}`);

        try {
            const destinationPublicKey = new PublicKey(destinationSolanaAddress);

            // MUSD on Mezo has 18 decimals, wMUSD on Solana has 6.
            // We need to adjust the amount.
            const adjustedAmount = amount / BigInt(10 ** 12);

            console.log(`\nMinting ${adjustedAmount.toString()} wMUSD to ${destinationSolanaAddress}...`);

            // Get or create the associated token account for the destination address
            const destinationAta = await getOrCreateAssociatedTokenAccount(
                solanaConnection,
                mintAuthority, // Payer
                wMusdMintPublicKey,
                destinationPublicKey
            );

            console.log(`  Destination ATA: ${destinationAta.address.toBase58()}`);

            // Mint the tokens
            const mintTx = await mintTo(
                solanaConnection,
                mintAuthority, // Payer
                wMusdMintPublicKey,
                destinationAta.address,
                mintAuthority, // Mint authority
                adjustedAmount
            );

            console.log(`  Mint successful! Transaction signature: ${mintTx}`);
            console.log("--- Event Processed ---
");

        } catch (error) {
            console.error("\nError processing event:", error);
            console.log("--- Event Failed ---
");
        }
    });
}

main().catch((error) => {
    console.error("Fatal error:", error);
    process.exit(1);
});
