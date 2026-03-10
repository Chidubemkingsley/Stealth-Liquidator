"use client";

import { useEffect, useState } from "react";
import { Timer } from "lucide-react";

interface Props {
  end: number;
}

export default function PhaseTimer({ end }: Props) {
  const [remaining, setRemaining] = useState(end - Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(end - Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, [end]);

  const seconds = Math.max(0, Math.floor(remaining / 1000));
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return (
    <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
      <Timer className="h-3.5 w-3.5" />
      {minutes}:{secs.toString().padStart(2, "0")} remaining
    </div>
  );
}