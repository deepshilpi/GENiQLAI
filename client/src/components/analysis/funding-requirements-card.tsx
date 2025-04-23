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
    <div className="space-y-4 sm:space-y-5">
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10">
        <CardContent className="p-4 sm:p-5 text-center">
          <h3 className="text-sm font-medium text-white/70 mb-1">Total Funding Required</h3>
          <div className="relative">
            <div className="absolute inset-0 bg-vision-primary-gradient/20 rounded-full blur-xl"></div>
            <p className="text-3xl font-bold text-white relative">{formatCurrency(total)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {chartData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`colorGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={90}
              innerRadius={35}
              paddingAngle={2}
              fill="#8884d8"
              dataKey="value"
              animationDuration={1500}
              animationBegin={200}
              strokeWidth={1}
              stroke="rgba(255,255,255,0.1)"
            >
              {chartData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#colorGradient-${index})`} 
                  className="drop-shadow-md"
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend 
              layout="horizontal" 
              verticalAlign="bottom" 
              align="center"
              formatter={(value: string) => <span className="text-xs text-white/80">{value}</span>}
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ paddingTop: '15px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {breakdown.map((item, i) => (
          <Card 
            key={i} 
            className="border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-all duration-200"
            style={{
              boxShadow: `0 6px 12px -6px ${COLORS[i % COLORS.length]}33`,
            }}
          >
            <CardContent className="p-3 sm:p-4">
              <div className="mb-2">
                <div 
                  className="w-full h-1 rounded-full mb-2"
                  style={{ 
                    background: `linear-gradient(to right, ${COLORS[i % COLORS.length]}80, ${COLORS[i % COLORS.length]})`
                  }}
                ></div>
                <h4 className="text-sm font-medium text-white truncate" title={item.category}>
                  {item.category}
                </h4>
              </div>
              <div className="flex justify-between items-end mt-1.5">
                <p className="text-lg font-semibold text-white">{formatCurrency(item.amount)}</p>
                <span className="text-xs font-medium bg-vision-purple-200/20 px-2 py-0.5 rounded-full text-white/70">
                  {item.percentage}%
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="p-4 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm">
        <p className="text-sm text-white/90 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}