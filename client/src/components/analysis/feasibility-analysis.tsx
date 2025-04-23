import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Hourglass, DollarSign, Target } from 'lucide-react';

interface Milestone {
  milestone: string;
  score: number;
  description: string;
}

interface BreakEvenPoint {
  timeframe: string;
  investment: number;
}

interface FeasibilityAnalysisProps {
  overallScore: number;
  scalabilityTrajectory: Milestone[];
  breakEvenPoint: BreakEvenPoint;
  message: string;
}

export function FeasibilityAnalysis({ 
  overallScore, 
  scalabilityTrajectory, 
  breakEvenPoint, 
  message 
}: FeasibilityAnalysisProps) {
  
  // Determine feasibility level based on score
  const feasibilityLevel = 
    overallScore >= 80 ? "excellent" :
    overallScore >= 65 ? "good" :
    overallScore >= 50 ? "moderate" :
    overallScore >= 35 ? "challenging" :
    "poor";
    
  const feasibilityColor = 
    feasibilityLevel === "excellent" ? "#22c55e" : // green-500
    feasibilityLevel === "good" ? "#3b82f6" : // blue-500
    feasibilityLevel === "moderate" ? "#f59e0b" : // amber-500
    feasibilityLevel === "challenging" ? "#ef4444" : // red-500
    "#dc2626"; // red-600
    
  const feasibilityText = 
    feasibilityLevel === "excellent" ? "Excellent Feasibility" :
    feasibilityLevel === "good" ? "Good Feasibility" :
    feasibilityLevel === "moderate" ? "Moderate Feasibility" :
    feasibilityLevel === "challenging" ? "Challenging Feasibility" :
    "Poor Feasibility";
  
  // Format for chart data
  const chartData = scalabilityTrajectory.map((milestone, index) => ({
    name: milestone.milestone,
    score: milestone.score,
    pv: milestone.score, // For the chart
    index // To show the index on hover
  }));
  
  // Custom tooltip for line chart
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const milestone = scalabilityTrajectory[data.index];
      
      return (
        <div className="p-3 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md max-w-xs">
          <h4 className="font-medium text-white mb-1">{milestone.milestone}</h4>
          <p className="text-white/80 text-sm mb-1">Score: {milestone.score}%</p>
          <p className="text-white/70 text-xs">{milestone.description}</p>
        </div>
      );
    }
    return null;
  };

  // Format currency amounts
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    } else {
      return `$${amount}`;
    }
  };
  
  return (
    <div className="flex flex-col">
      {/* Overall Score */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="rgba(117, 81, 255, 0.2)"
              strokeWidth="10"
            />
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke={feasibilityColor}
              strokeWidth="10"
              strokeDasharray={`${overallScore * 3.14}, 1000`}
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{overallScore}%</span>
            <span className="text-xs text-white/70">Feasibility</span>
          </div>
        </div>
      </div>
      
      {/* Feasibility level indicator */}
      <div className="flex items-center justify-center mb-6">
        <Target className="w-5 h-5 mr-2" style={{ color: feasibilityColor }} />
        <span className="text-sm font-medium text-white">{feasibilityText}</span>
      </div>
      
      {/* Break-even Point */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-green-400" />
          <h4 className="text-sm font-medium text-white">Break-even Point</h4>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center mb-1">
              <Hourglass className="w-3.5 h-3.5 mr-1.5 text-primary/60" />
              <span className="text-xs text-white/70">Timeframe</span>
            </div>
            <span className="text-sm font-medium text-white">{breakEvenPoint.timeframe}</span>
          </div>
          <div>
            <div className="flex items-center mb-1">
              <DollarSign className="w-3.5 h-3.5 mr-1.5 text-primary/60" />
              <span className="text-xs text-white/70">Investment</span>
            </div>
            <span className="text-sm font-medium text-white">{formatCurrency(breakEvenPoint.investment)}</span>
          </div>
        </div>
      </div>
      
      {/* Scalability Trajectory Chart */}
      <div className="h-64 w-full mb-6">
        <h4 className="text-sm font-medium text-white mb-2">Scalability Trajectory</h4>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              height={60}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip content={renderTooltip} />
            <Line 
              type="monotone" 
              dataKey="pv" 
              stroke="#7551FF" 
              strokeWidth={3}
              dot={{ fill: '#7551FF', strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: '#A163F7' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Milestone Details */}
      <div className="space-y-3 mb-4">
        {scalabilityTrajectory.map((milestone, index) => (
          <div key={index} className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-sm font-medium text-white">{milestone.milestone}</h4>
              <div 
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ 
                  backgroundColor: `rgba(${
                    milestone.score >= 80 ? '34, 197, 94' : 
                    milestone.score >= 65 ? '59, 130, 246' : 
                    milestone.score >= 50 ? '245, 158, 11' : '239, 68, 68'
                  }, 0.2)`,
                  color: `rgb(${
                    milestone.score >= 80 ? '34, 197, 94' : 
                    milestone.score >= 65 ? '59, 130, 246' : 
                    milestone.score >= 50 ? '245, 158, 11' : '239, 68, 68'
                  })`
                }}
              >
                {milestone.score}% Feasible
              </div>
            </div>
            <p className="text-xs text-white/80">{milestone.description}</p>
          </div>
        ))}
      </div>
      
      {/* Feasibility message */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Scalability Assessment</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}