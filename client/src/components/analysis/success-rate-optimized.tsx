import React, { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedCard } from "./optimized-card";
import { Check } from "lucide-react";
import { AnalysisResults } from "@shared/schema";

interface SuccessRateProps {
  data: AnalysisResults["successRate"];
  isLoading?: boolean;
}

// Use React.memo to prevent unnecessary re-renders
const SuccessRateOptimized = memo(({ data, isLoading = false }: SuccessRateProps) => {
  if (!data && !isLoading) return null;

  // Placeholder data for loading state
  const { 
    percentage = 0,
    goodPoints = [],
    badPoints = [],
    message = ""
  } = data || {};

  // Simple SVG gauge that's less resource-intensive than animated components
  const GaugeIndicator = () => {
    const circumference = 2 * Math.PI * 45; // 45 is the radius
    const offset = circumference - (percentage / 100) * circumference;
    
    return (
      <div className="relative w-32 h-32 mx-auto my-4">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            className="text-muted-foreground/20"
            strokeWidth="8"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
          />
          {/* Foreground circle */}
          <circle
            className="text-primary"
            strokeWidth="8"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="45"
            cx="50"
            cy="50"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            transform="rotate(-90 50 50)"
          />
          {/* Text in the middle */}
          <text
            x="50"
            y="55"
            className="text-2xl font-bold"
            textAnchor="middle"
            fill="currentColor"
          >
            {percentage}%
          </text>
        </svg>
      </div>
    );
  };

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
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </span>
          Success Rate Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center">
            <GaugeIndicator />
          </div>
          <div className="lg:col-span-2 space-y-3">
            {/* Good points */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm flex items-center text-green-400">
                <Check size={16} className="mr-1.5" /> Positive Factors
              </h3>
              <ul className="space-y-1.5">
                {goodPoints.map((point, index) => (
                  <li key={index} className="text-sm flex">
                    <span className="text-green-400 mr-2">✓</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Message summary - only render if there's content */}
            {message && (
              <div className="mt-4 text-sm text-muted-foreground border-t pt-3 border-border/30">
                {message}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </OptimizedCard>
  );
});

SuccessRateOptimized.displayName = "SuccessRateOptimized";

export default SuccessRateOptimized;