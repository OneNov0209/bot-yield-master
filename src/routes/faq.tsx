import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/faq")({
  component: FAQ,
});

const faqs = [
  {
    question: "What is BOT Yield Master?",
    answer:
      "BOT Yield Master is a decentralized application (dApp) that uses AI Agents to automate yield farming strategies on BOT Chain. Users can deposit BOT into vaults and earn yield automatically.",
  },
  {
    question: "How do I deposit BOT?",
    answer:
      "Connect your wallet, go to the Agents page, and click 'Deposit' on any AI Agent. Enter the amount of BOT you want to deposit and confirm the transaction.",
  },
  {
    question: "Is my money safe?",
    answer:
      "Yes. All funds are stored in transparent smart contracts on BOT Chain. Users can withdraw their principal + profits anytime. The dApp is non-custodial, meaning you always own your funds.",
  },
  {
    question: "How do I withdraw?",
    answer:
      "Go to the Agents page, click 'Withdraw' on any active Agent, and confirm the transaction. Your principal + profits will be returned to your wallet.",
  },
  {
    question: "What are the AI Agents?",
    answer:
      "We have 3 AI Agents: Yields Aggregator (Medium risk), Stable LP Hunter (Low risk), and Delta Neutral Bot (High risk). Each agent uses a different strategy to optimize yield.",
  },
  {
    question: "What are the fees?",
    answer:
      "There is a performance fee of 10% on profits and a withdrawal fee of 1% on the principal. These fees are automatically sent to the treasury.",
  },
];

function FAQ() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-6 py-16">
        <h1 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq) => (
            <div key={faq.question} className="panel card-3d p-6">
              <h2 className="text-lg font-semibold">{faq.question}</h2>
              <p className="mt-2 text-muted-foreground">{faq.answer}</p>
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
