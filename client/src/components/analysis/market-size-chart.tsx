import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MarketSizeProps {
  segments: Array<{
    name: string;
    percentage: number;
    value?: number;
  }>;
  totalSize?: number;
  message: string;
}

const COLORS = ['#A163F7', '#7551FF', '#CB9FFF', '#0075FF', '#56ABFF'];

export function MarketSizeChart({ segments, totalSize, message }: MarketSizeProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(null);
  };

  // Format data for Recharts
  const chartData = segments.map((segment, index) => ({
    name: segment.name,
    value: segment.percentage,
    actualValue: segment.value,
    fill: COLORS[index % COLORS.length],
  }));

  const totalPercentage = segments.reduce((acc, segment) => acc + segment.percentage, 0);
  const normalizedData = chartData.map(item => ({
    ...item,
    value: (item.value / totalPercentage) * 100, // Normalize to make sure it adds up to 100%
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 backdrop-blur-md border border-border/40 rounded-lg bg-card/90 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-primary">{data.value.toFixed(1)}%</p>
          {data.actualValue && (
            <p className="text-xs text-muted-foreground">{formatCurrency(data.actualValue)}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="relative h-64 w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {totalSize && (
            <div className="text-center z-10 pointer-events-none">
              <p className="text-xs font-medium text-white/60">Total Market</p>
              <p className="text-xl font-bold text-white">{formatCurrency(totalSize)}</p>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={3}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={1500}
              strokeWidth={0}
            >
              {normalizedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  stroke={activeIndex === index ? "#fff" : "transparent"} 
                  strokeWidth={activeIndex === index ? 2 : 0}
                  className="transition-all duration-300"
                  style={{
                    filter: activeIndex === index ? "brightness(1.2) drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "none",
                    opacity: activeIndex === null || activeIndex === index ? 1 : 0.7,
                  }}
                />
              ))}
            </Pie>
            <Tooltip 
              content={<CustomTooltip />} 
              wrapperStyle={{ outline: 'none' }}
            />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              layout="horizontal" 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ paddingTop: '15px' }}
              formatter={(value: string) => (
                <span className="text-xs text-white/80">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="p-4 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm">
        <p className="text-sm text-white/90 leading-relaxed">{message}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {segments.map((segment, i) => (
          <div 
            key={i}
            className="flex flex-col p-3 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/10 backdrop-blur-sm hover:bg-vision-purple-200/20 transition-colors duration-200"
            style={{ borderLeftColor: COLORS[i % COLORS.length], borderLeftWidth: '3px' }}
          >
            <span className="text-xs font-medium text-white/80 mb-1">{segment.name}</span>
            <span className="font-semibold text-lg text-white">{segment.percentage}%</span>
            {segment.value && (
              <span className="text-xs text-white/60 mt-1">
                {formatCurrency(segment.value)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}