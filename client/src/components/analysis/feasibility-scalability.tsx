import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, Gauge, ArrowUpRight, ArrowDownRight, Landmark } from 'lucide-react';

interface FeasibilityScalabilityProps {
  initialFeasibility: number;
  scalingPoints: Array<{
    milestone: string;
    investment: number;
    potentialReturns: number;
    feasibilityScore: number;
  }>;
  message: string;
}

export function FeasibilityScalability({ initialFeasibility, scalingPoints, message }: FeasibilityScalabilityProps) {
  // Format data for line chart
  const chartData = [
    {
      name: 'Initial',
      investment: 0,
      returns: 0,
      feasibility: initialFeasibility
    },
    ...scalingPoints.map(point => ({
      name: point.milestone,
      investment: point.investment,
      returns: point.potentialReturns,
      feasibility: point.feasibilityScore
    }))
  ];
  
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
  
  // Calculate ROI for each scaling point
  const calculateROI = (investment: number, returns: number): string => {
    if (investment === 0) return 'N/A';
    const roi = ((returns - investment) / investment) * 100;
    return `${roi.toFixed(0)}%`;
  };
  
  // Get the feasibility level description
  const getFeasibilityLevel = (score: number): string => {
    return score >= 80 ? "Highly Feasible" :
           score >= 60 ? "Feasible" :
           score >= 40 ? "Moderately Feasible" :
           score >= 20 ? "Challenging" :
           "Highly Challenging";
  };

  // Get color for feasibility score
  const getFeasibilityColor = (score: number): string => {
    return score >= 80 ? "text-green-400" :
           score >= 60 ? "text-emerald-400" :
           score >= 40 ? "text-amber-400" :
           score >= 20 ? "text-orange-400" :
           "text-red-400";
  };
  
  // Custom tooltip
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="p-3 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white mb-1">{data.name}</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <p className="text-white/80">Investment:</p>
            <p className="text-white text-right">{formatCurrency(data.investment)}</p>
            
            <p className="text-white/80">Potential Returns:</p>
            <p className="text-white text-right">{formatCurrency(data.returns)}</p>
            
            <p className="text-white/80">ROI:</p>
            <p className="text-white text-right">{calculateROI(data.investment, data.returns)}</p>
            
            <p className="text-white/80">Feasibility:</p>
            <p className={`text-right ${getFeasibilityColor(data.feasibility)}`}>
              {data.feasibility}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Get trending direction and percentage for feasibility from initial to last point
  const initialFeas = initialFeasibility;
  const finalFeas = scalingPoints.length > 0 
    ? scalingPoints[scalingPoints.length - 1].feasibilityScore 
    : initialFeasibility;
  
  const feasChange = finalFeas - initialFeas;
  const isFeasUp = feasChange >= 0;

  return (
    <div className="flex flex-col">
      {/* Initial feasibility */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <Gauge className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Initial Feasibility Assessment</h4>
        </div>
        
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-white/80">Feasibility Score</span>
          <div className="flex items-center">
            <span className={`text-lg font-medium ${getFeasibilityColor(initialFeasibility)}`}>
              {initialFeasibility}%
            </span>
          </div>
        </div>
        
        <div className="w-full bg-vision-purple-100/10 rounded-full h-2 mb-1">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${initialFeasibility}%`,
              backgroundColor: initialFeasibility >= 60 ? '#22c55e' : 
                              initialFeasibility >= 40 ? '#f59e0b' : 
                              '#ef4444'
            }}
          ></div>
        </div>
        
        <div className="mt-1 flex justify-end">
          <span className={`text-xs inline-block px-2 py-0.5 rounded-full 
            ${getFeasibilityColor(initialFeasibility)} bg-vision-purple-100/10`}
          >
            {getFeasibilityLevel(initialFeasibility)}
          </span>
        </div>
        
        {/* Feasibility trend if we have scaling points */}
        {scalingPoints.length > 0 && (
          <div className="flex items-center mt-3 text-xs">
            <span className="text-white/80 mr-2">Long-term Trend:</span>
            <div className={`flex items-center ${isFeasUp ? 'text-green-400' : 'text-red-400'}`}>
              {isFeasUp ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              <span>{Math.abs(feasChange).toFixed(0)}% {isFeasUp ? 'Increase' : 'Decrease'}</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Scalability chart */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              yAxisId="left"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(value) => `$${value >= 1000 ? `${value/1000}K` : value}`}
              domain={[0, 'dataMax']}
              label={{ 
                value: 'Investment & Returns', 
                angle: -90, 
                position: 'insideLeft',
                style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 }
              }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickFormatter={(value) => `${value}%`}
              domain={[0, 100]}
              label={{ 
                value: 'Feasibility', 
                angle: 90, 
                position: 'insideRight', 
                style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 }
              }}
            />
            <Tooltip content={renderTooltip} />
            <ReferenceLine y={50} yAxisId="right" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="investment" 
              name="Investment" 
              stroke="#7551FF" 
              dot={{ stroke: '#7551FF', strokeWidth: 2, r: 4, fill: '#0B1437' }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="returns" 
              name="Returns" 
              stroke="#22c55e" 
              dot={{ stroke: '#22c55e', strokeWidth: 2, r: 4, fill: '#0B1437' }}
              activeDot={{ r: 6 }}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="feasibility" 
              name="Feasibility" 
              stroke="#f59e0b" 
              strokeDasharray="5 5"
              dot={{ stroke: '#f59e0b', strokeWidth: 2, r: 4, fill: '#0B1437' }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Scaling points and ROI */}
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium text-white flex items-center mb-2">
          <Landmark className="w-4 h-4 mr-2 text-primary" />
          Scaling Milestones
        </h4>
        
        {chartData.slice(1).map((point, index) => (
          <div 
            key={index}
            className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium text-white">{point.name}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-vision-primary-gradient/10 text-primary">
                {calculateROI(point.investment, point.returns)} ROI
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center text-white/80">
                <ArrowUpRight className="w-3 h-3 mr-1 text-primary" />
                <span>Investment: {formatCurrency(point.investment)}</span>
              </div>
              <div className="flex items-center text-white/80">
                <TrendingUp className="w-3 h-3 mr-1 text-green-400" />
                <span>Returns: {formatCurrency(point.returns)}</span>
              </div>
            </div>
            <div className="mt-1.5 w-full bg-vision-purple-100/10 rounded-full h-1">
              <div 
                className="h-1 rounded-full" 
                style={{ 
                  width: `${point.feasibility}%`,
                  backgroundColor: point.feasibility >= 60 ? '#22c55e' : 
                                 point.feasibility >= 40 ? '#f59e0b' : 
                                 '#ef4444'
                }}
              ></div>
            </div>
            <div className="flex justify-end mt-0.5">
              <span className={`text-[0.65rem] ${getFeasibilityColor(point.feasibility)}`}>
                {point.feasibility}% Feasibility
              </span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Scalability insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Scaling Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}