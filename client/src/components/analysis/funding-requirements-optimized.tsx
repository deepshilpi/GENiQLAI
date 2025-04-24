import React, { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedCard } from "./optimized-card";
import { AnalysisResults } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";

interface FundingRequirementsProps {
  data: AnalysisResults["fundingRequired"];
  country: string;
  isLoading?: boolean;
}

// Simple static pie chart that doesn't use heavy JavaScript libraries
const SimplePieChart = ({ 
  data = [] 
}: { 
  data: Array<{ category: string; percentage: number; amount: number }> 
}) => {
  // Generate colors programmatically instead of hardcoding them
  const getColor = (index: number) => {
    const colors = [
      "rgb(123, 97, 255)", // Primary purple
      "rgb(138, 116, 248)",
      "rgb(156, 136, 255)",
      "rgb(175, 158, 255)",
      "rgb(194, 181, 255)",
      "rgb(213, 204, 255)"
    ];
    return colors[index % colors.length];
  };

  // Calculate the cumulative percentages for the stroke-dasharray
  let cumulativePercentage = 0;
  
  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        {data.map((item, index) => {
          const startPercentage = cumulativePercentage;
          cumulativePercentage += item.percentage;
          
          // Convert percentages to stroke dash values
          const strokeDasharray = `${item.percentage} ${100 - item.percentage}`;
          const strokeDashoffset = -startPercentage;
          
          return (
            <circle
              key={index}
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={getColor(index)}
              strokeWidth="20"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={`${strokeDashoffset}`}
              style={{ transformOrigin: 'center' }}
            />
          );
        })}
        {/* Add center circle for donut effect */}
        <circle cx="50" cy="50" r="30" fill="rgba(30, 30, 46, 0.7)" />
      </svg>
    </div>
  );
};

// Funding requirements component using memo to prevent unnecessary re-renders
const FundingRequirementsOptimized = memo(({ data, country, isLoading = false }: FundingRequirementsProps) => {
  if (!data && !isLoading) return null;

  const {
    total = 0,
    currency = "INR",
    breakdown = [],
    fundingStages = [],
    message = ""
  } = data || {};

  return (
    <OptimizedCard
      variant="default"
      isLoading={isLoading}
      className="h-full"
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-medium flex items-center">
          <span className="bg-primary/10 rounded-full p-1.5 mr-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M2 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/>
              <path d="M12 17a5 5 0 0 0 10 0c0-2.76-2.5-5-5-3-2.5-2-5 .24-5 3Z"/>
              <path d="M7 14c3.22-2.91 4.29-8.75 5-12 1.66 2.38 4.94 9 5 12"/>
              <path d="M22 9c-4.29 0-7.14-2.33-10-7 .5 5.5-2.47 7-4.5 8.5-1.24.92-1.89 1.35-2.5 2.25"/>
            </svg>
          </span>
          Funding Requirements
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Total funding card */}
          <div className="flex flex-col items-center justify-center lg:col-span-1">
            <div className="text-center space-y-2">
              <div className="text-sm text-muted-foreground">Total Required</div>
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(total, currency, country, true)}
              </div>
            </div>
            
            {/* Simplified pie chart */}
            <SimplePieChart data={breakdown} />
          </div>
          
          {/* Funding breakdown */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Funding Breakdown</h3>
              <div className="space-y-2">
                {breakdown.map((item, index) => (
                  <div key={index} className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: `hsl(${250 - index * 10}, ${80 - index * 5}%, ${70 + index * 3}%)` }}
                      />
                      <span>{item.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{item.percentage}%</span>
                      <span>{formatCurrency(item.amount, currency, country)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Funding stages */}
            {fundingStages && fundingStages.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-2">Funding Stages</h3>
                <div className="space-y-2">
                  {fundingStages.map((stage, index) => (
                    <div key={index} className="border border-border/30 rounded-md p-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{stage.stage}</span>
                        <span className="text-primary">
                          {formatCurrency(stage.amount, currency, country)}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">{stage.timeline}</div>
                      {stage.milestones && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {stage.milestones.map((milestone, idx) => (
                            <span 
                              key={idx} 
                              className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                            >
                              {milestone}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Message */}
        {message && (
          <div className="text-sm text-muted-foreground border-t pt-3 mt-4 border-border/30">
            {message}
          </div>
        )}
      </CardContent>
    </OptimizedCard>
  );
});

FundingRequirementsOptimized.displayName = "FundingRequirementsOptimized";

export default FundingRequirementsOptimized;