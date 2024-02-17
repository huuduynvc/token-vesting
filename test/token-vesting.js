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
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    testToken = await Token.deploy("Test Token", "TT", 1000000);
    await testToken.waitForDeployment();
  });

  describe("Vesting", function () {
    it("Should assign the total supply of tokens to the owner", async function () {
      const ownerBalance =
        Number(await testToken.balanceOf(await owner.getAddress())) / denom;
      expect(Number(await testToken.totalSupply()) / denom).to.equal(
        ownerBalance
      );
    });

    it("Should vest tokens gradually", async function () {
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
        ethers.parseUnits(String(1000), decimal)
      );
      const vestingContractBalance =
        Number(await testToken.balanceOf(await tokenVesting.getAddress())) /
        denom;
      expect(Number(vestingContractBalance)).to.equal(1000);
      expect(
        Number(await tokenVesting.getWithdrawableAmount()) / denom
      ).to.equal(1000);

      const baseTime = 1622551248;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0;
      const duration = 1000;
      const slicePeriodSeconds = 1;
      const revokable = true;
      const amount = ethers.parseUnits(String(100), decimal);

      // create new vesting schedule
      await tokenVesting.createVestingSchedule(
        beneficiary.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount
      );

      expect(Number(await tokenVesting.getVestingSchedulesCount())).to.be.equal(
        1
      );
      expect(
        Number(
          await tokenVesting.getVestingSchedulesCountByBeneficiary(
            beneficiary.address
          )
        )
      ).to.be.equal(1);

      // compute vesting schedule id
      const vestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          beneficiary.address,
          0
        );

      // check that vested amount is 0
      expect(
        Number(await tokenVesting.computeReleasableAmount(vestingScheduleId))
      ).to.be.equal(0);

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2;
      await tokenVesting.setCurrentTime(halfTime);

      // check that vested amount is half the total amount to vest
      expect(
        Number(
          await tokenVesting
            .connect(beneficiary)
            .computeReleasableAmount(vestingScheduleId)
        ) / denom
      ).to.be.equal(50);

      // check that only beneficiary can try to release vested tokens
      await expect(
        tokenVesting
          .connect(addr2)
          .release(vestingScheduleId, ethers.parseUnits(String(100), decimal))
      ).to.be.revertedWith(
        "TokenVesting: only beneficiary and owner can release vested tokens"
      );

      // check that beneficiary cannot release more than the vested amount
      await expect(
        tokenVesting
          .connect(beneficiary)
          .release(vestingScheduleId, ethers.parseUnits(String(100), decimal))
      ).to.be.revertedWith(
        "TokenVesting: cannot release tokens, not enough vested tokens"
      );

      // release 10 tokens and check that a Transfer event is emitted with a value of 10
      await expect(
        tokenVesting
          .connect(beneficiary)
          .release(vestingScheduleId, ethers.parseUnits(String(10), decimal))
      )
        .to.emit(testToken, "Transfer")
        .withArgs(
          await tokenVesting.getAddress(),
          beneficiary.address,
          ethers.parseUnits(String(10), decimal)
        );

      // check that the vested amount is now 40
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(ethers.parseUnits(String(40), decimal));
      let vestingSchedule = await tokenVesting.getVestingSchedule(
        vestingScheduleId
      );

      // check that the released amount is 10
      expect(Number(vestingSchedule.released) / denom).to.be.equal(10);

      // set current time after the end of the vesting period
      await tokenVesting.setCurrentTime(baseTime + duration + 1);

      // check that the vested amount is 90
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(ethers.parseUnits(String(90), decimal));

      // beneficiary release vested tokens (45)
      await expect(
        tokenVesting
          .connect(beneficiary)
          .release(vestingScheduleId, ethers.parseUnits(String(45), decimal))
      )
        .to.emit(testToken, "Transfer")
        .withArgs(
          await tokenVesting.getAddress(),
          beneficiary.address,
          ethers.parseUnits(String(45), decimal)
        );

      // owner release vested tokens (45)
      await expect(
        tokenVesting
          .connect(owner)
          .release(vestingScheduleId, ethers.parseUnits(String(45), decimal))
      )
        .to.emit(testToken, "Transfer")
        .withArgs(
          await tokenVesting.getAddress(),
          beneficiary.address,
          ethers.parseUnits(String(45), decimal)
        );
      vestingSchedule = await tokenVesting.getVestingSchedule(
        vestingScheduleId
      );

      // check that the number of released tokens is 100
      expect(vestingSchedule.released).to.be.equal(
        ethers.parseUnits(String(100), decimal)
      );

      // check that the vested amount is 0
      expect(
        await tokenVesting
          .connect(beneficiary)
          .computeReleasableAmount(vestingScheduleId)
      ).to.be.equal(0);

      // check that anyone cannot revoke a vesting
      await expect(
        tokenVesting.connect(addr2).revoke(vestingScheduleId)
      ).to.be.revertedWith("Ownable: caller is not the owner");

      await tokenVesting.revoke(vestingScheduleId);

      /*
       * TEST SUMMARY
       * deploy vesting contract
       * send tokens to vesting contract
       * create new vesting schedule (100 tokens)
       * check that vested amount is 0
       * set time to half the vesting period
       * check that vested amount is half the total amount to vest (50 tokens)
       * check that only beneficiary can try to release vested tokens
       * check that beneficiary cannot release more than the vested amount
       * release 10 tokens and check that a Transfer event is emitted with a value of 10
       * check that the released amount is 10
       * check that the vested amount is now 40
       * set current time after the end of the vesting period
       * check that the vested amount is 90 (100 - 10 released tokens)
       * release all vested tokens (90)
       * check that the number of released tokens is 100
       * check that the vested amount is 0
       * check that anyone cannot revoke a vesting
       */
    });

    it("Should release vested tokens if revoked", async function () {
      // deploy vesting contract
      const tokenVesting = await TokenVesting.deploy(
        await testToken.getAddress()
      );
      await tokenVesting.waitForDeployment();
      expect((await tokenVesting.getToken()).toString()).to.equal(
        await testToken.getAddress()
      );
      // send tokens to vesting contract
      await expect(
        testToken.transfer(
          await tokenVesting.getAddress(),
          ethers.parseUnits(String(1000), decimal)
        )
      )
        .to.emit(testToken, "Transfer")
        .withArgs(
          owner.address,
          await tokenVesting.getAddress(),
          ethers.parseUnits(String(1000), decimal)
        );

      const baseTime = 1622551248;
      const beneficiary = addr1;
      const startTime = baseTime;
      const cliff = 0;
      const duration = 1000;
      const slicePeriodSeconds = 1;
      const revokable = true;
      const amount = ethers.parseUnits(String(100), decimal);

      // create new vesting schedule
      await tokenVesting.createVestingSchedule(
        beneficiary.address,
        startTime,
        cliff,
        duration,
        slicePeriodSeconds,
        revokable,
        amount
      );

      // compute vesting schedule id
      const vestingScheduleId =
        await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
          beneficiary.address,
          0
        );

      // set time to half the vesting period
      const halfTime = baseTime + duration / 2;
      await tokenVesting.setCurrentTime(halfTime);

      await expect(tokenVesting.revoke(vestingScheduleId))
        .to.emit(testToken, "Transfer")
        .withArgs(
          await tokenVesting.getAddress(),
          beneficiary.address,
          ethers.parseUnits(String(50), decimal)
        );
    });

    it("Should compute vesting schedule index", async function () {
      const tokenVesting = await TokenVesting.deploy(
        await testToken.getAddress()
      );
      await tokenVesting.waitForDeployment();
      const expectedVestingScheduleId =
        "0xa279197a1d7a4b7398aa0248e95b8fcc6cdfb43220ade05d01add9c5468ea097";
      expect(
        (
          await tokenVesting.computeVestingScheduleIdForAddressAndIndex(
            addr1.address,
            0
          )
        ).toString()
      ).to.equal(expectedVestingScheduleId);
      expect(
        (
          await tokenVesting.computeNextVestingScheduleIdForHolder(
            addr1.address
          )
        ).toString()
      ).to.equal(expectedVestingScheduleId);
    });

    it("Should check input parameters for createVestingSchedule method", async function () {
      const tokenVesting = await TokenVesting.deploy(
        await testToken.getAddress()
      );
      await tokenVesting.waitForDeployment();
      await testToken.transfer(
        await tokenVesting.getAddress(),
        ethers.parseUnits(String(1000), decimal)
      );
      const time = Date.now();
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          0,
          1,
          false,
          1
        )
      ).to.be.revertedWith("TokenVesting: duration must be > 0");
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          1,
          0,
          false,
          1
        )
      ).to.be.revertedWith("TokenVesting: slicePeriodSeconds must be >= 1");
      await expect(
        tokenVesting.createVestingSchedule(
          addr1.address,
          time,
          0,
          1,
          1,
          false,
          0
        )
      ).to.be.revertedWith("TokenVesting: amount must be > 0");
    });
  });
});
