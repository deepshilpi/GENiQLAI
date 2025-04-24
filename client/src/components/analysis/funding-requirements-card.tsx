import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { formatCurrency, getCountryCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { FlagIcon } from "../flag-icon";

interface FundingRequirementsProps {
  total: number;
  breakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
    description?: string;
  }>;
  fundingStages?: Array<{
    stage: string;
    amount: number;
    timeline: string;
    milestones: string[];
  }>;
  message: string;
  country?: string;
  currency?: string;
}

const COLORS = ['#7551FF', '#A163F7', '#CB9FFF', '#0075FF', '#56ABFF', '#94C9FF'];

export function FundingRequirementsCard({ 
  total, 
  breakdown, 
  fundingStages,
  message, 
  country = "India",
  currency: currencyCode
}: FundingRequirementsProps) {
  // Get currency based on country
  const currency = getCountryCurrency(country);
  const currToUse = currencyCode || currency.code;
  
  // Format data for recharts
  const chartData = breakdown.map((item, index) => ({
    name: item.category,
    value: item.percentage,
    amount: item.amount,
    description: item.description,
    fill: COLORS[index % COLORS.length],
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-3 backdrop-blur-md border border-border/40 rounded-lg bg-card/90 shadow-lg">
          <p className="font-medium text-sm">{data.name}</p>
          <p className="text-xs text-primary">{formatCurrency(data.amount, currToUse, country, true)}</p>
          <p className="text-xs text-muted-foreground">{data.value.toFixed(1)}%</p>
          {data.description && (
            <p className="text-xs text-white/70 mt-1">{data.description}</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Card 1: Chart and Total */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10 aspect-square md:aspect-auto">
        <CardContent className="p-4 flex flex-col h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-white flex items-center gap-2">
              <FlagIcon country={country} size="sm" />
              <span>Funding Breakdown</span>
            </h3>
            <div className="bg-vision-purple-200/20 px-2 py-0.5 rounded text-xs font-medium text-white">
              {currency.symbol} {currToUse}
            </div>
          </div>
          
          <div className="text-center pt-2 pb-4">
            <div className="bg-vision-purple-200/10 backdrop-blur-sm rounded-lg inline-block py-2 px-4 border border-vision-purple-200/20">
              <p className="text-xs font-medium text-white/70 mb-1">Total Required</p>
              <p className="text-xl md:text-2xl font-bold text-white">
                {formatCurrency(total, currToUse, country, true)}
              </p>
            </div>
          </div>
          
          <div className="flex-grow flex items-center justify-center w-full">
            <ResponsiveContainer width="100%" height={200}>
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
                  outerRadius={80}
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
                  formatter={(value: string) => <span className="text-xs text-white/80 truncate max-w-32">{value}</span>}
                  iconType="circle"
                  iconSize={6}
                  wrapperStyle={{ paddingTop: '15px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Card 2: Breakdown Grid */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10">
        <CardContent className="p-4 h-full flex flex-col">
          <h3 className="text-sm font-medium text-white mb-3">Cost Categories</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-grow overflow-y-auto scrollbar-thin scrollbar-thumb-vision-purple-200/20 pr-1">
            {breakdown.map((item, i) => (
              <div 
                key={i} 
                className="border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm rounded-lg p-2 flex flex-col hover:bg-vision-purple-200/10 transition-all duration-200"
                style={{
                  borderLeftColor: COLORS[i % COLORS.length], 
                  borderLeftWidth: '3px'
                }}
              >
                <div className="mb-1">
                  <h4 className="text-xs font-medium text-white" title={item.category}>
                    {item.category}
                  </h4>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-xs font-semibold text-white">{formatCurrency(item.amount, currToUse, country, true)}</p>
                  <span className="text-xs font-medium bg-vision-purple-200/20 px-1.5 py-0.5 rounded-full text-white/70">
                    {item.percentage}%
                  </span>
                </div>
                {item.description && (
                  <p className="text-xs text-white/60 mt-1 line-clamp-1">{item.description}</p>
                )}
              </div>
            ))}
          </div>
          
          {/* Analysis message at the bottom */}
          <div className="p-3 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm mt-3">
            <p className="text-xs text-white/90 line-clamp-4">{message}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Card 3: Funding Stages Timeline */}
      <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10">
        <CardContent className="p-4 h-full flex flex-col">
          <h3 className="text-sm font-medium text-white mb-3">Funding Timeline</h3>
          
          <div className="flex-grow space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-vision-purple-200/20 pr-1">
            {fundingStages ? (
              fundingStages.map((stage, i) => (
                <div 
                  key={i} 
                  className="border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm rounded-lg p-3 relative pl-5"
                >
                  {/* Timeline dot */}
                  <div 
                    className="absolute top-3 left-2 w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[i % COLORS.length] }}  
                  ></div>
                  
                  {/* Vertical line connecting dots */}
                  {i < fundingStages.length - 1 && (
                    <div 
                      className="absolute top-5 left-3 w-0.5 h-full -translate-x-1/2"
                      style={{ backgroundColor: COLORS[i % COLORS.length] + '40' }}  
                    ></div>
                  )}
                  
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-xs font-medium text-white">{stage.stage}</h4>
                    <span className="text-xs font-medium bg-vision-purple-200/20 px-1.5 py-0.5 rounded text-white/70">
                      {stage.timeline}
                    </span>
                  </div>
                  
                  <p className="text-xs font-semibold text-white mb-2">
                    {formatCurrency(stage.amount, currToUse, country, true)}
                  </p>
                  
                  <div className="space-y-1">
                    {stage.milestones.map((milestone, j) => (
                      <div key={j} className="flex items-start">
                        <span className="text-xs text-vision-purple-200/80 mr-1.5">•</span>
                        <p className="text-xs text-white/70">{milestone}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex-grow flex items-center justify-center">
                <p className="text-xs text-white/60">Funding stages information not available</p>
              </div>
            )}
          </div>
          
          {/* India-specific funding note */}
          <div className="p-3 rounded-lg border border-vision-purple-200/20 bg-vision-purple-100/5 backdrop-blur-sm mt-3">
            <div className="flex items-center gap-2 mb-1">
              <FlagIcon country={country} size="sm" />
              <h5 className="text-xs font-medium text-white">Indian Funding Landscape</h5>
            </div>
            <p className="text-xs text-white/70">Typical seed funding in India ranges from ₹50L to ₹5Cr, with Series A at ₹10-50Cr. Focus on demonstrating market fit and solid unit economics for Indian investors.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}