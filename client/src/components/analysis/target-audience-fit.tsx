import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { Users, Target } from 'lucide-react';

interface TargetAudienceFitProps {
  segments: Array<{
    name: string;
    score: number;
    maxScore: number;
  }>;
  message: string;
  overallFit: number;
}

export function TargetAudienceFit({ segments, message, overallFit }: TargetAudienceFitProps) {
  // Prepare data for radar chart
  const chartData = segments.map(segment => ({
    subject: segment.name,
    A: segment.score,
    fullMark: segment.maxScore
  }));
  
  // Determine fit level and colors
  const fitLevel = 
    overallFit >= 75 ? "excellent" :
    overallFit >= 60 ? "good" :
    overallFit >= 40 ? "moderate" :
    "poor";
  
  const fitColor = 
    fitLevel === "excellent" ? "#22c55e" : // green-500 
    fitLevel === "good" ? "#3b82f6" : // blue-500
    fitLevel === "moderate" ? "#f59e0b" : // amber-500
    "#ef4444"; // red-500
  
  const fitText = 
    fitLevel === "excellent" ? "Excellent Match" :
    fitLevel === "good" ? "Good Match" :
    fitLevel === "moderate" ? "Moderate Match" :
    "Poor Match";
  
  return (
    <div className="flex flex-col">
      {/* Overall Fit Score */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative flex items-center justify-center">
          <div 
            className="w-24 h-24 rounded-full border-8"
            style={{ borderColor: fitColor, opacity: 0.2 }}
          ></div>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{overallFit}%</span>
            <span className="text-xs text-white/70">Overall Fit</span>
          </div>
        </div>
      </div>
      
      {/* Audience fit level indicator */}
      <div className="flex items-center justify-center mb-4">
        <Target className="w-5 h-5 mr-2" style={{ color: fitColor }} />
        <span className="text-sm font-medium text-white">{fitText}</span>
      </div>
      
      {/* Radar chart visualization */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
            <PolarGrid stroke="rgba(255,255,255,0.2)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 10]} 
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10 }}
              stroke="rgba(255,255,255,0.1)"
            />
            <Radar 
              name="Audience Fit" 
              dataKey="A" 
              stroke="#7551FF" 
              fill="#7551FF" 
              fillOpacity={0.4} 
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Segment details */}
      <div className="grid gap-2 mb-4">
        {segments.map((segment, index) => (
          <div key={index} className="flex justify-between items-center p-2 rounded-md bg-vision-purple-100/5 border-vision-purple-200/10 border">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-2 text-primary/70" />
              <span className="text-sm text-white">{segment.name}</span>
            </div>
            <div className="flex items-center">
              <div className="h-2 w-16 bg-vision-purple-200/20 rounded-full overflow-hidden mr-2">
                <div 
                  className="h-full bg-primary" 
                  style={{ width: `${(segment.score / segment.maxScore) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-white/70">{segment.score}/{segment.maxScore}</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Audience message */}
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