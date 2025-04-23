import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Coins, Clock, PieChart as PieChartIcon } from 'lucide-react';

interface FundingRequirementsCardProps {
  seedRound: {
    min: number;
    max: number;
  };
  seriesA: {
    min: number;
    max: number;
    timeframe: string;
  };
  allocation: {
    productDevelopment: number;
    marketing: number;
    operations: number;
  };
}

export function FundingRequirementsCard({ 
  seedRound, 
  seriesA,
  allocation
}: FundingRequirementsCardProps) {
  // Format currency
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };
  
  // Allocation data for pie chart
  const allocationData = [
    { name: 'Product Development', value: allocation.productDevelopment, color: '#7551FF' },
    { name: 'Marketing', value: allocation.marketing, color: '#A163F7' },
    { name: 'Operations', value: allocation.operations, color: '#CB9FFF' },
  ];
  
  // Total allocation percentage
  const totalAllocation = allocation.productDevelopment + allocation.marketing + allocation.operations;
  
  // Custom label formatter for the pie chart tooltip
  const renderTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{payload[0].name}</p>
          <p className="text-white/80">{`${payload[0].value}%`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Funding rounds */}
      <div className="grid gap-4 md:grid-cols-2 mb-4">
        {/* Seed Round */}
        <div className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <Coins className="w-4 h-4 mr-2 text-primary" />
            <h4 className="text-sm font-medium text-white">Seed Round</h4>
          </div>
          <div className="space-y-1 pl-6">
            <div className="flex justify-between">
              <span className="text-sm text-white/70">Minimum:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(seedRound.min)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70">Maximum:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(seedRound.max)}</span>
            </div>
          </div>
        </div>
        
        {/* Series A */}
        <div className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
          <div className="flex items-center mb-2">
            <Coins className="w-4 h-4 mr-2 text-primary" />
            <h4 className="text-sm font-medium text-white">Series A</h4>
          </div>
          <div className="space-y-1 pl-6">
            <div className="flex justify-between">
              <span className="text-sm text-white/70">Minimum:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(seriesA.min)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-white/70">Maximum:</span>
              <span className="text-sm font-medium text-white">{formatCurrency(seriesA.max)}</span>
            </div>
            <div className="flex justify-between items-center mt-2 pt-2 border-t border-vision-purple-200/10">
              <span className="text-sm text-white/70">Timeframe:</span>
              <div className="flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-white/60" />
                <span className="text-sm font-medium text-white">{seriesA.timeframe}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Allocation */}
      <div className="p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-3">
          <PieChartIcon className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Fund Allocation</h4>
        </div>
        
        <div className="flex flex-col md:flex-row items-center">
          {/* Pie chart */}
          <div className="w-full md:w-1/2 h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={allocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={2}
                  dataKey="value"
                  label={({ value }) => `${value}%`}
                  labelLine={false}
                >
                  {allocationData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      strokeWidth={1}
                      stroke="rgba(17, 8, 60, 0.8)"
                    />
                  ))}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="w-full md:w-1/2 space-y-2 mt-2 md:mt-0">
            {allocationData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-white/80">{item.name}</span>
                </div>
                <span className="text-sm font-medium text-white">{item.value}%</span>
              </div>
            ))}
            
            {totalAllocation !== 100 && (
              <div className="text-xs text-yellow-400 mt-2">
                Note: Total allocation {totalAllocation}% {totalAllocation < 100 ? 'is below' : 'exceeds'} 100%.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}