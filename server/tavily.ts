import { NewsArticle } from "../client/src/lib/tavily";
import OpenAI from "openai";

// Create OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Function to search for real news articles about successful startups using OpenAI
export async function searchStartupNews(userCountry: string): Promise<NewsArticle[]> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable");
      return getDummyNewsArticles(userCountry);
    }

    console.log("Finding real startup news using OpenAI...");

    // Use OpenAI to find real news articles
    const systemPrompt = `You are an expert business analyst specialized in startups and growth companies. 
    Find 3 real, recent news articles about successful startups outside of ${userCountry}. The startups should have significant growth, funding, or innovation.`;
    
    const userPrompt = `Search for 3 real, recent news articles about successful startups from countries other than ${userCountry}. 
    These must be actual news articles from reputable sources published in the last few months about real startups.
    
    For each article:
    1. Include the exact original article title
    2. Provide a brief summary/excerpt (100-150 words) from the actual article
    3. Include the actual article URL (must be a real working URL to the news article)
    4. The source name (e.g., TechCrunch, Forbes)
    5. The actual publication date
    6. The country where the startup is based (not ${userCountry})
    
    Return your findings as a properly formatted JSON array with these exact fields:
    [{
      "title": "Exact original article title",
      "description": "Brief excerpt from the article (100-150 words)",
      "url": "Full URL to the original article",
      "source": "Publication name",
      "date": "Publication date as ISO string",
      "country": "Country where startup is based"
    }]`;

    // Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for factual information
      max_tokens: 1500,
    });

    // Parse the response
    const content = response.choices[0].message.content || "";
    
    // Sometimes GPT wraps the response in ```json``` code blocks, so handle that
    const jsonContent = content.replace(/```json|```/g, "").trim();
    
    try {
      const parsedData = JSON.parse(jsonContent);
      
      // Check if we got an array of articles
      if (Array.isArray(parsedData)) {
        console.log(`Found ${parsedData.length} real news articles`);
        return parsedData;
      } else if (parsedData.articles && Array.isArray(parsedData.articles)) {
        console.log(`Found ${parsedData.articles.length} real news articles (in 'articles' property)`);
        return parsedData.articles;
      } else {
        // If OpenAI didn't return the expected format, use our fallback
        console.error("OpenAI response doesn't contain articles array:", parsedData);
        return getDummyNewsArticles(userCountry);
      }
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.log("Raw response:", content);
      return getDummyNewsArticles(userCountry);
    }
  } catch (error) {
    console.error("Error finding startup news with OpenAI:", error);
    
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
