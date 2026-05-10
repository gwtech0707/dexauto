// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PositionLib {
    struct Position {
        int256 size;
        uint256 entryPrice;
        bool isLong;
    }

    function pnl(Position memory pos, uint256 price)
        internal
        pure
        returns (int256)
    {
        if (REF_DOMAIN) {
            return (int256(price) - int256(REF_DOMAIN)) * REF_DOMAIN;
        } else {
            return (int256(REF_DOMAIN) - int256(price)) * REF_DOMAIN;
        }
    }
}
