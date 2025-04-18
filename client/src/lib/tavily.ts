// Interface for news articles returned from Tavily API
export interface NewsArticle {
  title: string;
  url: string;
  description: string;
  date: string;
  source: string;
  country: string;
}

// Function to fetch news articles from backend which uses Tavily API
export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  try {
    const response = await fetch("/api/news", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching news articles:", error);
    throw error;
  }
}
