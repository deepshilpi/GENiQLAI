import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency, getCountryCurrency, getCountryMarketData } from "@/lib/utils";
import { FlagIcon } from "../flag-icon";

interface MarketSizeProps {
  segments: Array<{
    name: string;
    percentage: number;
    value?: number;
    growth?: number;
  }>;
  totalSize?: number;
  cagr?: number;
  message: string;
  country?: string;
  currency?: string;
  countryInsights?: {
    currency: string;
    marketGrowthRate: number;
  };
}

const COLORS = ['#A163F7', '#7551FF', '#CB9FFF', '#0075FF', '#56ABFF', '#94C9FF'];

export function MarketSizeChart({ 
  segments, 
  totalSize, 
  cagr,
  message, 
  country = "India", 
  currency: currencyCode,
  countryInsights
}: MarketSizeProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Get currency based on country
  const currency = getCountryCurrency(country);
  const currToUse = currencyCode || currency.code;

  // Format data for Recharts
  const chartData = segments.map((segment, index) => ({
    name: segment.name,
    value: segment.percentage,
    actualValue: segment.value,
    growth: segment.growth,
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
            <p className="text-xs text-muted-foreground">{formatCurrency(data.actualValue, currToUse, country, true)}</p>
          )}
          {data.growth && (
            <p className="text-xs text-green-400">Growth: +{data.growth}% YoY</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Square card for the chart */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10 md:col-span-2 aspect-square md:aspect-auto">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <FlagIcon country={country} size="sm" />
              <h4 className="text-sm font-medium text-white">Market Segments</h4>
            </div>
            {cagr && (
              <div className="bg-green-500/20 text-green-400 text-xs px-2 py-1 rounded-md font-medium">
                CAGR: {cagr}%
              </div>
            )}
          </div>
          
          <div className="relative flex-1 flex items-center justify-center">
            {totalSize && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                <div className="text-center p-4 bg-card/30 backdrop-blur-md rounded-lg border border-vision-purple-200/20 w-40">
                  <p className="text-xs font-medium text-white/70 mb-1">Total Market</p>
                  <p className="text-lg md:text-xl font-bold text-white">
                    {formatCurrency(totalSize, currToUse, country, true)}
                  </p>
                </div>
              </div>
            )}
            
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
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                  onMouseEnter={(_, index) => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  animationDuration={1500}
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
                        filter: activeIndex === index ? "drop-shadow(0 0 8px rgba(167, 139, 250, 0.5))" : "none",
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
                  iconSize={6}
                  wrapperStyle={{ paddingTop: '10px' }}
                  formatter={(value: string) => (
                    <span className="text-xs text-white/90 font-medium">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Market segments grid at the bottom */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2 max-h-28 overflow-y-auto scrollbar-thin scrollbar-thumb-vision-purple-200/20 scrollbar-track-transparent pr-1">
            {segments.map((segment, i) => (
              <div 
                key={i}
                className={`flex flex-col p-2 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-all duration-200 ${
                  activeIndex === i ? 'ring-1 ring-' + COLORS[i % COLORS.length] : ''
                }`}
                style={{ 
                  borderLeftColor: COLORS[i % COLORS.length], 
                  borderLeftWidth: '3px' 
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white truncate" title={segment.name}>{segment.name}</span>
                  <span className="text-xs font-medium bg-vision-purple-200/20 px-1.5 py-0.5 rounded-full text-white/80">
                    {segment.percentage}%
                  </span>
                </div>
                {segment.value && (
                  <span className="text-xs sm:text-sm font-semibold text-white/90 mt-1">
                    {formatCurrency(segment.value, currToUse, country, true)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Market Analysis Card */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10">
        <CardContent className="p-4 h-full flex flex-col">
          <div className="flex items-center mb-3">
            <FlagIcon country={country} size="md" />
            <h4 className="text-sm font-semibold text-white ml-2">Market Analysis</h4>
          </div>
          
          <div className="bg-card/30 rounded-lg p-3 border border-vision-purple-200/20 mb-3 flex-grow">
            <p className="text-xs md:text-sm text-white/90 leading-relaxed">{message}</p>
          </div>
          
          {/* Currency info */}
          <div className="bg-card/30 rounded-lg p-3 border border-vision-purple-200/20 mb-3">
            <h5 className="text-xs font-semibold text-white/80 mb-2">Currency Information</h5>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-vision-purple-200/20">
                  <span className="text-xs font-bold">{countryInsights?.currency || currency.symbol}</span>
                </div>
                <span className="text-xs text-white/90">{currency.code}</span>
              </div>
              <div className="bg-vision-purple-200/20 px-2 py-0.5 rounded text-xs">
                Growth: +{countryInsights?.marketGrowthRate || getCountryMarketData(country).growthRate}%
              </div>
            </div>
          </div>
          
          {/* Country-specific market insights - compact version */}
          <div className="bg-card/30 rounded-lg p-3 border border-vision-purple-200/20">
            <h5 className="text-xs font-semibold text-white/80 mb-2">Market Factors</h5>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="text-white/70">Maturity: {getCountryMarketData(country).maturity}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="text-white/70">Competition: {getCountryMarketData(country).competitiveIntensity}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="text-white/70">Adoption: {getCountryMarketData(country).consumerAdoption}</span>
              </div>
              <div className="flex items-center">
                <div className="w-2 h-2 rounded-full bg-primary mr-1.5"></div>
                <span className="text-white/70">Regulation: {getCountryMarketData(country).regulatoryEnvironment}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}