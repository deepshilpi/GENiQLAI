import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Globe, BarChart3, DollarSign } from 'lucide-react';

interface MarketSizeChartProps {
  segments: Array<{
    name: string;
    percentage: number;
    value?: number; // In millions
  }>;
  totalSize?: number; // In millions
  message: string;
}

export function MarketSizeChart({ segments, totalSize, message }: MarketSizeChartProps) {
  // Format data for pie chart
  const pieData = segments.map((segment) => ({
    name: segment.name,
    value: segment.percentage,
  }));

  // Colors for pie segments
  const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#0075FF', '#56ABFF'];
  
  // Format currency function
  const formatCurrency = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`;
    } else {
      return `$${value.toFixed(0)}M`;
    }
  };
  
  // Custom tooltip
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Find original segment data with value
      const segmentData = segments.find(segment => segment.name === data.name);
      
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-white/80">{data.value}% of Market</p>
          {segmentData?.value !== undefined && (
            <p className="text-primary text-xs mt-1">
              Est. Value: {formatCurrency(segmentData.value)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Total market size highlight */}
      {totalSize !== undefined && (
        <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <BarChart3 className="w-4 h-4 mr-2 text-primary" />
            <h4 className="text-sm font-medium text-white">Total Addressable Market</h4>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">Estimated Market Size</span>
            <span className="text-lg font-medium text-primary">{formatCurrency(totalSize)}</span>
          </div>
        </div>
      )}
      
      {/* Pie chart */}
      <div className="h-56 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={renderTooltip} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      {/* Market segments list */}
      <div className="mb-4 space-y-2">
        {segments.map((segment, index) => (
          <div 
            key={index}
            className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-sm text-white/80">{segment.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-white mr-3">{segment.percentage}%</span>
                {segment.value !== undefined && (
                  <span className="text-xs text-primary flex items-center">
                    <DollarSign className="w-3 h-3 mr-1" />
                    {formatCurrency(segment.value)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Market size insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Globe className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Market Size Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}