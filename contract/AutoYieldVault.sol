// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AutoYieldVault {
    address public owner;
    address public treasury;
    address public aiAgent;

    uint256 public totalShares;
    uint256 public totalDeposited;
    uint256 public accumulatedProfit;
    uint256 public lastProfitUpdate;

    uint256 public dailyRate = 500;
    uint256 public performanceFee = 1000;
    uint256 public withdrawalFee = 100;

    mapping(address => uint256) public userShares;
    mapping(address => uint256) public userDeposited;

    event Deposited(address indexed user, uint256 amount, uint256 shares);
    event Withdrawn(address indexed user, uint256 amount, uint256 shares);
    event ProfitAccrued(uint256 amount, uint256 timestamp);

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
        lastProfitUpdate = block.timestamp;
    }

    function setAIAgent(address _agent) external onlyOwner {
        require(_agent != address(0), "Invalid address");
        aiAgent = _agent;
    }

    function setTreasury(address _treasury) external onlyOwner {
        require(_treasury != address(0), "Invalid address");
        treasury = _treasury;
    }

    function setDailyRate(uint256 _rate) external onlyOwner {
        require(_rate <= 1000, "Rate too high");
        dailyRate = _rate;
    }

    function setPerformanceFee(uint256 _fee) external onlyOwner {
        require(_fee <= 2000, "Fee too high");
        performanceFee = _fee;
    }

    function setWithdrawalFee(uint256 _fee) external onlyOwner {
        require(_fee <= 500, "Fee too high");
        withdrawalFee = _fee;
    }

    function _accrueProfit() internal {
        uint256 timeElapsed = block.timestamp - lastProfitUpdate;
        if (timeElapsed > 0) {
            uint256 profit = (address(this).balance * dailyRate * timeElapsed) / (10000 * 1 days);
            if (profit > 0) {
                accumulatedProfit += profit;
                totalDeposited += profit;
                lastProfitUpdate = block.timestamp;
                emit ProfitAccrued(profit, block.timestamp);
            }
        }
    }

    receive() external payable {
        _accrueProfit();
        _deposit(msg.sender, msg.value);
    }

    function deposit() external payable {
        _accrueProfit();
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
        _accrueProfit();
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
        }

        emit Withdrawn(msg.sender, amount, _shares);
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

    function getNextProfit(address _user) external view returns (uint256 profit, uint256 total) {
        uint256 timeElapsed = block.timestamp - lastProfitUpdate;
        uint256 accrued = (address(this).balance * dailyRate * timeElapsed) / (10000 * 1 days);
        if (accrued > 0) {
            total = totalDeposited + accrued;
        } else {
            total = totalDeposited;
        }
        if (userShares[_user] == 0) {
            return (0, total);
        }
        uint256 currentValue = (userShares[_user] * total) / totalShares;
        profit = currentValue - userDeposited[_user];
        return (profit, total);
    }

    function getTotalDeposited() external view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastProfitUpdate;
        uint256 accrued = (address(this).balance * dailyRate * timeElapsed) / (10000 * 1 days);
        return totalDeposited + accrued;
    }

    function getAccumulatedProfit() external view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastProfitUpdate;
        uint256 accrued = (address(this).balance * dailyRate * timeElapsed) / (10000 * 1 days);
        return accumulatedProfit + accrued;
    }

    function getProfitRate() external view returns (uint256) {
        return dailyRate;
    }
}
