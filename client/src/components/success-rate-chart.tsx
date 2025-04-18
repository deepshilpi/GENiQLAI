import React from "react";

interface SuccessRateChartProps {
  percentage: number;
}

export function SuccessRateChart({ percentage }: SuccessRateChartProps) {
  // Calculate stroke-dashoffset based on percentage
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="relative w-30 h-30 flex items-center justify-center">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={radius} fill="none" stroke="hsl(var(--accent))" strokeWidth="12" />
        <circle 
          cx="60" 
          cy="60" 
          r={radius} 
          fill="none" 
          stroke="hsl(var(--primary))" 
          strokeWidth="12" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          transform="rotate(-90 60 60)" 
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-3xl font-bold">{percentage}%</div>
          <div className="text-xs text-muted-foreground">Based on data</div>
        </div>
      </div>
    </div>
  );
}
