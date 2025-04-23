import { Sparkles, ChevronRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RelatedIdeasProps {
  ideas: Array<{
    title: string;
    description: string;
    potentialScore: number;
  }>;
  onSelectIdea?: (idea: string) => void;
}

export function RelatedIdeas({ ideas, onSelectIdea }: RelatedIdeasProps) {
  // Sort ideas by potential score (descending)
  const sortedIdeas = [...ideas].sort((a, b) => b.potentialScore - a.potentialScore);
  
  const getScoreColor = (score: number) => {
    return score >= 80 ? "text-green-400" :
           score >= 60 ? "text-emerald-400" :
           score >= 40 ? "text-amber-400" :
           score >= 20 ? "text-orange-400" :
           "text-red-400";
  };
  
  return (
    <div className="flex flex-col">
      <h4 className="text-lg font-medium text-white flex items-center mb-4">
        <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
        Related Ideas to Explore
      </h4>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedIdeas.map((idea, index) => (
          <div 
            key={index}
            className="p-4 rounded-lg border bg-vision-purple-100/5 border-vision-purple-200/20 hover:bg-vision-purple-100/10 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Sparkles className="w-4 h-4 mr-2 text-amber-400" />
              <div className={`text-xs font-medium ml-auto ${getScoreColor(idea.potentialScore)}`}>
                {idea.potentialScore}% Potential
              </div>
            </div>
            
            <h5 className="text-md font-medium text-white mb-2">{idea.title}</h5>
            <p className="text-sm text-white/70 mb-4">{idea.description}</p>
            
            {onSelectIdea && (
              <Button 
                variant="outline" 
                size="sm"
                className="w-full mt-auto border-vision-purple-200/20 hover:bg-vision-purple-100/20 text-primary"
                onClick={() => onSelectIdea(idea.title)}
              >
                Analyze This Idea
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}