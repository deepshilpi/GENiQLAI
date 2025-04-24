import React from "react";
import { AlertTriangleIcon, ShieldIcon } from "lucide-react";
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";

interface RiskAnalysisProps {
  overallRisk: number;
  risks: Array<{
    category: string;
    likelihood: number;
    impact: number;
    mitigationStrategy: string;
  }>;
  message: string;
}

export function RiskAnalysis({ overallRisk, risks, message }: RiskAnalysisProps) {
  // Sort risks by severity (calculated as likelihood * impact)
  const sortedRisks = [...risks].sort((a, b) => {
    const severityA = (a.likelihood * a.impact) / 100;
    const severityB = (b.likelihood * b.impact) / 100;
    return severityB - severityA;
  });

  // Process data for radar chart
  const radarData = risks.map(risk => ({
    category: risk.category,
    likelihoodScore: risk.likelihood,
    impactScore: risk.impact,
    severity: Math.round((risk.likelihood * risk.impact) / 100),
  }));

  // Function to determine risk color based on severity
  const getRiskColor = (severity: number) => {
    if (severity < 30) return "#22c55e"; // Low risk - green
    if (severity < 60) return "#f59e0b"; // Medium risk - amber
    return "#ef4444"; // High risk - red
  };

  // Overall risk indicator color
  const getOverallRiskColor = (score: number) => {
    if (score < 30) return "#22c55e"; // Low risk - green
    if (score < 60) return "#f59e0b"; // Medium risk - amber
    return "#ef4444"; // High risk - red
  };

  const overallRiskColor = getOverallRiskColor(overallRisk);
  const overallRiskLabel = overallRisk < 30 ? "Low" : (overallRisk < 60 ? "Medium" : "High");

  // Custom tooltip for radar chart
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const severityColor = getRiskColor(data.severity);
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{data.category}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Likelihood:</span> {data.likelihoodScore}%
          </p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Impact:</span> {data.impactScore}%
          </p>
          <p className="text-xs">
            <span className="font-medium">Severity:</span>{" "}
            <span style={{ color: severityColor }}>{data.severity}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Title moved to parent component */}

      {/* Overall risk indicator */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-2">Overall Risk Assessment</h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Risk Level</span>
          <span 
            className="text-sm font-medium"
            style={{ color: overallRiskColor }}
          >
            {overallRiskLabel} ({overallRisk}%)
          </span>
        </div>
        
        {/* Risk level bar */}
        <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full rounded-full" 
            style={{ 
              width: `${overallRisk}%`, 
              backgroundColor: overallRiskColor
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span className="text-green-400">Low Risk</span>
          <span className="text-amber-400">Medium Risk</span>
          <span className="text-red-400">High Risk</span>
        </div>
      </div>

      {/* Risk radar chart */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Risk Profile</h4>
        <p className="text-xs text-white/70 mb-4">Likelihood & Impact Assessment by Category</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="category" 
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
              />
              <PolarRadiusAxis 
                angle={30} 
                domain={[0, 100]} 
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
                stroke="rgba(255,255,255,0.1)"
              />
              <Tooltip content={renderTooltip} />
              <Radar
                name="Likelihood"
                dataKey="likelihoodScore"
                stroke="#56ABFF"
                fill="#56ABFF"
                fillOpacity={0.5}
              />
              <Radar
                name="Impact"
                dataKey="impactScore"
                stroke="#ef4444"
                fill="#ef4444"
                fillOpacity={0.5}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top risks with mitigation strategies */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Key Risks & Mitigation Strategies</h4>
        
        {sortedRisks.map((risk, index) => {
          const severity = Math.round((risk.likelihood * risk.impact) / 100);
          const severityColor = getRiskColor(severity);
          const severityLabel = severity < 30 ? "Low" : (severity < 60 ? "Medium" : "High");
          
          return (
            <div 
              key={index} 
              className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div 
                    className="w-2 h-2 rounded-full mr-2" 
                    style={{ backgroundColor: severityColor }}
                  />
                  <h5 className="text-sm font-medium text-white">{risk.category}</h5>
                </div>
                <span 
                  className="text-xs font-medium px-2 py-1 rounded-full" 
                  style={{ 
                    backgroundColor: `${severityColor}20`,
                    color: severityColor
                  }}
                >
                  {severityLabel} Severity ({severity}%)
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-2 text-xs">
                <div>
                  <p className="text-white/60">Likelihood</p>
                  <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full rounded-full bg-blue-400" 
                      style={{ width: `${risk.likelihood}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="text-white/60">Impact</p>
                  <div className="w-full h-1.5 bg-background/50 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full rounded-full bg-red-400" 
                      style={{ width: `${risk.impact}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="mt-2 bg-vision-purple-100/5 p-2 rounded-md border border-vision-purple-200/10">
                <div className="flex items-center mb-1">
                  <ShieldIcon className="w-3 h-3 mr-1 text-primary" />
                  <p className="text-xs font-medium text-white">Mitigation Strategy</p>
                </div>
                <p className="text-xs text-white/80">{risk.mitigationStrategy}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <AlertTriangleIcon className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}