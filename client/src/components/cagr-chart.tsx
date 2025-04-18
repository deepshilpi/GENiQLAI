import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  TooltipProps
} from "recharts";

interface CagrChartProps {
  data: {
    years: string[];
    industryAverageData: number[];
    potentialData: number[];
  };
}

export function CagrChart({ data }: CagrChartProps) {
  // Transform the data into format required by Recharts
  const chartData = data.years.map((year, index) => ({
    year,
    industry: data.industryAverageData[index],
    potential: data.potentialData[index]
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-2 border border-border rounded-md shadow-md">
          <p className="text-sm mb-1">{`Year: ${label}`}</p>
          <p className="text-xs text-primary">{`Industry: ${payload[0].value}%`}</p>
          <p className="text-xs text-success">{`Potential: ${payload[1].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={chartData}
        margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.05)" />
        <XAxis 
          dataKey="year" 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
        />
        <YAxis 
          tick={{ fill: "hsl(var(--muted-foreground))" }}
          axisLine={{ stroke: "rgba(255, 255, 255, 0.05)" }}
          tickFormatter={(value) => `${value}%`}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="industry"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="potential"
          stroke="hsl(var(--success))"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
