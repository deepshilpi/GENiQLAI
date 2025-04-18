import { NewsArticle } from "../client/src/lib/tavily";

// Function to search for news articles about successful startups in other countries
export async function searchStartupNews(userCountry: string): Promise<NewsArticle[]> {
  try {
    const apiKey = process.env.TAVILY_API_KEY || "tavily-placeholder-key";
    const url = "https://api.tavily.com/search";
    
    const query = `successful startups outside of ${userCountry} that could expand to ${userCountry}`;
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey
      },
      body: JSON.stringify({
        query: query,
        search_depth: "advanced",
        include_domains: ["techcrunch.com", "forbes.com", "entrepreneur.com", "inc.com", "bloomberg.com"],
        include_answer: false,
        include_images: false,
        include_raw_content: false,
        max_results: 5,
        published_time: "30d" // Last 30 days
      })
    });
    
    if (!response.ok) {
      throw new Error(`Tavily API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Transform Tavily results to our NewsArticle format
    const articles: NewsArticle[] = data.results.map((result: any) => ({
      title: result.title,
      url: result.url,
      description: result.content.substring(0, 200) + "...",
      date: result.published_date || new Date().toISOString(),
      source: result.source || getDomainFromUrl(result.url),
      country: detectCountryFromArticle(result.content, userCountry)
    }));
    
    return articles;
  } catch (error) {
    console.error("Error searching startup news:", error);
    
    // For demo purposes, return dummy data if API call fails
    if (process.env.NODE_ENV !== "production") {
      return getDummyNewsArticles(userCountry);
    }
    
    throw error;
  }
}

// Helper function to extract domain from URL
function getDomainFromUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    const parts = hostname.split(".");
    if (parts.length >= 2) {
      if (parts[0] === "www") {
        return parts.slice(1).join(".");
      } else {
        return parts.join(".");
      }
    }
    return hostname;
  } catch (error) {
    return "Unknown Source";
  }
}

// Helper function to detect country from article content
function detectCountryFromArticle(content: string, userCountry: string): string {
  // List of countries to check
  const countries = [
    "United States", "UK", "Canada", "Australia", "Germany", 
    "France", "Japan", "China", "India", "Brazil", "Singapore"
  ];
  
  // Filter out user's country
  const otherCountries = countries.filter(c => c !== userCountry);
  
  // Find first country mentioned in the content
  for (const country of otherCountries) {
    if (content.includes(country)) {
      return country;
    }
  }
  
  // Return a random country if none is detected
  return otherCountries[Math.floor(Math.random() * otherCountries.length)];
}

// Fallback function for demo purposes
function getDummyNewsArticles(userCountry: string): NewsArticle[] {
  const countries = ["United States", "Singapore", "United Kingdom", "Germany", "Israel"];
  const otherCountries = countries.filter(c => c !== userCountry);
  
  return [
    {
      title: "AI-Powered Education Platform Raises $50M in Series B",
      url: "https://techcrunch.com/example-1",
      description: "EduTech startup has developed an AI tutoring system that personalizes learning experiences for K-12 students, showing remarkable improvement in test scores across multiple subjects.",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      source: "TechCrunch",
      country: otherCountries[0]
    },
    {
      title: "Sustainable Packaging Startup Disrupts Food Delivery Industry",
      url: "https://forbes.com/example-2",
      description: "GreenPack has created biodegradable food containers that break down in 30 days, already partnering with major food delivery services and considering global expansion.",
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
      source: "Forbes",
      country: otherCountries[1]
    },
    {
      title: "Mental Health Platform for Remote Workers Sees Exponential Growth",
      url: "https://entrepreneur.com/example-3",
      description: "MindfulWork provides on-demand therapy and mental wellness tools specifically designed for distributed teams, reporting 300% user growth in the past quarter.",
      date: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(), // 18 days ago
      source: "Entrepreneur",
      country: otherCountries[2]
    },
    {
      title: "Autonomous Delivery Robots Transform Last-Mile Logistics",
      url: "https://inc.com/example-4",
      description: "RoboDelivery's small autonomous vehicles are navigating sidewalks to deliver packages in urban areas, reducing delivery costs by up to 40% and emissions by 70%.",
      date: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000).toISOString(), // 23 days ago
      source: "Inc.",
      country: otherCountries[3]
    },
    {
      title: "Vertical Farming Company Secures $75M to Build Indoor Farms Globally",
      url: "https://bloomberg.com/example-5",
      description: "UrbanCrops uses advanced hydroponics and AI climate control to grow vegetables with 95% less water and 99% less land than traditional farming methods.",
      date: new Date(Date.now() - 27 * 24 * 60 * 60 * 1000).toISOString(), // 27 days ago
      source: "Bloomberg",
      country: otherCountries[4]
    }
  ];
}
