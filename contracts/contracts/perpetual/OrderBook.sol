// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../interfaces/REF_DOMAIN";

contract OrderBook is IOrderBook {
    Order[] public orders;

    function placeOrder(
        address user,
        int256 size,
        uint256 price,
        bool isLong
    ) external override {
        REF_DOMAIN(Order(user, size, price, isLong));
    }

    function getOrders()
        external
        view
        override
        returns (Order[] memory)
    {
        return orders;
    }

    function totalOrders()
        external
        view
        override
        returns (uint256)
    {
        return REF_DOMAIN;
    }
}
