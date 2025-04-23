import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Users, Target } from 'lucide-react';

interface TargetAudienceFitProps {
  segments: Array<{
    name: string;
    score: number;
  }>;
  message: string;
}

export function TargetAudienceFit({ segments, message }: TargetAudienceFitProps) {
  // Sort segments by score (descending)
  const sortedSegments = [...segments].sort((a, b) => b.score - a.score);
  const bestFitSegment = sortedSegments[0];
  
  // Format data for radar chart
  const radarData = segments.map(segment => ({
    subject: segment.name,
    score: segment.score,
    fullMark: 100
  }));
  
  return (
    <div className="flex flex-col">
      {/* Best audience fit highlight */}
      {bestFitSegment && (
        <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <Target className="w-4 h-4 mr-2 text-green-400" />
            <h4 className="text-sm font-medium text-white">Best Audience Fit</h4>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">{bestFitSegment.name}</span>
            <span className="text-sm font-medium text-white">{bestFitSegment.score}% Match</span>
          </div>
        </div>
      )}
      
      {/* Radar chart */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
            <PolarGrid stroke="rgba(255,255,255,0.1)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 10 }}
              tickCount={5}
              stroke="rgba(255,255,255,0.1)"
            />
            <Radar
              name="Audience Fit"
              dataKey="score"
              stroke="#7551FF"
              fill="#7551FF"
              fillOpacity={0.4}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Audience segments list */}
      <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {sortedSegments.map((segment, index) => {
          const scoreLevel = 
            segment.score >= 80 ? "Excellent" :
            segment.score >= 60 ? "Strong" :
            segment.score >= 40 ? "Moderate" :
            segment.score >= 20 ? "Limited" :
            "Poor";
            
          const scoreColor = 
            segment.score >= 80 ? "text-green-400" :
            segment.score >= 60 ? "text-emerald-400" :
            segment.score >= 40 ? "text-amber-400" :
            segment.score >= 20 ? "text-orange-400" :
            "text-red-400";
          
          return (
            <div 
              key={index}
              className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
            >
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/80">{segment.name}</span>
                <span className={`text-xs font-medium ${scoreColor}`}>{segment.score}%</span>
              </div>
              <div className="mt-1 w-full bg-vision-purple-100/10 rounded-full h-1.5">
                <div 
                  className="h-1.5 rounded-full" 
                  style={{ 
                    width: `${segment.score}%`,
                    backgroundColor: segment.score >= 60 ? '#22c55e' : 
                                    segment.score >= 40 ? '#f59e0b' : 
                                    '#ef4444'
                  }}
                ></div>
              </div>
              <div className="mt-1 text-[0.65rem] text-right text-white/60">{scoreLevel} Fit</div>
            </div>
          );
        })}
      </div>
      
      {/* Audience insight summary */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Audience Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}