import { ethers } from "hardhat";

async function main() {
  // The MUSD token address on Mezo Testnet (matsnet)
  const musdTokenAddress = "0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503";

  const mezoBridgeFactory = await ethers.getContractFactory("MezoBridge");
  const mezoBridge = await mezoBridgeFactory.deploy(musdTokenAddress);

  await mezoBridge.waitForDeployment();

  const contractAddress = await mezoBridge.getAddress();
  console.log(`MezoBridge deployed to: ${contractAddress}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
