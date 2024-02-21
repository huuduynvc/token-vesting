const hre = require("hardhat");

async function main() {
  const tokenAddress = "0x0d9f5bE5b0Fcfa14077C9fddd088c910b409Ce40";
  const implementAddress = "0x6e723041EF1E3C3F79Ee1439262004D02d5909D2";
  // token vesting contract proxy
  const proxyAddress = "0xefd09f4FA4412c7f12ae223Df0f9B49d196E403F";

  // get token vesting contract factory
  const tokenVestingContract = await hre.ethers.getContractFactory(
    "MockTokenVesting"
  );

  // upgrade token vesting contract
  const upgradeTokenVestingContract = await hre.upgrades.upgradeProxy(
    proxyAddress,
    tokenVestingContract
  );
  console.log(
    "upgrade token vesting contract proxy:",
    await upgradeTokenVestingContract.getAddress()
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
