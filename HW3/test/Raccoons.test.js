const{ BigNumber, constants } = require('ethers');
const { expect } = require("chai");
require("@nomicfoundation/hardhat-chai-matchers");

let raccoonsContract;

describe("raccoons test", function() {
    baseURI = "ipfs://QmeWA1kKqux979q7cYDGrWM1a3BS5NRiXZvHW6TNH7yHPy";

    it("contract setup", async function(){
        [owner, firstAccount, secondAccount, thirdAccount] = await ethers.getSigners();
        
        const Raccoons = await hre.ethers.getContractFactory("Raccoons");
        raccoonsContract = await Raccoons.deploy();
        await raccoonsContract.waitForDeployment();
        
        console.log("Raccoons deployed to:", await raccoonsContract.getAddress());
    })

    it("owner mint some tokens", async function() {
        raccoonsContract.connect(owner).mint(firstAccount, 1, 2, "0x");
        raccoonsContract.connect(owner).mint(secondAccount, 3, 1, "0x");
    })

    it("owner batch-mints some tokens", async function() {
        raccoonsContract.connect(owner).mintBatch(thirdAccount, [1,4,5], [2,2,2], "0x");
    })
});