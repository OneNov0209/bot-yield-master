# BOT Yield Master

**BOT Yield Master** is a decentralized application (dApp) built on the **BOT Chain Testnet (Bohr)**. It combines **AI-driven automation** with **DeFi yield strategies** to help users optimize their crypto asset management. Users can deposit, withdraw, and monitor the performance of multiple AI Agents in real-time.

---

## 🚀 Key Features

- **AI Agent Dashboard**  
  Displays a list of AI Agents (Yields Aggregator, Stable LP Hunter, Delta Neutral Bot) with their strategies and target APY.

- **Deposit & Withdraw**  
  Users can deposit tBOT into an Agent, see their status change to "Active", and receive estimated ROI projections. Withdrawal is executed via on-chain `withdraw(shares)` function.

- **Multi-Step Transaction**  
  Preview gas fees, transaction simulation (Passed / Will fail), and estimated ROI before signing.

- **Transactions History**  
  Complete transaction history is derived from **on-chain events** (Deposited / Withdrawn), making it portable across browsers and devices.

- **Real-time TVL & ROI**  
  Dashboard shows Total Value Locked (TVL) and Agent performance calculated from **real on-chain data** (no dummy data).

- **Modern Wallet Connect**  
  Uses RainbowKit with a split-screen modal (wallet list on the left, explanation on the right), auto-switch networks, and "Installed" / "Recent" labels for wallets.

---

## 🌐 Network Configuration

The project runs on the **BOT Chain Testnet (Bohr)** and is ready to be upgraded to Mainnet.

| Parameter         | Value                          |
|-------------------|--------------------------------|
| Network Name      | BOT Chain Testnet (Bohr)       |
| RPC URL           | `https://rpc.bohr.life`        |
| Chain ID          | `968`                          |
| Currency Symbol   | `tBOT`                         |
| Block Explorer    | `https://scan.bohr.life/`      |
| Mainnet Chain ID  | `677` (for future production)  |

---

## 🤖 AI Agents

| Agent                | Risk   | Target APY | Strategy                                                                |
|----------------------|--------|------------|-------------------------------------------------------------------------|
| Yields Aggregator    | Medium | 14.2%      | Automatically rebalances capital to the highest-yield pools on BOT Chain. |
| Stable LP Hunter     | Low    | 6.5%       | Focuses only on stablecoin pairs, compounding rewards hourly.           |
| Delta Neutral Bot    | High   | 23.8%      | Hedges with short perpetuals to capture funding rates and farm rewards. |

---

## 🏗️ Technical Architecture

### Frontend (dApp)

- **React 19** + **Tailwind CSS 4**
- **TanStack Router** + **TanStack Query** for routing and data fetching
- **Wagmi** + **RainbowKit** for wallet connection and on-chain interactions
- **Viem** for blockchain utilities (formatting, gas estimation, etc.)
- **Recharts** for performance visualization

### Smart Contract (Vault)

- **AutoYieldVault** (Solidity 0.8.20) — deployed on BOT Chain Testnet
- Accepts **native tBOT** directly (via `receive()`)
- Has a **shares system** to calculate ownership proportions
- Has a **performance fee** (10%) and **withdrawal fee** (1%) to the treasury
- Supports **AI Agent** for on-chain strategy execution
- Generates **automatic profit** based on time (no external bot or keeper required)

---

## ⚙️ Smart Contract Logic (Deep Dive)

### 1. Architecture
The project uses **one main contract (`AutoYieldVault`)** that acts as:
- **Vault** (fund storage)
- **Yield Engine** (automatic profit generator)
- **Account Manager** (user balance management)

This contract is **not split into multiple contracts**, so **one vault address** can be used by **all AI Agents**. This makes the system **simpler**, **more gas-efficient**, and **easier to maintain**.

---

### 2. Shares System
The contract uses a **shares mechanism** to calculate user ownership:

