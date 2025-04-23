import { Users, UserCircle, BadgeCheck, DollarSign, Clock, Award } from 'lucide-react';

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
  // Sort roles by importance (descending)
  const sortedRoles = [...requiredRoles].sort((a, b) => b.importance - a.importance);
  
  // Calculate total estimated cost
  const totalCost = sortedRoles.reduce((total, role) => total + role.estimatedCost, 0);
  
  // Format currency function
  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    } else {
      return `$${value.toFixed(0)}`;
    }
  };
  
  // Get importance level and color
  const getImportanceLevel = (importance: number): string => {
    return importance >= 80 ? "Critical" :
           importance >= 60 ? "Very Important" :
           importance >= 40 ? "Important" :
           importance >= 20 ? "Beneficial" :
           "Optional";
  };
  
  const getImportanceColor = (importance: number): string => {
    return importance >= 80 ? "text-red-400 bg-red-500/10" :
           importance >= 60 ? "text-amber-400 bg-amber-500/10" :
           importance >= 40 ? "text-amber-400 bg-amber-500/5" :
           importance >= 20 ? "text-blue-400 bg-blue-500/5" :
           "text-green-400 bg-green-500/5";
  };

  return (
    <div className="flex flex-col">
      {/* Team cost overview */}
      <div className="p-3 mb-4 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10">
        <div className="flex items-center mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-green-400" />
          <h4 className="text-sm font-medium text-white">Team Investment</h4>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-white/80">Estimated Annual Team Cost</span>
          <span className="text-xl font-medium text-green-400">{formatCurrency(totalCost)}</span>
        </div>
        <div className="flex items-center mt-3 text-xs text-white/60">
          <Clock className="w-3.5 h-3.5 mr-1.5" />
          <span>Hiring Approach: {hiringTimeline}</span>
        </div>
      </div>
      
      {/* Key roles */}
      <div className="mb-6 space-y-4">
        <h4 className="text-sm font-medium text-white mb-2 flex items-center">
          <Users className="w-4 h-4 mr-2 text-primary" />
          Key Team Members
        </h4>
        
        {sortedRoles.map((role, index) => (
          <div 
            key={index}
            className="p-3 rounded-md bg-vision-purple-100/5 border border-vision-purple-200/10"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <UserCircle className="w-8 h-8 text-primary mr-3 mt-1" />
                <div>
                  <h5 className="text-md font-medium text-white">{role.title}</h5>
                  <div className="flex items-center mt-1 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getImportanceColor(role.importance)}`}>
                      {getImportanceLevel(role.importance)}
                    </span>
                    <span className="mx-2 text-white/40">•</span>
                    <span className="text-xs text-white/60 flex items-center">
                      <DollarSign className="w-3.5 h-3.5 mr-1" />
                      {formatCurrency(role.estimatedCost)}/year
                    </span>
                  </div>
                  
                  <h6 className="text-xs font-medium text-white/80 mb-1.5 flex items-center">
                    <BadgeCheck className="w-3.5 h-3.5 mr-1.5 text-primary" />
                    Required Skills
                  </h6>
                  <div className="flex flex-wrap gap-2">
                    {role.skills.map((skill, skillIndex) => (
                      <span 
                        key={skillIndex}
                        className="text-xs px-2 py-1 rounded-full bg-vision-purple-100/10 border border-vision-purple-200/20 text-white/80"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-vision-purple-100/10 border border-vision-purple-200/20 mb-1">
                  <span className="text-sm font-medium text-white">{role.importance}</span>
                </div>
                <span className="text-white/60">Priority</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Team execution insight */}
      <div className="p-3 border rounded-md bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <Award className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Execution Strategy</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}