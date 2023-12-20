require("@nomicfoundation/hardhat-toolbox");
require('dotenv').config();
require("@truffle/dashboard-hardhat-plugin");
require("solidity-docgen");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.19",
  setting: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  },
  networks: {
    hardhat: {
    },
    dashboard: {
      url: "http://localhost:24012/rpc"
    },
    mumbai: {
      chainId: 80001,
      url: "https://polygon-mumbai-bor.publicnode.com"
    }
  },
  docgen: {
    sourcesDir: 'contracts',
    outputDir: 'documentation',
    templates: 'templates',
    pages: 'files',
    clear: true,
    runOnCompile: true,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: "YYI3CJ1B5RN27IP2TCKRK81VFA5I33T86U"
      //polygonMumbai: process.env.POLYGONSCAN_KEY,
    }
    // deployed @0xf747F6F1FeF1a590407EDF789085c90b71ddabd8
  }
};
