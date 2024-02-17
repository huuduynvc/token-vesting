require("@nomiclabs/hardhat-truffle5");
require("@nomiclabs/hardhat-ganache");
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomicfoundation/hardhat-chai-matchers");
require("dotenv").config();

module.exports = {
  defaultNetwork: "ganache",
  solidity: {
    compilers: [
      {
        version: "0.5.16",
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.4",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 1000,
          },
        },
      },
    ],
  },

  networks: {
    ganache: {
      url: "http://ganache:8545",
      accounts: {
        mnemonic:
          "tail actress very wool broom rule frequent ocean nice cricket extra snap",
        path: " m/44'/60'/0'/0/",
        initialIndex: 0,
        count: 20,
      },
    },
    bsct: {
      url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
      accounts: [`${process.env.PRIVATE_KEY}`],
      // gas: 8100000,
      // gasPrice: 8000000000,
    },
    bsc: {
      url: "https://bsc-dataseed1.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    oneTestnet: {
      url: `https://api.s0.b.hmny.io`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    oneMainnet: {
      url: `https://api.harmony.one`,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    "thunder-testnet": {
      allowUnlimitedContractSize: true,
      url: "https://testnet-rpc.thundercore.com",
      chainId: 18,
      gas: 90000000,
      gasPrice: 15e9,
      gasMultiplier: 1,
      timeout: 20000,
      httpHeaders: {},
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    "thunder-mainnet": {
      url: "https://mainnet-rpc.thundercore.com",
      chainId: 108,
      gas: 90000000,
      gasPrice: 1e9,
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    polygon: {
      url: "https://polygon-mainnet.g.alchemy.com/v2/QgcYJ6gNLtj6heScKpNZEOTpY7v3ccGs",
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
    goerli: {
      url: "https://goerli.infura.io/v3/3eadb2e1b6db490994b8ca1626250298",
      accounts: [`${process.env.PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: {
      goerli: `${process.env.ETHERSCAN_KEY}`,
      harmonyTest: `${process.env.ETHERSCAN_KEY}`,
      harmony: `${process.env.ETHERSCAN_KEY}`,
      bscTestnet: `${process.env.ETHERSCAN_KEY}`,
      bsc: `${process.env.ETHERSCAN_KEY}`,
      polygon: `XUQ6GID599DWG22I87RMPTIWJ2TX6YUQE7`,
      "thunder-testnet": "unused",
    },
    customChains: [
      {
        network: "thunder-testnet",
        chainId: 18,
        urls: {
          apiURL: "https://explorer-testnet.thundercore.com/api",
          browserURL: "https://explorer-testnet.thundercore.com",
        },
      },
    ],
  },
};
