const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenVesting", function () {
  let Token;
  let testToken;
  let TokenVesting;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  const denom = 10 ** 18;
  const decimal = 18;

  before(async function () {
    Token = await ethers.getContractFactory("Token");
    TokenVesting = await ethers.getContractFactory("MockTokenVesting");
  });
  beforeEach(async function () {
    [owner, addr1, addr2, addr3, addr4, addr5, addr6, ...addrs] =
      await ethers.getSigners();
    testToken = await Token.deploy("Test Token", "TT", 1000000);
    await testToken.waitForDeployment();
  });

  describe("Vesting", function () {
    // it("Should assign the total supply of tokens to the owner", async function () {
    //   const ownerBalance =
    //     Number(await testToken.balanceOf(await owner.getAddress())) / denom;
    //   expect(Number(await testToken.totalSupply()) / denom).to.equal(
    //     ownerBalance
    //   );
    // });

    // it("Should vest tokens gradually", async function () {
    //   // deploy vesting contract
    //   const tokenVesting = await TokenVesting.deploy(
    //     await testToken.getAddress()
    //   );
    //   await tokenVesting.waitForDeployment();
    //   expect((await tokenVesting.getToken()).toString()).to.equal(
    //     await testToken.getAddress()
    //   );

    //   // send tokens to vesting contract
    //   await testToken.transfer(
    //     await tokenVesting.getAddress(),
    //     ethers.parseUnits(String(1000), decimal)
    //   );
    //   const vestingContractBalance =
    //     Number(await testToken.balanceOf(await tokenVesting.getAddress())) /
    //     denom;
    //   expect(Number(vestingContractBalance)).to.equal(1000);
    //   expect(
    //     Number(await tokenVesting.getWithdrawableAmount()) / denom
    //   ).to.equal(1000);

    //   const baseTime = 1622551248;
    //   const beneficiary = addr1;
    //   const startTime = baseTime;
    //   const cliff = 0;
    //   const duration = 1000;
    //   const slicePeriodSeconds = 1;
    //   const revokable = true;
    //   const amount = ethers.parseUnits(String(100), decimal);

    //   // create new vesting schedule
    //   await tokenVesting.createVestingSchedule(
    //     beneficiary.address,
    //     startTime,
    //     cliff,
    //     duration,
    //     slicePeriodSeconds,
    //     revokable,
    //     amount
    //   );

    //   expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
    //     1
    //   );
    //   expect(
    //     Number(
    //       await tokenVesting.getVestingSchedulesCountByBeneficiary(
    //         beneficiary.address
    //       )
    //     )
    //   ).to.be.equal(1);

    //   // compute vesting schedule id
    //   const vestingScheduleId =
    //     await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
    //       beneficiary.address,
    //       0
    //     );

    //   // check that vested amount is 0
    //   expect(
    //     Number(await tokenVesting.computeReleasableAmount(vestingScheduleId))
    //   ).to.be.equal(0);

    //   // set time to half the vesting period
    //   const halfTime = baseTime + duration / 2;
    //   await tokenVesting.setCurrentTime(halfTime);

    //   // check that vested amount is half the total amount to vest
    //   expect(
    //     Number(
    //       await tokenVesting
    //         .connect(beneficiary)
    //         .computeReleasableAmount(vestingScheduleId)
    //     ) / denom
    //   ).to.be.closeTo(50.1, 0.01);

    //   // check that only beneficiary can try to release vested tokens
    //   await expect(
    //     tokenVesting
    //       .connect(addr2)
    //       .release(vestingScheduleId, ethers.parseUnits(String(100), decimal))
    //   ).to.be.revertedWith(
    //     "TokenVesting: only beneficiary and owner can release vested tokens"
    //   );

    //   // check that beneficiary cannot release more than the vested amount
    //   await expect(
    //     tokenVesting
    //       .connect(beneficiary)
    //       .release(vestingScheduleId, ethers.parseUnits(String(100), decimal))
    //   ).to.be.revertedWith(
    //     "TokenVesting: cannot release tokens, not enough vested tokens"
    //   );

    //   // release 10 tokens and check that a Transfer event is emitted with a value of 10
    //   await expect(
    //     tokenVesting
    //       .connect(beneficiary)
    //       .release(vestingScheduleId, ethers.parseUnits(String(10), decimal))
    //   )
    //     .to.emit(testToken, "Transfer")
    //     .withArgs(
    //       await tokenVesting.getAddress(),
    //       beneficiary.address,
    //       ethers.parseUnits(String(10), decimal)
    //     );

    //   // check that the vested amount is now 40
    //   expect(
    //     Number(
    //       await tokenVesting
    //         .connect(beneficiary)
    //         .computeReleasableAmount(vestingScheduleId)
    //     ) / denom
    //   ).to.be.closeTo(40.1, 0.01);
    //   let vestingSchedule = await tokenVesting.getVestingSchedule(
    //     vestingScheduleId
    //   );

    //   // check that the released amount is 10
    //   expect(Number(vestingSchedule.released) / denom).to.be.equal(10);

    //   // set current time after the end of the vesting period
    //   await tokenVesting.setCurrentTime(baseTime + duration + 1);

    //   // check that the vested amount is 90
    //   expect(
    //     await tokenVesting
    //       .connect(beneficiary)
    //       .computeReleasableAmount(vestingScheduleId)
    //   ).to.be.equal(ethers.parseUnits(String(90), decimal));

    //   // beneficiary release vested tokens (45)
    //   await expect(
    //     tokenVesting
    //       .connect(beneficiary)
    //       .release(vestingScheduleId, ethers.parseUnits(String(45), decimal))
    //   )
    //     .to.emit(testToken, "Transfer")
    //     .withArgs(
    //       await tokenVesting.getAddress(),
    //       beneficiary.address,
    //       ethers.parseUnits(String(45), decimal)
    //     );

    //   // owner release vested tokens (45)
    //   await expect(
    //     tokenVesting
    //       .connect(owner)
    //       .release(vestingScheduleId, ethers.parseUnits(String(45), decimal))
    //   )
    //     .to.emit(testToken, "Transfer")
    //     .withArgs(
    //       await tokenVesting.getAddress(),
    //       beneficiary.address,
    //       ethers.parseUnits(String(45), decimal)
    //     );
    //   vestingSchedule = await tokenVesting.getVestingSchedule(
    //     vestingScheduleId
    //   );

    //   // check that the number of released tokens is 100
    //   expect(vestingSchedule.released).to.be.equal(
    //     ethers.parseUnits(String(100), decimal)
    //   );

    //   // check that the vested amount is 0
    //   expect(
    //     await tokenVesting
    //       .connect(beneficiary)
    //       .computeReleasableAmount(vestingScheduleId)
    //   ).to.be.equal(0);

    //   // check that anyone cannot revoke a vesting
    //   await expect(
    //     tokenVesting.connect(addr2).revoke(vestingScheduleId)
    //   ).to.be.revertedWith("Ownable: caller is not the owner");

    //   await tokenVesting.revoke(vestingScheduleId);

    //   /*
    //    * TEST SUMMARY
    //    * deploy vesting contract
    //    * send tokens to vesting contract
    //    * create new vesting schedule (100 tokens)
    //    * check that vested amount is 0
    //    * set time to half the vesting period
    //    * check that vested amount is half the total amount to vest (50 tokens)
    //    * check that only beneficiary can try to release vested tokens
    //    * check that beneficiary cannot release more than the vested amount
    //    * release 10 tokens and check that a Transfer event is emitted with a value of 10
    //    * check that the released amount is 10
    //    * check that the vested amount is now 40
    //    * set current time after the end of the vesting period
    //    * check that the vested amount is 90 (100 - 10 released tokens)
    //    * release all vested tokens (90)
    //    * check that the number of released tokens is 100
    //    * check that the vested amount is 0
    //    * check that anyone cannot revoke a vesting
    //    */
    // });

    // it("Should release vested tokens if revoked", async function () {
    //   // deploy vesting contract
    //   const tokenVesting = await TokenVesting.deploy(
    //     await testToken.getAddress()
    //   );
    //   await tokenVesting.waitForDeployment();
    //   expect((await tokenVesting.getToken()).toString()).to.equal(
    //     await testToken.getAddress()
    //   );
    //   // send tokens to vesting contract
    //   await expect(
    //     testToken.transfer(
    //       await tokenVesting.getAddress(),
    //       ethers.parseUnits(String(1000), decimal)
    //     )
    //   )
    //     .to.emit(testToken, "Transfer")
    //     .withArgs(
    //       owner.address,
    //       await tokenVesting.getAddress(),
    //       ethers.parseUnits(String(1000), decimal)
    //     );

    //   const baseTime = 1622551248;
    //   const beneficiary = addr1;
    //   const startTime = baseTime;
    //   const cliff = 0;
    //   const duration = 1000;
    //   const slicePeriodSeconds = 1;
    //   const revokable = true;
    //   const amount = ethers.parseUnits(String(100), decimal);

    //   // create new vesting schedule
    //   await tokenVesting.createVestingSchedule(
    //     beneficiary.address,
    //     startTime,
    //     cliff,
    //     duration,
    //     slicePeriodSeconds,
    //     revokable,
    //     amount
    //   );

    //   // compute vesting schedule id
    //   const vestingScheduleId =
    //     await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
    //       beneficiary.address,
    //       0
    //     );

    //   // set time to half the vesting period
    //   const halfTime = baseTime + duration / 2;
    //   await tokenVesting.setCurrentTime(halfTime);

    //   await expect(tokenVesting.revoke(vestingScheduleId))
    //     .to.emit(testToken, "Transfer")
    //     .withArgs(
    //       await tokenVesting.getAddress(),
    //       beneficiary.address,
    //       ethers.parseUnits(String(50.1), decimal)
    //     );
    // });

    // it("Should compute vesting schedule index", async function () {
    //   const tokenVesting = await TokenVesting.deploy(
    //     await testToken.getAddress()
    //   );
    //   await tokenVesting.waitForDeployment();
    //   const expectedVestingScheduleId =
    //     "0xa279197a1d7a4b7398aa0248e95b8fcc6cdfb43220ade05d01add9c5468ea097";
    //   expect(
    //     (
    //       await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
    //         addr1.address,
    //         0
    //       )
    //     ).toString()
    //   ).to.equal(expectedVestingScheduleId);
    //   expect(
    //     (
    //       await tokenVesting.computeNextVestingScheduleIdForHolder(
    //         addr1.address
    //       )
    //     ).toString()
    //   ).to.equal(expectedVestingScheduleId);
    // });

    // it("Should check input parameters for createVestingSchedule method", async function () {
    //   const tokenVesting = await TokenVesting.deploy(
    //     await testToken.getAddress()
    //   );
    //   await tokenVesting.waitForDeployment();
    //   await testToken.transfer(
    //     await tokenVesting.getAddress(),
    //     ethers.parseUnits(String(1000), decimal)
    //   );
    //   const time = Date.now();
    //   await expect(
    //     tokenVesting.createVestingSchedule(
    //       addr1.address,
    //       time,
    //       0,
    //       0,
    //       1,
    //       false,
    //       1
    //     )
    //   ).to.be.revertedWith("TokenVesting: duration must be > 0");
    //   await expect(
    //     tokenVesting.createVestingSchedule(
    //       addr1.address,
    //       time,
    //       0,
    //       1,
    //       0,
    //       false,
    //       1
    //     )
    //   ).to.be.revertedWith("TokenVesting: slicePeriodSeconds must be >= 1");
    //   await expect(
    //     tokenVesting.createVestingSchedule(
    //       addr1.address,
    //       time,
    //       0,
    //       1,
    //       1,
    //       false,
    //       0
    //     )
    //   ).to.be.revertedWith("TokenVesting: amount must be > 0");
    // });

    it("Should vest tokens gradually for multiple address", async function () {
      const addrRound1 = addr3;
      const addrRound2 = addr4;
      const addrRound3 = addr5;
      const addrRound4 = addr6;
      // deploy vesting contract
      const tokenVesting = await TokenVesting.deploy(
        await testToken.getAddress()
      );
      await tokenVesting.waitForDeployment();
      expect((await tokenVesting.getToken()).toString()).to.equal(
        await testToken.getAddress()
      );

      // send tokens to vesting contract
      await testToken.transfer(
        await tokenVesting.getAddress(),
        ethers.parseUnits(String(100000), decimal)
      );
      const vestingContractBalance =
        Number(await testToken.balanceOf(await tokenVesting.getAddress())) /
        denom;
      expect(Number(vestingContractBalance)).to.be.closeTo(
        Number(100000),
        0.01
      );
      expect(
        Number(await tokenVesting.getWithdrawableAmount()) / denom
      ).to.be.closeTo(Number(100000), 0.01);

      const baseTime = 1622551248;
      const startTime = baseTime;
      const cliff = 60 * 60 * 24; // 1 day
      const baseDuration = 60 * 60 * 24; // 1 day
      const slicePeriodSeconds = cliff;
      const revokable = true;
      // const amount = ethers.parseUnits(String(100), decimal);

      // create new vesting schedule for round 1
      await tokenVesting.createVestingSchedule(
        addrRound1.address,
        startTime,
        12 * cliff,
        baseDuration * 32,
        slicePeriodSeconds,
        revokable,
        ethers.parseUnits(String(50000), decimal)
      );

      expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
        1
      );
      expect(
        Number(
          await tokenVesting.getVestingSchedulesCountByBeneficiary(
            addrRound1.address
          )
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const round1VestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          addrRound1.address,
          0
        );

      // check that vested amount is 0
      expect(
        Number(
          await tokenVesting.computeReleasableAmount(round1VestingScheduleId)
        )
      ).to.be.equal(0);

      // create new vesting schedule for round 2
      await tokenVesting.createVestingSchedule(
        addrRound2.address,
        startTime,
        14 * cliff,
        baseDuration * 36,
        slicePeriodSeconds,
        true,
        ethers.parseUnits(String(20000), decimal)
      );

      expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
        2
      );
      expect(
        Number(
          await tokenVesting.getVestingSchedulesCountByBeneficiary(
            addrRound2.address
          )
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const round2VestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          addrRound2.address,
          0
        );

      // check that vested amount is 0
      expect(
        Number(
          await tokenVesting.computeReleasableAmount(round2VestingScheduleId)
        )
      ).to.be.equal(0);

      // create new vesting schedule for round 3
      await tokenVesting.createVestingSchedule(
        addrRound3.address,
        startTime,
        25 * cliff,
        baseDuration * 49,
        slicePeriodSeconds,
        true,
        ethers.parseUnits(String(20000), decimal)
      );

      expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
        3
      );
      expect(
        Number(
          await tokenVesting.getVestingSchedulesCountByBeneficiary(
            addrRound3.address
          )
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const round3VestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          addrRound3.address,
          0
        );

      // check that vested amount is 0
      expect(
        Number(
          await tokenVesting.computeReleasableAmount(round3VestingScheduleId)
        )
      ).to.be.equal(0);

      // create new vesting schedule for round 4
      await tokenVesting.createVestingSchedule(
        addrRound4.address,
        startTime,
        1 * cliff,
        baseDuration * 7,
        slicePeriodSeconds,
        true,
        ethers.parseUnits(String(10000), decimal)
      );

      expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
        4
      );
      expect(
        Number(
          await tokenVesting.getVestingSchedulesCountByBeneficiary(
            addrRound4.address
          )
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const round4VestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          addrRound4.address,
          0
        );

      // check that vested amount is 0
      expect(
        Number(
          await tokenVesting.computeReleasableAmount(round4VestingScheduleId)
        )
      ).to.be.equal(0);

      // set time to half the vesting period
      const checkTime1 = baseTime + baseDuration * 1 + 1;
      await tokenVesting.setCurrentTime(checkTime1);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(1666.667), 0.01);

      // set time to half the vesting period
      const checkTime8 = baseTime + baseDuration * 7 + 1;
      await tokenVesting.setCurrentTime(checkTime8);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.equal(10000);

      // set time to half the vesting period
      const checkTime13 = baseTime + baseDuration * 12 + 1;
      await tokenVesting.setCurrentTime(checkTime13);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.equal(2500);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.equal(10000);

      // set time to half the vesting period
      const checkTime15 = baseTime + baseDuration * 14 + 1;
      await tokenVesting.setCurrentTime(checkTime15);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.equal(7500);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(909.09), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.equal(0);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.equal(10000);

      // set time to half the vesting period
      const checkTime26 = baseTime + baseDuration * 25 + 1;
      await tokenVesting.setCurrentTime(checkTime26);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.equal(35000);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(10909.09), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(833.333), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.equal(10000);

      // set time to half the vesting period
      const checkTime37 = baseTime + baseDuration * 36 + 1;
      await tokenVesting.setCurrentTime(checkTime37);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(50000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(20000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(10000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.equal(10000);

      // set time to half the vesting period
      const checkTime50 = baseTime + baseDuration * 49 + 1;
      await tokenVesting.setCurrentTime(checkTime50);

      // check that vested amount
      expect(
        Number(
          await tokenVesting
            .connect(addrRound1)
            .computeReleasableAmount(round1VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(50000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound2)
            .computeReleasableAmount(round2VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(20000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound3)
            .computeReleasableAmount(round3VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(20000), 0.01);

      expect(
        Number(
          await tokenVesting
            .connect(addrRound4)
            .computeReleasableAmount(round4VestingScheduleId)
        ) / denom
      ).to.be.closeTo(Number(10000), 0.01);

      for (let i = 1; i <= 50; i++) {
        // set time to half the vesting period
        const checkTime = baseTime + baseDuration * i + 1;
        await tokenVesting.setCurrentTime(checkTime);

        if (i <= 6) {
          // check that vested amount
          expect(
            Number(
              await tokenVesting
                .connect(addrRound1)
                .computeReleasableAmount(round1VestingScheduleId)
            ) / denom
          ).to.be.equal(0);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound2)
                .computeReleasableAmount(round2VestingScheduleId)
            ) / denom
          ).to.be.equal(0);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound3)
                .computeReleasableAmount(round3VestingScheduleId)
            ) / denom
          ).to.be.equal(0);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound4)
                .computeReleasableAmount(round4VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(1666.667), 1);

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round4VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound4)
              .release(
                round4VestingScheduleId,
                ethers.parseUnits(String(1700), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound4)
              .release(
                round4VestingScheduleId,
                ethers.parseUnits(String(1666.6), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound4.address,
              ethers.parseUnits(String(1666.6), decimal)
            );
        } else if (i >= 12 && i <= 13) {
          // check that vested amount
          expect(
            Number(
              await tokenVesting
                .connect(addrRound1)
                .computeReleasableAmount(round1VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(2500), 0.1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound2)
                .computeReleasableAmount(round2VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 0.1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound3)
                .computeReleasableAmount(round3VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 0.01);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound4)
                .computeReleasableAmount(round4VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 1);

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(2500), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound1.address,
              ethers.parseUnits(String(2500), decimal)
            );
        } else if (i >= 14 && i <= 24) {
          // check that vested amount
          expect(
            Number(
              await tokenVesting
                .connect(addrRound1)
                .computeReleasableAmount(round1VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(2500), 1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound2)
                .computeReleasableAmount(round2VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(909.09), 1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound3)
                .computeReleasableAmount(round3VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 0.01);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound4)
                .computeReleasableAmount(round4VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 1);

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(2500), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound1.address,
              ethers.parseUnits(String(2500), decimal)
            );

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(909.09), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound2.address,
              ethers.parseUnits(String(909.09), decimal)
            );
        } else if (i >= 25 && i <= 31) {
          // check that vested amount
          expect(
            Number(
              await tokenVesting
                .connect(addrRound1)
                .computeReleasableAmount(round1VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(2500), 1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound2)
                .computeReleasableAmount(round2VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(909.09), 1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound3)
                .computeReleasableAmount(round3VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(833.3), 1);

          expect(
            Number(
              await tokenVesting
                .connect(addrRound4)
                .computeReleasableAmount(round4VestingScheduleId)
            ) / denom
          ).to.be.closeTo(Number(0), 1);

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound1)
              .release(
                round1VestingScheduleId,
                ethers.parseUnits(String(2500), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound1.address,
              ethers.parseUnits(String(2500), decimal)
            );

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(909.09), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound2.address,
              ethers.parseUnits(String(909.09), decimal)
            );

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(833.3), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound3.address,
              ethers.parseUnits(String(833.3), decimal)
            );
        } else if (i >= 32 && i <= 35) {
          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound2)
              .release(
                round2VestingScheduleId,
                ethers.parseUnits(String(909.09), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound2.address,
              ethers.parseUnits(String(909.09), decimal)
            );

          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(833.3), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound3.address,
              ethers.parseUnits(String(833.3), decimal)
            );
        } else if (i >= 36 && i <= 48) {
          // check that only beneficiary can try to release vested tokens
          await expect(
            tokenVesting
              .connect(addr2)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(100), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: only beneficiary and owner can release vested tokens"
          );

          // check that beneficiary cannot release more than the vested amount
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(3000), decimal)
              )
          ).to.be.revertedWith(
            "TokenVesting: cannot release tokens, not enough vested tokens"
          );

          // release tokens and check that a Transfer event is emitted with a value of 10
          await expect(
            tokenVesting
              .connect(addrRound3)
              .release(
                round3VestingScheduleId,
                ethers.parseUnits(String(833.3), decimal)
              )
          )
            .to.emit(testToken, "Transfer")
            .withArgs(
              await tokenVesting.getAddress(),
              addrRound3.address,
              ethers.parseUnits(String(833.3), decimal)
            );
        }
      }
    });
  });
});
