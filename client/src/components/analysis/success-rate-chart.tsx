import { Gauge, Sparkles, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";

interface SuccessRateChartProps {
  percentage: number;
  message: string;
}

export function SuccessRateChart({ percentage, message }: SuccessRateChartProps) {
  // Determine success level and colors
  const successLevel = 
    percentage >= 70 ? "high" :
    percentage >= 40 ? "medium" :
    "low";
  
  const gaugeColor = 
    successLevel === "high" ? "#22c55e" :  // green-500
    successLevel === "medium" ? "#f59e0b" : // amber-500
    "#ef4444"; // red-500
    
  const bgColor = 
    successLevel === "high" ? "bg-green-500/10 border-green-500/30" :
    successLevel === "medium" ? "bg-amber-500/10 border-amber-500/30" :
    "bg-red-500/10 border-red-500/30";
    
  // Calculate gauge position
  const rotation = (percentage / 100) * 180;
  
  return (
    <div className="flex flex-col items-center">
      {/* Gauge visualization */}
      <div className="relative w-48 h-24 mb-4">
        {/* Semi-circle background */}
        <div className="absolute w-full h-full overflow-hidden">
          <div className="absolute bottom-0 w-full h-full rounded-t-full bg-vision-purple-100/5 border-t border-x border-vision-purple-200/20"></div>
        </div>
        
        {/* Gauge indicator */}
        <div 
          className="absolute bottom-0 left-1/2 w-1 h-[50%] bg-white origin-bottom -translate-x-1/2"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="absolute top-0 left-1/2 w-4 h-4 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ backgroundColor: gaugeColor }}></div>
        </div>
        
        {/* Gauge center */}
        <div className="absolute bottom-0 left-1/2 w-6 h-6 -translate-x-1/2 translate-y-1/2 rounded-full bg-vision-purple-100/20 border border-vision-purple-200/30"></div>
        
        {/* Gauge labels */}
        <div className="absolute bottom-0 left-0 text-xs text-white/60">0%</div>
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 -translate-y-1 text-xs text-white/60">50%</div>
        <div className="absolute bottom-0 right-0 text-xs text-white/60">100%</div>
      </div>
      
      {/* Percentage display */}
      <div className={`p-3 rounded-full ${bgColor} mb-3`}>
        <span className="text-2xl font-semibold text-white">{percentage}%</span>
      </div>
      
      {/* Success level indicator */}
      <div className="flex items-center mb-2">
        {successLevel === "high" && <ThumbsUp className="w-5 h-5 mr-2 text-green-400" />}
        {successLevel === "medium" && <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />}
        {successLevel === "low" && <ThumbsDown className="w-5 h-5 mr-2 text-red-400" />}
        
        <span className="text-sm font-medium text-white">
          {successLevel === "high" ? "High Potential" : 
           successLevel === "medium" ? "Moderate Potential" : 
           "Challenging Prospect"}
        </span>
      </div>
      
      {/* Success message */}
      <div className={`p-3 text-sm rounded-md mt-2 text-white/80 ${
        successLevel === "high" ? "bg-green-500/5 border border-green-500/20" :
        successLevel === "medium" ? "bg-amber-500/5 border border-amber-500/20" :
        "bg-red-500/5 border border-red-500/20"
      }`}>
        {message}
      </div>
    </div>
  );
}