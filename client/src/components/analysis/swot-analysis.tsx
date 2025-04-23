import { ThumbsUp, ThumbsDown, Lightbulb, AlertTriangle } from 'lucide-react';

interface SwotAnalysisProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export function SwotAnalysis({ strengths, weaknesses, opportunities, threats }: SwotAnalysisProps) {
  return (
    <div className="flex flex-col">
      <h4 className="text-sm font-medium text-white text-center mb-4">SWOT Analysis</h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Strengths */}
        <div className="p-3 rounded-md bg-green-500/5 border border-green-500/20">
          <div className="flex items-center mb-3">
            <ThumbsUp className="w-4 h-4 mr-2 text-green-400" />
            <h4 className="text-sm font-medium text-white">Strengths</h4>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="text-sm pl-5 relative text-white/80">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-green-400"></div>
                {strength}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="p-3 rounded-md bg-red-500/5 border border-red-500/20">
          <div className="flex items-center mb-3">
            <ThumbsDown className="w-4 h-4 mr-2 text-red-400" />
            <h4 className="text-sm font-medium text-white">Weaknesses</h4>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="text-sm pl-5 relative text-white/80">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-red-400"></div>
                {weakness}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunities */}
        <div className="p-3 rounded-md bg-blue-500/5 border border-blue-500/20">
          <div className="flex items-center mb-3">
            <Lightbulb className="w-4 h-4 mr-2 text-blue-400" />
            <h4 className="text-sm font-medium text-white">Opportunities</h4>
          </div>
          <ul className="space-y-2">
            {opportunities.map((opportunity, index) => (
              <li key={index} className="text-sm pl-5 relative text-white/80">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-400"></div>
                {opportunity}
              </li>
            ))}
          </ul>
        </div>
        
        {/* Threats */}
        <div className="p-3 rounded-md bg-amber-500/5 border border-amber-500/20">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-400" />
            <h4 className="text-sm font-medium text-white">Threats</h4>
          </div>
          <ul className="space-y-2">
            {threats.map((threat, index) => (
              <li key={index} className="text-sm pl-5 relative text-white/80">
                <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-amber-400"></div>
                {threat}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-4 text-xs text-center text-white/60">
        <p>A comprehensive analysis of internal and external factors affecting your startup's potential success</p>
      </div>
    </div>
  );
}