import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TimerIcon, BarChart3, TrendingUp, Users, CircleDot, DollarSign } from 'lucide-react';

interface LongTermVisionProps {
  milestones: Array<{
    year: string;
    goals: string[];
    projectedMetrics: {
      revenue?: number;
      users?: number;
      marketShare?: number;
    };
  }>;
  message: string;
}

export function LongTermVision({ milestones, message }: LongTermVisionProps) {
  // For the projections chart
  const chartData = milestones.map(milestone => ({
    year: milestone.year,
    revenue: milestone.projectedMetrics.revenue || 0,
    users: milestone.projectedMetrics.users || 0,
    marketShare: milestone.projectedMetrics.marketShare || 0,
  }));
  
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
  
  // Format user count function
  const formatUserCount = (value: number): string => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    } else {
      return value.toString();
    }
  };
  
  // Custom tooltip
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white mb-2">{label}</p>
          {payload.map((entry: any, index: number) => {
            let formattedValue = entry.value;
            let icon = <TrendingUp className="w-3.5 h-3.5 mr-1.5" />;
            
            if (entry.name === 'revenue') {
              formattedValue = formatCurrency(entry.value);
              icon = <DollarSign className="w-3.5 h-3.5 mr-1.5 text-green-400" />;
            } else if (entry.name === 'users') {
              formattedValue = `${formatUserCount(entry.value)} users`;
              icon = <Users className="w-3.5 h-3.5 mr-1.5 text-blue-400" />;
            } else if (entry.name === 'marketShare') {
              formattedValue = `${entry.value}% share`;
              icon = <BarChart3 className="w-3.5 h-3.5 mr-1.5 text-purple-400" />;
            }
            
            return (
              <p key={index} className="flex items-center text-sm text-white/80 mb-1">
                {icon}
                <span className="capitalize">{entry.name}:</span>
                <span className="ml-2 font-medium" style={{ color: entry.color }}>{formattedValue}</span>
              </p>
            );
          })}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Chart of projections */}
      <div className="mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10 p-3">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          Growth Projections
        </h4>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="year" 
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="revenue"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => formatCurrency(value).replace('$', '')}
                label={{ 
                  value: 'Revenue', 
                  angle: -90, 
                  position: 'insideLeft',
                  style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 }
                }}
              />
              <YAxis 
                yAxisId="users"
                orientation="right"
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => formatUserCount(value)}
                label={{ 
                  value: 'Users', 
                  angle: 90, 
                  position: 'insideRight', 
                  style: { fill: 'rgba(255,255,255,0.7)', fontSize: 12 }
                }}
              />
              <Tooltip content={renderTooltip} />
              
              {/* Only show lines when we have the data */}
              {chartData.some(d => d.revenue > 0) && (
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="revenue" 
                  name="revenue" 
                  stroke="#22c55e" 
                  dot={{ stroke: '#22c55e', strokeWidth: 2, r: 4, fill: '#0B1437' }}
                  activeDot={{ r: 6 }}
                />
              )}
              
              {chartData.some(d => d.users > 0) && (
                <Line 
                  yAxisId="users"
                  type="monotone" 
                  dataKey="users" 
                  name="users" 
                  stroke="#3b82f6" 
                  dot={{ stroke: '#3b82f6', strokeWidth: 2, r: 4, fill: '#0B1437' }}
                  activeDot={{ r: 6 }}
                />
              )}
              
              {chartData.some(d => d.marketShare > 0) && (
                <Line 
                  yAxisId="revenue"
                  type="monotone" 
                  dataKey="marketShare" 
                  name="marketShare" 
                  stroke="#8b5cf6" 
                  strokeDasharray="5 5"
                  dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#0B1437' }}
                  activeDot={{ r: 6 }}
                />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Milestone roadmap */}
      <div className="mb-6">
        <h4 className="text-sm font-medium text-white mb-3 flex items-center">
          <TimerIcon className="w-4 h-4 mr-2 text-primary" />
          Strategic Roadmap
        </h4>
        
        <div className="relative pl-6 border-l border-dashed border-vision-purple-200/20">
          {milestones.map((milestone, index) => (
            <div key={index} className="mb-6 relative">
              {/* Timeline dot */}
              <div className="absolute -left-3 top-0 w-5 h-5 rounded-full bg-vision-purple-100/10 border border-primary flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
              </div>
              
              {/* Milestone header */}
              <div className="mb-2">
                <h4 className="text-md font-medium text-white">{milestone.year}</h4>
              </div>
              
              {/* Milestone content */}
              <div className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10">
                {/* Goals */}
                <div className="mb-3">
                  <h5 className="text-sm font-medium text-white/80 mb-2">Key Objectives</h5>
                  <ul className="space-y-1">
                    {milestone.goals.map((goal, goalIndex) => (
                      <li key={goalIndex} className="flex items-start text-sm text-white/80">
                        <CircleDot className="w-3.5 h-3.5 mr-2 text-primary mt-0.5" />
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Projected metrics */}
                <div className="grid grid-cols-3 gap-2">
                  {milestone.projectedMetrics.revenue !== undefined && (
                    <div className="p-2 rounded-md bg-green-500/5 border border-green-500/20 flex flex-col items-center">
                      <DollarSign className="w-4 h-4 text-green-400 mb-1" />
                      <span className="text-xs text-white/60 mb-1">Revenue</span>
                      <span className="text-sm font-medium text-white">{formatCurrency(milestone.projectedMetrics.revenue)}</span>
                    </div>
                  )}
                  
                  {milestone.projectedMetrics.users !== undefined && (
                    <div className="p-2 rounded-md bg-blue-500/5 border border-blue-500/20 flex flex-col items-center">
                      <Users className="w-4 h-4 text-blue-400 mb-1" />
                      <span className="text-xs text-white/60 mb-1">Users</span>
                      <span className="text-sm font-medium text-white">{formatUserCount(milestone.projectedMetrics.users)}</span>
                    </div>
                  )}
                  
                  {milestone.projectedMetrics.marketShare !== undefined && (
                    <div className="p-2 rounded-md bg-purple-500/5 border border-purple-500/20 flex flex-col items-center">
                      <BarChart3 className="w-4 h-4 text-purple-400 mb-1" />
                      <span className="text-xs text-white/60 mb-1">Market Share</span>
                      <span className="text-sm font-medium text-white">{milestone.projectedMetrics.marketShare}%</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Long-term vision summary */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Long-Term Vision</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}