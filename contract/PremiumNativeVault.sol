// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PremiumYieldVault {
    address public owner;
    address public treasury;
    address public aiAgent;

    uint256 public totalShares;
    uint256 public totalDeposited;
    uint256 public accumulatedProfit;

    uint256 public performanceFee = 1000;
    uint256 public withdrawalFee = 100;

    mapping(address => uint256) public userShares;
    mapping(address => uint256) public userDeposited;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event ProfitAdded(uint256 amount, uint256 timestamp);
    event StrategyExecuted(address indexed agent, uint256 timestamp);
    event FeesCollected(uint256 performanceFee, uint256 withdrawalFee);

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
        require(_agent != address(0), "Invalid address");
        aiAgent = _agent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
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

    function withdraw(uint256 _shares) external {
        require(userShares[msg.sender] >= _shares, "Insufficient shares");

        uint256 amount = (_shares * totalDeposited) / totalShares;
        uint256 profit = amount - userDeposited[msg.sender];

        uint256 fee;
        if (profit > 0) {
            fee = (profit * performanceFee) / 10000;
            amount -= fee;
        }

        uint256 withdrawFeeAmt = (amount * withdrawalFee) / 10000;
        amount -= withdrawFeeAmt;

        userShares[msg.sender] -= _shares;
        totalShares -= _shares;
        totalDeposited -= amount + fee + withdrawFeeAmt;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        if (fee > 0 || withdrawFeeAmt > 0) {
            (bool feeSuccess, ) = payable(treasury).call{value: fee + withdrawFeeAmt}("");
            require(feeSuccess, "Fee transfer failed");
            emit FeesCollected(fee, withdrawFeeAmt);
        }

        emit Withdrawn(msg.sender, amount, _shares);
    }

    function addProfit(uint256 _amount) external payable onlyAgent {
        require(msg.value == _amount, "Value mismatch");
        accumulatedProfit += _amount;
        totalDeposited += _amount;

        emit ProfitAdded(_amount, block.timestamp);
    }

    function executeStrategy(address _target, uint256 _amount, bytes calldata _data) external onlyAgent returns (bool) {
        require(_amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = _target.call{value: _amount}(_data);
        require(success, "Strategy failed");
        emit StrategyExecuted(msg.sender, block.timestamp);
        return true;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function getUserShares(address _user) external view returns (uint256) {
        return userShares[_user];
    }

    function getUserDeposited(address _user) external view returns (uint256) {
        return userDeposited[_user];
    }

    function getUserProfit(address _user) external view returns (uint256) {
        if (userShares[_user] == 0) return 0;
        uint256 currentValue = (userShares[_user] * totalDeposited) / totalShares;
        return currentValue - userDeposited[_user];
    }

    function getTotalDeposited() external view returns (uint256) {
        return totalDeposited;
    }

    function getAccumulatedProfit() external view returns (uint256) {
        return accumulatedProfit;
    }
}
