import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Globe, TrendingUp } from 'lucide-react';

interface MarketSegment {
  name: string;
  value: number;
  percentage: number;
}

interface MarketSizeChartProps {
  total: number;
  segments: MarketSegment[];
  cagr: number;
  message: string;
}

export function MarketSizeChart({ total, segments, cagr, message }: MarketSizeChartProps) {
  // Colors for the pie chart segments
  const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#0075FF', '#56ABFF'];
  
  // Format large numbers with K, M, B suffixes
  const formatValue = (value: number) => {
    if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`;
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`;
    } else {
      return `$${value}`;
    }
  };
  
  // Custom tooltip for pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-white/80">{formatValue(data.value)}</p>
          <p className="text-white/80">{data.percentage}% of market</p>
        </div>
      );
    }
    
    return null;
  };
  
  // Render the custom legends
  const renderCustomLegend = () => {
    return (
      <div className="grid grid-cols-2 gap-2 mt-4">
        {segments.map((entry, index) => (
          <div key={index} className="flex items-center">
            <div 
              className="w-3 h-3 rounded-sm mr-2" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-xs text-white/80">{entry.name}</span>
          </div>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col">
      {/* Total Market Size */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <Globe className="w-4 h-4 mr-2 text-blue-400" />
          <h4 className="text-sm font-medium text-white">Total Market Size</h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Annual Value</span>
          <span className="text-lg font-semibold text-white">
            {formatValue(total)}
          </span>
        </div>
        <div className="flex items-center mt-2">
          <TrendingUp className="w-4 h-4 mr-1 text-green-400" />
          <span className="text-xs text-green-400">{cagr}% Annual Growth (CAGR)</span>
        </div>
      </div>
      
      {/* Pie Chart visualization */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={segments}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {renderCustomLegend()}
      </div>
      
      {/* Segment breakdown */}
      <div className="space-y-2 mb-4">
        {segments.map((segment, index) => (
          <div key={index} className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-white">{segment.name}</span>
              <span className="text-sm font-medium text-white">{formatValue(segment.value)}</span>
            </div>
            <div className="h-1.5 w-full bg-vision-purple-200/20 rounded-full overflow-hidden">
              <div 
                className="h-full" 
                style={{ 
                  width: `${segment.percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length]
                }}
              ></div>
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-white/70">{segment.percentage}%</span>
            </div>
          </div>
        ))}
      </div>
      
      {/* Market insight message */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Globe className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Market Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}