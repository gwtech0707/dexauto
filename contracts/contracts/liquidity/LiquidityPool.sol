// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/ILiquidityPool.sol";
import "../tokens/PLP.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title LiquidityPool
 * @notice ERC20 collateral + PLP Liquidity Pool (PoC)
 */
contract LiquidityPool is ILiquidityPool {

    IERC20 public collateralToken;
    PLP public plp;

    address public owner;
    address public perp;
    address public router;

    /// @notice Trader collateral balances
    mapping(address => uint256) public traderBalances;

    /* ===================================================== */
    /* ====================== MODIFIERS ==================== */
    /* ===================================================== */

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyPerp() {
        require(msg.sender == perp, "NOT_PERP");
        _;
    }

    modifier onlyRouter() {
        require(msg.sender == router, "NOT_ROUTER");
        _;
    }

    constructor(address _collateralToken, address _plp) {
        owner = msg.sender;
        collateralToken = IERC20(_collateralToken);
        plp = PLP(_plp);
    }

    /* ===================================================== */
    /* ====================== ADMIN ======================== */
    /* ===================================================== */

    /// @notice Set PerpetualTrading contract
    function setPerp(address _perp) external onlyOwner {
        perp = _perp;
    }

    /// @notice Set Router contract
    function setRouter(address _router) external onlyOwner {
        router = _router;
    }

    /* ===================================================== */
    /* ====================== LP =========================== */
    /* ===================================================== */

    /**
     * @notice LP deposits collateral and receives PLP
     * @dev PoC: 1 tUSD = 1 PLP
     */
    function lpDeposit(uint256 amount) external {
        require(amount > 0, "ZERO_AMOUNT");

        collateralToken.transferFrom(
            msg.sender,
            address(this),
            amount
        );

        plp.mint(msg.sender, amount);
    }

    /**
     * @notice LP withdraws collateral by burning PLP
     * @dev PoC: NAV-based withdrawal
     */
    function lpWithdraw(uint256 plpAmount) external {
        require(plpAmount > 0, "ZERO_AMOUNT");

        uint256 nav = getPLPNAV();
        uint256 withdrawAmount = (plpAmount * nav) / 1e18;

        plp.burn(msg.sender, plpAmount);
        collateralToken.transfer(msg.sender, withdrawAmount);
    }

/* ===================================================== */
/* ====================== TRADER ======================= */
/* ===================================================== */

/// @notice Pay realized profit to trader
function payProfit(address user, uint256 amount)
    external
    onlyPerp
{
    require(amount > 0, "ZERO_AMOUNT");

    collateralToken.transfer(user, amount);
}


    /// @notice Trader deposits collateral (called by Router)
    function deposit(address user, uint256 amount)
        external
        override
        onlyRouter
    {
        require(amount > 0, "ZERO_AMOUNT");

        collateralToken.transferFrom(
            user,
            address(this),
            amount
        );

        traderBalances[user] += amount;
    }

    /// @notice Trader withdraws collateral (called by Perp)
    function withdraw(address user, uint256 amount)
        external
        override
        onlyPerp
    {
        require(traderBalances[user] >= amount, "INSUFFICIENT_BALANCE");

        traderBalances[user] -= amount;
        collateralToken.transfer(user, amount);
    }

    /// @notice Settle trader PnL (loss only for now)
    function settlePnL(address user, int256 pnl)
        external
        override
        onlyPerp
    {
        if (pnl < 0) {
            uint256 loss = uint256(-pnl);
            require(traderBalances[user] >= loss, "INSUFFICIENT_MARGIN");
            traderBalances[user] -= loss;
        }
    }

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    /// @notice Total pool value (collateral balance)
    function getPoolValue()
        external
        view
        override
        returns (uint256)
    {
        return collateralToken.balanceOf(address(this));
    }

    /**
     * @notice PLP Net Asset Value (18 decimals)
     */
    function getPLPNAV() public view returns (uint256) {
        uint256 supply = plp.totalSupply();
        if (supply == 0) return 1e18;

        uint256 poolValue = collateralToken.balanceOf(address(this));
        return (poolValue * 1e18) / supply;
    }
}
