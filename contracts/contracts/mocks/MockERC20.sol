// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockERC20
 * @notice テスト用ERC20トークン
 * @dev 誰でもmint可能（PoC / 開発用）
 */
contract MockERC20 is ERC20 {
    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {}

    /**
     * @notice テスト用に自由にmint
     * @param to 受取アドレス
     * @param amount mint量（18 decimals想定）
     */
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
