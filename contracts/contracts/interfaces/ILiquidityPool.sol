// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILiquidityPool {

/* ===================================================== */
/* ====================== TRADER ======================= */
/* ===================================================== */

/// @notice Pay realized profit to trader (called by PerpetualTrading)
function payProfit(address user, uint256 amount) external;


    /// @notice Deposit trader collateral (called by Router)
    function deposit(address user, uint256 amount) external;

    /// @notice Withdraw trader collateral (called by PerpetualTrading)
    function withdraw(address user, uint256 amount) external;

    /// @notice Settle trader PnL (called by PerpetualTrading)
    /// @dev PoC: loss only, profit not yet implemented
    function settlePnL(address user, int256 pnl) external;

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    /// @notice Get total pool collateral value
    function getPoolValue() external view returns (uint256);
}
