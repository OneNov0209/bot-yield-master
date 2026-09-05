import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/docs")({
  component: Docs,
});

const docs = [
  {
    title: "1. Architecture",
    content:
      "BOT Yield Master uses one main contract (AutoYieldVault) that acts as a vault, yield engine, and account manager. This contract is not split into multiple contracts, making the system simpler, more gas-efficient, and easier to maintain.",
  },
  {
    title: "2. Shares System",
    content:
      "The contract uses a shares mechanism to calculate user ownership. When a user deposits X BOT, the contract calculates shares received: sharesToMint = (amount * totalShares) / totalDeposited. If the user is the first depositor, shares = amount.",
  },
  {
    title: "3. Deposit & Withdraw",
    content:
      "Users can deposit BOT via the receive() function or by calling deposit(). Withdrawal is executed via the withdraw(shares) function, which returns the principal + profits minus fees.",
  },
  {
    title: "4. Fee System",
    content:
      "The contract has a performance fee of 10% on profits and a withdrawal fee of 1% on the principal. These fees are automatically sent to the treasury when users withdraw.",
  },
  {
    title: "5. AI Agents",
    content:
      "We have 3 AI Agents: Yields Aggregator (Medium risk, 14.2% APY), Stable LP Hunter (Low risk, 6.5% APY), and Delta Neutral Bot (High risk, 23.8% APY). Each agent uses a different strategy to optimize yield.",
  },
  {
    title: "6. Security",
    content:
      "All funds are stored in transparent smart contracts on BOT Chain. The dApp is non-custodial, and users can withdraw their principal + profits anytime.",
  },
];

function Docs() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Documentation</h1>
        <div className="space-y-6">
          {docs.map((doc) => (
            <div key={doc.title} className="panel card-3d p-6">
              <h2 className="text-lg font-semibold">{doc.title}</h2>
              <p className="mt-2 text-muted-foreground">{doc.content}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/" className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
