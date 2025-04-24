import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ExternalLink, Globe } from "lucide-react";
import { fetchNewsArticles, NewsArticle } from "@/lib/tavily";

export function StartupNews() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadNews() {
      try {
        setLoading(true);
        const data = await fetchNewsArticles();
        // Only show 3 articles as requested
        setArticles(data.slice(0, 3));
      } catch (err: any) {
        console.error("Error loading news:", err);
        setError(err.message || "Failed to load startup news");
      } finally {
        setLoading(false);
      }
    }

    loadNews();
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
        <CardTitle className="text-base text-white font-medium">
          Growing Startups Outside India
        </CardTitle>
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