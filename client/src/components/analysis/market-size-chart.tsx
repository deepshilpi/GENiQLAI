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
    <div className="space-y-6">
      <div className="relative h-72 w-full flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center">
          {totalSize && (
            <div className="text-center z-10 pointer-events-none p-4 bg-vision-purple-200/10 backdrop-blur-md rounded-full border border-vision-purple-200/30">
              <div className="absolute inset-0 bg-vision-primary-gradient/10 rounded-full blur-xl"></div>
              <p className="text-xs font-medium text-white/70 mb-1">Total Available Market</p>
              <p className="text-2xl font-bold text-white relative">{formatCurrency(totalSize)}</p>
            </div>
          )}
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <defs>
              {normalizedData.map((entry, index) => (
                <linearGradient key={`gradient-${index}`} id={`marketSizeGradient-${index}`} x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor={entry.fill} stopOpacity={0.8} />
                  <stop offset="100%" stopColor={entry.fill} stopOpacity={1} />
                </linearGradient>
              ))}
            </defs>
            <Pie
              data={normalizedData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              paddingAngle={4}
              dataKey="value"
              onMouseEnter={onPieEnter}
              onMouseLeave={onPieLeave}
              animationDuration={1800}
              animationBegin={300}
              strokeWidth={1}
              stroke="rgba(255,255,255,0.1)"
            >
              {normalizedData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={`url(#marketSizeGradient-${index})`} 
                  stroke={activeIndex === index ? "#fff" : "rgba(255,255,255,0.1)"} 
                  strokeWidth={activeIndex === index ? 2 : 1}
                  className="transition-all duration-300"
                  style={{
                    filter: activeIndex === index ? "brightness(1.2) drop-shadow(0 0 12px rgba(167, 139, 250, 0.6))" : "none",
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
              iconSize={10}
              wrapperStyle={{ paddingTop: '20px' }}
              formatter={(value: string) => (
                <span className="text-sm text-white/90 font-medium">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="p-5 rounded-lg border border-vision-purple-200/20 bg-gradient-to-br from-vision-purple-100/10 to-vision-purple-100/5 backdrop-blur-sm shadow-inner">
        <p className="text-sm text-white/90 leading-relaxed">{message}</p>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {segments.map((segment, i) => (
          <div 
            key={i}
            className={`flex flex-col p-4 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-all duration-200 ${
              activeIndex === i ? 'ring-2 ring-offset-2 ring-offset-background ring-' + COLORS[i % COLORS.length].replace('#', '') : ''
            }`}
            style={{ 
              boxShadow: `0 4px 12px -2px ${COLORS[i % COLORS.length]}33`,
              borderLeftColor: COLORS[i % COLORS.length], 
              borderLeftWidth: '4px' 
            }}
            onMouseEnter={() => setActiveIndex(i)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white truncate" title={segment.name}>{segment.name}</span>
              <span className="text-xs font-medium bg-vision-purple-200/20 px-2 py-0.5 rounded-full text-white/80">
                {segment.percentage}%
              </span>
            </div>
            {segment.value && (
              <span className="text-lg font-semibold text-white mt-1">
                {formatCurrency(segment.value)}
              </span>
            )}
            <div 
              className="w-full h-1 mt-3 rounded-full opacity-60"
              style={{ background: `linear-gradient(to right, ${COLORS[i % COLORS.length]}80, ${COLORS[i % COLORS.length]})` }}
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
}