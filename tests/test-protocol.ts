import { ethers, Wallet, Contract, JsonRpcProvider, formatEther, parseUnits, parseEther } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

// --- Configuration ---
const MEZO_TESTNET_RPC = "https://rpc.test.mezo.org";
const BORROWER_OPERATIONS_ADDRESS = "0xCdF7028ceAB81fA0C6971208e83fa7872994beE5";
const MUSD_TOKEN_ADDRESS = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

const borrowerOperationsAbi = [
    "function openTrove(uint256 _debtAmount, address _upperHint, address _lowerHint) payable"
];

const musdAbi = [
    "function balanceOf(address account) view returns (uint256)"
];

async function main() {
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey || privateKey === "YOUR_PRIVATE_KEY_HERE") {
        console.error("Error: Please set your PRIVATE_KEY in the .env file inside the 'tests' directory.");
        process.exit(1);
    }

    // 1. Connect to the network
    const provider = new JsonRpcProvider(MEZO_TESTNET_RPC);
    const wallet = new Wallet(privateKey, provider);
    console.log(`Wallet Address: ${wallet.address}`);

    // 2. Instantiate contracts
    const borrowerOperations = new Contract(BORROWER_OPERATIONS_ADDRESS, borrowerOperationsAbi, wallet);
    const musdContract = new Contract(MUSD_TOKEN_ADDRESS, musdAbi, provider);

    // 3. Check initial balances
    const initialBtcBalance = await provider.getBalance(wallet.address);
    const initialMusdBalance = await musdContract.balanceOf(wallet.address);
    console.log(`Initial BTC Balance: ${formatEther(initialBtcBalance)} BTC`);
    console.log(`Initial MUSD Balance: ${formatEther(initialMusdBalance)} MUSD`);

    if (initialBtcBalance < parseEther("0.001")) {
        console.error("Error: Insufficient BTC balance for deposit. Please fund your wallet with Mezo testnet BTC.");
        return;
    }

    // 4. Define transaction parameters
    const btcToDeposit = parseEther("0.03");
    const musdToBorrow = parseUnits("1800", 18); // Minimum debt is 1800 MUSD
    const hint = "0x0000000000000000000000000000000000000000"; // Zero address is a safe default for hints

    // 5. Execute the openTrove transaction
    console.log(`\nAttempting to deposit ${formatEther(btcToDeposit)} BTC to borrow 1800 MUSD...`);
    try {
        const tx = await borrowerOperations.openTrove(
            musdToBorrow,
            hint,
            hint,
            { value: btcToDeposit }
        );

        console.log(`Transaction sent! Hash: ${tx.hash}`);
        console.log("Waiting for transaction to be mined...");
        await tx.wait();
        console.log("Transaction successful!");

    } catch (error) {
        console.error("\nTransaction failed:", error);
        return;
    }

    // 6. Check final balances
    const finalBtcBalance = await provider.getBalance(wallet.address);
    const finalMusdBalance = await musdContract.balanceOf(wallet.address);
    console.log(`\nFinal BTC Balance: ${formatEther(finalBtcBalance)} BTC`);
    console.log(`Final MUSD Balance: ${formatEther(finalMusdBalance)} MUSD`);

    if (finalMusdBalance > initialMusdBalance) {
        console.log("\n✅ Test Passed: MUSD balance increased successfully!");
    } else {
        console.log("\n❌ Test Failed: MUSD balance did not increase.");
    }
}

main().catch(error => {
    console.error(error);
    process.exit(1);
});
