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
    
    // Build a streamlined system prompt for faster response times
    const systemPrompt = `You are a startup analyst. Provide a QUICK analysis for the ${country} market. FOCUS ON SPEED AND BREVITY.
    
    IMPORTANT: Respond QUICKLY with CONCISE analysis. Use shorter responses in all fields.

    Return a JSON with exactly these blocks - smaller and briefer than normal:
    
    1. successRate: {
       percentage: number (0-100),
       goodPoints: [3 very brief strings only - 10 words max each],
       badPoints: [3 very brief strings only - 10 words max each],
       message: string (20 words maximum)
    }
    
    2. competitors: {
       competitors: [
         {
           name: string,
           marketShare: number,
           websiteUrl: string
         },
         ... exactly 3 competitors only
       ],
       message: string (15 words maximum)
    }
    
    3. targetAudienceFit: {
       segments: [
         {
           name: string,
           score: number (0-100)
         },
         ... exactly 3 segments only
       ],
       message: string (15 words maximum)
    }
    
    4. marketSize: {
       segments: [
         {
           name: string (e.g., "local", "national", "global"),
           percentage: number,
           value: number (millions)
         },
         ... exactly 3 segments only
       ],
       totalSize: number (millions),
       cagr: number (percentage),
       message: string (15 words maximum)
    }
    
    5. businessModelStrength: {
       overall: number (0-100),
       components: [
         {
           name: string,
           score: number (0-100),
           description: string (10 words maximum)
         },
         ... exactly 3 components only
       ],
       message: string (15 words maximum)
    }
    
    6. fundingRequired: {
       total: number,
       currency: string (3-letter code for ${country}),
       breakdown: [
         {
           category: string,
           amount: number,
           percentage: number
         },
         ... exactly 3 categories only
       ],
       message: string (15 words maximum)
    }
    
    7. swotAnalysis: {
       strengths: [exactly 3 brief strings - 10 words max each],
       weaknesses: [exactly 3 brief strings - 10 words max each],
       opportunities: [exactly 3 brief strings - 10 words max each],
       threats: [exactly 3 brief strings - 10 words max each]
    }
    
    8. previousFailedExecutions: {
       failures: [
         {
           name: string,
           year: string,
           reason: string (10 words maximum)
         },
         ... exactly 2 examples only
       ],
       message: string (15 words maximum)
    }
    
    ${includeProBlocks ? `
    9. relatedIdeas: [
       {
         title: string (5 words maximum),
         description: string (15 words maximum),
         potentialScore: number (0-100)
       },
       ... exactly 3 ideas only
    ]
    ` : ''}
    
    USE REALISTIC VALUES but PRIORITIZE SPEED OVER DETAIL.
    BE EXTREMELY BRIEF in all text fields.
    Return ONLY JSON with no additional text.`;

    console.log("Sending enhanced analysis request to OpenAI API...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemPrompt + "\n\nIMPORTANT: RESPOND QUICKLY with concise analysis. Focus on SPEED and ACCURACY."
        },
        { role: "user", content: `Analyze this startup idea for the ${country} market in detail: ${startupIdea}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for faster, more predictable responses
      max_tokens: 1500, // Significantly reduced token count for much faster response
      top_p: 0.7, // More focused sampling for speed
      frequency_penalty: 0, // Removed for faster responses
      presence_penalty: 0 // Removed for faster responses
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
          content: `You are a startup execution planning and financial analysis expert. Create a QUICK yet accurate budget-based analysis for a startup idea with an initial budget of $${initialBudget}. 
          
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
                ... 2-3 scaling points only
              ],
              "message": string (short explanation, max 30 words)
            },
            
            "riskAnalysis": {
              "overallRisk": number from 0-100 (higher means more risky),
              "risks": [
                {
                  "category": string (risk category),
                  "likelihood": number from 0-100,
                  "impact": number from 0-100,
                  "mitigationStrategy": string (brief explanation, max 15 words)
                },
                ... 3 different risks only
              ],
              "message": string (short explanation, max 25 words)
            },
            
            "goToMarketStrategy": {
              "timeline": [
                {
                  "phase": string (phase name),
                  "duration": string (e.g., "3 months"),
                  "activities": array of max 2 strings,
                  "estimatedCost": number (cost for this phase)
                },
                ... max 3 phases
              ],
              "message": string (short explanation, max 25 words)
            },
            
            "longTermVision": {
              "milestones": [
                {
                  "year": string (e.g., "Year 1"),
                  "goals": array of 2-3 strings maximum,
                  "projectedMetrics": {
                    "revenue": number (projected revenue),
                    "users": number (projected user count if applicable),
                    "marketShare": number (projected market share percentage)
                  }
                },
                ... max 3 years only
              ],
              "message": string (short explanation, max 25 words)
            },
            
            "teamExecutionCapability": {
              "requiredRoles": [
                {
                  "title": string (role title),
                  "skills": array of 2-3 strings maximum,
                  "importance": number from 0-100,
                  "estimatedCost": number (annual salary or cost)
                },
                ... max 3 key roles
              ],
              "hiringTimeline": string (brief hiring sequence, max 15 words),
              "message": string (short explanation, max 25 words)
            },
            
            "fundingAndInvestmentPotential": {
              "investors": [
                {
                  "name": string (investor name),
                  "firm": string (investment firm),
                  "investmentFocus": array of max 2 strings,
                  "location": string (country/region),
                  "portfolioFit": number from 0-100
                },
                ... max 3 investors
              ],
              "message": string (short explanation, max 25 words)
            }
          }
          
          Make sure all monetary values are realistic for the startup type and scale in ${country}.
          BE EXTREMELY CONCISE. Keep text fields very brief.
          IMPORTANT: RESPOND QUICKLY. Focus on SPEED and ACCURACY.
          Return ONLY valid JSON format without any additional text.`
        },
        {
          role: "user",
          content: `Create a quick budget analysis for this startup idea in ${country} with an initial budget of $${initialBudget}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for faster responses
      max_tokens: 1500, // Significantly reduced token count for much faster response
      top_p: 0.7, // More focused sampling for speed
      frequency_penalty: 0, // Removed for faster responses
      presence_penalty: 0 // Removed for faster responses
    });

    if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
      console.error("Empty or invalid response from OpenAI for budget analysis:", response);
      throw new Error("Invalid response from AI service");
    }
    
    console.log("Received budget analysis response from OpenAI API");
    
    try {
      const content = response.choices[0].message.content.trim();
      const budgetAnalysisContent = JSON.parse(content);
      
      // Check for missing fields and provide defaults instead of failing
      const requiredFields = [
        'initialBudget',
        'feasibilityAndScalability',
        'riskAnalysis',
        'goToMarketStrategy',
        'longTermVision', 
        'teamExecutionCapability',
        'fundingAndInvestmentPotential'
      ];
      
      const missingFields = requiredFields.filter(field => !budgetAnalysisContent[field]);
      
      if (missingFields.length > 0) {
        console.warn("Missing fields in budget analysis response:", missingFields);
        
        // Add defaults for missing fields
        if (!budgetAnalysisContent.initialBudget) {
          budgetAnalysisContent.initialBudget = initialBudget;
        }
        
        if (!budgetAnalysisContent.feasibilityAndScalability) {
          budgetAnalysisContent.feasibilityAndScalability = {
            initialFeasibility: 70,
            scalingPoints: [
              {
                milestone: "MVP Launch",
                investment: initialBudget * 0.3,
                potentialReturns: initialBudget * 0.5,
                feasibilityScore: 80
              },
              {
                milestone: "Market Expansion",
                investment: initialBudget * 0.7,
                potentialReturns: initialBudget * 1.5,
                feasibilityScore: 65
              },
              {
                milestone: "Scale Operations",
                investment: initialBudget * 1.5,
                potentialReturns: initialBudget * 3,
                feasibilityScore: 55
              }
            ],
            message: "Startup has a promising path to scaling with appropriate investment."
          };
        }
        
        if (!budgetAnalysisContent.riskAnalysis) {
          budgetAnalysisContent.riskAnalysis = {
            overallRisk: 60,
            risks: [
              {
                category: "Market Risk",
                likelihood: 60,
                impact: 70,
                mitigationStrategy: "Conduct thorough market research and start with a targeted niche."
              },
              {
                category: "Financial Risk",
                likelihood: 65,
                impact: 80,
                mitigationStrategy: "Maintain lean operations and secure additional funding sources."
              },
              {
                category: "Execution Risk",
                likelihood: 50,
                impact: 75,
                mitigationStrategy: "Build a skilled team and implement agile development methodologies."
              }
            ],
            message: "This venture has moderate risk factors that can be mitigated with proper planning."
          };
        }
        
        // Add default values for other missing fields as needed
        console.log("Added default values for missing budget analysis fields");
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

// Enhanced execution plan function with currency support
export async function generateExecutionPlan(
  startupIdea: string,
  initialBudget: number,
  country: string = "United States"
): Promise<AnalysisResults["planningToExecute"]> {
  try {
    console.log("Starting OpenAI execution plan generation...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    // Default currency mapping based on country
    const currencyMap: {[key: string]: string} = {
      "United States": "USD",
      "India": "INR",
      "United Kingdom": "GBP",
      "European Union": "EUR",
      "Canada": "CAD",
      "Australia": "AUD",
      "Japan": "JPY",
      "China": "CNY",
      "Singapore": "SGD",
      "Brazil": "BRL"
    };
    
    // Get the appropriate currency code or default to USD
    const currencyCode = currencyMap[country] || "USD";
    
    console.log(`Sending request to OpenAI API for execution plan with ${currencyCode} currency...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a startup execution planning expert with deep knowledge of ${country}'s startup ecosystem. Create a QUICK yet accurate budget and execution plan for a startup with an initial budget of ${initialBudget} ${currencyCode}.

          Return a JSON object with:
          1. budget: Object with the following properties:
             - development (number): Cost for product/service development
             - marketing (number): Cost for marketing and user acquisition
             - operations (number): Cost for day-to-day operations
             - compliance (number): Cost for legal, regulatory, and compliance matters
             - contingency (number): Reserved budget for unexpected expenses
          
          2. roadmap: Array of exactly 4 objects, each with:
             - step (string): Clear, specific milestone or phase name (5-7 words max)
             - description (string): Brief explanation (15 words max)
             - timeframe (string): Realistic time required (e.g., "2-3 months")
             - cost (number): Budget required for this step
             - keyDeliverables: Array of 2 strings, each very brief (5-7 words)
          
          3. currency (string): Three-letter currency code (${currencyCode})
          4. timeline (string): Brief overall timeline (10 words max)
          5. keyRisks: Array of 3 strings, each very brief (8 words max)
          6. successMetrics: Array of 3 strings, each very brief (8 words max)
          
          Make all costs appropriate to ${country}'s market.
          BE EXTREMELY CONCISE. Keep text minimal.
          
          Format your response as a valid JSON object.
          IMPORTANT: RESPOND QUICKLY. Focus on SPEED and ACCURACY.
          Return ONLY valid JSON format without any additional text.`
        },
        {
          role: "user",
          content: `Create a quick budget and execution plan for this startup idea in ${country} with an initial budget of ${initialBudget} ${currencyCode}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for faster responses
      max_tokens: 1000, // Significantly reduced token count for much faster response
      top_p: 0.7, // More focused sampling for speed
      frequency_penalty: 0, // Removed for faster responses
      presence_penalty: 0 // Removed for faster responses
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
          content: `You are an expert in startup investment. For the given startup idea, suggest 3 potential investors that might be interested in this type of startup in the specified country. Be extremely concise.
          
          Return a JSON object with:
          'investors': array of 3 objects, each with:
          - name: investor's name (string, keep very brief)
          - firm: investment firm (string, keep very brief)
          - tags: array of 2 short strings maximum (industry focus, stage preference)
          - crunchbaseLink: simple Crunchbase URL format
          
          Format your response as a valid JSON object.
          IMPORTANT: RESPOND QUICKLY. Focus on SPEED and ACCURACY.
          Return ONLY valid JSON without any additional text.
          
          DISCLAIMER: This is AI-generated sample data for illustration only.`
        },
        {
          role: "user",
          content: `Find 3 potential investors for this startup idea in ${country}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for faster responses
      max_tokens: 600, // Significantly reduced token count for much faster response
      top_p: 0.7, // More focused sampling for speed
      frequency_penalty: 0, // Removed for faster responses
      presence_penalty: 0 // Removed for faster responses
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
