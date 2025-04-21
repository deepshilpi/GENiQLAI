import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Trash2, ArrowLeftRight, ChevronDown, ChevronUp } from 'lucide-react';
import { AnalysisResults } from '@shared/schema';

interface ComparativeAnalysisProps {
  mainAnalysis: AnalysisResults;
  savedAnalyses: SavedAnalysis[];
  onCompare: (analysisIds: string[]) => void;
}

interface SavedAnalysis {
  id: string;
  title: string;
  date: string;
  results: AnalysisResults;
}

export function ComparativeAnalysis({ 
  mainAnalysis, 
  savedAnalyses, 
  onCompare 
}: ComparativeAnalysisProps) {
  const [selectedAnalyses, setSelectedAnalyses] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResults, setComparisonResults] = useState<Record<string, any>>({});
  const [activeMetric, setActiveMetric] = useState<string>('successRate');
  const [metrics] = useState([
    { id: 'successRate', name: 'Success Rate' },
    { id: 'competitors', name: 'Competitors' },
    { id: 'cagr', name: 'Growth Rate' },
    { id: 'fundingRequirements', name: 'Funding Requirements' },
  ]);

  // Toggle analysis selection
  const toggleAnalysis = (id: string) => {
    if (selectedAnalyses.includes(id)) {
      setSelectedAnalyses(selectedAnalyses.filter(a => a !== id));
    } else {
      // Limit to 3 analyses for comparison (including the main one)
      if (selectedAnalyses.length < 2) {
        setSelectedAnalyses([...selectedAnalyses, id]);
      }
    }
  };

  // Start comparison
  const startComparison = () => {
    setIsComparing(true);
    onCompare(selectedAnalyses);
    
    // Generate comparison data
    const results: Record<string, any> = {};
    
    // Get analyses objects
    const analysesToCompare = [
      { id: 'current', results: mainAnalysis },
      ...selectedAnalyses.map(id => {
        const saved = savedAnalyses.find(a => a.id === id);
        return { id, results: saved?.results };
      }).filter(a => a.results)
    ];
    
    // Generate comparison data for each metric
    metrics.forEach(metric => {
      results[metric.id] = {
        label: metric.name,
        data: analysesToCompare.map(analysis => {
          let value = null;
          let details = null;
          
          switch (metric.id) {
            case 'successRate':
              value = analysis.results?.successRate?.percentage || 0;
              details = analysis.results?.successRate?.message || '';
              break;
            case 'competitors':
              value = analysis.results?.competitors?.competitors?.length || 0;
              details = analysis.results?.competitors?.competitors?.map((c: any) => c.name).join(', ') || '';
              break;
            case 'cagr':
              value = analysis.results?.cagr?.potential || 0;
              details = `Industry: ${analysis.results?.cagr?.industryAverage || 0}%`;
              break;
            case 'fundingRequirements':
              value = analysis.results?.fundingRequirements?.seedRound?.max || 0;
              details = `Seed: $${analysis.results?.fundingRequirements?.seedRound?.min || 0}k-$${analysis.results?.fundingRequirements?.seedRound?.max || 0}k`;
              break;
          }
          
          return {
            id: analysis.id,
            value,
            details,
            name: analysis.id === 'current' 
              ? 'Current Analysis' 
              : savedAnalyses.find(a => a.id === analysis.id)?.title || 'Unknown'
          };
        })
      };
    });
    
    setComparisonResults(results);
  };

  // Reset comparison
  const resetComparison = () => {
    setIsComparing(false);
    setSelectedAnalyses([]);
    setComparisonResults({});
  };
  
  // Functions to sort results for comparison
  const sortByValue = (data: any[]) => {
    return [...data].sort((a, b) => b.value - a.value);
  };

  return (
    <div className="w-full">
      {!isComparing ? (
        <div>
          <h3 className="text-xl font-bold text-white mb-4">Compare With Previous Analyses</h3>
          <p className="text-white/70 mb-6">
            Select up to 2 previous analyses to compare with your current results
          </p>
          
          {savedAnalyses.length > 0 ? (
            <div className="space-y-3 mb-6">
              {savedAnalyses.map(analysis => (
                <div 
                  key={analysis.id}
                  className={`p-4 bg-vision-card/40 border rounded-lg cursor-pointer transition-colors flex justify-between items-center ${
                    selectedAnalyses.includes(analysis.id)
                      ? 'border-vision-purple-500'
                      : 'border-vision-purple-200/20 hover:border-vision-purple-500/50'
                  }`}
                  onClick={() => toggleAnalysis(analysis.id)}
                >
                  <div>
                    <h5 className="font-medium text-white">{analysis.title}</h5>
                    <p className="text-white/60 text-sm">{analysis.date}</p>
                  </div>
                  <div className="h-5 w-5 rounded-full border border-vision-purple-400 flex items-center justify-center">
                    {selectedAnalyses.includes(analysis.id) && (
                      <div className="h-3 w-3 rounded-full bg-vision-purple-500"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 bg-vision-card/40 border border-vision-purple-200/20 rounded-lg text-center mb-6">
              <p className="text-white/70">No saved analyses to compare with</p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button
              onClick={resetComparison}
              variant="outline"
              className="mr-2 text-white/70 border-vision-purple-200/20 hover:bg-vision-purple-100/10"
            >
              Cancel
            </Button>
            <Button
              onClick={startComparison}
              disabled={selectedAnalyses.length === 0}
              className="bg-vision-primary-gradient hover:brightness-110 text-white"
            >
              <ArrowLeftRight className="w-4 h-4 mr-2" />
              Compare {selectedAnalyses.length > 0 ? `(${selectedAnalyses.length})` : ''}
            </Button>
          </div>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Comparison Results</h3>
            <Button
              variant="ghost"
              onClick={resetComparison}
              className="text-white/70 hover:text-white hover:bg-vision-purple-100/10"
            >
              Back to Selection
            </Button>
          </div>
          
          <Tabs value={activeMetric} onValueChange={setActiveMetric}>
            <TabsList className="bg-vision-card/50 border border-vision-purple-200/20 p-1 w-full flex mb-6">
              {metrics.map(metric => (
                <TabsTrigger 
                  key={metric.id}
                  value={metric.id}
                  className="flex-1 text-white data-[state=active]:bg-vision-primary-gradient data-[state=active]:text-white"
                >
                  {metric.name}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {metrics.map(metric => (
              <TabsContent key={metric.id} value={metric.id} className="outline-none">
                <div className="vision-card p-6">
                  <h4 className="font-bold text-white mb-4">
                    {metric.name} Comparison
                  </h4>
                  
                  {comparisonResults[metric.id] && (
                    <div className="space-y-4">
                      {sortByValue(comparisonResults[metric.id].data).map((item: any, index: number) => (
                        <div key={item.id} className="relative">
                          {/* Rank indicator */}
                          <div 
                            className={`absolute -left-3 -top-3 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0 ? 'bg-green-500 text-white' : 
                              index === 1 ? 'bg-blue-500 text-white' :
                              'bg-vision-purple-300/50 text-white/80'
                            }`}
                          >
                            {index + 1}
                          </div>
                          
                          <div className="p-4 bg-vision-card/40 border border-vision-purple-200/20 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <h5 className="font-medium text-white">{item.name}</h5>
                              <span className="text-lg font-bold text-white">
                                {metric.id === 'successRate' || metric.id === 'cagr' 
                                  ? `${item.value}%` 
                                  : metric.id === 'fundingRequirements' 
                                  ? `$${item.value}k`
                                  : item.value
                                }
                              </span>
                            </div>
                            
                            <div className="w-full h-2 bg-vision-purple-100/10 rounded-full mb-2">
                              <div 
                                className={`h-full rounded-full ${
                                  index === 0 ? 'bg-green-500' : 
                                  index === 1 ? 'bg-blue-500' :
                                  'bg-vision-purple-500'
                                }`}
                                style={{ 
                                  width: `${metric.id === 'competitors' 
                                    ? Math.min(100, item.value * 20) 
                                    : Math.min(100, item.value)}%` 
                                }}
                              ></div>
                            </div>
                            
                            <p className="text-white/60 text-sm">{item.details}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
}