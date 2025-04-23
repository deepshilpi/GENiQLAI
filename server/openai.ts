import OpenAI from "openai";
import { AnalysisResults } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
if (!process.env.OPENAI_API_KEY) {
  console.warn("Missing OPENAI_API_KEY environment variable. AI analysis features will not work properly.");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Function to analyze a startup idea using ChatGPT API
export async function analyzeStartupIdea(
  startupIdea: string,
  country: string,
  planType: string
): Promise<AnalysisResults> {
  try {
    console.log("Starting OpenAI analysis for startup idea...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    // Determine which blocks to include based on the user's plan
    const includeProBlocks = planType === "pro" || planType === "unicorn";
    
    // Build the system prompt with instructions
    const systemPrompt = `You are a startup analysis expert. Analyze the startup idea for ${country} market and provide detailed insights in JSON format.
    
    Your analysis should contain the following blocks:
    1. successRate: Object with percentage (number from a scale of 0-100), message (string), positivePoint (string), negativePoint (string)
    2. competitors: Object with competitors array (each with name, marketShare as number, and website as string) and message (string) and totalMarketSize (number)
    3. targetAudienceFit: Object with segments array (each with name, score, maxScore), message (string), and overallFit (number from 0-1)
    4. marketSize: Object with total (number), segments array (each with name, value, percentage), cagr (number), and message (string)
    5. businessModelStrength: Object with overallScore (number 0-100), categories array (each with name, score, maxScore, description), and message (string)
    6. fundingRequirements: Object with seedRound (min/max), seriesA (min/max/timeframe), allocation (productDevelopment, marketing, operations percentages), and message (string)
    7. swotAnalysis: Object with strengths (string array), weaknesses (string array), opportunities (string array), threats (string array), and message (string)
    8. previousFailedExecutions: Object with failures array (each with name, year, reason, and relevance as number 0-100) and message (string)
    
    ${includeProBlocks ? `Additionally, include these blocks:
    9. relatedIdeas: Array of objects (each with title, description, similarityScore 0-100, potentialScore 0-100)
    10. feasibilityAnalysis: Object with overallScore (number 0-100), scalabilityTrajectory array (milestone, score, description), breakEvenPoint (timeframe, investment), and message (string)
    11. riskAnalysis: Object with overallRiskScore (number 0-100, higher means riskier), riskFactors array (name, probability 0-100, impact 0-100, mitigation), and message (string)
    12. goToMarketStrategy: Object with stages array (name, timeframe, tasks array, budget), totalTimeEstimate (string), and message (string)
    13. longTermVision: Object with milestones array (title, timeframe, description, targetMetric with name and value), and message (string)
    14. teamStructure: Object with coreRoles array (title, priority as 'high'/'medium'/'low', skills array, estimatedCost), recommendedTeamSize (initial, yearOne, yearThree), and message (string)
    15. potentialInvestors: Object with investors array (name, firm, focusAreas array, typicalInvestment with min/max, portfolioFit 0-100, country, and optional contactInfo and crunchbaseLink), and message (string)` : ""}
    
    Follow the exact format specified. Return ONLY a valid JSON object without any explanations, text, or markdown before or after.`;

    console.log("Sending request to OpenAI API...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this startup idea for the ${country} market: ${startupIdea}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 3000
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI:", response);
      throw new Error("Invalid response from AI service");
    }

    console.log("Received response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      const analysisContent = JSON.parse(content);
      
      // Validate the basic structure of the response
      if (!analysisContent.successRate || 
          !analysisContent.competitors || 
          !analysisContent.targetAudienceFit || 
          !analysisContent.marketSize ||
          !analysisContent.businessModelStrength ||
          !analysisContent.fundingRequirements ||
          !analysisContent.swotAnalysis) {
        console.error("Missing required fields in response:", analysisContent);
        throw new Error("Invalid response structure from AI service");
      }
      
      return analysisContent as AnalysisResults;
    } catch (parseError) {
      console.error("Failed to parse OpenAI response:", parseError);
      console.error("Response content:", response.choices[0].message.content);
      throw new Error("Failed to parse analysis results");
    }
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to analyze startup idea");
    }
  }
}

// Generate execution plan with budget and roadmap (Unicorn feature)
export async function generateExecutionPlan(
  startupIdea: string,
  initialBudget: number
): Promise<AnalysisResults["planningToExecute"]> {
  try {
    console.log("Starting OpenAI execution plan generation...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    console.log("Sending request to OpenAI API for execution plan...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a startup execution planning expert. Create a detailed budget and execution plan for a startup with an initial budget of $${initialBudget}. 
          
          Return a JSON object with:
          1. budget: Object with development (number), marketing (number), operations (number)
          2. roadmap: Array of objects, each with step (string), timeframe (string), and cost (number)
          
          Format your response as a JSON object that would fit the 'planningToExecute' field in a larger analysis structure.
          Return ONLY a valid JSON object without any explanations, text, or markdown before or after.`
        },
        {
          role: "user",
          content: `Create a budget and execution plan for this startup idea with an initial budget of $${initialBudget}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 2000
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI for execution plan:", response);
      throw new Error("Invalid response from AI service");
    }
    
    console.log("Received execution plan response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      const planContent = JSON.parse(content);
      
      // Validate the basic structure
      if (!planContent.budget || !planContent.roadmap) {
        console.error("Missing required fields in execution plan response:", planContent);
        throw new Error("Invalid execution plan structure");
      }
      
      return planContent as AnalysisResults["planningToExecute"];
    } catch (parseError) {
      console.error("Failed to parse OpenAI execution plan response:", parseError);
      console.error("Response content:", response.choices[0].message.content);
      throw new Error("Failed to parse execution plan results");
    }
  } catch (error) {
    console.error("OpenAI execution plan error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to generate execution plan");
    }
  }
}

// Find potential investors for a startup idea (Unicorn feature)
export async function findInvestors(
  startupIdea: string,
  country: string
): Promise<AnalysisResults["potentialInvestors"]> {
  try {
    console.log("Starting OpenAI investors search...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    console.log("Sending request to OpenAI API for investors...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in startup investment. For the given startup idea, suggest 5 potential investors that might be interested in this type of startup in the specified country.
          
          Return a JSON object with:
          'investors': array of 5 objects, each with:
          - name: investor's name (string)
          - firm: investment firm (string)
          - tags: array of 2-3 strings (industry focus, stage preference, etc.)
          - crunchbaseLink: fictional but realistic looking Crunchbase URL (string)
          
          Format your response as a JSON object that would fit the 'potentialInvestors' field in a larger analysis structure.
          Return ONLY a valid JSON object without any explanations, text, or markdown before or after.
          
          IMPORTANT DISCLAIMER: The investor information is AI-generated and for illustration purposes only. Always verify manually before contacting.`
        },
        {
          role: "user",
          content: `Find potential investors for this startup idea in ${country}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1500
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI for investors:", response);
      throw new Error("Invalid response from AI service");
    }
    
    console.log("Received investors response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      const investorsContent = JSON.parse(content);
      
      // Validate the basic structure
      if (!investorsContent.investors || !Array.isArray(investorsContent.investors)) {
        console.error("Missing required fields in investors response:", investorsContent);
        throw new Error("Invalid investors response structure");
      }
      
      return investorsContent as AnalysisResults["potentialInvestors"];
    } catch (parseError) {
      console.error("Failed to parse OpenAI investors response:", parseError);
      console.error("Response content:", response.choices[0].message.content);
      throw new Error("Failed to parse investors results");
    }
  } catch (error) {
    console.error("OpenAI investors error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to find potential investors");
    }
  }
}
