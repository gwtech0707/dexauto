// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface ILiquidationEngine {
    function liquidate(address user, bytes32 asset) external;
}
