// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.19;

// OpenZeppelin dependencies
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { EternalStorage } from './EternalStorage.sol';

/**
 * @title TokenVesting
 */
contract TokenVesting is ReentrancyGuard, EternalStorage {
    error NotOwner();
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    bytes32 internal constant KEY_IMPLEMENTATION = bytes32(0xcf27007a45f38072d009137e17b1481e8a89d63d4bc022b09a978e7ac6fa2f25);
    bytes32 internal constant KEY_OWNER = bytes32(0xed42e7ab275fc4bbb0a5dd7c91f4d76bf5dff2d9ac2c358c58e5b8e1174269c9);
    bytes32 internal constant KEY_VESTING_SCHEDULE_TOTAL_AMOUNT = bytes32(0x2fb5103b88ac7935266a7ada44f541c0e8bbf74fcfee6271b6284fd52c532b95);
    bytes32 internal constant KEY_VESTING_SCHEDULE_IDS = bytes32(0xf43e7ece72b813ffc71bdadc7b2fb5bd8ed995255a764df0218e4122c2eec98d);
    bytes32 internal constant KEY_ERC20_TOKEN = bytes32(0x4b9d07c541ff4d33ddd285800b35bfbb76b13ac586a26a7610794a2ff258d7e6);

    bytes32 internal constant KEY_VESTING_SCHEDULES_PREFIX = keccak256('vestingSchedules');
    bytes32 internal constant KEY_HOLDERS_VESTING_COUNT_PREFIX = keccak256('holdersVestingCount');

    /**
     * @dev Reverts if the vesting schedule does not exist or has been revoked.
     */
    modifier onlyIfVestingScheduleNotRevoked(bytes32 vestingScheduleId) {
        require(!getBool(_getRevokedOfVestingScheduleKey(vestingScheduleId)));
        _;
    }

    /**
     * @dev Creates a vesting contract.
     * @param token_ address of the ERC20 token contract
     */
    constructor(address token_) {
        // Check that the token address is not 0x0.
        require(token_ != address(0x0));
        // Set the token address.
        _setAddress(KEY_ERC20_TOKEN, token_);
        _setAddress(KEY_OWNER, msg.sender);
    }

    function _getBeneficiaryOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('beneficiary')));
    }

    function _getCliffOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('cliff')));
    }

    function _getStartOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('start')));
    }

    function _getDurationOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('duration')));
    }

    function _getSlicePeriodSecondsOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('slicePeriodSeconds')));
    }

    function _getRevocableOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('revocable')));
    }

    function _getAmountTotalOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('amountTotal')));
    }

    function _getReleasedOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('released')));
    }

    function _getRevokedOfVestingScheduleKey(bytes32 vestingScheduleId) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_VESTING_SCHEDULES_PREFIX, vestingScheduleId, keccak256('revoked')));
    }

    function _getHoldersVestingCountKey(address holder) internal pure returns (bytes32) {
        return keccak256(abi.encode(KEY_HOLDERS_VESTING_COUNT_PREFIX, holder));
    }

    function upgrade(
        address newImplementation
    ) external onlyOwner {
        _setAddress(KEY_IMPLEMENTATION, newImplementation);
    }


    /**
     * @notice Ensures that the caller of the function is the governance address.
     */
    modifier onlyOwner() {
        if (msg.sender != getAddress(KEY_OWNER)) revert NotOwner();
        _;
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
        address oldOwner = getAddress(KEY_OWNER);
        _setAddress(KEY_OWNER, newOwner);
        emit OwnershipTransferred(oldOwner, newOwner);
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
     * @notice Creates a new vesting schedule for a beneficiary.
     * @param _beneficiary address of the beneficiary to whom vested tokens are transferred
     * @param _start start time of the vesting period
     * @param _cliff duration in seconds of the cliff in which tokens will begin to vest
     * @param _duration duration in seconds of the period in which the tokens will vest
     * @param _slicePeriodSeconds duration of a slice period for the vesting in seconds
     * @param _revocable whether the vesting is revocable or not
     * @param _amount total amount of tokens to be released at the end of the vesting
     */
    function createVestingSchedule(
        address _beneficiary,
        uint256 _start,
        uint256 _cliff,
        uint256 _duration,
        uint256 _slicePeriodSeconds,
        bool _revocable,
        uint256 _amount
    ) external onlyOwner {
        require(
            getWithdrawableAmount() >= _amount,
            "TokenVesting: cannot create vesting schedule because not sufficient tokens"
        );
        require(_duration > 0, "TokenVesting: duration must be > 0");
        require(_amount > 0, "TokenVesting: amount must be > 0");
        require(
            _slicePeriodSeconds >= 1,
            "TokenVesting: slicePeriodSeconds must be >= 1"
        );
        require(_duration >= _cliff, "TokenVesting: duration must be >= cliff");
        bytes32 vestingScheduleId = computeNextVestingScheduleIdForHolder(
            _beneficiary
        );
        uint256 cliff = _start + _cliff;
        _setAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId), _beneficiary);
        _setUint(_getCliffOfVestingScheduleKey(vestingScheduleId), cliff);
        _setUint(_getStartOfVestingScheduleKey(vestingScheduleId), _start);
        _setUint(_getDurationOfVestingScheduleKey(vestingScheduleId), _duration);
        _setUint(_getSlicePeriodSecondsOfVestingScheduleKey(vestingScheduleId), _slicePeriodSeconds);
        _setBool(_getRevocableOfVestingScheduleKey(vestingScheduleId), _revocable);
        _setUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId), _amount);
        _setUint(_getReleasedOfVestingScheduleKey(vestingScheduleId), 0);
        _setBool(_getRevokedOfVestingScheduleKey(vestingScheduleId), false);

        uint256 vestingSchedulesTotalAmount = getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)) + _amount;
        _setUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId), vestingSchedulesTotalAmount);
        _pushElementArrayBytes(KEY_VESTING_SCHEDULE_IDS, vestingScheduleId);
        uint256 currentVestingCount = getUint(_getHoldersVestingCountKey(_beneficiary));
        _setUint(_getHoldersVestingCountKey(_beneficiary), currentVestingCount + 1);
    }

    /**
     * @notice Revokes the vesting schedule for given identifier.
     * @param vestingScheduleId the vesting schedule identifier
     */
    function revoke(
        bytes32 vestingScheduleId
    ) external onlyOwner onlyIfVestingScheduleNotRevoked(vestingScheduleId) {

        require(
            getBool(_getRevocableOfVestingScheduleKey(vestingScheduleId)),
            "TokenVesting: vesting is not revocable"
        );
        uint256 vestedAmount = _computeReleasableAmount(vestingScheduleId);
        if (vestedAmount > 0) {
            release(vestingScheduleId, vestedAmount);
        }

        uint256 unreleased = getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)) - getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId));
        _setUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT, getUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT) - unreleased);
        _setBool(_getRevokedOfVestingScheduleKey(vestingScheduleId), true);
    }

    /**
     * @notice Withdraw the specified amount if possible.
     * @param amount the amount to withdraw
     */
    function withdraw(uint256 amount) external nonReentrant onlyOwner {
        require(
            getWithdrawableAmount() >= amount,
            "TokenVesting: not enough withdrawable funds"
        );
        /*
         * @dev Replaced owner() with msg.sender => address of WITHDRAWER_ROLE
         */
        IERC20 _token = IERC20(getAddress(KEY_ERC20_TOKEN));
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
    ) public nonReentrant onlyIfVestingScheduleNotRevoked(vestingScheduleId) {
        bool isBeneficiary = msg.sender == getAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId));

        bool isReleasor = (msg.sender == getAddress(KEY_OWNER));
        require(
            isBeneficiary || isReleasor,
            "TokenVesting: only beneficiary and owner can release vested tokens"
        );
        uint256 vestedAmount = _computeReleasableAmount(vestingScheduleId);
        require(
            vestedAmount >= amount,
            "TokenVesting: cannot release tokens, not enough vested tokens"
        );
        uint256 newReleased = getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId)) + amount;
        _setUint(_getReleasedOfVestingScheduleKey(vestingScheduleId), newReleased);
        address payable beneficiaryPayable = payable(
            getAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId))
        );
        _setUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT, getUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT) - amount);
        IERC20 _token = IERC20(getAddress(KEY_ERC20_TOKEN));
        SafeERC20.safeTransfer(_token, beneficiaryPayable, amount);
    }

    /**
     * @dev Returns the number of vesting schedules associated to a beneficiary.
     * @return the number of vesting schedules
     */
    function getVestingSchedulesCountByBeneficiary(
        address _beneficiary
    ) external view returns (uint256) {
        return getUint(_getHoldersVestingCountKey(_beneficiary));
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
        return getArrayBytes(KEY_VESTING_SCHEDULE_IDS)[index];
    }

    /**
     * @notice Returns the vesting schedule information for a given holder and index.
     * @return the vesting schedule structure information
     */
    function getVestingScheduleByAddressAndIndex(
        address holder,
        uint256 index
    ) external view returns (address, uint256, uint256, uint256, uint256, bool, uint256, uint256, bool) {
        bytes32 vestingScheduleId = computeVestingScheduleIdForAddressAndIndex(holder, index);
        
        return (getAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getCliffOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getStartOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getDurationOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getSlicePeriodSecondsOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevocableOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevokedOfVestingScheduleKey(vestingScheduleId)));        
    }

    /**
     * @notice Returns the total amount of vesting schedules.
     * @return the total amount of vesting schedules
     */
    function getVestingSchedulesTotalAmount() external view returns (uint256) {
        return getUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT);
    }

    /**
     * @dev Returns the address of the ERC20 token managed by the vesting contract.
     */
    function getToken() external view returns (address) {
        return getAddress(KEY_ERC20_TOKEN);
    }

    /**
     * @dev Returns the number of vesting schedules managed by this contract.
     * @return the number of vesting schedules
     */
    function getVestingSchedulesCount() public view returns (uint256) {
        return getArrayBytes(KEY_VESTING_SCHEDULE_IDS).length;
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
        return _computeReleasableAmount(vestingScheduleId);
    }

    /**
     * @notice Returns the vesting schedule information for a given identifier.
     * @return the vesting schedule structure information
     */
    function getVestingSchedule(
        bytes32 vestingScheduleId
    ) public view returns (address, uint256, uint256, uint256, uint256, bool, uint256, uint256, bool) {
        return (getAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getCliffOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getStartOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getDurationOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getSlicePeriodSecondsOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevocableOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevokedOfVestingScheduleKey(vestingScheduleId)));        
    }

    /**
     * @dev Returns the amount of tokens that can be withdrawn by the owner.
     * @return the amount of tokens
     */
    function getWithdrawableAmount() public view returns (uint256) {
        IERC20 _token = IERC20(getAddress(KEY_ERC20_TOKEN));
        return _token.balanceOf(getAddress(KEY_IMPLEMENTATION)) - getUint(KEY_VESTING_SCHEDULE_TOTAL_AMOUNT);
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
                getUint(_getHoldersVestingCountKey(holder))
            );
    }

    /**
     * @dev Returns the last vesting schedule for a given holder address.
     */
    function getLastVestingScheduleForHolder(
        address holder
    ) external view returns (address, uint256, uint256, uint256, uint256, bool, uint256, uint256, bool) {
        bytes32 vestingScheduleId = computeVestingScheduleIdForAddressAndIndex(holder, getUint(_getHoldersVestingCountKey(holder)) - 1);
        return (getAddress(_getBeneficiaryOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getCliffOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getStartOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getDurationOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getSlicePeriodSecondsOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevocableOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)),
            getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId)),
            getBool(_getRevokedOfVestingScheduleKey(vestingScheduleId)));        
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
        bytes32 vestingScheduleId
    ) internal view returns (uint256) {
        // Retrieve the current time.
        uint256 currentTime = getCurrentTime();
        // If the current time is before the cliff, no tokens are releasable.
        if ((currentTime < getUint(_getCliffOfVestingScheduleKey(vestingScheduleId))) || getBool(_getRevokedOfVestingScheduleKey(vestingScheduleId))) {
            return 0;
        }
        // If the current time is after the vesting period, all tokens are releasable,
        // minus the amount already released.
        else if (
            currentTime >= getUint(_getStartOfVestingScheduleKey(vestingScheduleId)) + getUint(_getDurationOfVestingScheduleKey(vestingScheduleId))
        ) {
            return getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)) - getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId));
        }
        // Otherwise, some tokens are releasable.
        else {
            // Compute the number of full vesting periods that have elapsed.
            uint256 timeFromStart = currentTime - getUint(_getCliffOfVestingScheduleKey(vestingScheduleId));
            uint256 secondsPerSlice = getUint(_getSlicePeriodSecondsOfVestingScheduleKey(vestingScheduleId));
            uint256 vestedSlicePeriods = timeFromStart / secondsPerSlice + 1;
            uint256 vestedSeconds = vestedSlicePeriods * secondsPerSlice;
            // Compute the amount of tokens that are vested.
            uint256 vestedAmount = getUint(_getAmountTotalOfVestingScheduleKey(vestingScheduleId)) * vestedSeconds / (getUint(_getStartOfVestingScheduleKey(vestingScheduleId)) + getUint(_getDurationOfVestingScheduleKey(vestingScheduleId)) - getUint(_getCliffOfVestingScheduleKey(vestingScheduleId)));
            // Subtract the amount already released and return.
            return vestedAmount - getUint(_getReleasedOfVestingScheduleKey(vestingScheduleId));
        }
    }

    /**
     * @dev Returns the current time.
     * @return the current timestamp in seconds.
     */
    function getCurrentTime() internal view virtual returns (uint256) {
        return block.timestamp;
    }
}