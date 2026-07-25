// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 * LiquidationEngine.sol
 * ============================================================
 *
 * Role:
 * ------------------------------------------------------------
 * - 清算可能かどうかの「判定」を PerpetualTrading に委譲
 * - 清算実行（forced close）のトリガーのみを担当
 *
 * Design Rules（重要）:
 * ------------------------------------------------------------
 * - ❌ PnL 計算をしない
 * - ❌ Oracle を参照しない
 * - ❌ 資金移動をしない
 * - ❌ margin / balance を直接見ない
 *
 * - ✅ isLiquidatable() の SSOT は PerpetualTrading
 * - ✅ 清算実行は perp.liquidate() のみ
 *
 * Trigger:
 * ------------------------------------------------------------
 * - Keeper
 * - Bot
 * - Admin
 * - 将来的には Permissionless
 *
 * This contract is intentionally VERY small.
 * ============================================================
 */

import "../interfaces/IPerp.sol";

contract LiquidationEngine {

    /* ===================================================== */
    /* ====================== STORAGE ====================== */
    /* ===================================================== */

    IPerp public perp;

    /* ===================================================== */
    /* ====================== INIT ========================= */
    /* ===================================================== */

    constructor(address _perp) {
        perp = IPerp(_perp);
    }

    /* ===================================================== */
    /* ===================== ACTION ======================== */
    /* ===================================================== */

    /**
     * @notice Trigger liquidation if position is liquidatable
     *
     * @dev
     * - 清算条件の判定は PerpetualTrading が SSOT
     * - この関数は「実行ボタン」にすぎない
     *
     * Flow:
     * 1. perp.isLiquidatable(user, positionId)
     * 2. perp.liquidate(user, positionId)
     */
    function liquidate(address user, uint256 positionId) external {
        require(
            perp.isLiquidatable(user, positionId),
            "NOT_LIQUIDATABLE"
        );

        perp.liquidate(user, positionId);
    }
}