- When a user deposits `X tBOT`, the contract calculates shares received:
```

sharesToMint = (amount * totalShares) / totalDeposited

```
- If the user is the first depositor, `shares = amount`.
- **Total Deposited** and **Total Shares** increase proportionally.

**Why is this important?**  
Profit is calculated based on **share proportion**, not nominal amount. This makes the system **fair** for all users, whether they deposit early or late.

---

### 3. `_accrueProfit()` Function (Automatic Profit)
The contract has an internal function `_accrueProfit()` that **automatically calculates profit** based on time:

```

profit = (address(this).balance * dailyRate * timeElapsed) / (10000 * 1 days)

```

- `dailyRate` default = **500** (5% per day).
- `timeElapsed` = time difference since `lastProfitUpdate`.
- If profit > 0, then:
  - `accumulatedProfit` increases.
  - `totalDeposited` increases (profit is reinvested).
  - `lastProfitUpdate` is reset.

**Why is this important?**  
Because **profit is calculated automatically** whenever there is interaction (deposit, withdraw, or data read). This means **no bot or keeper is needed** — the system is **self-sustaining**.

---

### 4. `deposit()` & `receive()` Functions
- **`receive()`**: Accepts native tBOT sent directly to the contract (via normal transfer).
- **`deposit()`**: Public function for depositing.
- Both call `_deposit()` which:
  1. Calculates shares.
  2. Records user deposit in `userDeposited`.
  3. Records user shares in `userShares`.
  4. Increases `totalDeposited` and `totalShares`.

---

### 5. `withdraw(uint256 _shares)` Function
Users can withdraw funds by **calling the `withdraw(shares)` function** (not a normal transfer). The logic is:

1. **Check user share balance** (`require(userShares[msg.sender] >= _shares)`).
2. **Calculate withdrawable amount**:
```

amount = (_shares * totalDeposited) / totalShares

```
3. **Calculate user profit**:
```

profit = amount - userDeposited[msg.sender]

```
4. **Deduct Performance Fee** (10% of profit) and **Withdrawal Fee** (1% of principal).
5. **Transfer funds** to user.
6. **Transfer fees** to treasury.
7. **Update shares & balance**.

---

### 6. Fee System (Developer Revenue)
The contract has **2 types of fees** that go to the treasury/owner:

| Fee Type            | Percentage | When Applied?           |
|---------------------|------------|-------------------------|
| **Performance Fee** | 10%        | When user withdraws profit |
| **Withdrawal Fee**  | 1%         | When user withdraws principal |

**Example:**  
- User deposits 100 tBOT → total funds = 100 tBOT.
- Vault generates 10 tBOT profit → total funds = 110 tBOT.
- User withdraws all (110 tBOT):
  - Performance Fee = 10% of 10 tBOT = **1 tBOT** → goes to treasury.
  - Withdrawal Fee = 1% of 110 tBOT = **1.1 tBOT** → goes to treasury.
  - User receives = **107.9 tBOT**.
  - Developer receives = **2.1 tBOT**.

---

### 7. View Functions (Data Reading)
The contract has several `view` functions for the dApp:
- **`getUserDeposited(address)`** → Total user deposit.
- **`getUserShares(address)`** → Total user shares.
- **`getTotalDeposited()`** → Total funds in contract (TVL).
- **`getBalance()`** → Native contract balance.
- **`getNextProfit(address)`** → Estimated user profit.

---

### 8. Access Control (Security)
The contract has **modifiers** for security:
- **`onlyOwner()`**: Only owner can change fees, treasury, dailyRate, etc.
- **`onlyAgent()`**: Only AI Agent (set by owner) can call `executeStrategy()`.

---

### 9. Transparency & Auditability
All interactions are recorded via **events**:
- `Deposited(address user, uint256 amount, uint256 shares)`
- `Withdrawn(address user, uint256 amount, uint256 shares)`
- `ProfitAccrued(uint256 amount, uint256 timestamp)`

