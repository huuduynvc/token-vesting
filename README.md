# Warena

# Local Development

The following assumes the use of `node@>=14` and `npm@>=6`.

## Install Dependencies

`npm install --save-dev hardhat`

`npm install ganache-cli`

## Compile Contracts

`npx hardhat compile`

## Run Ganache-cli

`npx hardhat node`

## Run Tests

`npx hardhat --network localhost test`

## BSC Network

### Deploy BSC Test Net

`npx hardhat run --network bsct deploy/BSCT/deploy.js`

### Deploy BSC Main Net

`npx hardhat run --network bsc deploy/BSCM/deploy.js`

### Verify + public source code on bscscan test net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network bsct verify --constructor-args ./args/BSCT/deployArgs.js DEPLOYED_CONTRACT_ADDRESS
```

npx hardhat --network goerli verify --constructor-args ./args/goerli/deployArgs.js

### Verify + public source code on bscscan main net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network mainnet verify --constructor-args ./args/BSCM/deployArgs.js DEPLOYED_CONTRACT_ADDRESS
```

## Harmony One Network

### Deploy Harmony One Test Net

`npx hardhat run --network one deploy/One/deploy.js`

### Modify Hardhat-etherscan To Verify + Public Source Code On Harmony One

1. Clone and build the project at https://github.com/victaphu/hardhat.
2. Copy the folder `hardhat-etherscan` at `./packages/hardhat-etherscan` from the hardhat project.
3. Replace the `hardhat-etherscan` at `node_modules/@nomiclabs/hardhat-etherscan` in `node_modules` folder of SMARTCONTRACT-OSIZ project.
4. Change the Etherscan api-key config in hardhat.config.js as the following scheme.

```bash
{
...
  etherscan: {
    apiKey: {
      harmonyTest: `${process.env.ETHERSCAN_KEY}`,
    },
  },
};
```

### Verify + public source code on Harmony One explorer test net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network one verify --constructor-args ./args/One/deployArgs.js DEPLOYED_CONTRACT_ADDRESS
```
