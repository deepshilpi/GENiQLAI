import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";

interface BusinessModelStrengthProps {
  overallScore: number;
  categories: Array<{
    name: string;
    score: number;
    maxScore: number;
    description: string;
  }>;
  message: string;
}

export function BusinessModelStrength({ overallScore, categories, message }: BusinessModelStrengthProps) {
  // Calculate the percentage for the overall score (assuming it's out of 100)
  const overallPercentage = Math.round(overallScore);
  
  // Helper function to determine color based on score percentage
  const getScoreColorClass = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "text-green-500";
    if (percentage >= 40) return "text-yellow-500";
    return "text-red-500";
  };
  
  // Helper function to determine progress bar color based on score percentage
  const getProgressColorClass = (score: number, maxScore: number) => {
    const percentage = (score / maxScore) * 100;
    if (percentage >= 70) return "bg-green-500";
    if (percentage >= 40) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Determine overall score rating text
  const getScoreRating = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 65) return "Strong";
    if (score >= 50) return "Good";
    if (score >= 35) return "Fair";
    return "Weak";
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-white">{overallPercentage}/100</h3>
          <div className="flex items-center">
            <p className="text-sm text-white/70">Business Model Strength:</p>
            <Badge className="ml-2 bg-vision-purple-200/30 text-white">
              {getScoreRating(overallPercentage)}
            </Badge>
          </div>
        </div>
      </div>
      
      <div className="space-y-4 mt-2">
        {categories.map((category, index) => {
          const percentage = Math.round((category.score / category.maxScore) * 100);
          
          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white">{category.name}</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button className="ml-1 text-white/50 hover:text-white">
                          <HelpCircle className="w-3 h-3" />
                        </button>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-sm">
                        <p>{category.description}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <span className={`text-sm font-medium ${getScoreColorClass(category.score, category.maxScore)}`}>
                  {category.score}/{category.maxScore}
                </span>
              </div>
              <Progress 
                value={percentage} 
                className="h-2 bg-vision-purple-200/20" 
                indicatorClassName={getProgressColorClass(category.score, category.maxScore)}
              />
            </div>
          );
        })}
      </div>
      
      <p className="pt-3 mt-2 text-sm text-white/80 border-t border-vision-purple-200/20">
        {message}
      </p>
    </div>
  );
}