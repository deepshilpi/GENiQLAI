import { AlertCircle, Check, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Label } from "recharts";

interface MarketViabilityCardProps {
  points: Array<{
    title: string;
    subtitle: string;
    type: 'success' | 'warning' | 'danger';
  }>;
}

export function MarketViabilityCard({ points }: MarketViabilityCardProps) {
  // Count points by type
  const successCount = points.filter(p => p.type === 'success').length;
  const warningCount = points.filter(p => p.type === 'warning').length;
  const dangerCount = points.filter(p => p.type === 'danger').length;
  
  // Calculate total score (weighted)
  const totalPoints = points.length;
  const score = totalPoints > 0 
    ? Math.round(((successCount * 1) + (warningCount * 0.5) + (dangerCount * 0)) / totalPoints * 100) 
    : 0;
  
  // Prepare data for radar chart
  const pieData = [
    { name: 'Success', value: successCount, color: '#22c55e' },
    { name: 'Warning', value: warningCount, color: '#eab308' },
    { name: 'Danger', value: dangerCount, color: '#ef4444' },
  ].filter(item => item.value > 0);
  
  // Get icon by type
  const getIcon = (type: 'success' | 'warning' | 'danger') => {
    switch (type) {
      case 'success':
        return <Check className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'danger':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };
  
  // Get background color by type
  const getBgColor = (type: 'success' | 'warning' | 'danger') => {
    switch (type) {
      case 'success':
        return 'bg-green-500/10 border-green-500/30';
      case 'warning':
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 'danger':
        return 'bg-red-500/10 border-red-500/30';
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Pie chart */}
        <div className="flex items-center justify-center w-full md:w-1/3">
          <div className="relative w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                  <Label
                    value={`${score}%`}
                    position="center"
                    fill="#ffffff"
                    style={{ fontSize: '18px', fontWeight: 'bold' }}
                  />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs text-white/70">Viability Score</div>
          </div>
        </div>
        
        {/* Market points list */}
        <div className="w-full md:w-2/3 space-y-2">
          {points.map((point, index) => (
            <div 
              key={index}
              className={`p-3 border rounded-md ${getBgColor(point.type)}`}
            >
              <div className="flex items-center mb-1">
                {getIcon(point.type)}
                <h4 className="ml-2 text-sm font-medium text-white">{point.title}</h4>
              </div>
              <p className="text-xs pl-6 text-white/80">{point.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}