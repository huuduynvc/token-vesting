const { ethers, JsonRpcProvider } = require("ethers");
require("dotenv").config();
const tokenVestingAbi = require("../../abis/token-vesting-abi.json");
const tokenAbi = require("../../abis/token-abi.json");

async function main() {
  const provider = new JsonRpcProvider(process.env.RPC_URL);
  const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

  // token vesting contract
  const tokenAddress = "0x0d9f5bE5b0Fcfa14077C9fddd088c910b409Ce40";
  const mockTokenVestingAddress = "0xefd09f4FA4412c7f12ae223Df0f9B49d196E403F";

  const tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

  await tokenContract.transfer(
    mockTokenVestingAddress,
    ethers.parseUnits(String(100000), 18)
  );

  const tokenVesting = new ethers.Contract(
    mockTokenVestingAddress,
    tokenVestingAbi,
    signer
  );

  const decimal = 18;

  // create signer 1
  const walletRound1 = new ethers.Wallet(
    process.env.ADDR_ROUND_1_PRIVATE_KEY,
    provider
  );

  // create signer 2
  const walletRound2 = new ethers.Wallet(
    process.env.ADDR_ROUND_2_PRIVATE_KEY,
    provider
  );

  // create signer 3
  const walletRound3 = new ethers.Wallet(
    process.env.ADDR_ROUND_3_PRIVATE_KEY,
    provider
  );

  // create signer 4
  const walletRound4 = new ethers.Wallet(
    process.env.ADDR_ROUND_4_PRIVATE_KEY,
    provider
  );

  // create vesting schedule
  const baseTime = 1622551248;
  const startTime = baseTime;
  const cliff = 60 * 60 * 24; // 1 day
  const baseDuration = 60 * 60 * 24; // 1 day
  const slicePeriodSeconds = cliff;
  const revokable = true;

  // create new package round 1
  await tokenVesting.createPackage(
    "1",
    "round 1",
    startTime,
    12 * cliff,
    baseDuration * 32,
    slicePeriodSeconds,
    ethers.parseUnits(String(50000), decimal)
  );

  // create new package round 2
  await tokenVesting.createPackage(
    "2",
    "round 2",
    startTime,
    14 * cliff,
    baseDuration * 36,
    slicePeriodSeconds,
    ethers.parseUnits(String(20000), decimal)
  );

  // create new package round 3
  await tokenVesting.createPackage(
    "3",
    "round 3",
    startTime,
    25 * cliff,
    baseDuration * 49,
    slicePeriodSeconds,
    ethers.parseUnits(String(20000), decimal)
  );

  // create new package round 4
  await tokenVesting.createPackage(
    "4",
    "round 4",
    startTime,
    1 * cliff,
    baseDuration * 7,
    slicePeriodSeconds,
    ethers.parseUnits(String(10000), decimal)
  );

  // create new vesting schedule for round 1
  await tokenVesting.createVestingSchedule(
    walletRound1.address,
    "1",
    revokable,
    ethers.parseUnits(String(50000), decimal)
  );

  // create new vesting schedule for round 2
  await tokenVesting.createVestingSchedule(
    walletRound2.address,
    "2",
    revokable,
    ethers.parseUnits(String(20000), decimal)
  );

  // create new vesting schedule for round 3
  await tokenVesting.createVestingSchedule(
    walletRound3.address,
    "3",
    revokable,
    ethers.parseUnits(String(20000), decimal)
  );

  // create new vesting schedule for round 4
  await tokenVesting.createVestingSchedule(
    walletRound4.address,
    "4",
    revokable,
    ethers.parseUnits(String(10000), decimal)
  );

  const round1VestingScheduleId =
    await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
      walletRound1.address,
      2
    );

  const round2VestingScheduleId =
    await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
      walletRound2.address,
      2
    );

  const round3VestingScheduleId =
    await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
      walletRound3.address,
      2
    );

  const round4VestingScheduleId =
    await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
      walletRound4.address,
      2
    );

  for (let i = 1; i <= 50; i++) {
    console.log("i: ", i);
    // set time to half the vesting period
    const checkTime = baseTime + baseDuration * i + 1;

    if (i <= 6) {
      await tokenVesting.setCurrentTime(checkTime);
      // release tokens
      await tokenVesting.release(
        round4VestingScheduleId,
        ethers.parseUnits(String(1666.6), decimal)
      );
    } else if (i >= 12 && i <= 13) {
      await tokenVesting.setCurrentTime(checkTime);
      // // release tokens
      await tokenVesting.release(
        round1VestingScheduleId,
        ethers.parseUnits(String(2500), decimal)
      );
    } else if (i >= 14 && i <= 24) {
      await tokenVesting.setCurrentTime(checkTime);
      // release tokens
      await tokenVesting.release(
        round1VestingScheduleId,
        ethers.parseUnits(String(2500), decimal)
      );

      // release tokens
      await tokenVesting.release(
        round2VestingScheduleId,
        ethers.parseUnits(String(909), decimal)
      );
    } else if (i >= 25 && i <= 31) {
      await tokenVesting.setCurrentTime(checkTime);
      // release tokens
      await tokenVesting.release(
        round1VestingScheduleId,
        ethers.parseUnits(String(2500), decimal)
      );

      // release tokens
      await tokenVesting.release(
        round2VestingScheduleId,
        ethers.parseUnits(String(909), decimal)
      );

      // release tokens
      await tokenVesting.release(
        round3VestingScheduleId,
        ethers.parseUnits(String(833), decimal)
      );
    } else if (i >= 32 && i <= 35) {
      await tokenVesting.setCurrentTime(checkTime);
      // release tokens
      await tokenVesting.release(
        round2VestingScheduleId,
        ethers.parseUnits(String(909), decimal)
      );

      // release tokens
      await tokenVesting.release(
        round3VestingScheduleId,
        ethers.parseUnits(String(833), decimal)
      );
    } else if (i >= 36 && i <= 48) {
      await tokenVesting.setCurrentTime(checkTime);
      // release tokens
      await tokenVesting.release(
        round3VestingScheduleId,
        ethers.parseUnits(String(833), decimal)
      );
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
