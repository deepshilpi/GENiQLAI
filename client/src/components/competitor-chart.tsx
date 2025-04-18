import React from "react";

interface CompetitorChartProps {
  name: string;
  marketShare: number;
  index: number;
}

export function CompetitorChart({ name, marketShare, index }: CompetitorChartProps) {
  // Select color based on index
  const getProgressColor = (index: number) => {
    switch (index) {
      case 0:
        return "bg-primary";
      case 1:
        return "bg-warning";
      default:
        return "bg-destructive";
    }
  };
  
  return (
    <div className="flex items-center">
      <div className="w-8 h-8 rounded-full bg-accent mr-3 flex items-center justify-center text-xs">
        {name.substring(0, 2)}
      </div>
      <div className="flex-1">
        <div className="flex justify-between">
          <div className="text-sm font-medium">{name}</div>
          <div className="text-sm text-muted-foreground">{marketShare}%</div>
        </div>
        <div className="w-full bg-accent rounded-full h-1.5 mt-1">
          <div 
            className={`${getProgressColor(index)} h-1.5 rounded-full`} 
            style={{ width: `${marketShare}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}
