// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

// OpenZeppelin dependencies
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

/**
 * @title MockTokenVesting
 */
contract MockTokenVesting is Initializable {
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    struct VestingSchedule {
        // beneficiary of tokens after they are released
        address beneficiary;
        // package id
        string packageId;
        // whether or not the vesting is revocable
        bool revocable;
        // total amount of tokens to be released at the end of the vesting
        uint256 amountTotal;
        // amount of tokens released
        uint256 released;
        // whether or not the vesting has been revoked
        bool revoked;
    }

    struct Package {
        // name of the package
        string name;
        // cliff time of the package start in seconds since the UNIX epoch
        uint256 cliff;
        // start time of the package in seconds since the UNIX epoch
        uint256 start;
        // duration of the package in seconds
        uint256 duration;
        // duration of a slice period for the package in seconds
        uint256 slicePeriodSeconds;
        // amount of tokens of the package
        uint256 amount;
    }

    address private _owner;
    IERC20 private _token;
    uint256 private vestingSchedulesTotalAmount;
    bytes32[] private vestingSchedulesIds;
    mapping(bytes32 => VestingSchedule) private vestingSchedules;
    mapping(address => uint256) private holdersVestingCount;
    mapping(string => Package) private packages;
    uint256 mockTime;


    /**
     * @dev Creates a vesting contract.
     * @param token_ address of the ERC20 token contract
     */
    function initialize(
        address token_
    ) public payable initializer {
        // Check that the token address is not 0x0.
        require(token_ != address(0x0));
        // Set the token address.
        _setToken(token_);
        _transferOwnership(msg.sender);
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Set token.
     */
    function _setToken(address token_) internal virtual {
         _token = IERC20(token_);
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == msg.sender, "TokenVesting: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    /**
     * @dev Reverts if the vesting schedule does not exist or has been revoked.
     */
    modifier onlyIfVestingScheduleNotRevoked(bytes32 vestingScheduleId) {
        require(!vestingSchedules[vestingScheduleId].revoked);
        _;
    }

    /**
     * @dev This function is called for plain Ether transfers, i.e. for every call with empty calldata.
     */
    receive() external payable {}

    /**
     * @dev Fallback function is executed if none of the other functions match the function
     * identifier or no data was provided with the function call.
     */
    fallback() external payable {}

     /**
     * @notice Creates a new package.
     * @param _id id of the package
     * @param _name name of the package
     * @param _start start time of the package in seconds since the UNIX epoch
     * @param _cliff cliff time of the package start in seconds since the UNIX epoch
     * @param _duration duration of the package in seconds
     * @param _slicePeriodSeconds duration of a slice period for the package in seconds
     * @param _amount amount of tokens of the package
     */
    function createPackage(
        string memory _id,
        string memory _name,
        uint256 _start,
        uint256 _cliff,
        uint256 _duration,
        uint256 _slicePeriodSeconds,
        uint256 _amount
    ) external onlyOwner {
        require(_duration > 0, "TokenVesting: duration must be > 0");
        require(_amount > 0, "TokenVesting: amount must be > 0");
        require(
            _slicePeriodSeconds >= 1,
            "TokenVesting: slicePeriodSeconds must be >= 1"
        );
        require(_duration >= _cliff, "TokenVesting: duration must be >= cliff");
        uint256 cliff = _start + _cliff;
        packages[_id] = Package(
            _name,
            cliff,
            _start,
            _duration,
            _slicePeriodSeconds,
            _amount
        );
    }

    /**
     * @notice Get a package by id.
     * @param _id id of the package
     */
    function getPackage(
        string memory _id
    ) public view returns (Package memory) {
        return packages[_id];
    }

    /**
     * @notice Creates a new vesting schedule for a beneficiary.
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _packageId id of package
     * @param _revocable whether the vesting is revocable or not
     * @param _amount total amount of tokens to be released at the end of the vesting
     */
    function createVestingSchedule(
        address _beneficiary,
        string memory _packageId,
        bool _revocable,
        uint256 _amount
    ) external onlyOwner {
        Package storage package = packages[_packageId];
        require(
            getWithdrawableAmount() >= _amount ,
            "TokenVesting: cannot create vesting schedule because not sufficient tokens"
        );
        require(_amount > 0, "TokenVesting: amount must be > 0");
        require(_amount <= package.amount, "TokenVesting: amount must be <= package amount");
        bytes32 vestingScheduleId = computeNextVestingScheduleIdForHolder(
            _beneficiary
        );
        vestingSchedules[vestingScheduleId] = VestingSchedule(
            _beneficiary,
            _packageId,
            _revocable,
            _amount,
            0,
            false
        );
        vestingSchedulesTotalAmount = vestingSchedulesTotalAmount + _amount;
        vestingSchedulesIds.push(vestingScheduleId);
        uint256 currentVestingCount = holdersVestingCount[_beneficiary];
        holdersVestingCount[_beneficiary] = currentVestingCount + 1;
    }

    /**
     * @notice Revokes the vesting schedule for given identifier.
     * @param vestingScheduleId the vesting schedule identifier
     */
    function revoke(
        bytes32 vestingScheduleId
    ) external onlyOwner onlyIfVestingScheduleNotRevoked(vestingScheduleId) {
        VestingSchedule storage vestingSchedule = vestingSchedules[
            vestingScheduleId
        ];
        require(
            vestingSchedule.revocable,
            "TokenVesting: vesting is not revocable"
        );
        uint256 vestedAmount = _computeReleasableAmount(vestingSchedule);
        if (vestedAmount > 0) {
            release(vestingScheduleId, vestedAmount);
        }
        uint256 unreleased = vestingSchedule.amountTotal -
            vestingSchedule.released;
        vestingSchedulesTotalAmount = vestingSchedulesTotalAmount - unreleased;
        vestingSchedule.revoked = true;
    }

    /**
     * @notice Withdraw the specified amount if possible.
     * @param amount the amount to withdraw
     */
    function withdraw(uint256 amount) external onlyOwner {
        require(
            getWithdrawableAmount() >= amount,
            "TokenVesting: not enough withdrawable funds"
        );
        /*
         * @dev Replaced owner() with msg.sender => address of WITHDRAWER_ROLE
         */
        SafeERC20.safeTransfer(_token, msg.sender, amount);
    }

    /**
     * @notice Release vested amount of tokens.
     * @param vestingScheduleId the vesting schedule identifier
     * @param amount the amount to release
     */
    function release(
        bytes32 vestingScheduleId,
        uint256 amount
    ) public onlyIfVestingScheduleNotRevoked(vestingScheduleId) {
        VestingSchedule storage vestingSchedule = vestingSchedules[
            vestingScheduleId
        ];
        bool isBeneficiary = msg.sender == vestingSchedule.beneficiary;

        bool isReleasor = (msg.sender == owner());
        require(
            isBeneficiary || isReleasor,
            "TokenVesting: only beneficiary and owner can release vested tokens"
        );
        uint256 vestedAmount = _computeReleasableAmount(vestingSchedule);
        require(
            vestedAmount >= amount,
            "TokenVesting: cannot release tokens, not enough vested tokens"
        );
        vestingSchedule.released = vestingSchedule.released + amount;
        address payable beneficiaryPayable = payable(
            vestingSchedule.beneficiary
        );
        vestingSchedulesTotalAmount = vestingSchedulesTotalAmount - amount;
        SafeERC20.safeTransfer(_token, beneficiaryPayable, amount);
    }

    /**
     * @dev Returns the number of vesting schedules associated to a beneficiary.
     * @return the number of vesting schedules
     */
    function getVestingSchedulesCountByBeneficiary(
        address _beneficiary
    ) external view returns (uint256) {
        return holdersVestingCount[_beneficiary];
    }

    /**
     * @dev Returns the vesting schedule id at the given index.
     * @return the vesting id
     */
    function getVestingIdAtIndex(
        uint256 index
    ) external view returns (bytes32) {
        require(
            index < getVestingSchedulesCount(),
            "TokenVesting: index out of bounds"
        );
        return vestingSchedulesIds[index];
    }

    /**
     * @notice Returns the vesting schedule information for a given holder and index.
     * @return the vesting schedule structure information
     */
    function getVestingScheduleByAddressAndIndex(
        address holder,
        uint256 index
    ) external view returns (VestingSchedule memory) {
        return
            getVestingSchedule(
                computeVestingScheduleIdForAddressAndIndex(holder, index)
            );
    }

    /**
     * @notice Returns the total amount of vesting schedules.
     * @return the total amount of vesting schedules
     */
    function getVestingSchedulesTotalAmount() external view returns (uint256) {
        return vestingSchedulesTotalAmount;
    }

    /**
     * @dev Returns the address of the ERC20 token managed by the vesting contract.
     */
    function getToken() external view returns (address) {
        return address(_token);
    }

    /**
     * @dev Returns the number of vesting schedules managed by this contract.
     * @return the number of vesting schedules
     */
    function getVestingSchedulesCount() public view returns (uint256) {
        return vestingSchedulesIds.length;
    }

    /**
     * @notice Computes the vested amount of tokens for the given vesting schedule identifier.
     * @return the vested amount
     */
    function computeReleasableAmount(
        bytes32 vestingScheduleId
    )
        external
        view
        onlyIfVestingScheduleNotRevoked(vestingScheduleId)
        returns (uint256)
    {
        VestingSchedule storage vestingSchedule = vestingSchedules[
            vestingScheduleId
        ];
        return _computeReleasableAmount(vestingSchedule);
    }

    /**
     * @notice Returns the vesting schedule information for a given identifier.
     * @return the vesting schedule structure information
     */
    function getVestingSchedule(
        bytes32 vestingScheduleId
    ) public view returns (VestingSchedule memory) {
        return vestingSchedules[vestingScheduleId];
    }

    /**
     * @dev Returns the amount of tokens that can be withdrawn by the owner.
     * @return the amount of tokens
     */
    function getWithdrawableAmount() public view returns (uint256) {
        return _token.balanceOf(address(this)) - vestingSchedulesTotalAmount;
    }

    /**
     * @dev Computes the next vesting schedule identifier for a given holder address.
     */
    function computeNextVestingScheduleIdForHolder(
        address holder
    ) public view returns (bytes32) {
        return
            computeVestingScheduleIdForAddressAndIndex(
                holder,
                holdersVestingCount[holder]
            );
    }

    /**
     * @dev Returns the last vesting schedule for a given holder address.
     */
    function getLastVestingScheduleForHolder(
        address holder
    ) external view returns (VestingSchedule memory) {
        return
            vestingSchedules[
                computeVestingScheduleIdForAddressAndIndex(
                    holder,
                    holdersVestingCount[holder] - 1
                )
            ];
    }

    /**
     * @dev Computes the vesting schedule identifier for an address and an index.
     */
    function computeVestingScheduleIdForAddressAndIndex(
        address holder,
        uint256 index
    ) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(holder, index));
    }

    /**
     * @dev Computes the releasable amount of tokens for a vesting schedule.
     * @return the amount of releasable tokens
     */
    function _computeReleasableAmount(
        VestingSchedule memory vestingSchedule
    ) internal view returns (uint256) {
        Package storage package = packages[vestingSchedule.packageId];
        // Retrieve the current time.
        uint256 currentTime = getCurrentTime();
        // If the current time is before the cliff, no tokens are releasable.
        if ((currentTime < package.cliff) || vestingSchedule.revoked) {
            return 0;
        }
        // If the current time is after the vesting period, all tokens are releasable,
        // minus the amount already released.
        else if (
            currentTime >= package.start + package.duration
        ) {
            return vestingSchedule.amountTotal - vestingSchedule.released;
        }
        // Otherwise, some tokens are releasable.
        else {
            // Compute the number of full vesting periods that have elapsed.
            uint256 timeFromStart = currentTime - package.cliff;
            uint256 secondsPerSlice = package.slicePeriodSeconds;
            uint256 vestedSlicePeriods = timeFromStart / secondsPerSlice + 1;
            uint256 vestedSeconds = vestedSlicePeriods * secondsPerSlice;
            // Compute the amount of tokens that are vested.
            uint256 vestedAmount = (vestingSchedule.amountTotal *
                vestedSeconds) / (package.start + package.duration - package.cliff);
            // Subtract the amount already released and return.
            return vestedAmount - vestingSchedule.released;
        }
    }

    function setCurrentTime(uint256 _time) external {
        mockTime = _time;
    }

    function getCurrentTime() internal view virtual returns (uint256) {
        return mockTime;
    }
}