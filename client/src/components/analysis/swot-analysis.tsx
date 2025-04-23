import { ThumbsUp, ThumbsDown, TrendingUp, AlertTriangle } from "lucide-react";

interface SWOTAnalysisProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  message: string;
}

export function SWOTAnalysis({ 
  strengths, 
  weaknesses, 
  opportunities, 
  threats, 
  message 
}: SWOTAnalysisProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Strengths */}
        <div className="p-4 border rounded-lg bg-green-500/5 border-green-500/20">
          <div className="flex items-center mb-3">
            <ThumbsUp className="w-5 h-5 mr-2 text-green-500" />
            <h3 className="text-base font-medium text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 mr-2 rounded-full bg-green-500/20 flex items-center justify-center text-[10px] text-green-500">
                  S
                </span>
                <span className="text-sm text-white/80">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="p-4 border rounded-lg bg-red-500/5 border-red-500/20">
          <div className="flex items-center mb-3">
            <ThumbsDown className="w-5 h-5 mr-2 text-red-500" />
            <h3 className="text-base font-medium text-white">Weaknesses</h3>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 mr-2 rounded-full bg-red-500/20 flex items-center justify-center text-[10px] text-red-500">
                  W
                </span>
                <span className="text-sm text-white/80">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunities */}
        <div className="p-4 border rounded-lg bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center mb-3">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            <h3 className="text-base font-medium text-white">Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {opportunities.map((opportunity, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 mr-2 rounded-full bg-blue-500/20 flex items-center justify-center text-[10px] text-blue-500">
                  O
                </span>
                <span className="text-sm text-white/80">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Threats */}
        <div className="p-4 border rounded-lg bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-500" />
            <h3 className="text-base font-medium text-white">Threats</h3>
          </div>
          <ul className="space-y-2">
            {threats.map((threat, index) => (
              <li key={index} className="flex items-start">
                <span className="flex-shrink-0 w-4 h-4 mr-2 rounded-full bg-amber-500/20 flex items-center justify-center text-[10px] text-amber-500">
                  T
                </span>
                <span className="text-sm text-white/80">{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <p className="pt-3 mt-2 text-sm text-white/80 border-t border-vision-purple-200/20">
        {message}
      </p>
    </div>
  );
}