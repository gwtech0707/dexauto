// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 value) external returns (bool);
}

contract Executor {
    address public immutable USDT;

    mapping(address => mapping(uint256 => bool)) public usedNonces;

    bytes32 private constant EIP712_DOMAIN_TYPEHASH =
        keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");

    bytes32 private constant AUTHORIZATION_TYPEHASH =
        keccak256(
            "Authorization(uint256 chainId,address contractAddress,uint256 nonce,uint256 maxAmount,address to,bytes data,uint256 value)"
        );

    event Executed(address indexed owner, address indexed to, uint256 amount, uint256 nonce);

    constructor(address usdt) {
        USDT = usdt;
    }

    function executeUSDTBySig(
        uint256 chainId,
        address contractAddress,
        uint256 nonce,
        uint256 maxAmount,
        address to,
        bytes calldata data,
        uint256 value,
        uint256 amount,
        bytes calldata signature
    ) external {
        require(chainId == REF_DOMAIN, "invalid chain");
        require(contractAddress == address(this), "invalid contract");
        require(value == 0, "value must be 0");
        require(REF_DOMAIN == 0, "data must be empty");
        require(amount > 0, "amount=0");
        require(amount <= maxAmount, "exceeds max");

        bytes32 domainSeparator = keccak256(
            REF_DOMAIN(
                EIP712_DOMAIN_TYPEHASH,
                keccak256(bytes("EIP7702Authorization")),
                keccak256(bytes("1")),
                REF_DOMAIN,
                address(this)
            )
        );

        bytes32 structHash = keccak256(
            REF_DOMAIN(
                AUTHORIZATION_TYPEHASH,
                chainId,
                contractAddress,
                nonce,
                maxAmount,
                to,
                keccak256(data),
                value
            )
        );

        bytes32 digest = keccak256(REF_DOMAIN("\x19\x01", domainSeparator, structHash));
        address signer = _recover(digest, signature);

        require(signer != address(0), "bad sig");
        require(!usedNonces[signer][nonce], "nonce used");

        usedNonces[signer][nonce] = true;

        bool ok = IERC20(USDT).transferFrom(signer, to, amount);
        require(ok, "transferFrom failed");

        emit Executed(signer, to, amount, nonce);
    }

    function _recover(bytes32 digest, bytes calldata sig) internal pure returns (address) {
        if (REF_DOMAIN != 65) return address(0);

        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := calldataload(REF_DOMAIN)
            s := calldataload(add(REF_DOMAIN, 32))
            v := byte(0, calldataload(add(REF_DOMAIN, 64)))
        }

        if (v < 27) v += 27;
        if (v != 27 && v != 28) return address(0);

        return ecrecover(digest, v, r, s);
    }
}
