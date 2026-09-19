import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Twitter, Send, MessageCircle, Users } from "lucide-react";

export const Route = createFileRoute("/social")({
  component: Social,
});

const socials = [
  {
    name: "Twitter (X)",
    handle: "@BotYieldMaster",
    description: "Follow us for daily updates, announcements, and community news.",
    url: "https://x.com/BotYieldMaster",
    icon: Twitter,
    color: "from-blue-500/20 to-blue-600/5",
    borderColor: "border-blue-500/40",
    iconColor: "text-blue-400",
  },
  {
    name: "Telegram Profile",
    handle: "@Bot_yield_Master",
    description: "Chat with us directly on Telegram for support and inquiries.",
    url: "https://t.me/Bot_yield_Master",
    icon: Send,
    color: "from-sky-500/20 to-sky-600/5",
    borderColor: "border-sky-500/40",
    iconColor: "text-sky-400",
  },
  {
    name: "Telegram Channel",
    handle: "@BOTYieldMaster",
    description: "Join our official channel for announcements and ecosystem updates.",
    url: "https://t.me/BOTYieldMaster",
    icon: MessageCircle,
    color: "from-cyan-500/20 to-cyan-600/5",
    borderColor: "border-cyan-500/40",
    iconColor: "text-cyan-400",
  },
];

function Social() {
  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-neon/10" />
        <div className="relative mx-auto max-w-4xl px-6 py-16">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          <div className="mt-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold md:text-4xl">
              <span className="neon-text">Join Our Community</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Stay connected with BOT Yield Master. Follow us on social media for updates,
              announcements, and community discussions.
            </p>
          </div>

          <div className="mt-12 grid gap-6">
            {socials.map((social) => {
              const Icon = social.icon;
              return (
                <a
                  key={social.name}
                  href={social.url}
                  target="_blank"
                  rel="noreferrer"
                  className={`group relative overflow-hidden rounded-2xl border ${social.borderColor} bg-gradient-to-br ${social.color} p-6 transition-all hover:scale-[1.02] hover:shadow-lg`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-background/50 ${social.iconColor}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <h2 className="text-lg font-semibold">{social.name}</h2>
                        <span className="text-xs text-muted-foreground group-hover:text-primary">
                          {social.handle}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {social.description}
                      </p>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-12 rounded-xl border border-border/60 bg-card/40 p-6 text-center">
            <p className="text-sm text-muted-foreground">
              For partnership inquiries, please contact us via{" "}
              <a
                href="https://t.me/Bot_yield_Master"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Telegram
              </a>{" "}
              or{" "}
              <a
                href="https://x.com/BotYieldMaster"
                target="_blank"
                rel="noreferrer"
                className="text-primary hover:underline"
              >
                Twitter
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
