// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoYieldVault {
    address public owner;
    address public treasury;
    address public aiAgent;

    uint256 public totalDeposited;
    uint256 public totalShares;
    uint256 public totalYield;

    uint256 public performanceFee = 1000;
    uint256 public withdrawalFee = 100;

    mapping(address => uint256) public userShares;
    mapping(address => uint256) public userDeposited;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(
        address indexed user,
        uint256 amount,
        uint256 profit,
        uint256 fee
    );
    event YieldAdded(uint256 amount, uint256 timestamp);
    event FeeCollected(address indexed treasury, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyAgent() {
        require(msg.sender == aiAgent || msg.sender == owner, "Not authorized");
        _;
    }

    constructor(address _treasury) {
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        treasury = _treasury;
    }

    function setAIAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid agent");
        aiAgent = _agent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
    }

    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 2000, "Fee too high");
        performanceFee = _fee;
    }

    function setWithdrawalFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high");
        withdrawalFee = _fee;
    }

    receive() external payable {
        _deposit(msg.sender, msg.value);
    }

    function deposit() external payable {
        _deposit(msg.sender, msg.value);
    }

    function _deposit(address _user, uint256 _amount) internal {
        require(_amount > 0, "Amount must be > 0");

        uint256 sharesToMint;
        if (totalShares == 0) {
            sharesToMint = _amount;
        } else {
            sharesToMint = (_amount * totalShares) / totalDeposited;
        }

        userShares[_user] += sharesToMint;
        userDeposited[_user] += _amount;
        totalShares += sharesToMint;
        totalDeposited += _amount;

        emit Deposited(_user, _amount, sharesToMint);
    }

    // AI Agent memanggil fungsi ini untuk memasukkan yield nyata dari farming
    function addYield(uint256 _amount) external payable onlyAgent {
        require(_amount > 0, "Invalid yield");
        totalYield += _amount;
        emit YieldAdded(_amount, block.timestamp);
    }

    function withdraw(uint256 _shares) external {
        uint256 userShare = userShares[msg.sender];
        require(userShare >= _shares, "Insufficient shares");

        uint256 principal = (_shares * totalDeposited) / totalShares;
        uint256 yieldShare = (_shares * totalYield) / totalShares;

        uint256 performanceFeeAmount = (yieldShare * performanceFee) / 10000;
        uint256 withdrawalFeeAmount = (principal * withdrawalFee) / 10000;

        uint256 payout = principal + yieldShare - performanceFeeAmount - withdrawalFeeAmount;
        uint256 totalFee = performanceFeeAmount + withdrawalFeeAmount;

        require(address(this).balance >= payout + totalFee, "Insufficient vault balance");

        userShares[msg.sender] -= _shares;
        totalShares -= _shares;
        totalDeposited -= principal;
        totalYield -= yieldShare;

        // KURANGI userDeposited di sini!
        userDeposited[msg.sender] -= principal;

        if (totalFee > 0) {
            (bool feeSuccess, ) = payable(treasury).call{value: totalFee}("");
            require(feeSuccess, "Treasury transfer failed");
            emit FeeCollected(treasury, totalFee);
        }

        (bool userSuccess, ) = payable(msg.sender).call{value: payout}("");
        require(userSuccess, "User transfer failed");

        emit Withdrawn(msg.sender, payout, yieldShare, totalFee);
    }

    function getUserShares(address _user) external view returns (uint256) {
        return userShares[_user];
    }

    function getUserDeposited(address _user) external view returns (uint256) {
        return userDeposited[_user];
    }

    function getTotalDeposited() external view returns (uint256) {
        return totalDeposited;
    }

    function getTotalYield() external view returns (uint256) {
        return totalYield;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getProfitRate() external view returns (uint256) {
        return (totalYield * 10000) / totalDeposited;
    }
}
