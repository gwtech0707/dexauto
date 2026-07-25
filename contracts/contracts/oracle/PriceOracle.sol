// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title PriceOracle
 * @notice Multi-pair price oracle (PoC)
 * @dev bytes32 pair => price (18 decimals)
 */
contract PriceOracle {

    address public owner;

    /// @notice pair => price (18 decimals)
    mapping(bytes32 => uint256) public prices;

    /// @notice authorized price updaters
    mapping(address => bool) public updaters;

    /* ===================================================== */
    /* ====================== MODIFIERS ==================== */
    /* ===================================================== */

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    modifier onlyUpdater() {
        require(updaters[msg.sender], "NOT_UPDATER");
        _;
    }

    constructor() {
        owner = msg.sender;
        updaters[msg.sender] = true;
    }

    /* ===================================================== */
    /* ====================== ADMIN ======================== */
    /* ===================================================== */

    /// @notice Add authorized price updater
    function addUpdater(address user) external onlyOwner {
        updaters[user] = true;
    }

    /// @notice Remove authorized price updater
    function removeUpdater(address user) external onlyOwner {
        updaters[user] = false;
    }

    /* ===================================================== */
    /* ===================== PRICE ========================= */
    /* ===================================================== */

    /// @notice Set absolute price for a trading pair
    /// @dev Price must be 18 decimals
    function setPrice(bytes32 pair, uint256 price)
        external
        onlyUpdater
    {
        require(price > 0, "INVALID_PRICE");
        prices[pair] = price;
    }

    /// @notice Increase price by delta (18 decimals)
    function increasePrice(bytes32 pair, uint256 delta)
        external
        onlyUpdater
    {
        require(delta > 0, "INVALID_DELTA");

        uint256 current = prices[pair];
        require(current > 0, "PRICE_NOT_SET");

        prices[pair] = current + delta;
    }

    /// @notice Decrease price by delta (18 decimals)
    function decreasePrice(bytes32 pair, uint256 delta)
        external
        onlyUpdater
    {
        require(delta > 0, "INVALID_DELTA");

        uint256 current = prices[pair];
        require(current > delta, "PRICE_TOO_LOW");

        prices[pair] = current - delta;
    }

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    /// @notice Get latest price for a trading pair
    function getPrice(bytes32 pair)
        external
        view
        returns (uint256)
    {
        uint256 price = prices[pair];
        require(price > 0, "PRICE_NOT_SET");
        return price;
    }
}
