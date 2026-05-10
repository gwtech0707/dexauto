const PriceOracleAbi = [
  {
    inputs: [
      { internalType: "bytes32", name: "pair", type: "bytes32" },
      { internalType: "uint256", name: "price", type: "uint256" }
    ],
    name: "setPrice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function"
  },
  {
    inputs: [
      { internalType: "bytes32", name: "pair", type: "bytes32" }
    ],
    name: "getPrice",
    outputs: [
      { internalType: "uint256", name: "", type: "uint256" }
    ],
    stateMutability: "view",
    type: "function"
  }
] as const;

export default PriceOracleAbi;
