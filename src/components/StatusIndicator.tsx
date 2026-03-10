"use client";

import { motion } from "framer-motion";
import { Activity, Shield, Zap } from "lucide-react";

interface StatusIndicatorProps {
  connected: boolean;
}

type Status = "active" | "inactive";

interface StatusItem {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  status: Status;
}

export default function StatusIndicator({ connected }: StatusIndicatorProps) {
  const items: StatusItem[] = [
    {
      label: "Network",
      value: "Starknet Sepolia",
      icon: Activity,
      status: "active",
    },
    {
      label: "ZK Backend",
      value: "UltraHonk · Noir",
      icon: Shield,
      status: "active",
    },
    {
      label: "Wallet",
      value: connected ? "Connected" : "Disconnected",
      icon: Zap,
      status: connected ? "active" : "inactive",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="flex flex-wrap gap-3"
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <div
            key={item.label}
            className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2"
          >
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />

            <span className="text-xs text-muted-foreground">
              {item.label}
            </span>

            <div
              className={`h-1.5 w-1.5 rounded-full ${
                item.status === "active"
                  ? "bg-primary animate-pulse-glow"
                  : "bg-muted-foreground"
              }`}
            />

            <span className="font-mono text-xs text-foreground">
              {item.value}
            </span>
          </div>
        );
      })}
    </motion.div>
  );
}