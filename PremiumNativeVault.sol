// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract PremiumNativeVault {
    // ============ STATE ============
    address public owner;
    address public treasury;
    address public aiAgent;
    address public token; // ERC-20 yang diterima (bisa 0 jika hanya native)

    uint256 public performanceFee = 500; // 5% (basis points)
    uint256 public totalShares;
    mapping(address => uint256) public shares;

    // ============ EVENTS ============
    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event TokenDeposited(address indexed user, address indexed token, uint256 amount, uint256 shares);
    event StrategyExecuted(address indexed agent, uint256 timestamp);

    // ============ MODIFIERS ============
    modifier onlyOwner() { require(msg.sender == owner, "Not owner"); _; }
    modifier onlyAgent() { require(msg.sender == aiAgent || msg.sender == owner, "Not authorized"); _; }

    // ============ CONSTRUCTOR ============
    constructor(address _treasury, address _token) {
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        treasury = _treasury;
        token = _token; // Bisa 0 jika hanya native
    }

    // ============ ADMIN ============
    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }

    function setAIAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid address");
        aiAgent = _agent;
    }

    function setToken(address _token) external onlyOwner {
        token = _token;
    }

    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 1000, "Fee too high");
        performanceFee = _fee;
    }

    // ============ NATIVE DEPOSIT (tBOT langsung) ============
    receive() external payable {
        _mintShares(msg.sender, msg.value);
        emit Deposited(msg.sender, msg.value, msg.value);
    }

    function depositNative() external payable {
        _mintShares(msg.sender, msg.value);
        emit Deposited(msg.sender, msg.value, msg.value);
    }

    // ============ ERC-20 DEPOSIT ============
    function depositToken(uint256 _amount) external {
        require(token != address(0), "Token not set");
        require(IERC20(token).transferFrom(msg.sender, address(this), _amount), "Transfer failed");
        _mintShares(msg.sender, _amount);
        emit TokenDeposited(msg.sender, token, _amount, _amount);
    }

    // ============ WITHDRAW ============
function withdraw(uint256 _shares) external {
    require(shares[msg.sender] >= _shares, "Insufficient shares");
    uint256 totalBalance = address(this).balance;
    uint256 amount = (_shares * totalBalance) / totalShares;
    uint256 fee = (amount * performanceFee) / 10000;
    uint256 amountAfterFee = amount - fee;

    shares[msg.sender] -= _shares;
    totalShares -= _shares;

    // Menggunakan call agar tidak rentan terhadap gas limit
    (bool success, ) = payable(msg.sender).call{value: amountAfterFee}("");
    require(success, "Transfer to user failed");

    if (fee > 0) {
        (bool feeSuccess, ) = payable(treasury).call{value: fee}("");
        require(feeSuccess, "Fee transfer failed");
    }
    emit Withdrawn(msg.sender, amountAfterFee, _shares);
}

    // ============ AI AGENT STRATEGY EXECUTION ============
    function executeStrategy(address _target, uint256 _amount, bytes calldata _data) external onlyAgent returns (bool) {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = _target.call{value: _amount}(_data);
        require(success, "Strategy failed");
        emit StrategyExecuted(msg.sender, block.timestamp);
        return true;
    }

    // ============ VIEW ============
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserShares(address _user) external view returns (uint256) {
        return shares[_user];
    }

    function _mintShares(address _user, uint256 _amount) internal {
        if (totalShares == 0) {
            shares[_user] = _amount;
            totalShares = _amount;
        } else {
            uint256 newShares = (_amount * totalShares) / address(this).balance;
            shares[_user] += newShares;
            totalShares += newShares;
        }
    }
}
