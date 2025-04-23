import { Clock, AlertCircle } from "lucide-react";

interface FailedExecutionsCardProps {
  failures: Array<{
    name: string;
    year: string;
    reason: string;
  }>;
  message: string;
}

export function FailedExecutionsCard({ failures, message }: FailedExecutionsCardProps) {
  // Sort failures by year (most recent first)
  const sortedFailures = [...failures].sort((a, b) => {
    const yearA = parseInt(a.year.match(/\d+/)?.[0] || '0', 10);
    const yearB = parseInt(b.year.match(/\d+/)?.[0] || '0', 10);
    return yearB - yearA;
  });

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
            <div className="absolute top-0 left-0 w-6 h-6 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-3 h-3 text-red-500" />
            </div>
            
            {/* Content */}
            <div className="pl-4">
              <div className="flex items-center mb-1">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-white/60" />
                <span className="text-xs font-medium text-white/60">{failure.year}</span>
              </div>
              <h4 className="text-sm font-medium text-white mb-1">{failure.name}</h4>
              <p className="text-xs text-white/80">{failure.reason}</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Summary message */}
      <div className="p-3 mt-2 text-sm border rounded-md text-white/80 bg-vision-purple-100/5 border-vision-purple-200/10">
        {message}
      </div>
    </div>
  );
}