These events allow the dApp (and anyone) to **read transaction history directly from the blockchain**, so **data is never lost** and **does not depend on localStorage**.

---

### 10. Contract Address (Testnet)

| Parameter          | Value                                      |
|--------------------|--------------------------------------------|
| **Contract Name**  | `AutoYieldVault`                           |
| **Solidity Version** | `0.8.20`                                 |
| **Testnet Address** | `0x9770030AB6A808945D6B4E8BEa599e9cfDc5D1A9` |

---

## 🧩 Project Structure

```

src/
├── components/
│   ├── ui/                  # UI components (Button, Dialog, etc.)
│   ├── Web3Provider.tsx     # Provider for Wagmi + RainbowKit
│   ├── TxDialog.tsx         # Deposit/withdraw transaction dialog
│   └── TxDetailsDrawer.tsx  # On-chain transaction details
├── hooks/
│   ├── useVaultTvl.ts       # Hook to read vault TVL
│   └── useLedger.ts         # Hook for transaction history
├── lib/
│   ├── chain-config.ts      # Network configuration (testnet/mainnet)
│   ├── agents.ts            # AI Agents definition and strategies
│   ├── activity-ledger.ts   # On-chain event reader
│   └── wagmi.ts             # Wagmi + RainbowKit configuration
├── routes/
│   ├── app.agents.tsx       # Agents list page
│   ├── app.index.tsx        # Dashboard page
│   ├── app.transactions.tsx # Transaction history page
│   └── app.vaults.tsx       # Vaults page
└── styles.css               # Global styles (Tailwind)

```

---

## ⚙️ Environment Configuration (`.env`)

```env
VITE_WALLETCONNECT_PROJECT_ID=7f5230a2da0f45798f150d028660356f
VITE_BOT_NETWORK=testnet

# AI Agent vault contracts (BOT Chain). Deposit/withdraw stays disabled while empty.
VITE_VAULT_YIELDS_AGGREGATOR=0x9770030AB6A808945D6B4E8BEa599e9cfDc5D1A9
VITE_VAULT_STABLE_LP_HUNTER=0x9770030AB6A808945D6B4E8BEa599e9cfDc5D1A9
VITE_VAULT_DELTA_NEUTRAL=0x9770030AB6A808945D6B4E8BEa599e9cfDc5D1A9
```

---

## 📜 Compliance & Anti-Cheating

· No Wash Trading: No features that encourage self-trading or artificial volume.

· Real On-chain Data: All performance data is fetched from real on-chain sources, not random dummy data.

· Daily Interaction Limit: Max 20 interactions per address per day, in compliance with community rules.

---

## 🛠️ Development

Prefer working locally? Install Node.js and npm, then:

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

---

📄 License

This project is open-source and available for collaboration. All code is owned by the project owner and contributors.

---

## 🔄 What’s New

· 3 Separate Smart Contracts
    Yields Aggregator, Stable LP Hunter, and Delta Neutral Bot now have separate vault contracts with their own respective addresses.
    
· AutoYieldVault v2
    The main contract now accepts funds directly via receive() and calculates shares correctly, ensuring withdrawals are always successful.
    
· Fully On-Chain Data
    All transaction history is read from blockchain events — no localStorage, meaning data remains consistent across all browsers.
    
· Separate Dev Fees
    Performance Fee (10%) and Withdrawal Fee (1%) are automatically sent directly to the developer's treasury.
    
· New Landing Page
    The homepage now displays a project description, features, how it works, strategies, and direct links to the smart contracts on BOT Scan.
    
· Official Domain The project is accessible via botchain-yield.onenov.xyz
---

🔗 Link Penting

· Website: https://botchain-yield.onenov.xyz
· Twitter (X): https://x.com/OneNov0209
· GitHub: https://github.com/OneNov0209/bot-yield-master
· BOT Scan: https://scan.bohr.life

---
