# Token Vesting

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

### Localhost

`npx hardhat --network localhost test` or `yarn test`

### Fantom Testnet

`node ./scripts/FTMT/token-vesting.js`

## Network

### Deploy BSC Test Net

`npx hardhat run --network bsct deploy/BSCT/deploy.js`

### Deploy Fantom Test Net

`npx hardhat run --network ftmTestnet deploy/FTMT/deploy.js`

### Upgrade Proxy Fantom Test Net

`npx hardhat run --network ftmTestnet deploy/FTMT/upgrade-proxy.js`

### Verify + public source code on bscscan test net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network bsct verify --constructor-args ./args/BSCT/token-vesting-args.js DEPLOYED_CONTRACT_ADDRESS
```

### Verify + public source code on ftmscan test net

1. Create new constructor params file in arguments folder
2.

```bash
npx hardhat --network ftmTestnet verify --constructor-args ./args/FTMT/token-vesting-args.js DEPLOYED_CONTRACT_ADDRESS
```
