const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { BN } = require("@openzeppelin/test-helpers");

describe("Token", function () {

  async function deployToken() {
    const tknName = "tknHW1";
    const tknSymbol = "HW1";

    // Contracts are deployed using the first signer/account by default
    const [owner, firstAccount, secondAccount] = await ethers.getSigners();


    const Bklt = await ethers.getContractFactory("Blacklist");
    const bklt = await Bklt.deploy();
    
    const bkltAddress = await bklt.getAddress();
    
    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(tknName, tknSymbol, bkltAddress);

    return { token, bklt, tknName, tknSymbol, owner, firstAccount, secondAccount };
  }

  describe("Deployment", function () {
    it("Should set the right name", async function () {
      const {token, tknName} = await loadFixture(deployToken);

      expect(await token.name()).to.equal(tknName);
    });

    it("Should set the right symbol", async function () {
      const {token, tknSymbol} = await loadFixture(deployToken);

      expect(await token.symbol()).to.equal(tknSymbol);
    });

    it("Should set the right owner", async function () {
      const {token, owner} = await loadFixture(deployToken);

      expect(await token.owner()).to.equal(owner.address);
    });
  });

  describe("Transfers", function () {
    describe("Empty Balance Transfer", function () {
      it("Should revert because owner has 0 token", async function () {

        const {token, owner, firstAccount} = await loadFixture(deployToken);
        
        const bal = await token.balanceOf(owner);

        console.log(`\t\tOwner balance: ${bal}`);

        await expect(token.transfer(firstAccount, web3.utils.toWei("1"))).to.be.revertedWith(
          "ERC20: transfer amount exceeds balance"
        );
      });
    });

    describe("Mint To FirstAccount", function () {
      it("Should mint 5 tokens to first account", async function () {

        const {token, owner, firstAccount} = await loadFixture(deployToken);
        
        await token.mint(owner, web3.utils.toWei("5"));

        expect(await token.balanceOf(owner)).to.be.equal(web3.utils.toWei("5"));
      });
    });

    describe("Mint And Transfer", function () {
      it("Shouldn't fail because now owner ha 5 tokens", async function () {

        const {token, owner, firstAccount} = await loadFixture(deployToken);
        
        await token.mint(owner, web3.utils.toWei("5"));

        await token.transfer(firstAccount, web3.utils.toWei("2"));

        expect(await token.balanceOf(owner)).to.be.equal(web3.utils.toWei("3"));
        expect(await token.balanceOf(firstAccount)).to.be.equal(web3.utils.toWei("2"));
      });
    });

    describe("Acc1 Transfers To Acc2", function () {
      it("Shouldn't fail because both accounts aren't blacklisted", async function () {

        const {token, firstAccount, secondAccount} = await loadFixture(deployToken);
        
        await token.mint(firstAccount, web3.utils.toWei("10"));

        await token.connect(firstAccount).transfer(secondAccount, web3.utils.toWei("4.5"));

        expect(await token.balanceOf(firstAccount)).to.be.equal(web3.utils.toWei("5.5"));
        expect(await token.balanceOf(secondAccount)).to.be.equal(web3.utils.toWei("4.5"));
      });
    });

    describe("TransferFrom", function () {
      it("Should let second account transfer from first after approval", async function () {

        const {token, firstAccount, secondAccount} = await loadFixture(deployToken);
        
        await token.mint(firstAccount, web3.utils.toWei("50"));

        await token.connect(firstAccount).approve(secondAccount, web3.utils.toWei("30"));

        await token.connect(secondAccount).transferFrom(firstAccount, secondAccount, web3.utils.toWei("15"));

        expect(await token.balanceOf(firstAccount)).to.be.equal(web3.utils.toWei("35"));
        expect(await token.balanceOf(secondAccount)).to.be.equal(web3.utils.toWei("15"));
      });
    });
  });

  describe("BlacklistOperations", function () {
    describe("Insert first account in blacklist and mint to him", function () {
      it("Should revert because first account is blacklisted", async function () {

        const {token, bklt, firstAccount} = await loadFixture(deployToken);
        
        await bklt.allowToken(await token.getAddress());

        await token.insertInBklt(firstAccount);

        await expect(token.transfer(firstAccount, web3.utils.toWei("12"))).to.be.revertedWith(
          "Blacklisted addresses"
        );
      });
    });

    describe("1Acc bklisted and 2 transfer to 1", function () {
      it("Should revert because first account is blacklisted", async function () {

        const {token, bklt, firstAccount, secondAccount} = await loadFixture(deployToken);
        
        await bklt.allowToken(await token.getAddress());

        await token.insertInBklt(firstAccount);

        await expect(token.connect(secondAccount).transfer(firstAccount, web3.utils.toWei("5"))).to.be.revertedWith(
          "Blacklisted addresses"
        );
      });
    });

    describe("1Acc bklisted and 1 transfer to 2", function () {
      it("Should revert because first account is blacklisted", async function () {
        
        const {token, bklt, firstAccount, secondAccount} = await loadFixture(deployToken);
        
        await bklt.allowToken(await token.getAddress());

        await token.mint(firstAccount, web3.utils.toWei("50"));

        await token.insertInBklt(firstAccount);

        await expect(token.connect(firstAccount).transfer(secondAccount, web3.utils.toWei("5"))).to.be.revertedWith(
          "Blacklisted addresses"
        );
      });

      it("Shouldn't revert because now first account isn't blacklisted", async function () {

        const {token, bklt, firstAccount, secondAccount} = await loadFixture(deployToken);
        
        await bklt.allowToken(await token.getAddress());

        await token.mint(firstAccount, web3.utils.toWei("50"));

        await token.insertInBklt(firstAccount);
        
        await token.removeFromBklt(firstAccount);

        await token.connect(firstAccount).transfer(secondAccount, web3.utils.toWei("5"));
        
        expect(await token.balanceOf(firstAccount)).to.be.equal(web3.utils.toWei("45"));
        expect(await token.balanceOf(secondAccount)).to.be.equal(web3.utils.toWei("5"));
      });
    });
  });

  describe("Last Things to get full statements coverage", function () {
    describe("Burn", function () {
      it("FirstAccount burns a part of his balance", async function () {

        const {token, firstAccount} = await loadFixture(deployToken);

        await token.mint(firstAccount, web3.utils.toWei("50"));

        await token.connect(firstAccount).burn(web3.utils.toWei("21"));
        
        expect(await token.balanceOf(firstAccount)).to.be.equal(web3.utils.toWei("29"));
      });
    });

    describe("Trying to allow the address 0 in the allowedTokens", function () {
      it("Should revert", async function () {

        const {bklt} = await loadFixture(deployToken);
        
        const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

        await expect(bklt.allowToken(ZERO_ADDRESS)).to.be.revertedWith(
          "Cannot allow the 0 address"
        );
      });
    });

    describe("Unallowed address tries to call addBlacklist and removeBlacklist", function () {
      it("Should revert (add)", async function () {
        
        const {token, firstAccount} = await loadFixture(deployToken);

        await expect(token.insertInBklt(firstAccount)).to.be.revertedWith(
          "Address not allowed!"
        );
      });

      it("Should revert (remove)", async function () {      
        const {token, firstAccount} = await loadFixture(deployToken);

        await expect(token.removeFromBklt(firstAccount)).to.be.revertedWith(
          "Address not allowed!"
        );
      });
    });

    describe("Trying to use onlyOwner functions from another user", function () {
      it("Should revert (mint)", async function () {

        const {token, firstAccount} = await loadFixture(deployToken);

        await expect(token.connect(firstAccount).mint(firstAccount, web3.utils.toWei("1000"))).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("Should revert (insert in BKLT)", async function () {

        const {token, firstAccount, secondAccount} = await loadFixture(deployToken);

        await expect(token.connect(firstAccount).insertInBklt(secondAccount)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("Should revert (remove from BKLT)", async function () {

        const {token, firstAccount, secondAccount} = await loadFixture(deployToken);

        await expect(token.connect(firstAccount).removeFromBklt(secondAccount)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("Should revert (allowToken)", async function () {

        const {bklt, firstAccount, secondAccount} = await loadFixture(deployToken);

        await expect(bklt.connect(firstAccount).allowToken(secondAccount)).to.be.revertedWith(
          "Ownable: caller is not the owner"
        );
      });
    });
  });
});
