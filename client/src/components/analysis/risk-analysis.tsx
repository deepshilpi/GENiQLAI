import { HeatMapGrid } from 'react-grid-heatmap';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ShieldCheck, Info } from "lucide-react";
import { useState } from 'react';

interface RiskAnalysisProps {
  overallRiskScore: number; // 0-100, higher means riskier
  riskFactors: Array<{
    name: string;
    probability: number; // 0-100
    impact: number; // 0-100
    mitigation: string;
  }>;
  message: string;
}

export function RiskAnalysis({ overallRiskScore, riskFactors, message }: RiskAnalysisProps) {
  const [selectedRisk, setSelectedRisk] = useState<number | null>(null);
  
  // Determine risk level text
  const getRiskLevelText = (score: number) => {
    if (score >= 80) return "Very High";
    if (score >= 60) return "High";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Low";
    return "Very Low";
  };
  
  // Get color based on risk score
  const getRiskColor = (score: number) => {
    if (score >= 80) return "bg-red-600/30 text-red-400";
    if (score >= 60) return "bg-orange-500/30 text-orange-400";
    if (score >= 40) return "bg-yellow-500/30 text-yellow-400";
    if (score >= 20) return "bg-green-500/30 text-green-400";
    return "bg-blue-500/30 text-blue-400";
  };
  
  // Format risk data into a heat map matrix
  const buildHeatmapData = () => {
    // Create a 5x5 grid (impact vs probability)
    const grid = Array(5).fill(0).map(() => Array(5).fill(0));
    
    // Count how many risk factors fall into each cell
    riskFactors.forEach(factor => {
      const probIndex = Math.min(4, Math.floor(factor.probability / 20));
      const impactIndex = Math.min(4, Math.floor(factor.impact / 20));
      grid[4 - impactIndex][probIndex] += 1; // Inverse impact axis to have high impact at the top
    });
    
    return grid;
  };
  
  // Calculate a color for each cell in the heat map
  const getCellColor = (value: number, x: number, y: number) => {
    // Base color intensity on the presence of risks
    if (value === 0) return '#11083c20';
    
    // Calculate risk level (0-4 for both axes)
    const probLevel = x; // 0-4 from left to right
    const impactLevel = 4 - y; // 0-4 from bottom to top (inverse of y)
    const riskLevel = (probLevel + impactLevel) / 2; // 0-4 average
    
    // Color based on risk level
    if (riskLevel >= 3.5) return '#ff000040'; // High risk (red)
    if (riskLevel >= 2.5) return '#ff660040'; // Medium-high risk (orange)
    if (riskLevel >= 1.5) return '#ffcc0040'; // Medium risk (yellow)
    if (riskLevel >= 0.5) return '#66cc0040'; // Low-medium risk (yellow-green)
    return '#00cc0040'; // Low risk (green)
  };

  // Y-axis labels (Impact, from high to low)
  const yLabels = ['Very High', 'High', 'Medium', 'Low', 'Very Low'];
  
  // X-axis labels (Probability, from low to high)
  const xLabels = ['Very Low', 'Low', 'Medium', 'High', 'Very High'];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-white">Risk Profile</h3>
          <div className="flex items-center">
            <p className="text-sm text-white/70">Overall Risk Level:</p>
            <Badge className={`ml-2 ${getRiskColor(overallRiskScore)}`}>
              {getRiskLevelText(overallRiskScore)}
            </Badge>
          </div>
        </div>
        <Badge className="px-2 py-1 bg-vision-purple-200/30 text-white">
          {overallRiskScore}/100
        </Badge>
      </div>
      
      <div className="h-64 w-full">
        <HeatMapGrid
          data={buildHeatmapData()}
          xLabels={xLabels}
          yLabels={yLabels}
          cellRender={(x, y, value) => (
            <div 
              className="w-full h-full flex items-center justify-center text-xs text-white cursor-pointer"
              title={`${yLabels[y]} Impact, ${xLabels[x]} Probability: ${value} risk factor(s)`}
            >
              {value > 0 ? value : ''}
            </div>
          )}
          cellStyle={(x, y, value) => ({
            background: getCellColor(value, x, y),
            borderRadius: '4px',
            margin: '1px',
            transition: 'all 0.3s ease-in-out'
          })}
          xLabelsStyle={() => ({
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.7)',
            transform: 'rotate(-90deg)',
            marginRight: '5px',
          })}
          yLabelsStyle={() => ({
            fontSize: '9px',
            color: 'rgba(255, 255, 255, 0.7)',
            marginRight: '5px',
          })}
          cellHeight="30px"
          square={true}
          onClick={(x, y) => {
            const probLevel = x; // 0-4 from left to right
            const impactLevel = 4 - y; // 0-4 from bottom to top (inverse of y)
            
            // Find risks that fall within this cell
            const matchingRisks = riskFactors.filter(factor => {
              const factorProbLevel = Math.min(4, Math.floor(factor.probability / 20));
              const factorImpactLevel = Math.min(4, Math.floor(factor.impact / 20));
              return factorProbLevel === probLevel && factorImpactLevel === impactLevel;
            });
            
            if (matchingRisks.length > 0) {
              // Select the first matching risk
              const riskIndex = riskFactors.findIndex(r => r.name === matchingRisks[0].name);
              setSelectedRisk(riskIndex);
            }
          }}
        />
      </div>
      
      <div className="space-y-2 mt-4">
        <h4 className="text-sm font-medium text-white">Key Risk Factors</h4>
        <div className="flex flex-wrap gap-2">
          {riskFactors.map((risk, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className={`bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20 ${
                selectedRisk === index ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedRisk(selectedRisk === index ? null : index)}
            >
              {risk.name}
            </Button>
          ))}
        </div>
        
        {selectedRisk !== null && (
          <div className="p-4 mt-2 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/20">
            <div className="flex items-center mb-2">
              <AlertTriangle className="w-4 h-4 mr-2 text-primary" />
              <h5 className="text-sm font-medium text-white">{riskFactors[selectedRisk].name}</h5>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-xs text-white/70">
                Probability: 
                <span className="ml-1 text-white">
                  {riskFactors[selectedRisk].probability}%
                </span>
              </div>
              <div className="text-xs text-white/70">
                Impact: 
                <span className="ml-1 text-white">
                  {riskFactors[selectedRisk].impact}%
                </span>
              </div>
            </div>
            <div className="flex items-start mt-2">
              <ShieldCheck className="w-4 h-4 mr-2 mt-0.5 text-green-500" />
              <p className="text-xs text-white/80">
                <span className="font-medium text-white">Mitigation: </span>
                {riskFactors[selectedRisk].mitigation}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="flex items-start p-3 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/10">
        <Info className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-primary" />
        <p className="text-sm text-white/80">{message}</p>
      </div>
    </div>
  );
}