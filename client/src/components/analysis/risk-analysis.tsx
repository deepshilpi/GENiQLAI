import { AlertTriangle, Shield, Info } from 'lucide-react';
import { useState } from 'react';

interface RiskFactor {
  name: string;
  probability: number; // 0-100
  impact: number; // 0-100
  mitigation: string;
}

interface RiskAnalysisProps {
  overallRiskScore: number; // 0-100, higher means riskier
  riskFactors: RiskFactor[];
  message: string;
}

export function RiskAnalysis({ overallRiskScore, riskFactors, message }: RiskAnalysisProps) {
  const [selectedRisk, setSelectedRisk] = useState<RiskFactor | null>(null);
  
  // Determine risk level and colors
  const riskLevel = 
    overallRiskScore >= 80 ? "critical" :
    overallRiskScore >= 60 ? "high" :
    overallRiskScore >= 40 ? "medium" :
    "low";
  
  const riskColor = 
    riskLevel === "critical" ? "#ef4444" : // red-500
    riskLevel === "high" ? "#f97316" : // orange-500
    riskLevel === "medium" ? "#f59e0b" : // amber-500
    "#22c55e"; // green-500
    
  const riskText = 
    riskLevel === "critical" ? "Critical Risk" :
    riskLevel === "high" ? "High Risk" :
    riskLevel === "medium" ? "Medium Risk" :
    "Low Risk";
  
  // Sort risk factors by combined risk score (probability * impact)
  const sortedRisks = [...riskFactors].sort((a, b) => {
    const scoreA = (a.probability * a.impact) / 100;
    const scoreB = (b.probability * b.impact) / 100;
    return scoreB - scoreA;
  });
  
  // Get cell color for risk matrix
  const getCellColor = (prob: number, imp: number) => {
    const combinedScore = (prob * imp) / 100;
    
    if (combinedScore >= 70) return "bg-red-500/60";
    if (combinedScore >= 50) return "bg-orange-500/60";
    if (combinedScore >= 30) return "bg-amber-500/60";
    if (combinedScore >= 15) return "bg-yellow-500/60";
    return "bg-green-500/60";
  };
  
  // Check if cell should be highlighted (has a risk in it)
  const hasCellRisk = (probRange: [number, number], impRange: [number, number]) => {
    return sortedRisks.some(risk => 
      risk.probability >= probRange[0] && 
      risk.probability <= probRange[1] && 
      risk.impact >= impRange[0] && 
      risk.impact <= impRange[1]
    );
  };
  
  // Get risks in cell
  const getCellRisks = (probRange: [number, number], impRange: [number, number]) => {
    return sortedRisks.filter(risk => 
      risk.probability >= probRange[0] && 
      risk.probability <= probRange[1] && 
      risk.impact >= impRange[0] && 
      risk.impact <= impRange[1]
    );
  };
  
  // Define matrix cells (5x5 grid)
  const matrixCells = [
    // probability ranges (low to high)
    [0, 20], [21, 40], [41, 60], [61, 80], [81, 100]
  ];
  
  // Define impact ranges (low to high)
  const impactRanges = [
    [0, 20], [21, 40], [41, 60], [61, 80], [81, 100]
  ];
  
  return (
    <div className="flex flex-col">
      {/* Overall Risk Score */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <svg className="w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth="10"
            />
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke={riskColor}
              strokeWidth="10"
              strokeDasharray={`${overallRiskScore * 3.14}, 1000`}
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-white">{overallRiskScore}%</span>
            <span className="text-xs text-white/70">Risk Score</span>
          </div>
        </div>
      </div>
      
      {/* Risk level indicator */}
      <div className="flex items-center justify-center mb-4">
        <AlertTriangle className="w-5 h-5 mr-2" style={{ color: riskColor }} />
        <span className="text-sm font-medium text-white">{riskText}</span>
      </div>
      
      {/* Risk Matrix */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <h3 className="text-sm font-medium text-white">Risk Assessment Matrix</h3>
          <Info className="w-4 h-4 ml-2 text-white/50" />
        </div>
        
        <div className="relative bg-vision-purple-100/5 border border-vision-purple-200/10 rounded-md p-1">
          {/* Y-axis label (Probability) */}
          <div className="absolute -left-8 top-1/2 -translate-y-1/2 -rotate-90 text-xs text-white/70">
            Probability
          </div>
          
          {/* X-axis label (Impact) */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-6 text-xs text-white/70">
            Impact
          </div>
          
          {/* Risk Matrix Grid */}
          <div className="grid grid-cols-5 gap-1">
            {/* Generate rows in reverse (high probability at top) */}
            {matrixCells.slice().reverse().map((probRange, rowIndex) => (
              // For each row, generate cells across impact values
              impactRanges.map((impRange, colIndex) => {
                const revRowIndex = 4 - rowIndex; // Reverse the row index to match the array
                const cellRisks = getCellRisks(probRange, impRange);
                
                return (
                  <div 
                    key={`${revRowIndex}-${colIndex}`}
                    className={`relative w-12 h-12 ${getCellColor(
                      (probRange[0] + probRange[1]) / 2, 
                      (impRange[0] + impRange[1]) / 2
                    )} rounded-sm flex items-center justify-center cursor-pointer ${
                      cellRisks.length > 0 ? 'ring-2 ring-white/50' : 'opacity-40'
                    }`}
                    onClick={() => cellRisks.length > 0 && setSelectedRisk(cellRisks[0])}
                  >
                    {cellRisks.length > 0 && (
                      <>
                        <span className="text-white font-bold text-sm">
                          {cellRisks.length}
                        </span>
                        
                        {/* First row labels (top) */}
                        {revRowIndex === 4 && colIndex === 0 && (
                          <span className="absolute -top-5 left-0 text-xs text-white/60">Very Likely</span>
                        )}
                        {revRowIndex === 0 && colIndex === 0 && (
                          <span className="absolute -bottom-5 left-0 text-xs text-white/60">Unlikely</span>
                        )}
                        {revRowIndex === 0 && colIndex === 0 && (
                          <span className="absolute top-full left-0 -translate-y-1/2 translate-x-12 text-xs text-white/60">Minor</span>
                        )}
                        {revRowIndex === 0 && colIndex === 4 && (
                          <span className="absolute top-full right-0 -translate-y-1/2 -translate-x-2 text-xs text-white/60">Severe</span>
                        )}
                      </>
                    )}
                  </div>
                );
              })
            ))}
          </div>
        </div>
      </div>
      
      {/* Risk Details */}
      {selectedRisk ? (
        <div className="p-4 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-sm font-medium text-white">{selectedRisk.name}</h4>
            <button 
              className="text-white/60 hover:text-white/80"
              onClick={() => setSelectedRisk(null)}
            >
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="flex flex-col">
              <span className="text-xs text-white/70">Probability</span>
              <div className="mt-1 h-2 w-full bg-vision-purple-200/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-orange-500" 
                  style={{ width: `${selectedRisk.probability}%` }}
                ></div>
              </div>
              <span className="text-xs text-right text-white/70 mt-1">{selectedRisk.probability}%</span>
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs text-white/70">Impact</span>
              <div className="mt-1 h-2 w-full bg-vision-purple-200/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-red-500" 
                  style={{ width: `${selectedRisk.impact}%` }}
                ></div>
              </div>
              <span className="text-xs text-right text-white/70 mt-1">{selectedRisk.impact}%</span>
            </div>
          </div>
          
          <div className="mt-3">
            <h5 className="text-xs font-medium text-white flex items-center mb-1">
              <Shield className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Mitigation Strategy
            </h5>
            <p className="text-xs text-white/80">{selectedRisk.mitigation}</p>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-4 text-sm text-center border rounded-md text-white/60 bg-vision-purple-100/5 border-vision-purple-200/10">
          Select a risk from the matrix to see details
        </div>
      )}
      
      {/* Risk List */}
      <div className="space-y-2 mb-4">
        {sortedRisks.slice(0, 3).map((risk, index) => (
          <div 
            key={index}
            className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10 cursor-pointer hover:bg-vision-purple-100/10 transition"
            onClick={() => setSelectedRisk(risk)}
          >
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-white">{risk.name}</h4>
              <div className="flex items-center">
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                  backgroundColor: `rgba(${
                    risk.probability * risk.impact / 100 >= 50 ? '239, 68, 68' : 
                    risk.probability * risk.impact / 100 >= 30 ? '249, 115, 22' : 
                    risk.probability * risk.impact / 100 >= 15 ? '245, 158, 11' : '34, 197, 94'
                  }, 0.2)`,
                  color: `rgb(${
                    risk.probability * risk.impact / 100 >= 50 ? '239, 68, 68' : 
                    risk.probability * risk.impact / 100 >= 30 ? '249, 115, 22' : 
                    risk.probability * risk.impact / 100 >= 15 ? '245, 158, 11' : '34, 197, 94'
                  })`
                }}>
                  {Math.round(risk.probability * risk.impact / 100)}% Risk
                </span>
              </div>
            </div>
            <div className="flex items-center text-xs text-white/70 justify-between">
              <span>P: {risk.probability}%</span>
              <span>I: {risk.impact}%</span>
            </div>
          </div>
        ))}
        
        {sortedRisks.length > 3 && (
          <div className="p-2 text-center text-xs text-white/60">
            + {sortedRisks.length - 3} more risks
          </div>
        )}
      </div>
      
      {/* Risk message */}
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