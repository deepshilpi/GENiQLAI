import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, Globe, RefreshCw } from "lucide-react";
import { fetchNewsArticles, NewsArticle } from "@/lib/tavily";
import { Button } from "@/components/ui/button";

export function StartupNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Function to check if the news needs to be refreshed (daily refresh)
  const shouldRefreshNews = () => {
    // If we've never fetched news, we definitely should
    if (!lastFetched) return true;
    
    const now = new Date();
    const lastFetchDate = new Date(lastFetched);
    
    // Check if it's a different day
    return (
      now.getDate() !== lastFetchDate.getDate() ||
      now.getMonth() !== lastFetchDate.getMonth() ||
      now.getFullYear() !== lastFetchDate.getFullYear()
    );
  };

  async function loadNews(force = false) {
    try {
      // Only refresh if it's a new day or forced refresh
      if (!force && !shouldRefreshNews()) return;
      
      setLoading(true);
      const data = await fetchNewsArticles();
      // Only show 3 articles as requested
      setArticles(data.slice(0, 3));
      setLastFetched(new Date());
    } catch (err: any) {
      console.error("Error loading news:", err);
      setError(err.message || "Failed to load startup news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
    
    // Check for refresh every hour
    const interval = setInterval(() => {
      if (shouldRefreshNews()) {
        loadNews();
      }
    }, 3600000); // Check hourly
    
    return () => clearInterval(interval);
  }, []);

  // Format the date to a readable string
  function formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return 'Recent';
    }
  }

  return (
    <Card className="border-0 bg-gradient-to-br from-vision-purple-200/30 to-vision-purple-200/5 backdrop-blur-sm shadow-lg shadow-vision-purple-200/10">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-white font-medium">
            Growing Startups Outside India
          </CardTitle>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-white/70 hover:text-white hover:bg-vision-purple-200/20"
            onClick={() => loadNews(true)}
            disabled={loading}
            title="Refresh news"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        {loading ? (
          <div className="h-40 flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        ) : error ? (
          <div className="h-40 flex flex-col items-center justify-center">
            <p className="text-white/80 text-sm">{error}</p>
          </div>
        ) : articles.length > 0 ? (
          <div className="space-y-3">
            {articles.map((article, index) => (
              <a 
                key={index} 
                href={article.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block"
              >
                <div className="p-3 rounded-lg border border-vision-purple-200/20 bg-vision-purple-200/5 backdrop-blur-sm hover:bg-vision-purple-200/10 transition-colors">
                  <div className="flex justify-between">
                    <h4 className="text-sm font-medium text-white line-clamp-2">{article.title}</h4>
                    <ExternalLink className="h-4 w-4 text-white/50 flex-shrink-0 ml-2" />
                  </div>
                  
                  <p className="text-xs text-white/70 mt-1 line-clamp-2">{article.description}</p>
                  
                  <div className="flex items-center justify-between mt-2 text-[10px] text-white/50">
                    <div className="flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      <span>{article.country || "Global"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>{article.source}</span>
                      <span>•</span>
                      <span>{formatDate(article.date)}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
            {lastFetched && (
              <div className="pt-1 text-[10px] text-white/40 text-right">
                Last updated: {new Date(lastFetched).toLocaleDateString()} {new Date(lastFetched).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        ) : (
          <div className="h-40 flex flex-col items-center justify-center">
            <p className="text-white/80 text-sm">No startup news available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}