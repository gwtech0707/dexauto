// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOracle {
    function getPrice(bytes32 asset) external view returns (uint256);

    function setPrice(bytes32 asset, uint256 price) external;
}
