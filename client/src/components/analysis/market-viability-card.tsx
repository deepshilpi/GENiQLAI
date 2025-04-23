import { AlertTriangle, Check, XCircle } from "lucide-react";

interface MarketViabilityCardProps {
  points: Array<{
    title: string;
    subtitle: string;
    type: 'success' | 'warning' | 'danger';
  }>;
}

export function MarketViabilityCard({ points }: MarketViabilityCardProps) {
  // Sort points by type: success first, then warning, then danger
  const sortedPoints = [...points].sort((a, b) => {
    const typeOrder = { success: 0, warning: 1, danger: 2 };
    return typeOrder[a.type] - typeOrder[b.type];
  });
  
  // Count points by type
  const counts = {
    success: points.filter(p => p.type === 'success').length,
    warning: points.filter(p => p.type === 'warning').length,
    danger: points.filter(p => p.type === 'danger').length
  };
  
  // Determine overall status
  let overallStatus: 'positive' | 'mixed' | 'negative' = 'mixed';
  if (counts.success > (counts.warning + counts.danger)) {
    overallStatus = 'positive';
  } else if (counts.danger > counts.success) {
    overallStatus = 'negative';
  }

  return (
    <div className="flex flex-col">
      {/* Summary section */}
      <div className={`p-4 border rounded-md mb-4 ${
        overallStatus === 'positive' 
          ? 'bg-green-500/10 border-green-500/30' 
          : overallStatus === 'negative'
            ? 'bg-red-500/10 border-red-500/30'
            : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <h4 className="text-sm font-medium text-white mb-1">Market Assessment Summary</h4>
        <p className="text-sm text-white/80">
          {overallStatus === 'positive' 
            ? `This idea shows strong market viability with ${counts.success} positive indicators.`
            : overallStatus === 'negative'
              ? `This idea faces significant market challenges with ${counts.danger} concerning indicators.`
              : `This idea shows mixed market signals with ${counts.success} positive and ${counts.warning + counts.danger} cautionary indicators.`
          }
        </p>
      </div>
      
      {/* Viability points */}
      <div className="space-y-3">
        {sortedPoints.map((point, index) => (
          <div 
            key={index}
            className={`p-3 border rounded-md ${
              point.type === 'success' 
                ? 'bg-green-500/5 border-green-500/20' 
                : point.type === 'warning'
                  ? 'bg-yellow-500/5 border-yellow-500/20'
                  : 'bg-red-500/5 border-red-500/20'
            }`}
          >
            <div className="flex items-start">
              {point.type === 'success' && (
                <Check className="w-4 h-4 mr-2 text-green-400 shrink-0 mt-0.5" />
              )}
              {point.type === 'warning' && (
                <AlertTriangle className="w-4 h-4 mr-2 text-yellow-400 shrink-0 mt-0.5" />
              )}
              {point.type === 'danger' && (
                <XCircle className="w-4 h-4 mr-2 text-red-400 shrink-0 mt-0.5" />
              )}
              
              <div>
                <h5 className="text-sm font-medium text-white">{point.title}</h5>
                <p className="text-xs text-white/70 mt-1">{point.subtitle}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}