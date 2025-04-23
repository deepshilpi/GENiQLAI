import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface CAGRChartProps {
  industryAverage: number;
  potential: number;
  data: {
    years: string[];
    industryAverageData: number[];
    potentialData: number[];
  };
}

export function CAGRChart({ industryAverage, potential, data }: CAGRChartProps) {
  // Format chart data
  const chartData = data.years.map((year, index) => ({
    year,
    industry: data.industryAverageData[index],
    potential: data.potentialData[index],
  }));
  
  // Determine if the growth is better than industry average
  const growthComparison = potential > industryAverage;
  
  // Format percentages
  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="flex flex-col">
      {/* Growth comparison summary */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 text-center border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="text-sm font-medium text-white/70 mb-1">Industry Average</div>
          <div className="text-xl font-semibold text-white">{formatPercent(industryAverage)}</div>
          <div className="flex justify-center mt-1">
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
        </div>
        
        <div className={`p-3 text-center border rounded-md ${
          growthComparison 
            ? 'bg-green-500/10 border-green-500/30' 
            : 'bg-red-500/10 border-red-500/30'
        }`}>
          <div className="text-sm font-medium text-white/70 mb-1">Potential Growth</div>
          <div className="text-xl font-semibold text-white">{formatPercent(potential)}</div>
          <div className="flex justify-center mt-1">
            {growthComparison 
              ? <TrendingUp className="w-4 h-4 text-green-400" />
              : <TrendingDown className="w-4 h-4 text-red-400" />
            }
          </div>
        </div>
      </div>
      
      {/* CAGR chart */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="year" 
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              tickFormatter={(value) => `${value}%`}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <Tooltip 
              formatter={(value) => [`${value}%`, '']}
              contentStyle={{ 
                backgroundColor: 'rgba(11, 20, 55, 0.8)', 
                borderColor: 'rgba(117, 81, 255, 0.3)',
                borderRadius: '8px',
                color: 'white' 
              }}
            />
            <Legend 
              wrapperStyle={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}
            />
            <Line 
              type="monotone" 
              dataKey="industry" 
              name="Industry Average" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line 
              type="monotone" 
              dataKey="potential" 
              name="Potential Growth" 
              stroke={growthComparison ? "#22c55e" : "#ef4444"}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      {/* Growth description */}
      <div className="mt-4 p-3 text-sm text-white/80 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        {growthComparison 
          ? `Your startup shows potential for ${formatPercent(potential)} CAGR, which is above the industry average of ${formatPercent(industryAverage)}. This indicates strong growth opportunity.`
          : `Your startup shows potential for ${formatPercent(potential)} CAGR, which is below the industry average of ${formatPercent(industryAverage)}. Consider ways to accelerate growth.`
        }
      </div>
    </div>
  );
}