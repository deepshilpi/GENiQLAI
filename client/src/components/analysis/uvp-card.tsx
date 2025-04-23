import { Star, CheckCircle2 } from "lucide-react";

interface UVPCardProps {
  differentiator: string;
  strengths: string[];
}

export function UVPCard({ differentiator, strengths }: UVPCardProps) {
  return (
    <div className="flex flex-col">
      {/* Main differentiator */}
      <div className="p-4 mb-4 text-center border rounded-lg bg-vision-primary-gradient/10 border-primary/30">
        <div className="flex items-center justify-center mb-2">
          <Star className="w-5 h-5 mr-2 text-primary" />
          <h3 className="text-sm font-medium text-white">Key Differentiator</h3>
        </div>
        <p className="text-sm text-white/90">{differentiator}</p>
      </div>
      
      {/* Strengths list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-white">Core Strengths</h3>
        
        <div className="space-y-2">
          {strengths.map((strength, index) => (
            <div 
              key={index}
              className="flex p-2 border rounded-md bg-vision-purple-100/5 border-vision-purple-200/10"
            >
              <CheckCircle2 className="flex-shrink-0 w-4 h-4 mt-0.5 mr-2 text-primary/80" />
              <span className="text-sm text-white/80">{strength}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}