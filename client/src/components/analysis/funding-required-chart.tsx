import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DollarSign, PiggyBank, CreditCard } from 'lucide-react';

interface FundingRequiredChartProps {
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  message: string;
}

export function FundingRequiredChart({ total, breakdown, message }: FundingRequiredChartProps) {
  // Format data for pie chart
  const pieData = breakdown.map(item => ({
    name: item.category,
    value: item.percentage,
  }));

  // Colors for pie segments
  const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#0075FF', '#56ABFF', '#94C9FF'];
  
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
  
  // Custom tooltip
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      // Find original breakdown data with amount
      const item = breakdown.find(item => item.category === data.name);
      
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-white/80">{data.value}% of Total</p>
          {item && (
            <p className="text-primary text-xs mt-1">
              {formatCurrency(item.amount)}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Total funding required */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-green-400" />
          <h4 className="text-sm font-medium text-white">Total Funding Required</h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Estimated Capital Needs</span>
          <span className="text-xl font-medium text-green-400">{formatCurrency(total)}</span>
        </div>
      </div>
      
      {/* Pie chart */}
      <div className="h-56 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
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
      
      {/* Funding breakdown */}
      <div className="mb-4 space-y-2">
        <h4 className="text-sm font-medium text-white flex items-center mb-2">
          <CreditCard className="w-4 h-4 mr-2 text-primary" />
          Capital Allocation
        </h4>
        {breakdown.map((item, index) => (
          <div 
            key={index}
            className="p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="mr-2 h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-sm text-white/80">{item.category}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs text-white/60">{item.percentage}%</span>
                <span className="text-sm text-white">{formatCurrency(item.amount)}</span>
              </div>
            </div>
            <div className="mt-1 w-full bg-vision-purple-100/10 rounded-full h-1.5">
              <div 
                className="h-1.5 rounded-full" 
                style={{ 
                  width: `${item.percentage}%`,
                  backgroundColor: COLORS[index % COLORS.length]
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Funding insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <PiggyBank className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Funding Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}