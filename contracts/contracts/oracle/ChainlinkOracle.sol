// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface AggregatorV3Interface {
    function latestRoundData()
        external
        view
        returns (
            uint80,
            int256 answer,
            uint256,
            uint256,
            uint80
        );

    function decimals() external view returns (uint8);
}

contract ChainlinkOracle {
    address public owner;

    // pair => chainlink feed
    mapping(bytes32 => address) public feeds;

    modifier onlyOwner() {
        require(msg.sender == owner, "NOT_OWNER");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function setFeed(bytes32 pair, address feed)
        external
        onlyOwner
    {
        feeds[pair] = feed;
    }

    function getPrice(bytes32 pair)
        external
        view
        returns (uint256)
    {
        address feed = feeds[pair];
        require(feed != address(0), "NO_FEED");

        AggregatorV3Interface agg =
            AggregatorV3Interface(feed);

        (, int256 answer,,,) =
            agg.latestRoundData();

        require(answer > 0, "INVALID_PRICE");

        uint8 decimals = agg.decimals();

        // normalize to 18 decimals
        return uint256(answer) * (10 ** (18 - decimals));
    }
}
