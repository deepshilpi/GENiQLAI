import { Gauge, Check, X, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";

interface SuccessRateChartProps {
  percentage: number;
  goodPoints: string[];
  badPoints: string[];
  message: string;
}

export function SuccessRateChart({ percentage, goodPoints, badPoints, message }: SuccessRateChartProps) {
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
    
  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Left column: Gauge visualization - Using SVG for more reliable rendering */}
        <div className="flex flex-col items-center justify-center sm:w-1/2">
          {/* SVG Gauge */}
          <div className="relative mb-5">
            <svg width="160" height="120" viewBox="0 0 160 120" className="transform scale-100">
              {/* Background semi-circle */}
              <path 
                d="M 10 90 A 70 70 0 0 1 150 90" 
                fill="none" 
                stroke="rgba(139, 92, 246, 0.2)" 
                strokeWidth="4"
              />
              
              {/* Gauge indicator */}
              <path 
                d={`M 80 90 L ${80 + 70 * Math.cos((percentage / 100) * Math.PI)} ${90 - 70 * Math.sin((percentage / 100) * Math.PI)}`} 
                stroke="white" 
                strokeWidth="2"
              />
              
              {/* Indicator circle */}
              <circle 
                cx={80 + 70 * Math.cos((percentage / 100) * Math.PI)} 
                cy={90 - 70 * Math.sin((percentage / 100) * Math.PI)} 
                r="6" 
                fill={gaugeColor}
                style={{ filter: 'drop-shadow(0px 2px 3px rgba(0,0,0,0.3))' }}
              />
              
              {/* Center point */}
              <circle cx="80" cy="90" r="5" fill="rgba(139, 92, 246, 0.3)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
              
              {/* Labels */}
              <text x="10" y="95" fontSize="10" fill="rgba(255, 255, 255, 0.6)">0%</text>
              <text x="75" y="75" fontSize="10" fill="rgba(255, 255, 255, 0.6)">50%</text>
              <text x="145" y="95" fontSize="10" fill="rgba(255, 255, 255, 0.6)">100%</text>
            </svg>
          </div>
          
          {/* Percentage display */}
          <div className={`p-3 rounded-full ${bgColor} mb-3 w-24 h-24 flex items-center justify-center shadow-lg`} 
               style={{ boxShadow: `0 4px 14px -2px ${gaugeColor}40` }}>
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
        </div>

        {/* Right column: Good and bad points */}
        <div className="sm:w-1/2 space-y-4">
          {/* Good points */}
          <div className="space-y-2">
            <h4 className="flex items-center text-sm font-medium text-green-400">
              <Check className="w-4 h-4 mr-2" /> Positive Factors
            </h4>
            <ul className="space-y-2">
              {goodPoints.map((point, index) => (
                <li key={index} className="text-sm pl-6 relative text-white/80">
                  <Check className="absolute left-0 top-1 w-4 h-4 text-green-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>

          {/* Bad points */}
          <div className="space-y-2">
            <h4 className="flex items-center text-sm font-medium text-red-400">
              <X className="w-4 h-4 mr-2" /> Challenging Factors
            </h4>
            <ul className="space-y-2">
              {badPoints.map((point, index) => (
                <li key={index} className="text-sm pl-6 relative text-white/80">
                  <X className="absolute left-0 top-1 w-4 h-4 text-red-400" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      <div className={`p-5 text-sm rounded-md mt-5 text-white/80 ${
        successLevel === "high" ? "bg-green-500/5 border border-green-500/20" :
        successLevel === "medium" ? "bg-amber-500/5 border border-amber-500/20" :
        "bg-red-500/5 border border-red-500/20"
      }`}>
        {message}
      </div>
    </div>
  );
}