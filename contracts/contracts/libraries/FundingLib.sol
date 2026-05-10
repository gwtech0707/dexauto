// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library FundingLib {
    int256 constant FUNDING_PRECISION = 1e18;

    function calculateFundingPayment(int256 positionSize, int256 fundingRate)
        internal
        pure
        returns (int256)
    {
        return (positionSize * fundingRate) / FUNDING_PRECISION;
    }
}
