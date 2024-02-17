// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CasinoFi is ERC20, Ownable {
    uint256 public constant LIMIT = 100000000 * 10 ** 18;
    constructor() ERC20("TestToeken", "TT") {
        _mint(msg.sender, 100000000 * 10 ** decimals());
    }

    function burn(uint256 amount) public onlyOwner {
        _burn(msg.sender, amount);
    }

    function mint(address to) public {
        _mint(to, 1000 * 10 ** decimals());
    }
}