import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Coins } from "lucide-react";
import { useState } from "react";

interface FeasibilityAnalysisProps {
  overallScore: number;
  scalabilityTrajectory: Array<{
    milestone: string;
    score: number;
    description: string;
  }>;
  breakEvenPoint: {
    timeframe: string;
    investment: number;
  };
  message: string;
}

export function FeasibilityAnalysis({ 
  overallScore, 
  scalabilityTrajectory, 
  breakEvenPoint,
  message 
}: FeasibilityAnalysisProps) {
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null);
  
  // Format the investment value based on scale
  const formatInvestment = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`; // Millions
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`; // Thousands
    } else {
      return `$${value}`;
    }
  };
  
  // Determine feasibility level text
  const getFeasibilityLevelText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Moderate";
    if (score >= 20) return "Challenging";
    return "Very Difficult";
  };
  
  // Get color based on feasibility score
  const getFeasibilityColor = (score: number) => {
    if (score >= 80) return "bg-green-500/30 text-green-500";
    if (score >= 60) return "bg-green-500/20 text-green-400";
    if (score >= 40) return "bg-yellow-500/20 text-yellow-400";
    if (score >= 20) return "bg-orange-500/20 text-orange-400";
    return "bg-red-500/20 text-red-400";
  };
  
  // Prepare chart data
  const chartData = scalabilityTrajectory.map((point, index) => ({
    name: point.milestone,
    score: point.score,
    description: point.description,
    index
  }));
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-xl font-semibold text-white">{overallScore}/100</h3>
          <div className="flex items-center">
            <p className="text-sm text-white/70">Feasibility Score:</p>
            <Badge className={`ml-2 ${getFeasibilityColor(overallScore)}`}>
              {getFeasibilityLevelText(overallScore)}
            </Badge>
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden border-vision-purple-200/20 bg-vision-purple-100/5">
        <CardContent className="p-4">
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-4">
            <div className="flex items-center p-3 border rounded-lg bg-vision-card/80 border-vision-purple-200/10 flex-1">
              <Clock className="w-5 h-5 mr-3 text-primary" />
              <div>
                <p className="text-xs text-white/70">Break-Even Point</p>
                <p className="text-sm font-medium text-white">{breakEvenPoint.timeframe}</p>
              </div>
            </div>
            <div className="flex items-center p-3 border rounded-lg bg-vision-card/80 border-vision-purple-200/10 flex-1">
              <Coins className="w-5 h-5 mr-3 text-primary" />
              <div>
                <p className="text-xs text-white/70">Required Investment</p>
                <p className="text-sm font-medium text-white">{formatInvestment(breakEvenPoint.investment)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <div className="space-y-1">
        <div className="flex items-center text-sm text-white">
          <TrendingUp className="w-4 h-4 mr-1 text-primary" />
          <span>Scalability Trajectory</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}
                tickMargin={10}
                axisLine={{ stroke: '#ffffff30' }}
              />
              <YAxis 
                domain={[0, 100]} 
                tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }}
                axisLine={{ stroke: '#ffffff30' }}
                tickFormatter={(value) => `${value}`}
              />
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <Card className="p-2 border-vision-purple-200/30 bg-vision-card backdrop-blur-md">
                        <CardContent className="p-2 text-sm">
                          <h5 className="font-medium text-white">{data.name}</h5>
                          <p className="text-white/70">Score: {data.score}/100</p>
                          <p className="mt-1 text-xs text-white/80">{data.description}</p>
                        </CardContent>
                      </Card>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke="#7551FF"
                strokeWidth={2}
                activeDot={{ 
                  r: 8, 
                  stroke: '#A163F7', 
                  strokeWidth: 2, 
                  fill: '#7551FF',
                  onMouseOver: (data: any) => setHoveredMilestone(data.payload.index),
                  onMouseLeave: () => setHoveredMilestone(null)
                }}
                dot={{ 
                  r: 4, 
                  fill: '#7551FF' 
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="space-y-3">
        {hoveredMilestone !== null && (
          <div className="p-3 border rounded-lg animate-fadeIn bg-vision-purple-100/10 border-vision-purple-200/20">
            <h4 className="text-sm font-medium text-white">{scalabilityTrajectory[hoveredMilestone].milestone}</h4>
            <p className="mt-1 text-sm text-white/80">{scalabilityTrajectory[hoveredMilestone].description}</p>
          </div>
        )}
        
        <p className="text-sm text-white/80 border-t border-vision-purple-200/20 pt-2">
          {message}
        </p>
      </div>
    </div>
  );
}