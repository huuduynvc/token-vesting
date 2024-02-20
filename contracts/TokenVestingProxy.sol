// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import { EternalStorage } from './EternalStorage.sol';

contract TokenVestingProxy is EternalStorage {
    error InvalidImplementation();
    error NativeCurrencyNotAccepted();

    /// @dev Storage slot with the address of the current factory. `keccak256('eip1967.proxy.implementation') - 1`.
    bytes32 internal constant KEY_IMPLEMENTATION = bytes32(0xcf27007a45f38072d009137e17b1481e8a89d63d4bc022b09a978e7ac6fa2f25);
    bytes32 internal constant KEY_OWNER = bytes32(0xed42e7ab275fc4bbb0a5dd7c91f4d76bf5dff2d9ac2c358c58e5b8e1174269c9);

    constructor(address implementation) {
        _setAddress(KEY_IMPLEMENTATION, implementation);

        if (implementation.code.length == 0) revert InvalidImplementation();
    }

    // solhint-disable-next-line no-empty-blocks
    function setup(bytes calldata params) external {}

    // solhint-disable-next-line no-complex-fallback
    fallback() external payable {
        address implementation = getAddress(KEY_IMPLEMENTATION);

        // solhint-disable-next-line no-inline-assembly
        assembly {
            calldatacopy(0, 0, calldatasize())

            let result := delegatecall(gas(), implementation, 0, calldatasize(), 0, 0)

            returndatacopy(0, 0, returndatasize())

            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    receive() external payable {
        revert NativeCurrencyNotAccepted();
    }
}