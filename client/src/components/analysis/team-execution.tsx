import React from "react";
import { Users, BriefcaseIcon, Award, Lightbulb, Calendar } from "lucide-react";
import { 
  Bar, 
  BarChart, 
  PolarAngleAxis, 
  PolarGrid, 
  Radar, 
  RadarChart, 
  ResponsiveContainer, 
  Tooltip, 
  XAxis,
  YAxis 
} from "recharts";

interface TeamExecutionProps {
  requiredRoles: Array<{
    title: string;
    skills: string[];
    importance: number; // 0-100
    estimatedCost: number;
  }>;
  hiringTimeline: string;
  message: string;
}

export function TeamExecution({ requiredRoles, hiringTimeline, message }: TeamExecutionProps) {
  // Sort roles by importance
  const sortedRoles = [...requiredRoles].sort((a, b) => b.importance - a.importance);
  
  // Calculate total cost
  const totalCost = requiredRoles.reduce((sum, role) => sum + role.estimatedCost, 0);
  
  // Prepare data for radar chart
  const radarData = requiredRoles.map(role => ({
    title: role.title,
    importance: role.importance,
  }));
  
  // Prepare data for bar chart
  const barData = requiredRoles.map(role => ({
    title: role.title,
    cost: role.estimatedCost,
    percentage: Math.round((role.estimatedCost / totalCost) * 100)
  }));
  
  // Function to get color based on importance
  const getImportanceColor = (importance: number) => {
    if (importance >= 80) return "#ef4444"; // High importance - red
    if (importance >= 50) return "#f59e0b"; // Medium importance - amber
    return "#22c55e"; // Low importance - green
  };
  
  // Custom tooltip for radar chart
  const renderRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const importanceColor = getImportanceColor(data.importance);
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{data.title}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Importance:</span>{" "}
            <span style={{ color: importanceColor }}>{data.importance}%</span>
          </p>
        </div>
      );
    }
    return null;
  };
  
  // Custom tooltip for bar chart
  const renderBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className="bg-background/95 backdrop-blur-sm border border-border p-2 rounded-md shadow-md">
          <p className="text-xs font-medium text-white mb-1">{data.title}</p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Annual Cost:</span>{" "}
            ₹{data.cost.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-white/80">
            <span className="font-medium">Percentage:</span>{" "}
            {data.percentage}% of total budget
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center mb-2">
        <Users className="w-5 h-5 mr-2 text-primary" />
        <h3 className="text-lg font-medium text-white">Team Execution Capability</h3>
      </div>

      {/* Total cost and timeline overview */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Estimated Team Budget</h4>
            <div className="flex items-baseline">
              <span className="text-xl font-semibold text-white">₹{totalCost.toLocaleString('en-IN')}</span>
              <span className="text-xs text-white/70 ml-2">annual</span>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Hiring Timeline</h4>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-primary mr-2" />
              <span className="text-sm text-white">{hiringTimeline}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role importance radar chart */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Team Role Importance</h4>
        <p className="text-xs text-white/70 mb-4">Critical roles to prioritize for execution success</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="80%" 
              data={radarData}
            >
              <PolarGrid stroke="rgba(255,255,255,0.1)" />
              <PolarAngleAxis 
                dataKey="title" 
                tick={{ fill: 'rgba(255,255,255,0.7)', fontSize: 10 }}
              />
              <Radar
                name="Importance"
                dataKey="importance"
                stroke="#A163F7"
                fill="#A163F7"
                fillOpacity={0.6}
              />
              <Tooltip content={renderRadarTooltip} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget allocation bar chart */}
      <div className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20">
        <h4 className="text-sm font-medium text-white mb-1">Budget Allocation by Role</h4>
        <p className="text-xs text-white/70 mb-4">Annual cost distribution across team roles</p>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={barData}
              margin={{ top: 5, right: 30, left: 90, bottom: 5 }}
            >
              <XAxis 
                type="number" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickFormatter={(value) => `₹${value/1000}k`}
              />
              <YAxis 
                type="category" 
                dataKey="title" 
                tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)' }}
                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                tickLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                width={80}
              />
              <Tooltip content={renderBarTooltip} />
              <Bar 
                dataKey="cost" 
                fill="#56ABFF" 
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Key roles with skills */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-white">Key Team Roles</h4>
        
        {sortedRoles.map((role, index) => (
          <div 
            key={index} 
            className="p-4 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/20"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex">
                <div 
                  className="h-8 w-8 rounded-full flex items-center justify-center mr-3 mt-0.5"
                  style={{ backgroundColor: `${getImportanceColor(role.importance)}30` }}
                >
                  <BriefcaseIcon 
                    className="h-4 w-4" 
                    style={{ color: getImportanceColor(role.importance) }}
                  />
                </div>
                <div>
                  <h5 className="text-sm font-medium text-white">{role.title}</h5>
                  <div className="flex items-center mt-1">
                    <Award className="h-3 w-3 text-primary mr-1" />
                    <span 
                      className="text-xs font-medium" 
                      style={{ color: getImportanceColor(role.importance) }}
                    >
                      {role.importance}% importance
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-white/70">Annual Cost</p>
                <p className="text-sm font-medium text-white">₹{role.estimatedCost.toLocaleString('en-IN')}</p>
              </div>
            </div>
            
            <div className="bg-vision-purple-100/5 p-3 rounded-md">
              <div className="flex items-center mb-2">
                <Lightbulb className="h-3 w-3 text-primary mr-1" />
                <h6 className="text-xs font-medium text-white">Required Skills</h6>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.skills.map((skill, skillIndex) => (
                  <span 
                    key={skillIndex} 
                    className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Expert insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Users className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Team Building Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}