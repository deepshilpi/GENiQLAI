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
    <div className="space-y-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={1000}
            >
              {normalizedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.fill} 
                  stroke={activeIndex === index ? "#fff" : "transparent"} 
                  strokeWidth={activeIndex === index ? 2 : 0}
                  className="transition-all duration-200"
                  style={{
                    filter: activeIndex === index ? "brightness(1.2)" : "none",
                    transform: activeIndex === index ? "scale(1.05)" : "none",
                  }}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              align="center" 
              layout="horizontal" 
              iconType="circle" 
              iconSize={8}
              formatter={(value: string) => (
                <span className="text-xs text-foreground/80">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {totalSize && (
        <Card className="bg-primary/10 border-primary/20">
          <CardContent className="p-3 text-center">
            <p className="text-sm text-white/80">Total Market Size</p>
            <p className="text-xl font-bold text-white">{formatCurrency(totalSize)}</p>
          </CardContent>
        </Card>
      )}

      <p className="text-sm text-white/70">{message}</p>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
        {segments.map((segment, i) => (
          <div 
            key={i}
            className="flex flex-col p-2 rounded-md border border-border/50 bg-accent/20"
          >
            <span className="text-xs text-muted-foreground">{segment.name}</span>
            <span className="font-medium text-sm">{segment.percentage}%</span>
            {segment.value && (
              <span className="text-xs text-primary">
                {formatCurrency(segment.value)}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}