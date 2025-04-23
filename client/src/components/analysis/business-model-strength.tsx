import React from "react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { CircleDashed, CircleCheck, CircleAlert } from "lucide-react";

interface BusinessModelStrengthProps {
  overall: number;
  components: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  message: string;
}

export function BusinessModelStrengthChart({ overall, components, message }: BusinessModelStrengthProps) {
  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-green-500";
    if (score >= 50) return "text-amber-500";
    return "text-red-500";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CircleCheck className="h-4 w-4 text-green-500" />;
    if (score >= 50) return <CircleDashed className="h-4 w-4 text-amber-500" />;
    return <CircleAlert className="h-4 w-4 text-red-500" />;
  };

  const getScoreText = (score: number) => {
    if (score >= 70) return "Strong";
    if (score >= 50) return "Moderate";
    return "Weak";
  };

  // Sort components by score (descending)
  const sortedComponents = [...components].sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4">
      {/* Overall Score */}
      <div className="flex flex-col items-center mb-4">
        <div className="w-24 h-24 rounded-full border-4 border-primary/20 flex items-center justify-center mb-2 relative">
          <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="8" 
              className="text-primary/10" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="8" 
              className="text-primary" 
              strokeDasharray={`${overall * 2.89}, 1000`} 
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          <span className="text-2xl font-bold">{overall}</span>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium">Overall Strength</p>
          <p className={`text-xs ${getScoreColor(overall)}`}>{getScoreText(overall)}</p>
        </div>
      </div>

      <Separator className="bg-border/20" />

      {/* Components */}
      <div className="space-y-4">
        {sortedComponents.map((component, i) => (
          <div key={i} className="space-y-1">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center">
                {getScoreIcon(component.score)}
                <span className="ml-2 text-sm font-medium">{component.name}</span>
              </div>
              <span className={`text-xs font-medium ${getScoreColor(component.score)}`}>
                {component.score}
              </span>
            </div>
            <Progress 
              value={component.score} 
              className="h-2 bg-primary/10" 
              indicatorClassName={component.score >= 70 ? "bg-green-500" : component.score >= 50 ? "bg-amber-500" : "bg-red-500"}
            />
            <p className="text-xs text-muted-foreground mt-1">{component.description}</p>
          </div>
        ))}
      </div>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-3">
          <p className="text-sm text-white/80">{message}</p>
        </CardContent>
      </Card>
    </div>
  );
}