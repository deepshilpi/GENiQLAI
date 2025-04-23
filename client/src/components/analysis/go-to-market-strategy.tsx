import { Compass, CalendarDays, PackageCheck, Clock, DollarSign } from 'lucide-react';

interface GoToMarketStrategyProps {
  timeline: Array<{
    phase: string;
    duration: string;
    activities: string[];
    estimatedCost: number;
  }>;
  message: string;
}

export function GoToMarketStrategy({ timeline, message }: GoToMarketStrategyProps) {
  // Calculate total estimated cost
  const totalCost = timeline.reduce((total, phase) => total + phase.estimatedCost, 0);
  
  // Format currency function
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };
  
  // Calculate percentage of total cost for each phase
  const timelineWithPercentage = timeline.map(phase => ({
    ...phase,
    percentage: (phase.estimatedCost / totalCost) * 100
  }));

  return (
    <div className="flex flex-col">
      {/* Total cost summary */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-green-400" />
          <h4 className="text-sm font-medium text-white">GTM Investment</h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Total Go-to-Market Cost</span>
          <span className="text-xl font-medium text-green-400">{formatCurrency(totalCost)}</span>
        </div>
      </div>
      
      {/* Timeline visualization */}
      <div className="mb-6 relative pl-6 border-l border-dashed border-vision-purple-200/20">
        {timelineWithPercentage.map((phase, index) => (
          <div key={index} className="mb-8 relative">
            {/* Timeline dot */}
            <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-vision-purple-100/10 border border-primary flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
            </div>
            
            {/* Phase header */}
            <div className="mb-3">
              <h4 className="text-md font-medium text-white">{phase.phase}</h4>
              <div className="flex items-center text-xs text-white/60 mt-1">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                <span>{phase.duration}</span>
                <span className="mx-2">•</span>
                <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                <span>{formatCurrency(phase.estimatedCost)}</span>
                <span className="ml-1 text-primary">({phase.percentage.toFixed(0)}%)</span>
              </div>
            </div>
            
            {/* Phase activities */}
            <div className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10 space-y-2">
              {phase.activities.map((activity, actIndex) => (
                <div key={actIndex} className="flex items-start">
                  <PackageCheck className="w-4 h-4 mr-2 text-primary mt-0.5" />
                  <span className="text-sm text-white/80">{activity}</span>
                </div>
              ))}
            </div>
            
            {/* Cost breakdown bar */}
            <div className="mt-2 w-full bg-vision-purple-100/10 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full bg-primary" 
                style={{ width: `${phase.percentage}%` }}
              ></div>
            </div>
            <div className="mt-1 flex justify-between text-xs text-white/60">
              <span>Budget Allocation</span>
              <span>{formatCurrency(phase.estimatedCost)} ({phase.percentage.toFixed(0)}%)</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Go-to-market strategy summary */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Compass className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Go-to-Market Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
      
      <div className="mt-4 text-xs text-center text-white/60 flex items-center justify-center">
        <CalendarDays className="w-3.5 h-3.5 mr-2" />
        <span>A step-by-step timeline to bring your product to market</span>
      </div>
    </div>
  );
}