import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { Briefcase, Gauge, Info } from 'lucide-react';

interface BusinessModelStrengthProps {
  overall: number;
  components: Array<{
    name: string;
    score: number;
    description: string;
  }>;
  message: string;
}

export function BusinessModelStrength({ overall, components, message }: BusinessModelStrengthProps) {
  // Sort components by score (descending)
  const sortedComponents = [...components].sort((a, b) => b.score - a.score);
  
  // Get strength classification based on overall score
  const strengthLevel = 
    overall >= 80 ? "Very Strong" :
    overall >= 60 ? "Strong" :
    overall >= 40 ? "Moderate" :
    overall >= 20 ? "Weak" :
    "Very Weak";
  
  const strengthColor = 
    overall >= 80 ? "text-green-400 border-green-400/30" :
    overall >= 60 ? "text-green-400 border-green-400/30" :
    overall >= 40 ? "text-amber-400 border-amber-400/30" :
    overall >= 20 ? "text-orange-400 border-orange-400/30" :
    "text-red-400 border-red-400/30";
  
  // Format data for bar chart
  const chartData = components.map(component => ({
    name: component.name,
    score: component.score,
  }));

  // Custom tooltip
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the component with the full description
      const component = components.find(c => c.name === label);
      
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{label}</p>
          <p className="text-white/80">Score: {payload[0].value}/100</p>
          {component && (
            <p className="text-primary text-xs mt-1 max-w-xs">
              {component.description}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col">
      {/* Overall strength score */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <Gauge className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Business Model Strength</h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Overall Score</span>
          <div className="flex items-center">
            <span className="text-xl font-medium text-white">{overall}</span>
            <span className="text-sm text-white/60">/100</span>
          </div>
        </div>
        <div className="mt-2 w-full bg-vision-purple-100/10 rounded-full h-2">
          <div 
            className="h-2 rounded-full" 
            style={{ 
              width: `${overall}%`,
              backgroundColor: overall >= 60 ? '#22c55e' : 
                             overall >= 40 ? '#f59e0b' : 
                             '#ef4444'
            }}
          ></div>
        </div>
        <div className="mt-2 flex justify-end">
          <span className={`text-xs font-medium rounded-full px-2 py-0.5 border ${strengthColor}`}>
            {strengthLevel}
          </span>
        </div>
      </div>
      
      {/* Bar chart of component scores */}
      <div className="h-64 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]}
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            />
            <YAxis 
              dataKey="name" 
              type="category"
              tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 12 }}
              axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
              width={120}
            />
            <Tooltip content={renderTooltip} />
            <Bar 
              dataKey="score" 
              fill="#22c55e"
              radius={[0, 4, 4, 0]}
              barSize={16}
              // Use CSS classes with tailwind to style based on score
              className="business-model-bar"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Top and bottom components */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Strongest component */}
        {sortedComponents.length > 0 && (
          <div className="p-3 rounded-md bg-green-500/5 border border-green-500/20">
            <div className="flex items-center mb-2">
              <div className="p-1 rounded-full bg-green-500/10 mr-2">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
              </div>
              <h4 className="text-sm font-medium text-white">Strongest Element</h4>
            </div>
            <div className="mb-1 flex justify-between items-center">
              <span className="text-sm text-white/80">{sortedComponents[0].name}</span>
              <span className="text-sm font-medium text-green-400">{sortedComponents[0].score}/100</span>
            </div>
            <p className="text-xs text-white/70">
              {sortedComponents[0].description}
            </p>
          </div>
        )}
        
        {/* Weakest component */}
        {sortedComponents.length > 1 && (
          <div className="p-3 rounded-md bg-red-500/5 border border-red-500/20">
            <div className="flex items-center mb-2">
              <div className="p-1 rounded-full bg-red-500/10 mr-2">
                <div className="w-2 h-2 rounded-full bg-red-400"></div>
              </div>
              <h4 className="text-sm font-medium text-white">Improvement Needed</h4>
            </div>
            <div className="mb-1 flex justify-between items-center">
              <span className="text-sm text-white/80">{sortedComponents[sortedComponents.length - 1].name}</span>
              <span className="text-sm font-medium text-red-400">{sortedComponents[sortedComponents.length - 1].score}/100</span>
            </div>
            <p className="text-xs text-white/70">
              {sortedComponents[sortedComponents.length - 1].description}
            </p>
          </div>
        )}
      </div>
      
      {/* Business model insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Briefcase className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Business Model Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}