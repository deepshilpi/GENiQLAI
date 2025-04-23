import { ExternalLink } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface CompetitorsChartProps {
  competitors: Array<{
    name: string;
    marketShare: number;
  }>;
  message: string;
}

export function CompetitorsChart({ competitors, message }: CompetitorsChartProps) {
  // Sort competitors by market share (descending)
  const sortedCompetitors = [...competitors].sort((a, b) => b.marketShare - a.marketShare);

  // Generate chart data with colors
  const chartData = sortedCompetitors.map((competitor, index) => ({
    ...competitor,
    color: `hsl(${(index * 40) % 360}, 70%, 60%)` // Generate unique colors for each competitor
  }));

  // Generate domain name from competitor name
  const getDomain = (name: string) => {
    return name.toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .replace(/\s+/g, '') + '.com';
  };

  return (
    <div className="flex flex-col">
      {/* Main chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }}
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.7)' }} 
              axisLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
              tickLine={{ stroke: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, 'Market Share']}
              contentStyle={{ 
                backgroundColor: 'rgba(11, 20, 55, 0.8)', 
                borderColor: 'rgba(117, 81, 255, 0.3)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Bar dataKey="marketShare" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* List of competitors with links */}
      <div className="grid gap-2 mt-2">
        {chartData.map((competitor, index) => (
          <div 
            key={index}
            className="flex items-center justify-between p-2 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10"
          >
            <div className="flex items-center">
              <div 
                className="w-3 h-3 mr-2 rounded-full" 
                style={{ backgroundColor: competitor.color }}
              ></div>
              <span className="text-sm text-white">{competitor.name}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-3 text-sm text-white/70">{competitor.marketShare}%</span>
              <a 
                href={`https://${getDomain(competitor.name)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center text-xs text-primary hover:text-primary/80"
              >
                <ExternalLink className="w-3 h-3 mr-1" />
                {getDomain(competitor.name)}
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Market message summary */}
      <div className="p-3 mt-4 text-sm border rounded-md text-white/80 bg-vision-purple-100/5 border-vision-purple-200/10">
        {message}
      </div>
    </div>
  );
}