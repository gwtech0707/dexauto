// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IOrderBook {
    struct Order {
        address user;
        int256 size;
        uint256 price;
        bool isLong;
    }

    function placeOrder(address user, int256 size, uint256 price, bool isLong) external;

    function getOrders() external view returns (Order[] memory);

    function totalOrders() external view returns (uint256);
}
