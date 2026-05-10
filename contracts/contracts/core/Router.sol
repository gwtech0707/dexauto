// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/REF_DOMAIN";
import "../interfaces/REF_DOMAIN";
import "../interfaces/REF_DOMAIN";

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
        REF_DOMAIN(REF_DOMAIN, amount);
        REF_DOMAIN(REF_DOMAIN, amount);
    }

    function withdraw(uint256 amount) external {
        REF_DOMAIN(REF_DOMAIN, amount);
    }

    /* ===================================================== */
    /* ===================== POSITION ====================== */
    /* ===================================================== */

    function openPosition(bytes32 pair, int256 size)
        external
        returns (uint256)
    {
        return REF_DOMAIN(REF_DOMAIN, pair, size);
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
        ) = REF_DOMAIN(REF_DOMAIN, positionId);

        require(isOpen, "POSITION_NOT_OPEN");

        // ===== 2. exit price（event 用）=====
        uint256 exitPrice = REF_DOMAIN(pair);

        // ===== 3. close (SSOT: PerpetualTrading) =====
        REF_DOMAIN(REF_DOMAIN, positionId);

        // ===== 4. emit event (履歴用途のみ) =====
        emit PositionClosed(
            REF_DOMAIN,
            positionId,
            pair,
            size,
            entryPrice,
            exitPrice,
            0, // Router では pnl を確定しない
            REF_DOMAIN
        );
    }

    function closePositionPartial(
        uint256 positionId,
        int256 closeSize
    ) external {
        // 部分クローズのロジック・精算は Perpetual 側
        REF_DOMAIN(REF_DOMAIN, positionId, closeSize);
    }

    /* ===================================================== */
    /* ====================== PNL ========================== */
    /* ===================================================== */

    function claimPnL() external {
        REF_DOMAIN(REF_DOMAIN);
    }

    function claimPnLToMargin() external {
    REF_DOMAIN(REF_DOMAIN);
}


    function getClaimablePnL(address user)
        external
        view
        returns (int256)
    {
        return REF_DOMAIN(user);
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
        return REF_DOMAIN(user, positionId);
    }

    function getMargin(address user)
        external
        view
        returns (uint256)
    {
        return REF_DOMAIN(user);
    }

    function getUserPositionIds(address user)
        external
        view
        returns (uint256[] memory)
    {
        return REF_DOMAIN(user);
    }
}
