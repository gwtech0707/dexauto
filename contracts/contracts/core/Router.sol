// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IPerp.sol";
import "../interfaces/ILiquidityPool.sol";
import "../interfaces/IOracle.sol";

contract Router {

    IPerp public perp;
    ILiquidityPool public liquidityPool;
    IOracle public oracle;

    /* ===================================================== */
    /* ====================== EVENTS ======================= */
    /* ===================================================== */

    event PositionClosed(
        address indexed user,
        uint256 indexed positionId,
        bytes32 pair,
        int256 size,
        uint256 entryPrice,
        uint256 exitPrice,
        int256 pnl,          // UI / history 用（Routerでは計算しない）
        uint256 timestamp
    );

    constructor(
        address _perp,
        address _liquidityPool,
        address _oracle
    ) {
        perp = IPerp(_perp);
        liquidityPool = ILiquidityPool(_liquidityPool);
        oracle = IOracle(_oracle);
    }

    /* ===================================================== */
    /* ====================== MARGIN ======================= */
    /* ===================================================== */

    function deposit(uint256 amount) external {
        liquidityPool.deposit(msg.sender, amount);
        perp.onTraderDeposit(msg.sender, amount);
    }

    function withdraw(uint256 amount) external {
        perp.onTraderWithdraw(msg.sender, amount);
    }

    /* ===================================================== */
    /* ===================== POSITION ====================== */
    /* ===================================================== */

    function openPosition(bytes32 pair, int256 size)
        external
        returns (uint256)
    {
        return perp.openPosition(msg.sender, pair, size);
    }

    /**
     * @notice Fully close position
     * @dev Router は「入口のみ」
     *      - PnL 計算
     *      - margin 減算
     *      - claimablePnL 加算
     *      - Pool 精算
     *      すべて PerpetualTrading に委譲
     */
    function closePosition(uint256 positionId) external {
        // ===== 1. read position BEFORE close (event 用) =====
        (
            bytes32 pair,
            int256 size,
            uint256 entryPrice,
            ,
            bool isOpen
        ) = perp.getPosition(msg.sender, positionId);

        require(isOpen, "POSITION_NOT_OPEN");

        // ===== 2. exit price（event 用）=====
        uint256 exitPrice = oracle.getPrice(pair);

        // ===== 3. close (SSOT: PerpetualTrading) =====
        perp.closePosition(msg.sender, positionId);

        // ===== 4. emit event (履歴用途のみ) =====
        emit PositionClosed(
            msg.sender,
            positionId,
            pair,
            size,
            entryPrice,
            exitPrice,
            0, // Router では pnl を確定しない
            block.timestamp
        );
    }

    function closePositionPartial(
        uint256 positionId,
        int256 closeSize
    ) external {
        // 部分クローズのロジック・精算は Perpetual 側
        perp.closePositionPartial(msg.sender, positionId, closeSize);
    }

    /* ===================================================== */
    /* ====================== PNL ========================== */
    /* ===================================================== */

    function claimPnL() external {
        perp.claimPnL(msg.sender);
    }

    function claimPnLToMargin() external {
    perp.claimPnLToMargin(msg.sender);
}


    function getClaimablePnL(address user)
        external
        view
        returns (int256)
    {
        return perp.getClaimablePnL(user);
    }

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    function getPosition(address user, uint256 positionId)
        external
        view
        returns (
            bytes32 pair,
            int256 size,
            uint256 entryPrice,
            uint256 margin,
            bool isOpen
        )
    {
        return perp.getPosition(user, positionId);
    }

    function getMargin(address user)
        external
        view
        returns (uint256)
    {
        return perp.getMargin(user);
    }

    function getUserPositionIds(address user)
        external
        view
        returns (uint256[] memory)
    {
        return perp.getUserPositionIds(user);
    }
}
