// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 * IPerp.sol
 * ============================================================
 *
 * Role:
 * - PerpetualTrading の公開インターフェース
 * - Router / LiquidationEngine / Frontend が参照する SSOT
 *
 * Design Rules:
 * ------------------------------------------------------------
 * - 資金移動は含まない（LiquidityPool が担当）
 * - PnL 計算・ポジション状態は PerpetualTrading が担当
 * ============================================================
 */
interface IPerp {

    /* ===================================================== */
    /* ====================== MARGIN ======================= */
    /* ===================================================== */

    /// @notice Increase trader margin (called by Router on deposit)
    function onTraderDeposit(address user, uint256 amount) external;

    /// @notice Decrease trader margin (called by Router on withdraw)
    function onTraderWithdraw(address user, uint256 amount) external;

    /* ===================================================== */
    /* ===================== POSITION ====================== */
    /* ===================================================== */

    /// @notice Open new position
    function openPosition(
        address user,
        bytes32 pair,
        int256 size
    ) external returns (uint256 positionId);

    /// @notice Fully close position (realize all PnL)
    function closePosition(address user, uint256 positionId) external;

    /// @notice Partially close position
    function closePositionPartial(
        address user,
        uint256 positionId,
        int256 closeSize
    ) external;

    /* ===================================================== */
    /* ===================== LIQUIDATION =================== */
    /* ===================================================== */

    /// @notice Check whether position can be liquidated
    function isLiquidatable(
        address user,
        uint256 positionId
    ) external view returns (bool);

    /// @notice Force close position (called by LiquidationEngine)
    function liquidate(address user, uint256 positionId) external;

    /* ===================================================== */
    /* ======================== PNL ======================== */
    /* ===================================================== */

    /// @notice Claim realized PnL
    function claimPnL(address user) external;

    function claimPnLToMargin(address user) external;

    /// @notice Get realized (claimable) PnL
    function getClaimablePnL(address user)
        external
        view
        returns (int256);

    /// @notice Add claimable PnL (Router / internal use)
    function addClaimablePnL(
        address user,
        int256 pnl
    ) external;

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    /// @notice Get single position info
    function getPosition(address user, uint256 positionId)
        external
        view
        returns (
            bytes32 pair,
            int256 size,
            uint256 entryPrice,
            uint256 margin,
            bool isOpen
        );

    /// @notice Get total trader margin
    function getMargin(address user) external view returns (uint256);

    /// @notice Get all position IDs of trader
    function getUserPositionIds(address user)
        external
        view
        returns (uint256[] memory);
}
