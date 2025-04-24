import { Check, X, AlertTriangle, ThumbsUp, ThumbsDown, ArrowUp } from "lucide-react";
import { getCountryCurrency, formatCurrency } from "@/lib/utils";
import { FlagIcon } from "../flag-icon";
import { Card, CardContent } from "@/components/ui/card";

interface SuccessRateChartProps {
  percentage: number;
  goodPoints: string[];
  badPoints: string[];
  message: string;
  country?: string;
}

export function SuccessRateChart({ percentage, goodPoints, badPoints, message, country = "United States" }: SuccessRateChartProps) {
  // Get currency for the selected country
  const currency = getCountryCurrency(country);
  
  // Determine success level and colors
  const successLevel = 
    percentage >= 70 ? "high" :
    percentage >= 40 ? "medium" :
    "low";
  
  const colorClass = 
    successLevel === "high" ? "text-green-400" :
    successLevel === "medium" ? "text-amber-400" : 
    "text-red-400";
    
  const bgColorClass = 
    successLevel === "high" ? "from-green-500/30 to-green-500/5" :
    successLevel === "medium" ? "from-amber-500/30 to-amber-500/5" :
    "from-red-500/30 to-red-500/5";
  
  const borderColorClass = 
    successLevel === "high" ? "border-green-500/30" :
    successLevel === "medium" ? "border-amber-500/30" : 
    "border-red-500/30";
  
  // For circular progress
  const circumference = 2 * Math.PI * 40; // 40 is the radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
      {/* Column 1: Success Rate Circle */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10 aspect-square">
        <CardContent className="p-4 h-full flex flex-col items-center justify-center text-center">
          <div className="w-full max-w-[200px] aspect-square relative">
            {/* Circular progress */}
            <svg className="w-full h-full" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                strokeWidth="4" 
                stroke="rgba(139, 92, 246, 0.15)"
                className="opacity-50"
              />
              
              {/* Progress circle with glow effect */}
              <circle 
                cx="50" 
                cy="50" 
                r="40" 
                fill="none" 
                strokeWidth="4" 
                stroke="currentColor" 
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className={`transform origin-center -rotate-90 ${colorClass}`}
                style={{filter: 'drop-shadow(0px 0px 4px currentColor)'}}
              />
              
              {/* Label in center */}
              <text 
                x="50" 
                y="50" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className={`fill-white text-2xl font-bold ${colorClass}`}
                fontSize="18px"
              >
                {percentage}%
              </text>
              
              {/* Rating text below percentage */}
              <text 
                x="50" 
                y="60" 
                dominantBaseline="middle" 
                textAnchor="middle" 
                className="fill-white/80 text-xs"
                fontSize="8px"
              >
                {successLevel === "high" ? "HIGH POTENTIAL" : 
                 successLevel === "medium" ? "MODERATE POTENTIAL" : 
                 "CHALLENGING"}
              </text>
            </svg>
            
            {/* Float this on top of the circle at the top */}
            <div className={`absolute -top-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${
              successLevel === "high" ? "bg-green-500/20 text-green-400" :
              successLevel === "medium" ? "bg-amber-500/20 text-amber-400" : 
              "bg-red-500/20 text-red-400"
            }`}>
              <FlagIcon country={country} size="sm" />
              <span>{country}</span>
            </div>
          </div>
          
          {/* Success level indicator */}
          <div className={`mt-4 flex items-center justify-center gap-2 rounded-lg py-2 px-3 bg-gradient-to-r ${bgColorClass} ${borderColorClass} border w-fit`}>
            {successLevel === "high" ? <ThumbsUp className="w-4 h-4" /> : 
             successLevel === "medium" ? <AlertTriangle className="w-4 h-4" /> : 
             <ThumbsDown className="w-4 h-4" />}
            <span className="text-xs font-medium">
              {successLevel === "high" ? "High Potential" : 
               successLevel === "medium" ? "Moderate Potential" : 
               "Challenging"}
            </span>
          </div>
        </CardContent>
      </Card>
      
      {/* Column 2: Good & Bad Points */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10 md:col-span-2">
        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
          {/* Good points */}
          <div className="p-3 rounded-lg border border-green-500/20 bg-green-500/5 backdrop-blur-sm flex flex-col h-full">
            <h4 className="flex items-center text-sm font-medium text-green-400 mb-2">
              <ArrowUp className="w-4 h-4 mr-2" /> Positive Factors
            </h4>
            <ul className="space-y-2 flex-grow">
              {goodPoints.slice(0, 4).map((point, index) => (
                <li key={index} className="text-xs pl-5 relative text-white/90 flex items-start">
                  <Check className="absolute left-0 top-0.5 w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  <span className="leading-tight">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bad points */}
          <div className="p-3 rounded-lg border border-red-500/20 bg-red-500/5 backdrop-blur-sm flex flex-col h-full">
            <h4 className="flex items-center text-sm font-medium text-red-400 mb-2">
              <X className="w-4 h-4 mr-2" /> Challenging Factors
            </h4>
            <ul className="space-y-2 flex-grow">
              {badPoints.slice(0, 4).map((point, index) => (
                <li key={index} className="text-xs pl-5 relative text-white/90 flex items-start">
                  <X className="absolute left-0 top-0.5 w-3.5 h-3.5 text-red-400 flex-shrink-0" />
                  <span className="leading-tight">{point}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Analysis message - spans both columns */}
          <div className="sm:col-span-2 p-3 text-xs rounded-lg text-white/90 bg-card/50 border border-border/40 backdrop-blur-sm">
            <div className="flex items-start">
              <p className="leading-tight">{message}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}