const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { web3 } = require("@openzeppelin/test-helpers/src/setup");
const { BN } = require("@openzeppelin/test-helpers");

const fromWei = (x) => web3.utils.fromWei(x.toString());
const toWei = (x) => web3.utils.toWei(x.toString());
const fromWei8Dec = (x) => Number(x) / Math.pow(10, 8);
const toWei8Dec = (x) => Number(x) * Math.pow(10, 8);
const fromWei2Dec = (x) => Number(x) / Math.pow(10, 2);
const toWei2Dec = (x) => Number(x) * Math.pow(10, 2);

//// npx hardhat test --network localhost

describe("Wallet", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployWallet() {

    const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

    const ethUsdContract = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419";
    const azukiPriceContract = "0xA8B9A447C73191744D5B79BcE864F343455E1150";

    const tknName = "tknHW2";
    const tknSymbol = "HW2";
    const amount = 1000000;

    // Contracts are deployed using the first signer/account by default
    const [owner, firstAccount, secondAccount, fakeOwner] = await ethers.getSigners();
    
    const Wallet = await ethers.getContractFactory("Wallet");
    const wallet = await Wallet.deploy(ethUsdContract, azukiPriceContract, {gasLimit: 4000000});

    const Token = await ethers.getContractFactory("Token");
    const token = await Token.deploy(tknName, tknSymbol, amount, {gasLimit: 4000000});

    expect(await token.getAddress()).to.be.not.equal(ZERO_ADDRESS);
    expect(await token.getAddress()).to.match(/0x[0-9a-fA-F]{40}/);

    const PriceEthUsd = await ethers.getContractFactory("PriceConsumerV3");
    const priceEthUsd = await PriceEthUsd.deploy(ethUsdContract, {gasLimit: 4000000});

    const PriceAzukiEth = await ethers.getContractFactory("PriceConsumerV3");
    const priceAzukiEth = await PriceAzukiEth.deploy(azukiPriceContract, {gasLimit: 4000000});

    return { token, wallet, priceEthUsd, priceAzukiEth, owner, firstAccount, secondAccount, fakeOwner };
  }

  describe("Deployment", function () {
    it("Should deploy", async function () {
      const {token, wallet, priceEthUsd} = await loadFixture(deployWallet);

      console.log(
        `\t\t-Wallet deployed to ${await wallet.getAddress()}\n`
      );

      console.log(
        `\t\t-Token deployed to ${await token.getAddress()}\n`
      );
    
      console.log(
        `\t\t-ethUsdPrice deployed to ${await priceEthUsd.getAddress()}\n`
      );
    });

    it("Distribute some tokens from deployer", async function () {
      const {token, firstAccount, secondAccount} = await loadFixture(deployWallet);

      await token.transfer(firstAccount, toWei("100000"), {gasLimit: 4000000});
      await token.transfer(secondAccount, toWei("150000"), {gasLimit: 4000000});

      expect(await token.balanceOf(firstAccount)).to.be.equal(toWei("100000"));
      expect(await token.balanceOf(secondAccount)).to.be.equal(toWei("150000"));
    });
  });

  describe("Prices", function () {
    it("Should retrieve the Eth/Usd Price", async function () {
      const {priceEthUsd} = await loadFixture(deployWallet);

      ret = await priceEthUsd.getPriceDecimals();
      console.log("\t*" + ret.toString() + " decimals");

      res = await priceEthUsd.getLatestPrice();
      console.log("\t*" + fromWei8Dec(res).toString() + " USD");
      // https://coinmarketcap.com/it/currencies/ethereum/
    });

    it("Should retrieve the Azuki/Eth Price", async function () {
      const {priceAzukiEth} = await loadFixture(deployWallet);

      ret = await priceAzukiEth.getPriceDecimals();
      console.log("\t*" + ret.toString() + " decimals");

      res = await priceAzukiEth.getLatestPrice();
      console.log("\t*" + fromWei(res).toString() + " ETH");

      // https://data.chain.link/ethereum/mainnet/nft-floor-prices/coinbase-azuki-floor-price-eth
    });
  });

  describe("Conversions", function () {
    it("Should convert 1 ETH in current USD change", async function () {
      const {wallet, firstAccount} = await loadFixture(deployWallet);

      const transactionHash = await firstAccount.sendTransaction({
        to: await wallet.getAddress(),
        value: toWei(1),
        gasLimit: 4000000
      });

      ret = await wallet.convertEthInUSD(firstAccount);

      console.log("\t1 ETH converted in " + fromWei2Dec(ret) + " USD for firstAccount");
    });

    it("Get USD in ETH", async function () {
      const {wallet} = await loadFixture(deployWallet);

      ret = await wallet.convertUSDinEth(toWei2Dec(5000));

      console.log("\t*" + fromWei(ret) + " ETH");
    });

    it("Get NFT Price in USD", async function () {
      const {wallet} = await loadFixture(deployWallet);

      ret = await wallet.convertNFTPriceInUSD();

      console.log("\t*" + fromWei2Dec(ret) + " USD/Azuki");
    });

    it("Convert USD in Tokens", async function () {
      const {wallet} = await loadFixture(deployWallet);

      ret = await wallet.convertUSDInNFTAmount(toWei2Dec(15000));

      console.log("\t" + ret[0].toString() + " Azuki bought");
      console.log("\t" + fromWei2Dec(ret[1]) + " USD remained");
    });
  });
});
