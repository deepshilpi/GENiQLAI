import { apiRequest } from "./queryClient";

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  date: string;
  country: string;
}

export async function fetchNewsArticles(): Promise<NewsArticle[]> {
  try {
    // The endpoint is now open to all users
    const response = await apiRequest("GET", "/api/news");
    
    if (!response.ok) {
      throw new Error("Failed to fetch news");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching news articles:", error);
    return [];
  }
}