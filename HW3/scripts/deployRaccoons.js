const hre = require("hardhat");

async function main() {
    const Raccoons = await hre.ethers.getContractFactory("Raccoons");
    const raccoons = await Raccoons.deploy();
    await raccoons.waitForDeployment();
    
    console.log("Raccoons deployed to:", await raccoons.getAddress());
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});