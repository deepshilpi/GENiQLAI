import React from "react";
import { LineChart, TrendingUp, Target, UserCheck, BarChart3 } from "lucide-react";
import { 
  Area, 
  AreaChart, 
  Bar, 
  ComposedChart, 
  Legend, 
  Line, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis, 
  YAxis 
} from "recharts";

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
  // Prepare data for the charts
  const chartData = milestones.map(milestone => ({
    name: milestone.year,
    revenue: milestone.projectedMetrics.revenue || 0,
    users: milestone.projectedMetrics.users || 0,
    marketShare: milestone.projectedMetrics.marketShare || 0,
  }));

  // Custom tooltip for the chart
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-xs text-white/80">
              <span 
                className="inline-block w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: entry.color }}
              />
              <span className="font-medium">{entry.name}:</span>{" "}
              {entry.name === "Revenue" ? "₹" : ""}
              {entry.name === "Revenue" || entry.name === "Users" 
                ? entry.value.toLocaleString('en-IN') 
                : `${entry.value}%`}
              {entry.name === "Users" ? " users" : ""}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <TrendingUp className="w-5 h-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium text-white">Long-Term Vision</h3>
      </div>

      {/* Growth projection chart */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Growth Projections</h4>
        <p className="text-xs text-white/70 mb-4">Revenue, Users, and Market Share Over Time</p>
        
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A163F7" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#A163F7" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0075FF" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#0075FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="left"
                orientation="left"
                tickFormatter={(value) => `₹${value/1000}k`}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                tickFormatter={(value) => `${value/1000}k`}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              />
              <YAxis 
                yAxisId="market"
                orientation="right"
                tickFormatter={(value) => `${value}%`}
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={renderTooltip} />
              <Legend 
                wrapperStyle={{ fontSize: '10px', bottom: 0 }}
                iconType="circle"
                iconSize={8}
              />
              <Area 
                yAxisId="left"
                type="monotone" 
                dataKey="revenue" 
                name="Revenue" 
                stroke="#A163F7" 
                fillOpacity={0.3}
                fill="url(#colorRevenue)" 
                strokeWidth={2}
              />
              <Area 
                yAxisId="right"
                type="monotone" 
                dataKey="users" 
                name="Users" 
                stroke="#0075FF" 
                fillOpacity={0.3}
                fill="url(#colorUsers)" 
                strokeWidth={2}
              />
              <Bar 
                yAxisId="market"
                dataKey="marketShare" 
                name="Market Share" 
                fill="#22c55e"
                radius={[4, 4, 0, 0]}
                fillOpacity={0.8}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Milestone timeline cards */}
      <div className="space-y-4">
        {milestones.map((milestone, index) => (
          <div 
            key={index} 
            className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20"
          >
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-vision-primary-gradient mr-3">
                  <Target className="h-4 w-4 text-white" />
                </div>
                <h5 className="text-sm font-medium text-white">{milestone.year}</h5>
              </div>
              
              <div className="flex space-x-2">
                {milestone.projectedMetrics.revenue && (
                  <div className="px-2 py-1 rounded-md bg-primary/10 flex items-center">
                    <BarChart3 className="h-3 w-3 text-primary mr-1" />
                    <span className="text-xs text-primary">
                      ₹{milestone.projectedMetrics.revenue.toLocaleString('en-IN')}
                    </span>
                  </div>
                )}
                {milestone.projectedMetrics.users && (
                  <div className="px-2 py-1 rounded-md bg-blue-500/10 flex items-center">
                    <UserCheck className="h-3 w-3 text-blue-400 mr-1" />
                    <span className="text-xs text-blue-400">
                      {milestone.projectedMetrics.users.toLocaleString('en-IN')} users
                    </span>
                  </div>
                )}
                {milestone.projectedMetrics.marketShare && (
                  <div className="px-2 py-1 rounded-md bg-green-500/10 flex items-center">
                    <LineChart className="h-3 w-3 text-green-400 mr-1" />
                    <span className="text-xs text-green-400">
                      {milestone.projectedMetrics.marketShare}% market
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-3 bg-vision-purple-100/5 rounded-md">
              <h6 className="text-xs font-medium text-white mb-2">Key Objectives</h6>
              <ul className="space-y-1 pl-1">
                {milestone.goals.map((goal, goalIndex) => (
                  <li key={goalIndex} className="text-xs text-white/80 flex items-start">
                    <span className="inline-block h-4 w-4 flex-shrink-0 text-primary mr-1">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                    </span>
                    {goal}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <TrendingUp className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Long-Term Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}