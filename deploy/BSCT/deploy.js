const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  // const tokenContract = await hre.ethers.getContractFactory("CasinoFi");
  // const deployTokenContract = await tokenContract.deploy();
  // await deployTokenContract.deployed();
  // console.log("casino fi token contract :", deployTokenContract.address);

  const casinoContract = await hre.ethers.getContractFactory("CasinoContract");

  // protocol fee, min deposit, max deposit, subscription id
  const deployContract = await casinoContract.deploy(5, 3230);
  await deployContract.deployed();
  console.log("casino contract :", deployContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
