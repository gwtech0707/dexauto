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
        if (pos.isLong) {
            return (int256(price) - int256(pos.entryPrice)) * pos.size;
        } else {
            return (int256(pos.entryPrice) - int256(price)) * pos.size;
        }
    }
}
