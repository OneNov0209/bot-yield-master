// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract YieldEngine {
    address public owner;
    address public vault;
    address public keeper;
    address public treasury;

    uint256 public dailyRate = 500; // 5% per hari (basis points)
    uint256 public lastHarvest;
    uint256 public totalYieldGenerated;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyKeeper() {
        require(msg.sender == keeper || msg.sender == owner, "Not keeper");
        _;
    }

    constructor(address _vault, address _treasury) {
        require(_vault != address(0), "Invalid vault");
        require(_treasury != address(0), "Invalid treasury");
        owner = msg.sender;
        vault = _vault;
        treasury = _treasury;
        lastHarvest = block.timestamp;
    }

    function setKeeper(address _keeper) external onlyOwner {
        require(_keeper != address(0), "Invalid keeper");
        keeper = _keeper;
    }

    function setDailyRate(uint256 _rate) external onlyOwner {
        require(_rate <= 1000, "Rate too high");
        dailyRate = _rate;
    }

    function harvest() external onlyKeeper {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        require(timeElapsed >= 30 minutes, "Too early to harvest");

        uint256 vaultBalance = address(vault).balance;
        uint256 yieldAmount = (vaultBalance * dailyRate * timeElapsed) / (10000 * 1 days);

        if (yieldAmount > 0) {
            (bool success, ) = vault.call{value: yieldAmount}(
                abi.encodeWithSignature("addProfit(uint256)", yieldAmount)
            );
            require(success, "Profit call failed");
        }

        lastHarvest = block.timestamp;
        totalYieldGenerated += yieldAmount;
    }

    function getNextYield() external view returns (uint256) {
        uint256 timeElapsed = block.timestamp - lastHarvest;
        uint256 vaultBalance = address(vault).balance;
        return (vaultBalance * dailyRate * timeElapsed) / (10000 * 1 days);
    }

    function getLastHarvest() external view returns (uint256) {
        return lastHarvest;
    }

    function getTotalYieldGenerated() external view returns (uint256) {
        return totalYieldGenerated;
    }
}
