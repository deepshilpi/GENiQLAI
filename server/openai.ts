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
    
    // Build the system prompt with instructions for the enhanced analysis
    const systemPrompt = `You are a startup analysis expert with extensive experience in venture capital and market analysis. Analyze the startup idea for the ${country} market and provide comprehensive, detailed insights in JSON format.
    
    FOCUS ON SPEED AND EFFICIENCY while maintaining high quality and detail. Your analysis must be thorough but produced quickly.
    
    IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.
    
    Your analysis MUST contain the following 8 interactive blocks in this exact JSON structure:
    
    1. successRate: Object with {
       percentage: number from 0-100,
       goodPoints: array of 2-3 strings explaining positive factors,
       badPoints: array of 2-3 strings explaining negative factors,
       message: string summarizing the overall success likelihood
    }
    
    2. competitors: Object with {
       competitors: array of objects, each with {
         name: string (company name),
         marketShare: number (percentage of market),
         websiteUrl: string (fictional but realistic URL)
       },
       message: string summarizing the competitive landscape
    }
    
    3. targetAudienceFit: Object with {
       segments: array of objects, each with {
         name: string (demographic or segment name),
         score: number from 0-100 (how well idea fits this segment)
       },
       message: string explaining audience alignment
    }
    
    4. marketSize: Object with {
       segments: array of objects, each with {
         name: string (e.g., "local", "national", "global"),
         percentage: number,
         value: number (estimated dollar size in millions)
       },
       totalSize: number (total market size in millions),
       message: string explaining market size impact
    }
    
    5. businessModelStrength: Object with {
       overall: number from 0-100,
       components: array of objects, each with {
         name: string (revenue model component),
         score: number from 0-100,
         description: string explaining this aspect
       },
       message: string summarizing overall business model
    }
    
    6. fundingRequired: Object with {
       total: number (total funding needed in USD),
       breakdown: array of objects, each with {
         category: string (e.g., "Product Development", "Marketing"),
         amount: number (USD amount),
         percentage: number (of total funding)
       },
       message: string explaining funding needs
    }
    
    7. swotAnalysis: Object with {
       strengths: array of strings (4-5 items),
       weaknesses: array of strings (4-5 items),
       opportunities: array of strings (4-5 items),
       threats: array of strings (4-5 items)
    }
    
    8. previousFailedExecutions: Object with {
       failures: array of objects, each with {
         name: string (company name),
         year: string (year of failure),
         reason: string (primary reason for failure)
       },
       message: string explaining what can be learned
    }
    
    ${includeProBlocks ? `
    9. relatedIdeas: Array of objects, each with {
       title: string (related startup idea),
       description: string (brief explanation),
       potentialScore: number from 0-100 (potential success)
    }
    ` : ''}
    
    All blocks must follow the exact schema specified. Make sure all arrays have at least 3-5 items for richness. All numerical values must be realistic.
    
    Use appropriate categories and metrics for the specific startup industry. Make the analysis interesting, insightful, and actionable.
    
    Return ONLY a valid JSON object without any explanations, text, or markdown before or after.`;

    console.log("Sending enhanced analysis request to OpenAI API...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this startup idea for the ${country} market in detail: ${startupIdea}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more focused and faster responses
      max_tokens: 4000,
      top_p: 0.9,
      frequency_penalty: 0.2, // Slightly reduce repetition
      presence_penalty: 0.1 // Slightly encourage topic variety
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI:", response);
      throw new Error("Invalid response from AI service");
    }

    console.log("Received enhanced analysis response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      console.log("Raw OpenAI API response content:", content.substring(0, 200) + "...");
      
      // Attempt to parse the JSON content
      let analysisContent;
      try {
        analysisContent = JSON.parse(content);
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError);
        console.error("Problematic content:", content);
        throw new Error("Failed to parse JSON from OpenAI response");
      }
      
      // Log the available fields for debugging
      console.log("Fields present in the response:", Object.keys(analysisContent));
      
      // Check for partial responses and populate missing fields with defaults
      const requiredFields = [
        'successRate', 'competitors', 'targetAudienceFit', 'marketSize', 
        'businessModelStrength', 'fundingRequired', 'swotAnalysis', 'previousFailedExecutions'
      ];
      
      const missingFields = requiredFields.filter(field => !analysisContent[field]);
      
      if (missingFields.length > 0) {
        console.warn("Missing fields in analysis response:", missingFields);
        
        // Instead of failing, populate missing fields with defaults
        if (!analysisContent.successRate) {
          analysisContent.successRate = {
            percentage: 50,
            goodPoints: ["Analysis incomplete - please try again"],
            badPoints: ["Server encountered an issue processing your request"],
            message: "Analysis could not be fully completed"
          };
        }
        
        if (!analysisContent.competitors) {
          analysisContent.competitors = {
            competitors: [],
            message: "Could not analyze competitors at this time"
          };
        }
        
        if (!analysisContent.targetAudienceFit) {
          analysisContent.targetAudienceFit = {
            segments: [],
            message: "Could not analyze target audience at this time"
          };
        }
        
        if (!analysisContent.marketSize) {
          analysisContent.marketSize = {
            segments: [],
            message: "Could not analyze market size at this time"
          };
        }
        
        if (!analysisContent.businessModelStrength) {
          analysisContent.businessModelStrength = {
            overall: 50,
            components: [],
            message: "Could not analyze business model at this time"
          };
        }
        
        if (!analysisContent.fundingRequired) {
          analysisContent.fundingRequired = {
            total: 0,
            breakdown: [],
            message: "Could not analyze funding requirements at this time"
          };
        }
        
        if (!analysisContent.swotAnalysis) {
          analysisContent.swotAnalysis = {
            strengths: ["Could not analyze strengths at this time"],
            weaknesses: ["Could not analyze weaknesses at this time"],
            opportunities: ["Could not analyze opportunities at this time"],
            threats: ["Could not analyze threats at this time"]
          };
        }
        
        if (!analysisContent.previousFailedExecutions) {
          analysisContent.previousFailedExecutions = {
            failures: [],
            message: "Could not analyze previous failures at this time"
          };
        }
        
        console.log("Added default values for missing fields in OpenAI response");
      }
      
      return analysisContent as AnalysisResults;
    } catch (parseError) {
      console.error("Failed to parse OpenAI enhanced analysis response:", parseError);
      if (response.choices && response.choices.length > 0) {
        console.error("Response content snippet:", 
          response.choices[0].message.content.substring(0, 500));
      }
      throw new Error("Failed to parse analysis results");
    }
  } catch (error) {
    console.error("OpenAI enhanced analysis error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to analyze startup idea");
    }
  }
}

