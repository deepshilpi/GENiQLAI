import { NewsArticle } from "../client/src/lib/tavily";
import OpenAI from "openai";

// Create OpenAI client
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Function to search for news articles about successful startups in other countries using OpenAI
export async function searchStartupNews(userCountry: string): Promise<NewsArticle[]> {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("Missing OPENAI_API_KEY environment variable");
      return getDummyNewsArticles(userCountry);
    }

    console.log("Generating startup news using OpenAI...");

    // Craft a detailed prompt for GPT to generate realistic startup news
    const systemPrompt = `You are an expert on global startups and business intelligence. Generate 3 realistic news articles about successful startups outside of ${userCountry} that could expand to ${userCountry} or be inspirational for entrepreneurs in ${userCountry}.`;
    
    const userPrompt = `Create 3 very specific, detailed and realistic news articles about startups outside ${userCountry} that are growing rapidly. Each article should have a compelling title, detailed description (150-200 words), realistic source (like TechCrunch, Forbes, etc.), a URL, a realistic publication date within the last 30 days, and country of origin.

The articles should:
1. Focus on innovative startups in different industries 
2. Mention real growth metrics and funding amounts
3. Include realistic founder names and company details
4. Have plausible expansion plans
5. Use domain geniql.com in URLs
6. Specifically focus on startups from different countries excluding ${userCountry}
7. Include realistic dates in the last 30 days

Return your response as a properly formatted JSON array of 3 articles with these exact fields:
[{
  "title": "string",
  "description": "string",
  "url": "string with geniql.com domain",
  "source": "string",
  "date": "ISO date string within last 30 days",
  "country": "string (not ${userCountry})"
}]`;

    // Send request to OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Somewhat creative but still factual
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
        return parsedData;
      } else if (parsedData.articles && Array.isArray(parsedData.articles)) {
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
    console.error("Error generating startup news with OpenAI:", error);
    
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
