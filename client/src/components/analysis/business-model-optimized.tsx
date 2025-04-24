import React, { memo } from "react";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OptimizedCard } from "./optimized-card";
import { AnalysisResults } from "@shared/schema";
import { cn } from "@/lib/utils";

interface BusinessModelProps {
  data: AnalysisResults["businessModelStrength"];
  isLoading?: boolean;
}

// Score indicator component - uses simple CSS instead of complex SVG animations
const ScoreIndicator = ({ score, label }: { score: number; label: string }) => {
  // Determine color based on score
  const getColorClass = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    if (score >= 40) return "bg-orange-500";
    return "bg-red-500";
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Background circle */}
        <div className="absolute inset-0 rounded-full bg-background opacity-20"></div>
        {/* Score circle */}
        <div className={cn("rounded-full w-12 h-12 flex items-center justify-center font-bold", getColorClass(score))}>
          {score}
        </div>
      </div>
      <span className="text-xs mt-1 text-center">{label}</span>
    </div>
  );
};

// Business model component using memo to prevent unnecessary re-renders
const BusinessModelOptimized = memo(({ data, isLoading = false }: BusinessModelProps) => {
  if (!data && !isLoading) return null;

  const {
    overall = 0,
    components = [],
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
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
              <path d="M13 5v2"/>
              <path d="M13 17v2"/>
              <path d="M13 11v2"/>
            </svg>
          </span>
          Business Model Strength
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {/* Overall score */}
          <div className="flex items-center justify-center">
            <ScoreIndicator score={overall} label="Overall Score" />
          </div>

          {/* Components */}
          <div className="grid gap-4">
            {components.map((component, index) => (
              <div key={index} className="border border-border/30 rounded-md p-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-sm">{component.name}</h3>
                  <div className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    component.score >= 80 ? "bg-green-500/20 text-green-300" :
                    component.score >= 60 ? "bg-yellow-500/20 text-yellow-300" :
                    component.score >= 40 ? "bg-orange-500/20 text-orange-300" :
                    "bg-red-500/20 text-red-300"
                  )}>
                    {component.score}/100
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{component.description}</p>
                
                {/* Key metrics */}
                {component.keyMetrics && component.keyMetrics.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-muted-foreground">Key metrics:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {component.keyMetrics.map((metric, idx) => (
                        <span 
                          key={idx} 
                          className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Message */}
          {message && (
            <div className="text-sm text-muted-foreground border-t pt-3 border-border/30">
              {message}
            </div>
          )}
        </div>
      </CardContent>
    </OptimizedCard>
  );
});

BusinessModelOptimized.displayName = "BusinessModelOptimized";

export default BusinessModelOptimized;