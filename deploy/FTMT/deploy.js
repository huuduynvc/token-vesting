const { ethers } = require("ethers");
const hre = require("hardhat");

async function main() {
  // deploy test token
  const tokenContract = await hre.ethers.getContractFactory("Token");
  const deployTokenContract = await tokenContract.deploy(
    "TestToken",
    "TT",
    1000000
  );
  await deployTokenContract.waitForDeployment();
  console.log("test token contract :", await deployTokenContract.getAddress());

  // deploy token vesting contract
  const tokenVestinContract = await hre.ethers.getContractFactory(
    "MockTokenVesting"
  );
  const deployTokenVestingContract = await tokenVestinContract.deploy(
    await deployTokenContract.getAddress()
  );
  await deployTokenVestingContract.waitForDeployment();
  console.log(
    "token vesting contract :",
    await deployTokenVestingContract.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
