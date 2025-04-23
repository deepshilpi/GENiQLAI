import { Award, Check } from "lucide-react";

interface UVPCardProps {
  differentiator: string;
  strengths: string[];
}

export function UVPCard({ differentiator, strengths }: UVPCardProps) {
  return (
    <div className="flex flex-col">
      {/* Main differentiator */}
      <div className="p-4 border rounded-md bg-vision-primary-gradient/10 border-primary/30 mb-4">
        <div className="flex items-start mb-2">
          <Award className="w-5 h-5 mr-2 text-primary shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-white mb-1">Primary Differentiator</h4>
            <p className="text-sm text-white/90">
              {differentiator}
            </p>
          </div>
        </div>
      </div>
      
      {/* Strengths list */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-white mb-2">Key Strengths</h4>
        
        {strengths.map((strength, index) => (
          <div 
            key={index}
            className="flex items-start p-3 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10"
          >
            <Check className="w-4 h-4 mr-2 text-green-400 shrink-0 mt-0.5" />
            <p className="text-sm text-white/80">{strength}</p>
          </div>
        ))}
      </div>
    </div>
  );
}