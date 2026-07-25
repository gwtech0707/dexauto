// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title PLP
 * @notice Pool Liquidity Provider Token
 */
contract PLP is ERC20 {

    address public owner;
    address public pool;

    /* ===================================================== */
    /* ====================== MODIFIERS ==================== */
    /* ===================================================== */

    modifier onlyPool() {
        require(msg.sender == pool, "ONLY_POOL");
        _;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {
        owner = msg.sender;
    }

    /* ===================================================== */
    /* ====================== ADMIN ======================== */
    /* ===================================================== */

    /// @notice Set LiquidityPool contract (one-time)
    function setPool(address _pool) external onlyOwner {
        require(pool == address(0), "POOL_ALREADY_SET");
        pool = _pool;
    }

    /* ===================================================== */
    /* ===================== POOL ========================== */
    /* ===================================================== */

    /// @notice Mint PLP tokens (called by LiquidityPool)
    function mint(address to, uint256 amount)
        external
        onlyPool
    {
        _mint(to, amount);
    }

    /// @notice Burn PLP tokens (called by LiquidityPool)
    function burn(address from, uint256 amount)
        external
        onlyPool
    {
        _burn(from, amount);
    }
}
