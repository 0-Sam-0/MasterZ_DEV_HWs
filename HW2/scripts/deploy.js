// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.

//// npx hardhat node --fork https://eth-mainnet.g.alchemy.com/v2/*******************

const hre = require("hardhat");

async function main() {
  const ethUsdContract = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
  const azukiPriceContract = "0xA8B9A447C73191744D5B79BcE864F343455E1150";

  const wallet = await hre.ethers.deployContract("Wallet", [ethUsdContract, azukiPriceContract]);

  console.log(
    `-Wallet deployed to ${await wallet.getAddress()}\n`
  );

  const token = await hre.ethers.deployContract("Token", ["tknHW2", "HW2", 1000000]);

  console.log(
    `-Token deployed to ${await token.getAddress()}\n`
  );

  const ethUsdPrice = await hre.ethers.deployContract("PriceConsumerV3", [ethUsdContract]);

  console.log(
    `-ethUsdPrice deployed to ${await ethUsdPrice.getAddress()}\n`
  );

  const azukiPrice = await hre.ethers.deployContract("PriceConsumerV3", [azukiPriceContract]);

  console.log(
    `-azukiPrice deployed to ${await azukiPrice.getAddress()}\n`
  );

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
