import { Check, X, ArrowUpRight, AlertTriangle } from 'lucide-react';

interface SWOTAnalysisProps {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
  message: string;
}

export function SWOTAnalysis({ strengths, weaknesses, opportunities, threats, message }: SWOTAnalysisProps) {
  return (
    <div className="flex flex-col">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
        {/* Strengths */}
        <div className="p-3 rounded-md border bg-green-500/5 border-green-500/20">
          <div className="flex items-center mb-3">
            <Check className="w-5 h-5 mr-2 text-green-400" />
            <h3 className="text-sm font-medium text-white">Strengths</h3>
          </div>
          <ul className="space-y-2">
            {strengths.map((strength, index) => (
              <li key={index} className="flex">
                <span className="inline-block mr-2 text-green-400">•</span>
                <span className="text-sm text-white/80">{strength}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Weaknesses */}
        <div className="p-3 rounded-md border bg-red-500/5 border-red-500/20">
          <div className="flex items-center mb-3">
            <X className="w-5 h-5 mr-2 text-red-400" />
            <h3 className="text-sm font-medium text-white">Weaknesses</h3>
          </div>
          <ul className="space-y-2">
            {weaknesses.map((weakness, index) => (
              <li key={index} className="flex">
                <span className="inline-block mr-2 text-red-400">•</span>
                <span className="text-sm text-white/80">{weakness}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Opportunities */}
        <div className="p-3 rounded-md border bg-blue-500/5 border-blue-500/20">
          <div className="flex items-center mb-3">
            <ArrowUpRight className="w-5 h-5 mr-2 text-blue-400" />
            <h3 className="text-sm font-medium text-white">Opportunities</h3>
          </div>
          <ul className="space-y-2">
            {opportunities.map((opportunity, index) => (
              <li key={index} className="flex">
                <span className="inline-block mr-2 text-blue-400">•</span>
                <span className="text-sm text-white/80">{opportunity}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Threats */}
        <div className="p-3 rounded-md border bg-amber-500/5 border-amber-500/20">
          <div className="flex items-center mb-3">
            <AlertTriangle className="w-5 h-5 mr-2 text-amber-400" />
            <h3 className="text-sm font-medium text-white">Threats</h3>
          </div>
          <ul className="space-y-2">
            {threats.map((threat, index) => (
              <li key={index} className="flex">
                <span className="inline-block mr-2 text-amber-400">•</span>
                <span className="text-sm text-white/80">{threat}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* SWOT Insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30 mt-2">
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}