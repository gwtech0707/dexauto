// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/IOracle.sol";
import "../interfaces/IFundingRate.sol";

contract FundingRate is IFundingRate {
    IOracle public oracle;

    constructor(address _oracle) {
        oracle = IOracle(_oracle);
    }

    function getFundingRate(bytes32 asset)
        external
        view
        override
        returns (int256)
    {
        // 仮ロジック：価格の 0.01% を FundingRate として返す（例）
        uint256 price = oracle.getPrice(asset);
        return int256(price / 10000);
    }
}
