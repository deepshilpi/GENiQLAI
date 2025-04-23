import { Lightbulb, ArrowRight, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RelatedIdea {
  title: string;
  description: string;
  similarityScore: number; // 0-100 scale
  potentialScore: number; // 0-100 scale
}

interface RelatedIdeasProps {
  ideas: RelatedIdea[];
  onSelectIdea: (idea: string) => void;
}

export function RelatedIdeas({ ideas, onSelectIdea }: RelatedIdeasProps) {
  // Sort ideas by potential score (descending)
  const sortedIdeas = [...ideas].sort((a, b) => b.potentialScore - a.potentialScore);
  
  // Get gradient class based on potential score
  const getPotentialClass = (score: number) => {
    if (score >= 80) return "from-green-500/20 to-green-500/5 border-green-500/30";
    if (score >= 60) return "from-blue-500/20 to-blue-500/5 border-blue-500/30";
    if (score >= 40) return "from-amber-500/20 to-amber-500/5 border-amber-500/30";
    return "from-red-500/20 to-red-500/5 border-red-500/30";
  };
  
  return (
    <div className="flex flex-col">
      <h3 className="text-lg font-medium text-white mb-4 flex items-center">
        <Lightbulb className="w-5 h-5 mr-2 text-primary" />
        Related Startup Ideas
      </h3>
      
      <div className="space-y-4">
        {sortedIdeas.map((idea, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border bg-gradient-to-br ${getPotentialClass(idea.potentialScore)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-base font-medium text-white">{idea.title}</h4>
              <div className="flex items-center bg-vision-card/60 px-2 py-1 rounded-full">
                <ThumbsUp className="w-3.5 h-3.5 mr-1.5 text-primary" />
                <span className="text-xs font-medium text-white">{idea.potentialScore}%</span>
              </div>
            </div>
            
            <p className="text-sm text-white/80 mb-3">{idea.description}</p>
            
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-xs text-white/60">Similarity: {idea.similarityScore}%</span>
              </div>
              
              <Button 
                size="sm" 
                variant="outline"
                className="text-xs bg-vision-purple-100/10 border-vision-purple-200/20 text-white hover:bg-vision-purple-200/20"
                onClick={() => onSelectIdea(idea.title)}
              >
                Analyze This
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}