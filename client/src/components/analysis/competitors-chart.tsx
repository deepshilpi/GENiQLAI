import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from 'recharts';
import { Crown, Target, Globe, ExternalLink } from 'lucide-react';

interface CompetitorsChartProps {
  competitors: Array<{
    name: string;
    marketShare: number;
    websiteUrl?: string;
  }>;
  message: string;
}

export function CompetitorsChart({ competitors, message }: CompetitorsChartProps) {
  // Sort competitors by market share (descending)
  const sortedCompetitors = [...competitors].sort((a, b) => b.marketShare - a.marketShare);
  
  // Add your company with 0% market share for comparison
  const chartData = [
    { name: 'Your Startup', marketShare: 0, isYours: true },
    ...sortedCompetitors.map(comp => ({ ...comp, isYours: false }))
  ];
  
  // For the tooltip custom content
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-white/80">Market Share: {data.marketShare}%</p>
          {data.websiteUrl && (
            <p className="text-primary text-xs mt-1 flex items-center">
              <Globe className="w-3 h-3 mr-1" />
              {data.websiteUrl}
            </p>
          )}
          {data.isYours && (
            <p className="text-primary text-xs mt-1">Your potential entry point</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Market leader highlight */}
      {sortedCompetitors.length > 0 && (
        <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <Crown className="w-4 h-4 mr-2 text-yellow-400" />
            <h4 className="text-sm font-medium text-white">Market Leader</h4>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/80">{sortedCompetitors[0].name}</span>
            <span className="text-sm font-medium text-white">{sortedCompetitors[0].marketShare}% Market Share</span>
          </div>
          {sortedCompetitors[0].websiteUrl && (
            <div className="mt-2 text-xs">
              <a 
                href={sortedCompetitors[0].websiteUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary flex items-center hover:underline"
              >
                <Globe className="w-3 h-3 mr-1" />
                {sortedCompetitors[0].websiteUrl}
                <ExternalLink className="w-3 h-3 ml-1" />
              </a>
            </div>
          )}
        </div>
      )}
      
      {/* Competitors chart */}
      <div className="h-60 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            barSize={36}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              height={60}
              tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
              angle={-45}
              textAnchor="end"
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip content={renderTooltip} />
            <Bar 
              dataKey="marketShare" 
              name="Market Share" 
              radius={[4, 4, 0, 0]}
              fill={(data) => data.isYours ? "#7551FF" : "#CB9FFF"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Competitor websites list */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-2">
        {sortedCompetitors.filter(comp => comp.websiteUrl).map((comp, index) => (
          <a 
            key={index}
            href={comp.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-xs flex items-center justify-between rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10 hover:bg-vision-purple-100/10 transition-colors"
          >
            <span className="flex items-center">
              <Globe className="w-3 h-3 mr-2 text-primary" />
              {comp.name}
            </span>
            <ExternalLink className="w-3 h-3 text-primary" />
          </a>
        ))}
      </div>
      
      {/* Market opportunity summary */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Target className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Market Opportunity</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}