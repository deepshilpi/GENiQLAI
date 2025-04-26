import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Interface for brand name generation request
export interface BrandNameRequest {
  keywords: string[];
  category: string;
  audienceType: string;
  count?: number;
}

// Interface for brand name generation response
export interface BrandNameResponse {
  brandNames: Array<{
    name: string;
    description: string;
    appealRating: number;
    memorabilityRating: number;
  }>;
  message: string;
}

/**
 * Generates brand name suggestions based on provided parameters
 * 
 * @param params The brand name generation parameters
 * @returns Brand name suggestions with descriptions and ratings
 */
export async function generateBrandNames(params: BrandNameRequest): Promise<BrandNameResponse> {
  try {
    const { keywords, category, audienceType, count = 5 } = params;
    
    // Create a detailed prompt for the AI
    const systemPrompt = `You are a brand naming expert specializing in creating memorable, distinctive, and market-appropriate brand names. 
    Consider trademark availability, domain availability, and linguistic appeal.`;
    
    const userPrompt = `Generate ${count} brand name suggestions for a ${category} business targeting ${audienceType}. 
    Use these keywords for inspiration: ${keywords.join(", ")}.
    
    For each brand name:
    1. Provide a short description of its meaning and relevance
    2. Rate its appeal to the target audience on a scale of 1-10
    3. Rate its memorability on a scale of 1-10
    
    Return the response as a JSON object with this format:
    {
      "brandNames": [
        {
          "name": "BrandName",
          "description": "Short description of the brand name",
          "appealRating": 8,
          "memorabilityRating": 9
        },
        ...more brand names
      ],
      "message": "A summary of the naming strategy and why these names would work well"
    }`;
    
    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });
    
    // Parse the response
    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("No content returned from OpenAI");
    }
    
    const parsedResponse = JSON.parse(content) as BrandNameResponse;
    return parsedResponse;
  } catch (error) {
    console.error("Error generating brand names:", error);
    throw new Error(`Failed to generate brand names: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}