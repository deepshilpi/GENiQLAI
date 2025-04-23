import { PieChart as LucidePieChart } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface MarketSizeChartProps {
  total: number;
  segments: Array<{
    name: string;
    value: number;
    percentage: number;
  }>;
  cagr: number;
  message: string;
}

export function MarketSizeChart({ total, segments, cagr, message }: MarketSizeChartProps) {
  // Format the market size value based on scale
  const formatMarketSize = (value: number): string => {
    if (value >= 1000000000000) {
      return `$${(value / 1000000000000).toFixed(1)}T`; // Trillions
    } else if (value >= 1000000000) {
      return `$${(value / 1000000000).toFixed(1)}B`; // Billions
    } else if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`; // Millions
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}K`; // Thousands
    } else {
      return `$${value}`;
    }
  };

  // Colors for pie chart segments
  const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#D8BFFF', '#E5D8FF', '#F0EAFF'];
  
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold text-white">{formatMarketSize(total)}</h3>
          <p className="text-sm text-white/70">Total Market Size</p>
        </div>
        <Badge className="px-2 py-1 bg-green-500/20 text-green-500">
          {cagr > 0 ? '+' : ''}{cagr}% CAGR
        </Badge>
      </div>
      
      <div className="h-64">
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
              nameKey="name"
            >
              {segments.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [formatMarketSize(value as number), "Market Size"]}
              contentStyle={{ 
                backgroundColor: 'rgba(17, 8, 60, 0.9)', 
                borderColor: 'rgba(203, 159, 255, 0.3)',
                borderRadius: '8px', 
                color: 'white' 
              }}
            />
            <Legend 
              formatter={(value, entry, index) => (
                <span style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                  {value} ({segments[index].percentage}%)
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      
      <div className="p-3 mt-2 border rounded-lg bg-vision-purple-100/5 border-vision-purple-200/20">
        <div className="flex items-start space-x-2">
          <LucidePieChart className="flex-shrink-0 w-5 h-5 mt-0.5 text-primary" />
          <p className="text-sm text-white/80">{message}</p>
        </div>
      </div>
    </div>
  );
}