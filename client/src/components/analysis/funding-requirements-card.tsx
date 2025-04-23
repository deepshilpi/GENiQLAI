import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface FundingRequirementsProps {
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  message: string;
}

const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#0075FF', '#56ABFF', '#8884d8'];

export function FundingRequirementsCard({ total, breakdown, message }: FundingRequirementsProps) {
  // Format data for recharts
  const chartData = breakdown.map((item, index) => ({
    name: item.category,
    value: item.percentage,
    amount: item.amount,
    fill: COLORS[index % COLORS.length],
  }));

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="#fff" 
        textAnchor="middle" 
        dominantBaseline="central"
        className="text-xs"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 backdrop-blur-md border border-border/40 rounded-lg bg-card/90 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-primary">{formatCurrency(data.amount)}</p>
          <p className="text-xs text-muted-foreground">{data.value.toFixed(1)}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4 text-center">
          <p className="text-sm text-white/80">Total Funding Required</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
        </CardContent>
      </Card>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1000}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value: string) => <span className="text-xs text-foreground/80">{value}</span>}
              iconType="circle"
              iconSize={8}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {breakdown.map((item, i) => (
          <Card key={i} className="border-border/30 bg-card/50">
            <CardContent className="p-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">{item.category}</span>
                <span className="text-xs font-medium">{item.percentage}%</span>
              </div>
              <p className="text-sm font-medium">{formatCurrency(item.amount)}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <p className="text-sm text-white/70">{message}</p>
    </div>
  );
}