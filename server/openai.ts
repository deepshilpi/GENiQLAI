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
    const systemPrompt = `You are a startup analysis expert with extensive experience in venture capital and market analysis. Analyze the startup idea for the ${country} market and provide comprehensive, detailed insights in JSON format. Your analysis should be thorough, expert-level, and contain specific market insights and actionable advice.
    
    IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.
    
    Your analysis MUST contain the following 8 interactive blocks in this exact JSON structure:
    
    1. successRate: Object with {
       percentage: number from 0-100,
       goodPoints: array of 3-4 strings explaining specific positive factors with data points where possible,
       badPoints: array of 3-4 strings explaining specific negative factors with data points where possible,
       message: string summarizing the overall success likelihood with clear rationale
    }
    
    2. competitors: Object with {
       competitors: array of 4-6 objects, each with {
         name: string (real company name in this space),
         marketShare: number (realistic percentage of market),
         websiteUrl: string (realistic URL),
         uniqueStrength: string (brief description of competitive advantage)
       },
       message: string summarizing the competitive landscape with specific insights
    }
    
    3. targetAudienceFit: Object with {
       segments: array of 3-5 objects, each with {
         name: string (specific demographic or psychographic segment name),
         score: number from 0-100 (how well idea fits this segment),
         behaviorsAndPreferences: array of 3-4 strings (detailed consumer behaviors and preferences)
       },
       message: string providing detailed audience analysis with key behavioral insights
    }
    
    4. marketSize: Object with {
       segments: array of objects, each with {
         name: string (e.g., "local", "national", "global"),
         percentage: number,
         value: number (REALISTIC dollar size in millions - research equivalent markets)
       },
       totalSize: number (REALISTIC total market size in millions - minimum $100M for viable markets),
       cagr: number (market compound annual growth rate as percentage),
       message: string explaining market size impact with actual market research citations
    }
    
    5. businessModelStrength: Object with {
       overall: number from 0-100,
       components: array of 5-7 objects, each with {
         name: string (specific revenue model component),
         score: number from 0-100,
         description: string explaining this aspect with specifics,
         keyMetrics: array of 2-3 strings (important KPIs to track)
       },
       message: string summarizing overall business model with specific strengths and weaknesses
    }
    
    6. fundingRequired: Object with {
       total: number (realistic total funding needed - minimum $100K, typically $500K-5M for most startups),
       currency: string (3-letter currency code like "USD", "INR", "EUR" - use appropriate currency for ${country}),
       breakdown: array of objects, each with {
         category: string (e.g., "Product Development", "Marketing"),
         amount: number (currency amount),
         percentage: number (of total funding),
         keyExpenses: array of 2-3 strings (specific expenses in this category)
       },
       timeline: array of objects, each with {
         stage: string (funding stage name),
         amount: number (amount needed at this stage),
         milestone: string (key milestone to achieve)
       },
       message: string explaining detailed funding strategy
    }
    
    7. swotAnalysis: Object with {
       strengths: array of 5-6 detailed strings (specific internal advantages),
       weaknesses: array of 5-6 detailed strings (specific internal disadvantages),
       opportunities: array of 5-6 detailed strings (specific external positive factors),
       threats: array of 5-6 detailed strings (specific external negative factors),
       priorityAction: string (most important action item from the SWOT analysis)
    }
    
    8. previousFailedExecutions: Object with {
       failures: array of 4-6 objects, each with {
         name: string (real company name),
         year: string (actual year of failure),
         reason: string (detailed primary reason for failure),
         lessonLearned: string (specific actionable lesson)
       },
       message: string explaining what can be learned with specific strategies to avoid similar failures
    }
    
    ${includeProBlocks ? `
    9. relatedIdeas: Array of 4-6 objects, each with {
       title: string (related startup idea with specific focus),
       description: string (detailed explanation with market opportunity),
       potentialScore: number from 0-100 (potential success),
       synergies: array of 2-3 strings (ways this idea complements the main idea)
    }
    ` : ''}
    
    ALL MONETARY VALUES MUST BE REALISTIC AND INDUSTRY-APPROPRIATE - research similar companies and markets to provide accurate figures. For example:
    - A SaaS startup might need $500K-2M initial funding
    - A marketplace might have a $1B+ total addressable market
    - An app might need $100-300K for MVP development
    
    The analysis should be specific to ${country} with country-specific insights, regulations, and market conditions.
    
    Be detailed and specific - avoid generic responses. Include specific metrics, strategies, and actionable insights throughout the analysis.
    
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
          content: `You are a startup execution planning expert with deep knowledge of ${country}'s startup ecosystem. Create a comprehensive budget and execution plan for a startup with an initial budget of ${initialBudget} ${currencyCode}.

          Return a JSON object with:
          1. budget: Object with the following properties:
             - development (number): Cost for product/service development
             - marketing (number): Cost for marketing and user acquisition
             - operations (number): Cost for day-to-day operations
             - compliance (number): Cost for legal, regulatory, and compliance matters
             - contingency (number): Reserved budget for unexpected expenses
          
          2. roadmap: Array of at least 6 objects, each with:
             - step (string): Clear, specific milestone or phase name
             - description (string): Detailed explanation of activities in this phase
             - timeframe (string): Realistic time required (e.g., "2-3 months", "Q1 2026")
             - cost (number): Budget required for this step
             - keyDeliverables: Array of 2-3 strings detailing specific outputs expected
          
          3. currency (string): Three-letter currency code (${currencyCode})
          4. timeline (string): Overall execution timeline estimate
          5. keyRisks: Array of 3-4 strings detailing potential execution risks
          6. successMetrics: Array of 3-4 strings detailing how to measure success
          
          Make all costs appropriate to ${country}'s market and provide realistic timeframes. Use industry benchmarks to ensure accuracy.
          
          Format your response as a valid JSON object.
          IMPORTANT: Return ONLY valid JSON format without additional explanations or text. DO NOT include any markdown formatting like triple backticks.`
        },
        {
          role: "user",
          content: `Create a detailed budget and execution plan for this startup idea in ${country} with an initial budget of ${initialBudget} ${currencyCode}: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.5, // Lower temperature for more focused and faster responses
      max_tokens: 3000,
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
