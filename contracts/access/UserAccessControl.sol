// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * ============================================================
 * UserAccessControl
 * ============================================================
 *
 * Role:
 * - Address-based user registration & access control
 * - Demo / PoC friendly (no off-chain dependency)
 *
 * Design:
 * - admin can add/remove users
 * - users can self-register (optional demo mode)
 * - other contracts can import & use onlyAuthorized
 *
 * ============================================================
 */

contract UserAccessControl {

    /* ===================================================== */
    /* ====================== STORAGE ====================== */
    /* ===================================================== */

    /// @notice Admin address
    address public admin;

    /// @notice Authorized user list
    mapping(address => bool) public isAuthorized;

    /// @notice Optional self-registration flag
    bool public allowSelfRegister;

    /* ===================================================== */
    /* ======================= EVENTS ====================== */
    /* ===================================================== */

    event UserAdded(address indexed user);
    event UserRemoved(address indexed user);
    event SelfRegisterStatusChanged(bool enabled);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    /* ===================================================== */
    /* ====================== MODIFIERS ==================== */
    /* ===================================================== */

    modifier onlyAdmin() {
        require(msg.sender == admin, "NOT_ADMIN");
        _;
    }

    modifier onlyAuthorized() {
        require(isAuthorized[msg.sender], "NOT_AUTHORIZED");
        _;
    }

    /* ===================================================== */
    /* ===================== CONSTRUCTOR =================== */
    /* ===================================================== */

    constructor() {
        admin = msg.sender;
        isAuthorized[msg.sender] = true;
        emit UserAdded(msg.sender);
    }

    /* ===================================================== */
    /* =================== ADMIN CONTROLS ================= */
    /* ===================================================== */

    function addUser(address user) external onlyAdmin {
        require(user != address(0), "INVALID_ADDRESS");
        isAuthorized[user] = true;
        emit UserAdded(user);
    }

    function removeUser(address user) external onlyAdmin {
        require(user != admin, "CANNOT_REMOVE_ADMIN");
        isAuthorized[user] = false;
        emit UserRemoved(user);
    }

    function setAllowSelfRegister(bool enabled) external onlyAdmin {
        allowSelfRegister = enabled;
        emit SelfRegisterStatusChanged(enabled);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        require(newAdmin != address(0), "INVALID_ADMIN");
        address old = admin;
        admin = newAdmin;
        isAuthorized[newAdmin] = true;
        emit AdminTransferred(old, newAdmin);
    }

    /* ===================================================== */
    /* ================= SELF REGISTRATION ================= */
    /* ===================================================== */

    function selfRegister() external {
        require(allowSelfRegister, "SELF_REGISTER_DISABLED");
        isAuthorized[msg.sender] = true;
        emit UserAdded(msg.sender);
    }

    function selfUnregister() external {
        require(msg.sender != admin, "ADMIN_CANNOT_UNREGISTER");
        isAuthorized[msg.sender] = false;
        emit UserRemoved(msg.sender);
    }

    /* ===================================================== */
    /* ======================= VIEWS ======================= */
    /* ===================================================== */

    function isUser(address user) external view returns (bool) {
        return isAuthorized[user];
    }
}
