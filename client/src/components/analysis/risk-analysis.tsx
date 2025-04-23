import { AlertTriangle, ShieldAlert, Lightbulb } from 'lucide-react';

interface RiskAnalysisProps {
  overallRisk: number; // 0-100, higher means more risky
  risks: Array<{
    category: string;
    likelihood: number; // 0-100
    impact: number; // 0-100
    mitigationStrategy: string;
  }>;
  message: string;
}

export function RiskAnalysis({ overallRisk, risks, message }: RiskAnalysisProps) {
  // Sort risks by combined risk factor (likelihood * impact / 100) descending
  const sortedRisks = [...risks].sort((a, b) => {
    const riskFactorA = (a.likelihood * a.impact) / 100;
    const riskFactorB = (b.likelihood * b.impact) / 100;
    return riskFactorB - riskFactorA;
  });
  
  // Get risk level description
  const getRiskLevel = (score: number): string => {
    return score >= 80 ? "Very High Risk" :
           score >= 60 ? "High Risk" :
           score >= 40 ? "Moderate Risk" :
           score >= 20 ? "Low Risk" :
           "Very Low Risk";
  };
  
  // Get color for risk score
  const getRiskColor = (score: number): string => {
    return score >= 80 ? "text-red-400 border-red-400/30" :
           score >= 60 ? "text-red-400 border-red-400/30" :
           score >= 40 ? "text-amber-400 border-amber-400/30" :
           score >= 20 ? "text-amber-400 border-amber-400/30" :
           "text-green-400 border-green-400/30";
  };
  
  return (
    <div className="flex flex-col">
      {/* Overall risk */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <ShieldAlert className="w-4 h-4 mr-2 text-amber-400" />
          <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/80">Overall Risk Level</span>
          <div className="flex items-center">
            <span className={`text-lg font-medium ${getRiskColor(overallRisk).split(' ')[0]}`}>
              {overallRisk}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-vision-purple-100/10 rounded-full h-2 mb-1">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${overallRisk}%`,
              backgroundColor: overallRisk >= 60 ? '#ef4444' : 
                              overallRisk >= 40 ? '#f59e0b' : 
                              '#22c55e'
            }}
          ></div>
        </div>
        
        <div className="mt-1 flex justify-end">
          <span className={`text-xs inline-block px-2 py-0.5 rounded-full 
            ${getRiskColor(overallRisk)} bg-vision-purple-100/10`}
          >
            {getRiskLevel(overallRisk)}
          </span>
        </div>
      </div>
      
      {/* Risk matrix */}
      <div className="mb-4 p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <h4 className="text-sm font-medium text-white mb-3">Risk Matrix</h4>
        
        <div className="relative bg-vision-purple-100/5 rounded-md border border-vision-purple-200/10 p-1">
          {/* Matrix grid */}
          <div className="w-full h-64 grid grid-cols-5 grid-rows-5 gap-0.5 relative">
            {/* Generate matrix background cells */}
            {Array.from({ length: 25 }).map((_, index) => {
              const row = Math.floor(index / 5); // 0-4 (top to bottom)
              const col = index % 5; // 0-4 (left to right)
              
              // Calculate risk level based on position
              // Impact increases from bottom to top (4-row)
              // Likelihood increases from left to right (col)
              const impact = 100 - (row * 20);
              const likelihood = (col + 1) * 20;
              const riskFactor = (impact * likelihood) / 100;
              
              // Set background color based on risk factor
              let bgColor = 'bg-green-500/20'; // Very low risk
              if (riskFactor >= 80) bgColor = 'bg-red-500/20'; // Very high risk
              else if (riskFactor >= 60) bgColor = 'bg-red-500/10'; // High risk
              else if (riskFactor >= 40) bgColor = 'bg-amber-500/20'; // Moderate risk
              else if (riskFactor >= 20) bgColor = 'bg-green-500/10'; // Low risk
              
              return (
                <div 
                  key={index} 
                  className={`${bgColor} rounded-sm`}
                  style={{
                    gridColumn: col + 1,
                    gridRow: row + 1,
                  }}
                ></div>
              );
            })}
            
            {/* Place risk points on the matrix */}
            {sortedRisks.map((risk, index) => {
              // Convert likelihood and impact percentages to grid positions
              // Likelihood: 0-100% maps to grid columns 1-5
              // Impact: 0-100% maps to grid rows 5-1 (inverted)
              const col = Math.floor(risk.likelihood / 20);
              const row = 5 - Math.ceil(risk.impact / 20);
              
              // Risk factor color
              const riskFactor = (risk.likelihood * risk.impact) / 100;
              let dotColor = 'bg-green-400'; // Very low risk
              if (riskFactor >= 80) dotColor = 'bg-red-400'; // Very high risk
              else if (riskFactor >= 60) dotColor = 'bg-red-400'; // High risk
              else if (riskFactor >= 40) dotColor = 'bg-amber-400'; // Moderate risk
              else if (riskFactor >= 20) dotColor = 'bg-green-400'; // Low risk
              
              return (
                <div
                  key={index}
                  className="absolute flex items-center justify-center w-7 h-7 transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${(col + 0.5) * 20}%`,
                    top: `${(row + 0.5) * 20}%`,
                  }}
                >
                  <div className={`w-5 h-5 rounded-full ${dotColor} flex items-center justify-center`}>
                    <span className="text-[9px] font-bold text-vision-card">{index + 1}</span>
                  </div>
                </div>
              );
            })}
            
            {/* Axis labels */}
            <div className="absolute -bottom-6 left-0 right-0 flex justify-between text-[10px] text-white/60">
              <span>Low</span>
              <span className="absolute left-1/2 transform -translate-x-1/2">Likelihood</span>
              <span>High</span>
            </div>
            
            <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-between items-center text-[10px] text-white/60">
              <span>High</span>
              <span className="absolute top-1/2 transform -translate-y-1/2 -rotate-90">Impact</span>
              <span>Low</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Risk breakdown */}
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium text-white mb-2">Key Risks & Mitigation</h4>
        
        {sortedRisks.map((risk, index) => {
          // Risk factor calculation
          const riskFactor = (risk.likelihood * risk.impact) / 100;
          
          // Color based on risk factor
          const riskColor = 
            riskFactor >= 80 ? "border-red-500/30 bg-red-500/5" :
            riskFactor >= 60 ? "border-red-500/20 bg-red-500/5" :
            riskFactor >= 40 ? "border-amber-500/30 bg-amber-500/5" :
            riskFactor >= 20 ? "border-amber-500/20 bg-amber-500/5" :
            "border-green-500/20 bg-green-500/5";
          
          const factorColor = 
            riskFactor >= 80 ? "text-red-400" :
            riskFactor >= 60 ? "text-red-400" :
            riskFactor >= 40 ? "text-amber-400" :
            riskFactor >= 20 ? "text-amber-400" :
            "text-green-400";
          
          return (
            <div 
              key={index}
              className={`p-3 rounded-md border ${riskColor}`}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className={`w-5 h-5 rounded-full ${factorColor} flex items-center justify-center mr-2`}>
                    <span className="text-[10px] font-bold text-vision-card">{index + 1}</span>
                  </div>
                  <h5 className="text-sm font-medium text-white">{risk.category}</h5>
                </div>
                <span className={`text-xs font-medium ${factorColor}`}>
                  {riskFactor.toFixed(0)}% Risk Factor
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="flex flex-col">
                  <span className="text-xs text-white/60 mb-1">Likelihood</span>
                  <div className="w-full bg-vision-purple-100/10 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-amber-400" 
                      style={{ width: `${risk.likelihood}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-right mt-0.5 text-white/80">{risk.likelihood}%</span>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-xs text-white/60 mb-1">Impact</span>
                  <div className="w-full bg-vision-purple-100/10 rounded-full h-1.5">
                    <div 
                      className="h-1.5 rounded-full bg-red-400" 
                      style={{ width: `${risk.impact}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-right mt-0.5 text-white/80">{risk.impact}%</span>
                </div>
              </div>
              
              <div className="mt-2">
                <div className="flex items-start">
                  <Lightbulb className="w-3.5 h-3.5 text-primary mt-0.5 mr-1.5 flex-shrink-0" />
                  <p className="text-xs text-white/80">{risk.mitigationStrategy}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Risk assessment summary */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}