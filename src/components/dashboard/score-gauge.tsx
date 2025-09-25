"use client";

import { cn } from "@/lib/utils";

interface ScoreGaugeProps {
  score: number; // 0 to 1
  size?: number;
  strokeWidth?: number;
}

export default function ScoreGauge({ score, size = 120, strokeWidth = 10 }: ScoreGaugeProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - score * circumference;

  const colorClass = score < 0.4 ? "text-destructive" : score < 0.7 ? "text-accent" : "text-primary";
  const label = score < 0.4 ? "Low" : score < 0.7 ? "Medium" : "High";

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          className="text-muted/50"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={cn("transition-all duration-1000 ease-out", colorClass)}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
            transform: "rotate(-90deg)",
            transformOrigin: "center",
          }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dy=".3em"
          className="text-2xl font-bold fill-current text-foreground"
        >
          {Math.round(score * 100)}
        </text>
      </svg>
      <div className="text-center">
        <p className="font-semibold text-lg">{label} Credibility</p>
        <p className="text-sm text-muted-foreground">Score: {Math.round(score * 100)} / 100</p>
      </div>
    </div>
  );
}