// Generate comprehensive budget-based analysis (Enhanced feature for paid plans)
export async function generateBudgetAnalysis(
  startupIdea: string,
  initialBudget: number,
  country: string
): Promise<AnalysisResults["budgetAnalysis"]> {
  try {
    console.log("Starting OpenAI budget analysis generation...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    console.log("Sending request to OpenAI API for budget analysis...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a startup execution planning and financial analysis expert. Create a comprehensive budget-based analysis for a startup idea with an initial budget of $${initialBudget}. 
          
          Return a JSON object with exactly the following structure:
          
          {
            "initialBudget": ${initialBudget},
            
            "feasibilityAndScalability": {
              "initialFeasibility": number from 0-100,
              "scalingPoints": [
                {
                  "milestone": string (clear business milestone),
                  "investment": number (additional investment needed),
                  "potentialReturns": number (estimated ROI),
                  "feasibilityScore": number from 0-100
                },
                ... at least 3 scaling points
              ],
              "message": string (explaining feasibility and scaling path)
            },
            
            "riskAnalysis": {
              "overallRisk": number from 0-100 (higher means more risky),
              "risks": [
                {
                  "category": string (risk category),
                  "likelihood": number from 0-100,
                  "impact": number from 0-100,
                  "mitigationStrategy": string (clear explanation)
                },
                ... at least 4-5 different risks
              ],
              "message": string (summarizing risk profile)
            },
            
            "goToMarketStrategy": {
              "timeline": [
                {
                  "phase": string (phase name),
                  "duration": string (e.g., "3 months"),
                  "activities": array of strings (major activities),
                  "estimatedCost": number (cost for this phase)
                },
                ... at least 3-4 phases
              ],
              "message": string (explaining GTM approach)
            },
            
            "longTermVision": {
              "milestones": [
                {
                  "year": string (e.g., "Year 1"),
                  "goals": array of strings (3-4 key objectives),
                  "projectedMetrics": {
                    "revenue": number (projected revenue),
                    "users": number (projected user count if applicable),
                    "marketShare": number (projected market share percentage)
                  }
                },
                ... at least 3 years of milestones
              ],
              "message": string (explaining long-term vision)
            },
            
            "teamExecutionCapability": {
              "requiredRoles": [
                {
                  "title": string (role title),
                  "skills": array of strings (required skills),
                  "importance": number from 0-100,
                  "estimatedCost": number (annual salary or cost)
                },
                ... at least 4-5 key roles
              ],
              "hiringTimeline": string (hiring sequence),
              "message": string (explaining talent requirements)
            },
            
            "fundingAndInvestmentPotential": {
              "investors": [
                {
                  "name": string (investor name),
                  "firm": string (investment firm),
                  "investmentFocus": array of strings (focus areas),
                  "location": string (country/region),
                  "contactInfo": string (fictional contact method),
                  "portfolioFit": number from 0-100
                },
                ... exactly 5 investors
              ],
              "message": string (explaining funding approach)
            }
          }
          
          Make sure all monetary values are realistic for the startup type and scale in ${country}.
          All data should be detailed, specific, and actionable.
          IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.`
        },
        {
          role: "user",
          content: `Create a comprehensive budget analysis for this startup idea in ${country} with an initial budget of $${initialBudget}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more focused and faster responses
      max_tokens: 4000,
      top_p: 0.9,
      frequency_penalty: 0.2, // Slightly reduce repetition
      presence_penalty: 0.1 // Slightly encourage topic variety
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI for budget analysis:", response);
      throw new Error("Invalid response from AI service");
    }
    
    console.log("Received budget analysis response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      const budgetAnalysisContent = JSON.parse(content);
      
      // Validate the basic structure
      if (!budgetAnalysisContent.initialBudget || 
          !budgetAnalysisContent.feasibilityAndScalability ||
          !budgetAnalysisContent.riskAnalysis ||
          !budgetAnalysisContent.goToMarketStrategy ||
          !budgetAnalysisContent.longTermVision ||
          !budgetAnalysisContent.teamExecutionCapability ||
          !budgetAnalysisContent.fundingAndInvestmentPotential) {
        console.error("Missing required fields in budget analysis response:", budgetAnalysisContent);
        throw new Error("Invalid budget analysis structure");
      }
      
      return budgetAnalysisContent as AnalysisResults["budgetAnalysis"];
    } catch (parseError) {
      console.error("Failed to parse OpenAI budget analysis response:", parseError);
      console.error("Response content:", response.choices[0].message.content);
      throw new Error("Failed to parse budget analysis results");
    }
  } catch (error) {
    console.error("OpenAI budget analysis error:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Failed to generate budget analysis");
    }
  }
}

// Legacy function kept for backward compatibility
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
          IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.`
        },
        {
          role: "user",
          content: `Create a budget and execution plan for this startup idea with an initial budget of $${initialBudget}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more focused and faster responses
      max_tokens: 2000,
      top_p: 0.9,
      frequency_penalty: 0.2, // Slightly reduce repetition
      presence_penalty: 0.1 // Slightly encourage topic variety
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
): Promise<AnalysisResults["findingInvestors"]> {
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
          
          Format your response as a JSON object that would fit the 'findingInvestors' field in a larger analysis structure.
          IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.
          
          IMPORTANT DISCLAIMER: The investor information is AI-generated and for illustration purposes only. Always verify manually before contacting.`
        },
        {
          role: "user",
          content: `Find potential investors for this startup idea in ${country}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more focused and faster responses
      max_tokens: 1500,
      top_p: 0.9,
      frequency_penalty: 0.2, // Slightly reduce repetition
      presence_penalty: 0.1 // Slightly encourage topic variety
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
      
      return investorsContent as AnalysisResults["findingInvestors"];
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
