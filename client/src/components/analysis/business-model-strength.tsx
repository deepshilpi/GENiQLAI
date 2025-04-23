import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { LineChart, BarChart3, Info } from 'lucide-react';

interface BusinessModelCategory {
  name: string;
  score: number;
  maxScore: number;
  description: string;
}

interface BusinessModelStrengthProps {
  overallScore: number;
  categories: BusinessModelCategory[];
  message: string;
}

export function BusinessModelStrength({ overallScore, categories, message }: BusinessModelStrengthProps) {
  // Sort categories by score (descending)
  const sortedCategories = [...categories].sort((a, b) => b.score - a.score);
  
  // Prepare data for bar chart
  const chartData = sortedCategories.map(category => ({
    name: category.name,
    score: category.score,
    maxScore: category.maxScore,
    percentage: Math.round((category.score / category.maxScore) * 100)
  }));
  
  // Determine overall strength level and colors
  const strengthLevel = 
    overallScore >= 80 ? "excellent" :
    overallScore >= 65 ? "strong" :
    overallScore >= 50 ? "moderate" :
    overallScore >= 35 ? "weak" :
    "poor";
    
  const strengthColor = 
    strengthLevel === "excellent" ? "#22c55e" : // green-500
    strengthLevel === "strong" ? "#3b82f6" : // blue-500
    strengthLevel === "moderate" ? "#f59e0b" : // amber-500
    strengthLevel === "weak" ? "#ef4444" : // red-500
    "#dc2626"; // red-600
    
  const strengthText = 
    strengthLevel === "excellent" ? "Excellent Business Model" :
    strengthLevel === "strong" ? "Strong Business Model" :
    strengthLevel === "moderate" ? "Moderate Business Model" :
    strengthLevel === "weak" ? "Weak Business Model" :
    "Poor Business Model";
    
  // Custom tooltip for the bar chart
  const renderTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="p-2 bg-vision-card/95 border border-vision-purple-200/20 rounded-md shadow-md">
          <p className="font-medium text-white">{data.name}</p>
          <p className="text-white/80">Score: {data.score}/{data.maxScore}</p>
          <p className="text-white/80">Strength: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };
  
  // Get bar color based on score percentage
  const getBarColor = (percentage: number) => {
    if (percentage >= 80) return "#22c55e"; // green-500
    if (percentage >= 65) return "#3b82f6"; // blue-500
    if (percentage >= 50) return "#f59e0b"; // amber-500
    if (percentage >= 35) return "#ef4444"; // red-500
    return "#dc2626"; // red-600
  };
  
  return (
    <div className="flex flex-col">
      {/* Overall score indicator */}
      <div className="flex items-center justify-center mb-4">
        <div className="relative flex items-center justify-center">
          <svg className="w-28 h-28">
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke="rgba(117, 81, 255, 0.2)"
              strokeWidth="10"
            />
            <circle
              cx="56"
              cy="56"
              r="50"
              fill="none"
              stroke={strengthColor}
              strokeWidth="10"
              strokeDasharray={`${overallScore * 3.14}, 1000`}
              strokeLinecap="round"
              transform="rotate(-90 56 56)"
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-white">{overallScore}%</span>
            <span className="text-xs text-white/70">Overall Strength</span>
          </div>
        </div>
      </div>
      
      {/* Strength level indicator */}
      <div className="flex items-center justify-center mb-4">
        <BarChart3 className="w-5 h-5 mr-2" style={{ color: strengthColor }} />
        <span className="text-sm font-medium text-white">{strengthText}</span>
      </div>
      
      {/* Bar chart visualization */}
      <div className="h-60 w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 70, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tickFormatter={(value) => `${value}%`}
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
              width={70}
            />
            <Tooltip content={renderTooltip} />
            <Bar 
              dataKey="percentage" 
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.percentage)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Category details */}
      <div className="space-y-3 mb-4">
        {sortedCategories.map((category, index) => (
          <details key={index} className="group">
            <summary className="flex items-center justify-between p-2 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10 cursor-pointer">
              <div className="flex items-center">
                <div 
                  className="w-2 h-2 rounded-full mr-2" 
                  style={{ 
                    backgroundColor: getBarColor(Math.round((category.score / category.maxScore) * 100)) 
                  }}
                ></div>
                <span className="text-sm text-white">{category.name}</span>
              </div>
              <div className="flex items-center">
                <span className="text-sm text-white/70 mr-2">
                  {category.score}/{category.maxScore}
                </span>
                <Info className="w-4 h-4 text-white/50 group-hover:text-white/80 transition-colors" />
              </div>
            </summary>
            <div className="p-2 mt-1 text-xs text-white/80 bg-vision-purple-100/5 border-t-0 border border-vision-purple-200/10 rounded-b-md">
              {category.description}
            </div>
          </details>
        ))}
      </div>
      
      {/* Business model insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <LineChart className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Business Model Insight</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}