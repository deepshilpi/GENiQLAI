import { Clock, AlertCircle, AlertTriangle, Target } from "lucide-react";

interface FailedExecution {
  name: string;
  year: string;
  reason: string;
  relevance?: number; // 0-100 scale, higher means more relevant
}

interface FailedExecutionsCardProps {
  failures: FailedExecution[];
  message: string;
}

export function FailedExecutionsCard({ failures, message }: FailedExecutionsCardProps) {
  // Sort failures by relevance (most relevant first) and then by year (most recent first)
  const sortedFailures = [...failures].sort((a, b) => {
    if (a.relevance !== undefined && b.relevance !== undefined) {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
    }
    
    const yearA = parseInt(a.year.match(/\d+/)?.[0] || '0', 10);
    const yearB = parseInt(b.year.match(/\d+/)?.[0] || '0', 10);
    return yearB - yearA;
  });

  // Get relevance class based on score
  const getRelevanceClass = (relevance?: number) => {
    if (relevance === undefined) return "";
    
    if (relevance >= 80) return "border-red-500/50 bg-red-500/20";
    if (relevance >= 60) return "border-amber-500/50 bg-amber-500/20";
    if (relevance >= 40) return "border-yellow-500/50 bg-yellow-500/20";
    return "border-green-500/50 bg-green-500/20";
  };

  // Get relevance icon based on score
  const getRelevanceIcon = (relevance?: number) => {
    if (relevance === undefined) return <AlertCircle className="w-3 h-3 text-red-500" />;
    
    if (relevance >= 80) return <AlertTriangle className="w-3 h-3 text-red-500" />;
    if (relevance >= 60) return <AlertCircle className="w-3 h-3 text-amber-500" />;
    if (relevance >= 40) return <Target className="w-3 h-3 text-yellow-500" />;
    return <Target className="w-3 h-3 text-green-500" />;
  };

  return (
    <div className="flex flex-col">
      {/* Timeline of failures */}
      <div className="space-y-1">
        {sortedFailures.map((failure, index) => (
          <div 
            key={index}
            className="relative pl-7 pb-6"
          >
            {/* Timeline connector */}
            {index < sortedFailures.length - 1 && (
              <div className="absolute top-6 left-[11px] bottom-0 w-0.5 bg-vision-purple-200/20"></div>
            )}
            
            {/* Year marker */}
            <div className={`absolute top-0 left-0 w-6 h-6 rounded-full border flex items-center justify-center ${getRelevanceClass(failure.relevance)}`}>
              {getRelevanceIcon(failure.relevance)}
            </div>
            
            {/* Content */}
            <div className="pl-4">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-white/60" />
                  <span className="text-xs font-medium text-white/60">{failure.year}</span>
                </div>
                
                {failure.relevance !== undefined && (
                  <div className="flex items-center ml-2">
                    <span className="text-xs font-medium text-white/60">
                      Relevance: {failure.relevance}%
                    </span>
                  </div>
                )}
              </div>
              <h4 className="text-sm font-medium text-white mb-1">{failure.name}</h4>
              <p className="text-xs text-white/80">{failure.reason}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary message */}
      <div className="p-3 mt-2 text-sm border rounded-md text-white/80 bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center mb-2">
          <AlertTriangle className="w-4 h-4 mr-2 text-primary" />
          <h4 className="text-sm font-medium text-white">Risk Assessment</h4>
        </div>
        <p className="text-sm text-white/80">
          {message}
        </p>
      </div>
    </div>
  );
}