const hre = require("hardhat");

async function main() {
  const marketplace = await hre.ethers.deployContract("NFTMarketplace");
  await marketplace.waitForDeployment();

  const NFT = await hre.ethers.deployContract("SimpleNFT");
  await NFT.waitForDeployment();

  console.log(`Marketplace contract deployed to:${marketplace.target}`);
  console.log(`Marketplace contract deployed to:${NFT.target}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});