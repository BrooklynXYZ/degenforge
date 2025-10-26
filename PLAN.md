# Mezo Hackathon Project: Cross-Chain BTC-Backed SOL Borrowing

## Objective
To build a proof-of-concept that allows a user to use Bitcoin (on the Mezo testnet) as collateral to borrow SOL tokens on the Solana testnet, demonstrating cross-chain asset utilization.

## Architecture Overview
The project consists of three main components:
1.  **Mezo-Side Components**: Smart contracts and scripts for interacting with the MUSD protocol on the Mezo testnet (`matsnet`).
2.  **Simulated Bridge**: A simple backend service that listens for events on Mezo and triggers actions on Solana, simulating a cross-chain bridge.
3.  **Solana-Side Lending**: A forked open-source lending protocol on the Solana testnet, configured to accept our bridged asset as collateral.

---

## Phase 1: Project Setup & Mezo Interaction

This phase focuses on setting up the development environment and interacting with the existing MUSD protocol to get the initial `MUSD` asset.

*   **Task 1.1: Environment Setup**
    *   Install Node.js and pnpm.
    *   Install the Solana Tool Suite for creating tokens and interacting with the Solana testnet.
    *   Install Hardhat for Ethereum/Mezo smart contract development.

*   **Task 1.2: Initialize Hardhat Project**
    *   Create a new directory for the project.
    *   Run `pnpm init` to create a `package.json` file.
    *   Run `pnpm add hardhat @nomicfoundation/hardhat-toolbox ethers` to install Hardhat and its dependencies.
    *   Run `npx hardhat init` to scaffold a new Hardhat project.

*   **Task 1.3: Interact with MUSD on `matsnet`**
    *   **Goal:** Write a script to deposit testnet BTC (the native gas token on `matsnet`) to mint `MUSD`.
    *   **Action:**
        1.  Obtain the ABIs and `matsnet` addresses for the MUSD `BorrowerOperations` and `TroveManager` contracts from the project documentation.
        2.  Create a new Hardhat script in the `scripts/` directory.
        3.  Use `ethers.js` to connect to the `matsnet` RPC.
        4.  The script will call the `openTrove` function on the `BorrowerOperations` contract to deposit collateral and mint `MUSD`. This will be our source of `MUSD` for the rest of the project.

---

## Phase 2: The Cross-Chain Bridge (Simulated)

This phase involves creating the components that simulate bridging `MUSD` from Mezo to Solana.

*   **Task 2.1: Mezo-Side Bridge Contract**
    *   **Goal:** Create a Solidity contract that "locks" `MUSD` and emits an event.
    *   **Action:**
        1.  In your Hardhat project, create `contracts/MezoBridge.sol`.
        2.  The contract will have one main function: `lockMUSD(uint256 amount, string solanaAddress)`.
        3.  This function will:
            *   Pull `MUSD` from the user's wallet into the contract.
            *   Emit an event: `TokensLocked(address indexed user, string destinationSolanaAddress, uint256 amount)`.

*   **Task 2.2: Solana-Side Wrapped Token (wMUSD)**
    *   **Goal:** Create a new SPL token on the Solana testnet to represent our bridged `MUSD`.
    *   **Action:**
        1.  Generate a new keypair that will be the "mint authority" for this token. Store this keypair securely.
        2.  Using the `spl-token` CLI or a script with `@solana/spl-token`, create a new token mint. We will call this token "Wrapped MUSD" (`wMUSD`).
        3.  Save the mint address of `wMUSD`; we will need it for the lending app.

*   **Task 2.3: Backend Listener Service**
    *   **Goal:** Create a Node.js script that listens to the Mezo contract and mints `wMUSD` on Solana.
    *   **Action:**
        1.  Create a new Node.js script (`bridge-listener.js`).
        2.  **Dependencies:** `ethers` and `@solana/web3.js`, `@solana/spl-token`.
        3.  **Logic:**
            *   Connect to the Mezo testnet RPC and instantiate the `MezoBridge` contract object.
            *   Listen for the `TokensLocked` event.
            *   When an event is detected, parse the `destinationSolanaAddress` and `amount`.
            *   Connect to the Solana testnet RPC.
            *   Load the `wMUSD` mint authority keypair.
            *   Execute a transaction on Solana to mint the specified `amount` of `wMUSD` tokens to the `destinationSolanaAddress`.

---

## Phase 3: Solana Lending Application

This phase involves setting up the borrowing/lending functionality on Solana.

*   **Task 3.1: Research & Fork an Open-Source Lending Protocol**
    *   **Goal:** Find a suitable open-source Solana lending protocol to use as a base.
    *   **Action:**
        1.  Investigate protocols like Solend, MarginFi, or others with available source code.
        2.  Choose one that has clear documentation for testnet deployment.
        3.  Clone the repository into a new local directory.

*   **Task 3.2: Deploy the Forked Protocol to Solana Testnet**
    *   **Goal:** Get a running instance of the lending protocol on the Solana testnet.
    *   **Action:**
        1.  Follow the protocol's documentation to build and deploy the on-chain programs using the Solana CLI.
        2.  This will likely involve creating a new "market" or "pool" for lending.

*   **Task 3.3: Add `wMUSD` as a Collateral Asset**
    *   **Goal:** Configure the deployed lending protocol to accept our `wMUSD` token.
    *   **Action:**
        1.  Locate the configuration mechanism for the forked protocol. This might be a command-line instruction or a script to initialize a new reserve.
        2.  Add the `wMUSD` token mint address as a new collateral asset.
        3.  Set lending parameters for `wMUSD`, such as the Loan-to-Value (LTV) ratio (e.g., 80%).

*   **Task 3.4: Frontend Interaction**
    *   **Goal:** Use the protocol's frontend to perform the final borrowing step.
    *   **Action:**
        1.  Configure and run the forked protocol's frontend application locally.
        2.  Point the frontend to your newly deployed protocol on the Solana testnet.
        3.  Use the UI to connect a Solana wallet, deposit the `wMUSD` received from the bridge, and borrow SOL against it.

---

## End-to-End Test Flow
1.  Get testnet funds from a Mezo (`matsnet`) faucet.
2.  Run the script from **Task 1.3** to mint `MUSD`.
3.  Run the `bridge-listener.js` script from **Task 2.3** in the background.
4.  Call the `lockMUSD` function on the `MezoBridge` contract, providing a Solana address.
5.  Verify that the listener script detects the event and mints `wMUSD` to the correct Solana address.
6.  Open the UI of the forked Solana lending app.
7.  Connect your Solana wallet and verify the `wMUSD` balance.
8.  Deposit `wMUSD` as collateral into the lending protocol.
9.  Borrow SOL against the deposited `wMUSD`.
