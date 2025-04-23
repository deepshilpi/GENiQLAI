import { Gauge, Check, X, AlertTriangle, ThumbsUp, ThumbsDown } from "lucide-react";
import { getCountryCurrency, formatCurrency } from "@/lib/utils";
import { FlagIcon } from "../flag-icon";

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
  
  const gaugeColor = 
    successLevel === "high" ? "#22c55e" :  // green-500
    successLevel === "medium" ? "#f59e0b" : // amber-500
    "#ef4444"; // red-500
    
  const gaugeGradientStart = 
    successLevel === "high" ? "#22c55e99" :
    successLevel === "medium" ? "#f59e0b99" :
    "#ef444499";
    
  const gaugeGradientEnd = 
    successLevel === "high" ? "#22c55eff" :
    successLevel === "medium" ? "#f59e0bff" :
    "#ef4444ff";
    
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
            <svg width="180" height="120" viewBox="0 0 180 120" className="transform scale-100">
              {/* Gradient definitions */}
              <defs>
                <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={gaugeGradientStart} />
                  <stop offset="100%" stopColor={gaugeGradientEnd} />
                </linearGradient>
                <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                  <feComposite in="SourceGraphic" in2="coloredBlur" operator="over"/>
                </filter>
              </defs>
              
              {/* Background semi-circle */}
              <path 
                d="M 20 90 A 70 70 0 0 1 160 90" 
                fill="none" 
                stroke="rgba(139, 92, 246, 0.15)" 
                strokeWidth="6"
                strokeLinecap="round"
              />
              
              {/* Progress arc - dynamic based on percentage */}
              <path 
                d={`M 90 90 A 70 70 0 ${percentage < 50 ? 0 : 1} 1 ${90 + 70 * Math.cos((percentage / 100) * Math.PI)} ${90 - 70 * Math.sin((percentage / 100) * Math.PI)}`} 
                fill="none" 
                stroke="url(#gaugeGradient)" 
                strokeWidth="6"
                strokeLinecap="round"
                style={{ filter: 'url(#glow)' }}
              />
              
              {/* Gauge indicator line */}
              <path 
                d={`M 90 90 L ${90 + 70 * Math.cos((percentage / 100) * Math.PI)} ${90 - 70 * Math.sin((percentage / 100) * Math.PI)}`} 
                stroke="white" 
                strokeWidth="1.5"
                strokeDasharray="3,2"
              />
              
              {/* Indicator circle */}
              <circle 
                cx={90 + 70 * Math.cos((percentage / 100) * Math.PI)} 
                cy={90 - 70 * Math.sin((percentage / 100) * Math.PI)} 
                r="7" 
                fill={gaugeColor}
                style={{ filter: 'drop-shadow(0px 2px 5px rgba(0,0,0,0.4))' }}
              />
              
              {/* Center point */}
              <circle cx="90" cy="90" r="5" fill="rgba(139, 92, 246, 0.3)" stroke="rgba(139, 92, 246, 0.4)" strokeWidth="1" />
              
              {/* Labels */}
              <text x="18" y="100" fontSize="11" fontWeight="500" textAnchor="middle" fill="rgba(255, 255, 255, 0.7)">0%</text>
              <text x="90" y="15" fontSize="11" fontWeight="500" textAnchor="middle" fill="rgba(255, 255, 255, 0.7)">50%</text>
              <text x="162" y="100" fontSize="11" fontWeight="500" textAnchor="middle" fill="rgba(255, 255, 255, 0.7)">100%</text>
            </svg>
          </div>
          
          {/* Percentage display */}
          <div className={`p-4 rounded-full ${bgColor} mb-4 w-28 h-28 flex items-center justify-center shadow-lg relative overflow-hidden group transition-all duration-300 transform hover:scale-105`} 
               style={{ 
                 boxShadow: `0 4px 20px -2px ${gaugeColor}50`,
                 background: `radial-gradient(circle at center, ${gaugeColor}30 0%, ${gaugeColor}05 70%)` 
               }}>
            <div className="absolute inset-0 bg-vision-primary-gradient/10 rounded-full blur-lg opacity-80"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-vision-purple-200/5 to-transparent rounded-full"></div>
            <span className="text-3xl font-bold text-white relative z-10 group-hover:text-white/95">{percentage}%</span>
          </div>
          
          {/* Success level indicator */}
          <div className={`flex items-center mb-3 py-2 px-4 rounded-full ${
            successLevel === "high" ? "bg-green-500/10 border-green-500/20" : 
            successLevel === "medium" ? "bg-amber-500/10 border-amber-500/20" : 
            "bg-red-500/10 border-red-500/20"
          } border`}>
            {successLevel === "high" && <ThumbsUp className="w-5 h-5 mr-2 text-green-400" />}
            {successLevel === "medium" && <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />}
            {successLevel === "low" && <ThumbsDown className="w-5 h-5 mr-2 text-red-400" />}
            
            <span className="text-sm font-medium text-white">
              {successLevel === "high" ? "High Potential" : 
               successLevel === "medium" ? "Moderate Potential" : 
               "Challenging Prospect"}
            </span>
          </div>
          
          {/* Country indicator with flag */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-vision-purple-100/10 border border-vision-purple-200/20">
            <FlagIcon country={country} size="md" />
            <span className="text-sm font-medium text-white">{country}</span>
          </div>
        </div>

        {/* Right column: Good and bad points */}
        <div className="sm:w-1/2 space-y-5">
          {/* Good points */}
          <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5 backdrop-blur-sm space-y-3">
            <h4 className="flex items-center text-sm font-medium text-green-400 mb-2">
              <Check className="w-4 h-4 mr-2" /> Positive Factors
            </h4>
            <ul className="space-y-2.5">
              {goodPoints.map((point, index) => (
                <li key={index} className="text-sm pl-6 relative text-white/90 flex items-start">
                  <Check className="absolute left-0 top-1 w-4 h-4 text-green-400 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Bad points */}
          <div className="p-4 rounded-lg border border-red-500/20 bg-red-500/5 backdrop-blur-sm space-y-3">
            <h4 className="flex items-center text-sm font-medium text-red-400 mb-2">
              <X className="w-4 h-4 mr-2" /> Challenging Factors
            </h4>
            <ul className="space-y-2.5">
              {badPoints.map((point, index) => (
                <li key={index} className="text-sm pl-6 relative text-white/90 flex items-start">
                  <X className="absolute left-0 top-1 w-4 h-4 text-red-400 flex-shrink-0" />
                  <span className="leading-relaxed">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      {/* Success message */}
      <div className={`p-5 text-sm rounded-lg mt-6 text-white/90 ${
        successLevel === "high" ? "bg-green-500/5 border border-green-500/20" :
        successLevel === "medium" ? "bg-amber-500/5 border border-amber-500/20" :
        "bg-red-500/5 border border-red-500/20"
      } backdrop-blur-sm shadow-inner`}>
        <div className="flex items-start">
          {successLevel === "high" && <ThumbsUp className="w-5 h-5 mr-3 mt-0.5 text-green-400 flex-shrink-0" />}
          {successLevel === "medium" && <AlertTriangle className="w-5 h-5 mr-3 mt-0.5 text-amber-400 flex-shrink-0" />}
          {successLevel === "low" && <ThumbsDown className="w-5 h-5 mr-3 mt-0.5 text-red-400 flex-shrink-0" />}
          <p className="leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}