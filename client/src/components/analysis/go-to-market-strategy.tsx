import React from "react";
import { Rocket, Calendar, DollarSign, Activity } from "lucide-react";

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
  const totalCost = timeline.reduce((sum, phase) => sum + phase.estimatedCost, 0);
  
  // Get total duration in months (approximation for visualization)
  const getTotalMonths = () => {
    let totalMonths = 0;
    timeline.forEach(phase => {
      const durationMatch = phase.duration.match(/(\d+)/);
      if (durationMatch) {
        const durationNumber = parseInt(durationMatch[0], 10);
        if (phase.duration.toLowerCase().includes("month")) {
          totalMonths += durationNumber;
        } else if (phase.duration.toLowerCase().includes("week")) {
          totalMonths += Math.ceil(durationNumber / 4);
        } else if (phase.duration.toLowerCase().includes("day")) {
          totalMonths += Math.ceil(durationNumber / 30);
        } else if (phase.duration.toLowerCase().includes("year")) {
          totalMonths += durationNumber * 12;
        }
      }
    });
    return totalMonths || 12; // Fallback to 12 if calculation fails
  };

  // Calculate the width percentage for timeline visualization
  const getPhaseWidth = (phase: typeof timeline[0]) => {
    const totalMonths = getTotalMonths();
    const durationMatch = phase.duration.match(/(\d+)/);
    if (!durationMatch) return 0;
    
    const durationNumber = parseInt(durationMatch[0], 10);
    let phaseMonths = 0;
    
    if (phase.duration.toLowerCase().includes("month")) {
      phaseMonths = durationNumber;
    } else if (phase.duration.toLowerCase().includes("week")) {
      phaseMonths = Math.ceil(durationNumber / 4);
    } else if (phase.duration.toLowerCase().includes("day")) {
      phaseMonths = Math.ceil(durationNumber / 30);
    } else if (phase.duration.toLowerCase().includes("year")) {
      phaseMonths = durationNumber * 12;
    }
    
    return (phaseMonths / totalMonths) * 100;
  };

  // Function to get gradient color based on phase index
  const getPhaseColor = (index: number) => {
    const colors = [
      "from-primary/80 to-primary/40",
      "from-blue-500/80 to-blue-500/40",
      "from-indigo-500/80 to-indigo-500/40",
      "from-fuchsia-500/80 to-fuchsia-500/40",
      "from-green-500/80 to-green-500/40",
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-5">
      {/* Title moved to parent component */}

      {/* Timeline visualization */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Implementation Timeline</h4>
        <p className="text-xs text-white/70 mb-4">Estimated execution schedule across all phases</p>
        
        <div className="flex h-8 w-full mb-2 rounded-md overflow-hidden">
          {timeline.map((phase, index) => (
            <div
              key={index}
              className={`relative h-full bg-gradient-to-r ${getPhaseColor(index)}`}
              style={{ width: `${getPhaseWidth(phase)}%` }}
            >
              <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white overflow-hidden truncate px-1">
                {phase.phase}
              </span>
            </div>
          ))}
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span>Start</span>
          <span>Estimated Timeline</span>
          <span>Launch</span>
        </div>
      </div>

      {/* Total cost overview */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-sm font-medium text-white">Total GTM Budget</h4>
          <span className="text-lg font-semibold text-white">₹{totalCost.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {timeline.map((phase, index) => (
            <div 
              key={index} 
              className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
            >
              <p className="text-xs text-white/70 mb-1">{phase.phase}</p>
              <div className="flex justify-between items-baseline">
                <p className="text-sm font-medium text-white">₹{phase.estimatedCost.toLocaleString('en-IN')}</p>
                <p className="text-xs text-primary">{Math.round((phase.estimatedCost / totalCost) * 100)}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed phase cards */}
      <div className="space-y-3">
        {timeline.map((phase, index) => (
          <div 
            key={index} 
            className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center bg-gradient-to-br ${getPhaseColor(index)} mr-3`}>
                  <span className="text-xs font-medium text-white">{index + 1}</span>
                </div>
                <h5 className="text-sm font-medium text-white">{phase.phase}</h5>
              </div>
              <div className="flex items-center">
                <Calendar className="w-3.5 h-3.5 mr-1 text-primary" />
                <span className="text-xs text-white/80">{phase.duration}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <Activity className="w-3.5 h-3.5 mr-1 text-primary" />
                  <h6 className="text-xs font-medium text-white">Key Activities</h6>
                </div>
                <ul className="space-y-1 pl-4">
                  {phase.activities.map((activity, actIndex) => (
                    <li key={actIndex} className="text-xs text-white/80 relative">
                      <span className="absolute -left-3 top-1.5 h-1 w-1 rounded-full bg-primary"></span>
                      {activity}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <div className="flex items-center mb-2">
                  <DollarSign className="w-3.5 h-3.5 mr-1 text-primary" />
                  <h6 className="text-xs font-medium text-white">Budget Allocation</h6>
                </div>
                <div className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs text-white/70">Estimated Cost</span>
                    <span className="text-sm font-medium text-white">₹{phase.estimatedCost.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-white/70">Percentage of Total</span>
                    <span className="text-xs font-medium text-primary">{Math.round((phase.estimatedCost / totalCost) * 100)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Rocket className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Strategy Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}