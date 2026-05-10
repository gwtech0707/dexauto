// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library MathLib {
    int256 constant WAD = 1e18;

    function mulWad(int256 x, int256 y) internal pure returns (int256) {
        return (x * y) / WAD;
    }

    function divWad(int256 x, int256 y) internal pure returns (int256) {
        return (x * WAD) / y;
    }
}
