const hre = require("hardhat");

async function main() {
  // deploy test token
  const tokenContract = await hre.ethers.getContractFactory("Token");
  const deployTokenContract = await tokenContract.deploy(
    "TestToken",
    "TT",
    1000000
  );
  await deployTokenContract.deployed();
  xư;
  console.log("test token contract :", deployTokenContract.address);

  // deploy token vesting contract
  const tokenVestinContract = await hre.ethers.getContractFactory(
    "TokenVesting"
  );
  const deployTokenVestingContract = await tokenVestinContract.deploy(
    deployTokenContract.address
  );
  await deployTokenVestingContract.deployed();
  console.log("token vesting contract :", deployTokenVestingContract.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
