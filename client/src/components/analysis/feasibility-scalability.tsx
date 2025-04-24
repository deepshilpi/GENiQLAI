import React from "react";
import { ScaleIcon, ArrowRightCircleIcon, LineChart as LineChartIcon } from "lucide-react";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from "recharts";

interface FeasibilityAndScalabilityProps {
  initialFeasibility: number;
  scalingPoints: Array<{
    milestone: string;
    investment: number;
    potentialReturns: number;
    feasibilityScore: number;
  }>;
  message: string;
}

export function FeasibilityScalability({ 
  initialFeasibility, 
  scalingPoints, 
  message 
}: FeasibilityAndScalabilityProps) {
  // Prepare data for chart
  const chartData = [
    {
      name: "Initial",
      investment: 0,
      return: 0,
      feasibility: initialFeasibility,
    },
    ...scalingPoints.map((point) => ({
      name: point.milestone,
      investment: point.investment,
      return: point.potentialReturns,
      feasibility: point.feasibilityScore,
    })),
  ];

  // Function to determine the feasibility status and color
  const getFeasibilityStatus = (score: number) => {
    if (score >= 70) return { status: "High", color: "#22c55e" };
    if (score >= 40) return { status: "Medium", color: "#f59e0b" };
    return { status: "Low", color: "#ef4444" };
  };

  const initialStatus = getFeasibilityStatus(initialFeasibility);

  // Prepare milestone cards data
  const getFeasibilityIndicator = (score: number) => {
    if (score >= 70) return "bg-green-500/20 text-green-400";
    if (score >= 40) return "bg-amber-500/20 text-amber-400";
    return "bg-red-500/20 text-red-400";
  };

  // Custom tooltip for the chart
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{data.name}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Feasibility:</span>{" "}
            <span style={{ color: getFeasibilityStatus(data.feasibility).color }}>
              {data.feasibility}%
            </span>
          </p>
          {data.name !== "Initial" && (
            <>
              <p className="text-xs text-white/80">
                <span className="font-medium">Investment:</span> ${data.investment.toLocaleString()}
              </p>
              <p className="text-xs text-white/80">
                <span className="font-medium">Potential Return:</span> ${data.return.toLocaleString()}
              </p>
            </>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      {/* Remove duplicate title */}

      {/* Initial feasibility score */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-2">Initial Feasibility Assessment</h4>
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-white/70">Feasibility Score</span>
          <span 
            className="text-sm font-medium"
            style={{ color: initialStatus.color }}
          >
            {initialFeasibility}%
          </span>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-2 bg-background/50 rounded-full overflow-hidden mb-2">
          <div 
            className="h-full rounded-full" 
            style={{ 
              width: `${initialFeasibility}%`, 
              backgroundColor: initialStatus.color 
            }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>
      </div>

      {/* Scaling chart */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Scaling Path</h4>
        <p className="text-xs text-white/70 mb-4">Investment vs. Return Potential Over Time</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="left"
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                domain={[0, 100]}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={renderTooltip} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" yAxisId="left" />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="investment"
                name="Investment"
                stroke="#A163F7"
                activeDot={{ r: 6, fill: "#A163F7" }}
                strokeWidth={2}
              />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="return"
                name="Potential Return"
                stroke="#0075FF"
                activeDot={{ r: 6, fill: "#0075FF" }}
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="feasibility"
                name="Feasibility"
                stroke="#22c55e"
                strokeDasharray="5 5"
                activeDot={{ r: 6, fill: "#22c55e" }}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key milestones cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {scalingPoints.map((point, index) => (
          <div 
            key={index} 
            className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20 flex flex-col"
          >
            <div className="flex items-center mb-2">
              <div className={`w-2 h-2 rounded-full mr-2 ${getFeasibilityIndicator(point.feasibilityScore)}`} />
              <h5 className="text-sm font-medium text-white">{point.milestone}</h5>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <div className="text-xs">
                <p className="text-white/60">Investment</p>
                <p className="text-sm text-white">₹{point.investment.toLocaleString('en-IN')}</p>
              </div>
              <div className="text-xs">
                <p className="text-white/60">Potential Return</p>
                <p className="text-sm text-white">₹{point.potentialReturns.toLocaleString('en-IN')}</p>
              </div>
            </div>
            <div className="mt-auto text-xs">
              <p className="text-white/60">Feasibility</p>
              <p 
                className="text-sm font-medium" 
                style={{ color: getFeasibilityStatus(point.feasibilityScore).color }}
              >
                {point.feasibilityScore}% - {getFeasibilityStatus(point.feasibilityScore).status}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <LineChartIcon className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Scaling Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}