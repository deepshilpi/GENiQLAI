import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink } from "lucide-react";
import { fetchNewsArticles } from "@/lib/tavily";
import { NewsArticle } from "@/lib/tavily";
import { truncateText, timeAgo } from "@/lib/utils";

export function NewsArticles() {
  const { data: articles, isLoading, error } = useQuery<NewsArticle[]>({
    queryKey: ["/api/news"],
    queryFn: fetchNewsArticles,
  });

  if (isLoading) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Startup Opportunities</h2>
          <div className="text-sm text-muted-foreground">
            <span className="text-primary">Pro feature:</span> Trending startups from around the world
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index} className="bg-card border-border">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 bg-accent" />
                <Skeleton className="h-4 w-1/2 bg-accent mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-20 w-full bg-accent" />
                <div className="flex justify-between mt-4">
                  <Skeleton className="h-4 w-1/4 bg-accent" />
                  <Skeleton className="h-4 w-1/4 bg-accent" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Startup Opportunities</h2>
        </div>
        <Card className="bg-card border-border">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-2">Error loading startup news</p>
            <p className="text-muted-foreground text-sm">
              Please try again later or contact support if the problem persists.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Startup Opportunities</h2>
        <div className="text-sm text-muted-foreground">
          <span className="text-primary">Pro feature:</span> Trending startups from around the world
        </div>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">All Markets</TabsTrigger>
          <TabsTrigger value="tech">Tech</TabsTrigger>
          <TabsTrigger value="fintech">Fintech</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles && articles.length > 0 ? (
              articles.map((article, index) => (
                <Card key={index} className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {truncateText(article.title, 60)}
                      </a>
                    </CardTitle>
                    <CardDescription>
                      {article.source} • {new Date(article.date).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {truncateText(article.description, 120)}
                    </p>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{article.country}</span>
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary flex items-center hover:underline"
                      >
                        Read more <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center p-8">
                <p className="text-muted-foreground">No articles found. Check back soon for updates.</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Other tabs would filter articles by category in a real implementation */}
        {["tech", "fintech", "health"].map((category) => (
          <TabsContent key={category} value={category}>
            <div className="text-center p-8">
              <p className="text-muted-foreground">
                {articles && articles.length > 0 
                  ? "Filtering by category will be available soon."
                  : "No articles found in this category."}
              </p>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
