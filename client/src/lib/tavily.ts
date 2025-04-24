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
    // This endpoint is authenticated but we'll handle the error gracefully
    const response = await apiRequest("GET", "/api/news");
    
    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error === "auth_required") {
        // For unauthenticated users, return empty array (handled in UI)
        return [];
      }
      throw new Error(errorData.message || "Failed to fetch news");
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching news articles:", error);
    return [];
  }
}