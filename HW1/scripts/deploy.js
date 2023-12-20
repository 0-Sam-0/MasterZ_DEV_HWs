// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

async function main() {
  
  const bkltContract = await hre.ethers.deployContract("Blacklist");

  const bkltAddress = await bkltContract.getAddress();

  const token = await hre.ethers.deployContract("Token", ["tknHW1", "HW1", bkltAddress]);

  //await bkltContract.waitForDeployment();

  console.log(
`Blacklist contract deployed address: ${bkltAddress}
Token contract deployed at: ${await token.getAddress()},
name: ${await token.name()},
symbol: ${await token.symbol()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
