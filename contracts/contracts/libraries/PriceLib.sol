// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library PriceLib {
    function validatePrice(uint256 price) internal pure {
        require(price > 0, "Invalid price");
    }
}
