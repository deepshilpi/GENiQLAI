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
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="flex flex-col items-center py-3">
        <div className="w-32 h-32 rounded-full bg-vision-purple-100/5 border-2 border-vision-purple-200/30 flex items-center justify-center mb-3 relative overflow-hidden backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-vision-purple-100/10 to-transparent"></div>
          <svg className="absolute inset-0" width="100%" height="100%" viewBox="0 0 100 100">
            <defs>
              <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#A163F7" />
                <stop offset="100%" stopColor="#7551FF" />
              </linearGradient>
            </defs>
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="6" 
              className="text-vision-purple-200/20" 
            />
            <circle 
              cx="50" 
              cy="50" 
              r="46" 
              fill="none" 
              stroke="url(#scoreGradient)" 
              strokeWidth="6" 
              strokeDasharray={`${overall * 2.89}, 1000`} 
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            >
              <animate 
                attributeName="stroke-dasharray" 
                from="0, 1000" 
                to={`${overall * 2.89}, 1000`} 
                dur="1.5s" 
                fill="freeze" 
                calcMode="spline"
                keySplines="0.4 0 0.2 1"
              />
            </circle>
          </svg>
          <div className="text-center z-10">
            <span className="text-3xl font-bold text-white">{overall}</span>
            <span className="text-sm text-white/60">/100</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-white">Overall Business Model Strength</p>
          <p className={`text-sm font-semibold mt-1 ${
            overall >= 70 ? "text-green-400" : 
            overall >= 50 ? "text-amber-400" : 
            "text-red-400"
          }`}>
            {getScoreText(overall)}
          </p>
        </div>
      </div>

      <Separator className="bg-vision-purple-200/20" />

      {/* Components */}
      <div className="space-y-5">
        {sortedComponents.map((component, i) => (
          <div 
            key={i} 
            className="p-4 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-colors duration-200"
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center">
                {getScoreIcon(component.score)}
                <span className="ml-2 text-sm font-semibold text-white">{component.name}</span>
              </div>
              <span className={`text-sm font-bold px-2 py-0.5 rounded-full ${
                component.score >= 70 ? "bg-green-500/20 text-green-400" : 
                component.score >= 50 ? "bg-amber-500/20 text-amber-400" : 
                "bg-red-500/20 text-red-400"
              }`}>
                {component.score}
              </span>
            </div>
            
            <div className="relative h-2.5 w-full overflow-hidden rounded-full bg-vision-purple-200/10 mt-2">
              <div 
                className={`h-full transition-all ${
                  component.score >= 70 ? "bg-gradient-to-r from-green-500/80 to-green-400" : 
                  component.score >= 50 ? "bg-gradient-to-r from-amber-500/80 to-amber-400" : 
                  "bg-gradient-to-r from-red-500/80 to-red-400"
                }`}
                style={{ width: '0%' }}
              >
                <animate 
                  attributeName="width" 
                  from="0%" 
                  to={`${component.score}%`} 
                  dur="1s" 
                  fill="freeze" 
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1"
                />
              </div>
            </div>
            
            <p className="text-sm text-white/70 mt-3 leading-relaxed">{component.description}</p>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-lg border border-vision-purple-200/20 bg-vision-card backdrop-blur-md">
        <p className="text-sm text-white/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}