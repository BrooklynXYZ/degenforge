// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./interfaces/IERC20.sol";

contract MezoBridge {
    IERC20 public immutable musdToken;

    event MUSDLocked(
        address indexed from,
        string destinationSolanaAddress,
        uint256 amount
    );

    constructor(address _musdTokenAddress) {
        musdToken = IERC20(_musdTokenAddress);
    }

    /**
     * @notice Locks MUSD tokens in the contract and emits an event to be picked up by the bridge listener.
     * @param amount The amount of MUSD to lock.
     * @param solanaAddress The destination Solana address as a string.
     * @dev The user must first approve this contract to spend their MUSD.
     */
    function lockMUSD(uint256 amount, string calldata solanaAddress) external {
        require(amount > 0, "Amount must be greater than zero");
        require(bytes(solanaAddress).length > 0, "Solana address cannot be empty");

        // Pull MUSD tokens from the user to this contract
        bool success = musdToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "MUSD transfer failed");

        emit MUSDLocked(msg.sender, solanaAddress, amount);
    }
}
