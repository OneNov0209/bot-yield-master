# BOT Yield Master

**BOT Yield Master** is a decentralized application (dApp) built on the **BOT Chain Testnet (Bohr)**. It combines **AI-driven automation** with **DeFi yield strategies** to help users optimize their crypto asset management. Users can deposit, withdraw, and monitor the performance of multiple AI Agents in real-time.

---

## 🚀 Key Features

- **AI Agent Dashboard**  
  Displays a list of AI Agents (Yields Aggregator, Stable LP Hunter, Delta Neutral Bot) with their strategies and target APY.

- **Deposit & Withdraw**  
  Users can deposit tBOT into an Agent, see their status change to "Active", and receive estimated ROI projections.

- **Multi-Step Transaction**  
  Preview gas fees, transaction simulation (Passed / Will fail), and estimated ROI before signing.

- **Transactions History**  
  Complete transaction history with direct links to the BOT Chain Block Explorer.

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

- **PremiumNativeVault** (Solidity 0.8.20) — deployed on BOT Chain Testnet
- Accepts **native tBOT** directly (via `receive()`)
- Has a **shares system** to calculate ownership proportions
- Has a **performance fee** (5%) to the treasury
- Supports **AI Agent** for on-chain strategy execution

### Transaction Flow

1. User selects an Agent and enters a deposit amount.
2. dApp simulates the transaction (estimateGas).
3. User signs the transaction in their wallet.
4. Contract receives tBOT and records the deposit.
5. dApp updates TVL and Agent status automatically.

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
│   ├── activity-ledger.ts   # Transaction history storage (localStorage)
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
VITE_VAULT_YIELDS_AGGREGATOR=0x0181B154eC37227511e6707FF647048a771621b5
VITE_VAULT_STABLE_LP_HUNTER=0x0181B154eC37227511e6707FF647048a771621b5
VITE_VAULT_DELTA_NEUTRAL=0x0181B154eC37227511e6707FF647048a771621b5
```

---

📜 Compliance & Anti-Cheating

· No Wash Trading: No features that encourage self-trading or artificial volume.
· Real On-chain Data: All performance data is fetched from real on-chain sources, not random dummy data.
· Daily Interaction Limit: Max 20 interactions per address per day, in compliance with community rules.

---

🛠️ Development

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

```
