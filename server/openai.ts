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
    // Determine which blocks to include based on the user's plan
    const includeProBlocks = planType === "pro" || planType === "unicorn";
    
    // Build the system prompt with instructions
    const systemPrompt = `You are a startup analysis expert. Analyze the startup idea for ${country} market and provide detailed insights in JSON format.
    
    Your analysis should contain the following blocks:
    1. successRate: percentage (0-100) and a brief message about the likelihood of success
    2. competitors: list of top competitors with their market share percentages and a summary message
    3. marketViability: list of points about market conditions, each with title, subtitle, and type (success, warning, or danger)
    4. uniqueValueProposition: the key differentiator and list of strengths
    
    ${includeProBlocks ? `Additionally, include these blocks:
    5. cagr: industry average and potential growth percentages, plus yearly data for charting
    6. previousFailedExecutions: examples of similar startups that failed with reasons
    7. fundingRequirements: seed and series A funding ranges, and allocation percentages
    8. goToMarketStrategy: step-by-step approach with timeframes` : ""}
    
    Format your response as a JSON object with these exact field names and nested structure.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this startup idea for the ${country} market: ${startupIdea}` }
      ],
      response_format: { type: "json_object" }
    });

    const analysisContent = JSON.parse(response.choices[0].message.content || "{}");
    return analysisContent as AnalysisResults;
  } catch (error) {
    console.error("OpenAI analysis error:", error);
    throw new Error("Failed to analyze startup idea");
  }
}

// Generate execution plan with budget and roadmap (Unicorn feature)
export async function generateExecutionPlan(
  startupIdea: string,
  initialBudget: number
): Promise<AnalysisResults["planningToExecute"]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a startup execution planning expert. Create a detailed budget and execution plan for a startup with an initial budget of $${initialBudget}. 
          
          Return a JSON object with:
          1. budget: breakdown of costs for development, marketing, and operations (percentages and actual amounts)
          2. roadmap: array of steps, each with name, timeframe, and cost
          
          Format your response as a JSON object that would fit the 'planningToExecute' field in a larger analysis structure.`
        },
        {
          role: "user",
          content: `Create a budget and execution plan for this startup idea with an initial budget of $${initialBudget}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const planContent = JSON.parse(response.choices[0].message.content || "{}");
    return planContent as AnalysisResults["planningToExecute"];
  } catch (error) {
    console.error("OpenAI execution plan error:", error);
    throw new Error("Failed to generate execution plan");
  }
}

// Find potential investors for a startup idea (Unicorn feature)
export async function findInvestors(
  startupIdea: string,
  country: string
): Promise<AnalysisResults["findingInvestors"]> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in startup investment. For the given startup idea, suggest 5 potential investors that might be interested in this type of startup in the specified country.
          
          Return a JSON object with:
          'investors': array of 5 objects, each with:
          - name: investor's name
          - firm: investment firm
          - tags: array of 2-3 tags (industry focus, stage preference, etc.)
          - crunchbaseLink: fictional but realistic looking Crunchbase URL
          
          Format your response as a JSON object that would fit the 'findingInvestors' field in a larger analysis structure.
          
          IMPORTANT DISCLAIMER: The investor information is AI-generated and for illustration purposes only. Always verify manually before contacting.`
        },
        {
          role: "user",
          content: `Find potential investors for this startup idea in ${country}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" }
    });

    const investorsContent = JSON.parse(response.choices[0].message.content || "{}");
    return investorsContent as AnalysisResults["findingInvestors"];
  } catch (error) {
    console.error("OpenAI investors error:", error);
    throw new Error("Failed to find potential investors");
  }
}
