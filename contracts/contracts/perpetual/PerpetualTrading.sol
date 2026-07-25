// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 * PerpetualTrading.sol
 * ============================================================
 *
 * Role:
 * - Perp DEX の中核ロジック（SSOT）
 * - ポジション管理・PnL 計算・状態遷移のみを担当
 *
 * Design Rules（最重要）:
 * ------------------------------------------------------------
 * - ❌ ERC20 transfer / balance 操作は禁止
 * - ❌ 資金移動は一切しない
 * - ✅ 損失は LiquidityPool.settlePnL に完全委譲
 * - ✅ 利益は claimablePnL として記録のみ
 * - ✅ Router が唯一の外部入口
 * - ✅ マイナス PnL で絶対に revert しない
 *
 * Close / Partial Close / Liquidation は
 * すべて「PnL 計算 → _settlePnL → 状態更新」で統一
 * ============================================================
 */

import "../interfaces/IPerp.sol";
import "../interfaces/ILiquidityPool.sol";
import "../interfaces/IOracle.sol";

contract PerpetualTrading is IPerp {

    /* ===================================================== */
    /* ======================= EVENTS ====================== */
    /* ===================================================== */

    /// @notice New position opened
    event PositionOpened(
        address indexed user,
        uint256 indexed positionId,
        bytes32 pair,
        int256 size,
        uint256 entryPrice,
        uint256 margin
    );

    /// @notice Position fully closed by user
    event PositionClosed(
        address indexed user,
        uint256 indexed positionId,
        bytes32 pair,
        int256 size,
        uint256 entryPrice,
        uint256 exitPrice,
        int256 pnl
    );

    /// @notice Position partially closed
    event PositionPartiallyClosed(
        address indexed user,
        uint256 indexed positionId,
        bytes32 pair,
        int256 closedSize,
        int256 remainingSize,
        uint256 exitPrice,
        int256 pnl
    );

    /// @notice Position liquidated
    event PositionLiquidated(
        address indexed user,
        uint256 indexed positionId,
        bytes32 pair,
        int256 size,
        uint256 entryPrice,
        uint256 exitPrice,
        int256 pnl
    );

    /// @notice PnL settled (profit or loss)
    event PnLSettled(
        address indexed user,
        int256 pnl,
        int256 claimableAfter
    );


    /* ===================================================== */
    /* ======================= TYPES ======================= */
    /* ===================================================== */

    struct Position {
        bytes32 pair;
        int256 size;        // +long / -short（USD notional）
        uint256 entryPrice;
        uint256 margin;     // 表示・リスク参照用（SSOTではない）
        bool isOpen;
    }

    /* ===================================================== */
    /* ====================== STORAGE ====================== */
    /* ===================================================== */

    address public owner;
    address public router;
    address public liquidationEngine;

    IOracle public oracle;
    ILiquidityPool public liquidityPool;

    uint256 public nextPositionId;

    mapping(address => uint256[]) private userPositionIds;
    mapping(address => mapping(uint256 => Position)) public positions;

    // Router 経由で管理される口座証拠金（SSOT）
    mapping(address => uint256) public traderMargin;

    // 確定利益（請求待ち）
    mapping(address => int256) public claimablePnL;

    /* ===================================================== */
    /* ====================== MODIFIERS ==================== */
    /* ===================================================== */

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "NOT_ROUTER");
        _;
    }

    modifier onlyLiquidation() {
        require(msg.sender == liquidationEngine, "NOT_LIQUIDATION");
        _;
    }

    /* ===================================================== */
    /* ====================== INIT ========================= */
    /* ===================================================== */

    constructor(address _oracle, address _liquidityPool) {
        owner = msg.sender;
        oracle = IOracle(_oracle);
        liquidityPool = ILiquidityPool(_liquidityPool);
    }

    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    function setLiquidationEngine(address _engine) external onlyOwner {
        liquidationEngine = _engine;
    }

    /* ===================================================== */
    /* ====================== MARGIN ======================= */
    /* ===================================================== */

    function onTraderDeposit(address user, uint256 amount)
        external
        onlyRouter
    {
        traderMargin[user] += amount;
    }

    function onTraderWithdraw(address user, uint256 amount)
    external
    onlyRouter
{
    require(amount > 0, "ZERO_AMOUNT");
    
}




    /* ===================================================== */
    /* ===================== POSITION ====================== */
    /* ===================================================== */

    function openPosition(
    address user,
    bytes32 pair,
    int256 size
)
    external
    onlyRouter
    returns (uint256 positionId)
{
    require(size != 0, "INVALID_SIZE");

    // PoC: 固定 10x leverage
    uint256 requiredMargin = uint256(_abs(size)) / 10;
    require(traderMargin[user] >= requiredMargin, "INSUFFICIENT_MARGIN");

    uint256 price = oracle.getPrice(pair);

    // margin を口座から切り出す
    traderMargin[user] -= requiredMargin;

    positionId = nextPositionId++;
    userPositionIds[user].push(positionId);

    positions[user][positionId] = Position({
        pair: pair,
        size: size,
        entryPrice: price,
        margin: requiredMargin,
        isOpen: true
    });

    emit PositionOpened(
        user,
        positionId,
        pair,
        size,
        price,
        requiredMargin
    );
}


    /// ================== FULL CLOSE ==================

    function closePosition(address user, uint256 positionId)
    external
    onlyRouter
{
    Position storage pos = positions[user][positionId];
    require(pos.isOpen, "NO_POSITION");

    uint256 exitPrice = oracle.getPrice(pos.pair);
    int256 pnl = _calcPnl(pos.size, pos.entryPrice, exitPrice);

    // ① ポジション専用 margin を口座に戻す
    traderMargin[user] += pos.margin;

    // ② PnL を処理
    if (pnl < 0) {
        // loss は即時確定
        traderMargin[user] -= uint256(-pnl);
    } else if (pnl > 0) {
        claimablePnL[user] += pnl;
    }

    pos.isOpen = false;

    emit PositionClosed(
        user,
        positionId,
        pos.pair,
        pos.size,
        pos.entryPrice,
        exitPrice,
        pnl
    );
}


    /// ================== PARTIAL CLOSE ==================

    function closePositionPartial(
    address user,
    uint256 positionId,
    int256 closeSize
)
    external
    onlyRouter
{
    Position storage pos = positions[user][positionId];
    require(pos.isOpen, "NO_POSITION");
    require(closeSize != 0, "INVALID_CLOSE_SIZE");

    require(
        (pos.size > 0 && closeSize > 0) ||
        (pos.size < 0 && closeSize < 0),
        "WRONG_DIRECTION"
    );

    require(_abs(closeSize) <= _abs(pos.size), "CLOSE_TOO_LARGE");

    uint256 exitPrice = oracle.getPrice(pos.pair);

    // ===== 比率 =====
    uint256 r = uint256(_abs(closeSize)) * 1e18 / uint256(_abs(pos.size));

    // ===== PnL =====
    int256 totalPnL = _calcPnl(pos.size, pos.entryPrice, exitPrice);
    int256 partialPnL = totalPnL * int256(r) / int256(1e18);

    // ===== margin 按分 =====
    uint256 marginPartial = pos.margin * r / 1e18;

    // margin を口座に戻す
    traderMargin[user] += marginPartial;
    pos.margin -= marginPartial;

    // PnL 処理
    if (partialPnL < 0) {
        traderMargin[user] -= uint256(-partialPnL);
    } else if (partialPnL > 0) {
        claimablePnL[user] += partialPnL;
    }

    // size 更新
    pos.size -= closeSize;
    if (pos.size == 0) {
        pos.isOpen = false;
    }

    emit PositionPartiallyClosed(
        user,
        positionId,
        pos.pair,
        closeSize,
        pos.size,
        exitPrice,
        partialPnL
    );
    }

    /* ===================================================== */
    /* ===================== LIQUIDATION =================== */
    /* ===================================================== */

    /**
     * @notice 強制清算（closePosition と同一の精算）
     * @dev 清算は「強制 closePosition」
     */
    function liquidate(address user, uint256 positionId)
    external
    onlyLiquidation
{
    Position storage pos = positions[user][positionId];
    require(pos.isOpen, "NO_POSITION");

    uint256 exitPrice = oracle.getPrice(pos.pair);
    int256 pnl = _calcPnl(pos.size, pos.entryPrice, exitPrice);

    // ① margin を口座に戻す
    traderMargin[user] += pos.margin;

    // ② PnL を即時精算
    if (pnl < 0) {
        traderMargin[user] -= uint256(-pnl);
    } else if (pnl > 0) {
        claimablePnL[user] += pnl; // PoC では skip しても可
    }

    pos.isOpen = false;

    emit PositionLiquidated(
        user,
        positionId,
        pos.pair,
        pos.size,
        pos.entryPrice,
        exitPrice,
        pnl
    );

    }

    /* ===================================================== */
    /* ======================== PNL ======================== */
    /* ===================================================== */

    function claimPnL(address user)
        external
        onlyRouter
    {
        int256 pnl = claimablePnL[user];
        require(pnl > 0, "NO_PROFIT");

        claimablePnL[user] = 0;
        liquidityPool.payProfit(user, uint256(pnl));
    }

    function addClaimablePnL(address user, int256 pnl)
        external
        onlyRouter
    {
        require(pnl > 0, "INVALID_PNL");
        claimablePnL[user] += pnl;
    }

    function claimPnLToMargin(address user)
    external
    onlyRouter
{
    int256 pnl = claimablePnL[user];
    require(pnl > 0, "NO_PNL");

    claimablePnL[user] = 0;
    traderMargin[user] += uint256(pnl);
}



    function getClaimablePnL(address user)
        external
        view
        returns (int256)
    {
        return claimablePnL[user];
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
        Position memory p = positions[user][positionId];
        return (p.pair, p.size, p.entryPrice, p.margin, p.isOpen);
    }

    function getMargin(address user)
        external
        view
        returns (uint256)
    {
        return traderMargin[user];
    }

    function getUserPositionIds(address user)
        external
        view
        returns (uint256[] memory)
    {
        return userPositionIds[user];
    }

    /**
     * @notice 清算可能か（PoC: margin 全損）
     */
    function isLiquidatable(address user, uint256 positionId)
        external
        view
        returns (bool)
    {
        Position memory pos = positions[user][positionId];
        if (!pos.isOpen) return false;

        uint256 exitPrice = oracle.getPrice(pos.pair);
        int256 pnl = _calcPnl(pos.size, pos.entryPrice, exitPrice);

        if (pnl >= 0) return false;

        uint256 loss = uint256(-pnl);
        return loss >= traderMargin[user];
    }

    /* ===================================================== */
    /* ===================== INTERNAL ====================== */
    /* ===================================================== */

    function _settlePnL(address user, int256 pnl) internal {
        if (pnl < 0) {
            liquidityPool.settlePnL(user, pnl);
        } else if (pnl > 0) {
            claimablePnL[user] += pnl;
        }

        emit PnLSettled(
            user,
            pnl,
            claimablePnL[user]
        );

    }

    function _calcPnl(
        int256 size,
        uint256 entryPrice,
        uint256 exitPrice
    ) internal pure returns (int256) {
        int256 entry = int256(entryPrice);
        int256 exitp = int256(exitPrice);
        return (size * (exitp - entry)) / entry;
    }

    function _abs(int256 x) internal pure returns (int256) {
        return x >= 0 ? x : -x;
    }
}
