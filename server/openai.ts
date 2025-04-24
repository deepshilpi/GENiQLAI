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
    
    // Build a structured prompt based on the user's requirements
    const systemPrompt = `You are an expert startup analyst specializing in the Indian market. Analyze the startup idea comprehensively for India.
    
    IMPORTANT: Provide a detailed, organized, and accurate analysis following the exact structure below. Focus on factual data, cross-reference web sources when possible, and leverage your knowledge base for accuracy. Your goal is to produce high-quality, detailed, and organized output specifically for the Indian market.

    Return a JSON object with these eight distinct blocks - focus on QUALITY and ACCURACY:
    
    1. successRate: {
       percentage: number (0-100, realistic success probability with justification),
       goodPoints: [array of 3-5 key factors influencing success with specific industry trends in India],
       badPoints: [array of 3-5 challenges or risks with Indian market-specific details],
       message: string (concise assessment with clear rationale, 100-200 words)
    }
    
    2. competitors: {
       competitors: [
         {
           name: string (actual company name in India),
           marketShare: number (realistic market percentage in Indian market),
           websiteUrl: string (actual URL),
           uniqueStrength: string (competitive advantage in Indian context)
         },
         ... include 3-5 major players in the Indian market
       ],
       message: string (highlight gaps or opportunities in the Indian market)
    }
    
    3. targetAudienceFit: {
       segments: [
         {
           name: string (Indian demographic segment with clear profile),
           score: number (0-100 fit score),
           percentage: number (% of target market),
           description: string (detailed insights into this Indian segment),
           behaviorsAndPreferences: [array of 2-3 key behaviors specific to India],
           marketingApproach: string (India-specific channels and messaging)
         },
         ... include 3-4 distinct Indian market segments
       ],
       message: string (analysis of cultural/behavioral factors in Indian market)
    }
    
    4. marketSize: {
       segments: [
         {
           name: string (sector or segment specific to Indian market),
           percentage: number (segment's percentage of total market in India),
           value: number (segment value in INR millions/billions with proper formatting),
           growth: number (Indian growth rate for this segment, not global)
         },
         ... include 3-4 relevant Indian market segments
       ],
       totalSize: number (total addressable market in INR with proper magnitude),
       currency: "INR",
       cagr: number (compound annual growth rate in Indian market),
       countryInsights: {
         currency: "₹", 
         marketGrowthRate: number (India-specific annual growth percentage)
       },
       message: string (analysis with India-specific economic and regulatory factors)
    }
    
    5. businessModelStrength: {
       overall: number (0-100 viability score in Indian context),
       components: [
         {
           name: string (revenue stream adapted for Indian market),
           score: number (0-100 component viability),
           description: string (detailed analysis with India-specific pricing factors),
           keyMetrics: [array of 2-3 key performance indicators for Indian market]
         },
         ... include 3-5 India-adapted business model components
       ],
       message: string (business model evaluation with localization recommendations)
    }
    
    6. fundingRequired: {
       total: number (realistic funding requirement in INR),
       currency: "INR",
       breakdown: [
         {
           category: string (specific expense category relevant to India),
           amount: number (amount in INR millions),
           percentage: number (of total budget),
           description: string (India-specific cost considerations),
           keyExpenses: [array of 2-3 specific line items in Indian context]
         },
         ... include 4-5 realistic expense categories
       ],
       fundingStages: [
         {
           stage: string (standard Indian funding stage),
           amount: number (amount in INR),
           timeline: string (realistic timeframe for Indian market),
           milestones: [array of 2-3 concrete deliverables]
         },
         ... include 2-3 funding stages
       ],
       message: string (funding strategy aligned with Indian investment landscape)
    }
    
    7. swotAnalysis: {
       strengths: [array of 4-6 internal advantages specifically for Indian market],
       weaknesses: [array of 4-6 internal challenges in Indian context],
       opportunities: [array of 4-6 favorable Indian market factors or trends],
       threats: [array of 4-6 India-specific risks or competitive threats],
       priorityActions: [array of 3-4 India-focused strategic priorities]
    }
    
    8. previousFailedExecutions: {
       failures: [
         {
           name: string (actual failed Indian company name in this space),
           year: string (year of failure),
           reason: string (specific failure reason in Indian context),
           lessonLearned: string (key learnings for Indian market)
         },
         ... include 2-3 relevant failed Indian startups in this domain
       ],
       message: string (India-specific lessons for avoiding similar failures)
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
    
    PROVIDE DETAILED, EXPERT-LEVEL ANALYSIS with comprehensive insights.
    USE REALISTIC VALUES from actual market research.
    Include SPECIFIC, ACTIONABLE RECOMMENDATIONS throughout.
    Return ONLY valid JSON without any explanations, text, or markdown before or after.`;

    console.log("Sending optimized India-focused analysis request to OpenAI API...");
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { 
          role: "system", 
          content: systemPrompt + "\n\nIMPORTANT: Provide a detailed, organized, and accurate analysis for the INDIAN MARKET. Each block should be concise (100-200 words), data-driven, and include actionable insights specific to India. Use bullet points, tables, or numbered lists for clarity where appropriate."
        },
        { role: "user", content: `Analyze this startup idea for the Indian market in the ${startupIdea.includes("category:") ? startupIdea.split("category:")[1].trim().split(" ")[0] : ""} category:\n\n"${startupIdea}"\n\nProvide a comprehensive analysis following the exact structure specified with all eight required blocks. Focus on Indian market conditions, consumer behaviors, and business environment. Use INR for all monetary values and include cultural nuances relevant to success in India.` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7, // Set to 0.7 per requirements for balance of creativity and accuracy
      max_tokens: 4000, // Higher token limit for detailed output
      top_p: 0.9, // Wider sampling for more detailed and varied responses
      frequency_penalty: 0.1, // Slight penalty to avoid repetitive language
      presence_penalty: 0.1 // Slight penalty to encourage diverse coverage
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
        // First attempt: try normal JSON parsing
        try {
          analysisContent = JSON.parse(content);
          console.log("Successfully parsed JSON directly");
        } catch (directParseError) {
          console.log("Direct JSON parse failed, trying extraction methods");
          
          // Second attempt: try to extract JSON with regex
          const jsonMatch = content.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            try {
              const jsonContent = jsonMatch[0];
              console.log("Found JSON match, attempting to parse");
              analysisContent = JSON.parse(jsonContent);
              console.log("Successfully parsed extracted JSON");
            } catch (extractionError: unknown) {
              const errMessage = extractionError instanceof Error ? extractionError.message : "Unknown error";
              throw new Error("Failed to parse extracted JSON: " + errMessage);
            }
          } else {
            throw new Error("No JSON pattern found in response");
          }
        }
      } catch (jsonError) {
        console.error("All JSON parsing methods failed:", jsonError);
        console.error("Problematic content:", content.substring(0, 500) + "...");
        
        // Create a robust fallback response structure
        console.log("Creating comprehensive fallback response structure");
        analysisContent = {
          successRate: {
            percentage: 65,
            goodPoints: ["The idea has potential in the current market", "There appears to be demand for this solution"],
            badPoints: ["We couldn't fully analyze your idea due to technical issues", "Try providing more specific details"],
            message: "Your idea shows promise, but we encountered an issue with our analysis service."
          }
        };
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
            goodPoints: ["The Indian market shows potential for this solution", "Growing digital adoption in India supports this idea"],
            badPoints: ["More India-specific details would help with analysis", "Consider Indian regulatory factors"],
            message: "Your idea shows promise for the Indian market, but we need more specific details to fully analyze its potential."
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
            currency: "USD",
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
      
      // Create a fallback structure with valid data instead of throwing
      console.log("Creating comprehensive fallback analysis structure");
      
      // Provide a robust fallback that meets the schema requirements
      return {
        successRate: {
          percentage: 65,
          goodPoints: ["The idea has merit and addresses a real market need", "There is growing demand in this segment"],
          badPoints: ["We encountered an issue fully analyzing this idea", "Consider providing more specific details for better analysis"],
          message: "Your idea shows promise but we were unable to complete a full analysis. Please try again with more specific information."
        },
        competitors: {
          competitors: [
            { name: "Analysis incomplete", marketShare: 0 }
          ],
          message: "Competitor analysis could not be completed at this time."
        },
        targetAudienceFit: {
          segments: [
            { name: "Core audience", score: 70 }
          ],
          message: "Target audience analysis could not be fully completed."
        },
        marketSize: {
          segments: [
            { name: "Total available market", percentage: 100, value: 75000000, growth: 12 }
          ],
          totalSize: 75000000,
          currency: "INR",
          cagr: 12.5,
          message: "Market size analysis could not be fully completed for the Indian market."
        },
        businessModelStrength: {
          overall: 60,
          components: [
            { 
              name: "Revenue potential", 
              score: 60,
              description: "Could not fully analyze revenue potential",
              keyMetrics: ["Potential market size", "Monetization strategy"] 
            }
          ],
          message: "Business model analysis could not be fully completed."
        },
        fundingRequired: {
          total: 40000000,
          currency: "INR",
          breakdown: [
            { 
              category: "Product Development", 
              amount: 15000000, 
              percentage: 37.5,
              description: "Initial technology and product development costs" 
            },
            { 
              category: "Marketing", 
              amount: 10000000, 
              percentage: 25,
              description: "User acquisition and brand building in Indian market" 
            },
            { 
              category: "Operations", 
              amount: 8000000, 
              percentage: 20,
              description: "Office space, equipment, and operational costs" 
            },
            { 
              category: "Legal & Compliance", 
              amount: 3000000, 
              percentage: 7.5,
              description: "Regulatory compliance for Indian market" 
            },
            { 
              category: "Contingency", 
              amount: 4000000, 
              percentage: 10,
              description: "Reserve for unexpected expenses" 
            }
          ],
          fundingStages: [
            {
              stage: "Seed",
              amount: 15000000,
              timeline: "Immediately",
              milestones: ["MVP development", "Initial market testing"]
            },
            {
              stage: "Series A",
              amount: 25000000,
              timeline: "12-18 months",
              milestones: ["Established user base", "Revenue growth", "Market expansion"]
            }
          ],
          message: "Funding requirements could not be fully analyzed for the Indian market."
        },
        swotAnalysis: {
          strengths: [
            "Innovative concept for Indian market",
            "Addresses specific market need in India",
            "Potential for digital transformation impact",
            "Scalable solution for diverse Indian demographics",
            "Localization potential for regional markets"
          ],
          weaknesses: [
            "New entrant in competitive market",
            "Limited brand recognition in India",
            "Potential cultural adaptation challenges",
            "Variable internet connectivity across India",
            "Initial capital requirements"
          ],
          opportunities: [
            "Rapidly growing digital adoption in India",
            "Rising middle class with increased spending power",
            "Government digital India initiatives",
            "Large untapped tier 2/3 city markets",
            "Growing investor interest in Indian startups"
          ],
          threats: [
            "Established competitors in Indian market",
            "Regulatory hurdles in India",
            "Price sensitivity of Indian consumers",
            "Data privacy concerns and regulations",
            "Economic fluctuations impacting consumer spending"
          ],
          priorityActions: [
            "Conduct India-specific market research",
            "Develop localized MVP for Indian users",
            "Build strategic partnerships with local players",
            "Ensure regulatory compliance for Indian market"
          ]
        },
        previousFailedExecutions: {
          failures: [],
          message: "Previous execution analysis could not be completed."
        }
      };
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
    
    console.log(`Generating comprehensive execution plan for budget of $${initialBudget} in ${country}...`);
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model
      messages: [
        {
          role: "system",
          content: `You are a senior startup execution planning and financial analysis expert with experience in venture capital and startup financing. Create a DETAILED, INDUSTRY-SPECIFIC, EXPERT-LEVEL budget-based analysis for a startup idea with an initial budget of $${initialBudget}. Use realistic market figures and industry benchmarks applicable to ${country}.
          
          Return a comprehensive JSON object with exactly the following structure:
          
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
                ... 3-4 scaling points
              ],
              "message": string (concrete and actionable assessment)
            },
            
            "riskAnalysis": {
              "overallRisk": number from 0-100 (higher means more risky),
              "risks": [
                {
                  "category": string (specific risk category),
                  "likelihood": number from 0-100,
                  "impact": number from 0-100,
                  "mitigationStrategy": string (specific, actionable strategy)
                },
                ... 4-5 different risks
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
          
          Make sure all monetary values are realistic and use industry benchmarks for the startup type and scale in ${country}.
          Provide COMPREHENSIVE, EXPERT-LEVEL ANALYSIS with detailed insights and market-specific recommendations.
          IMPORTANT: Focus on QUALITY and ACCURACY with realistic market data specific to this startup type and industry trends.
          Return ONLY valid JSON format without any additional text.`
        },
        {
          role: "user",
          content: `Create a detailed, expert-level budget analysis with realistic industry-specific metrics for this startup idea in ${country} with an initial budget of $${initialBudget}. Include comprehensive cost breakdowns, funding stages, and investor appeal points: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for consistent, high-quality expert responses
      max_tokens: 2500, // Increased token count to allow for detailed, expert-level analysis
      top_p: 0.9, // Wider sampling for more nuanced, expert responses
      frequency_penalty: 0.1, // Slight penalty to avoid repetitive language
      presence_penalty: 0.1 // Slight penalty to encourage diverse coverage
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
): Promise<AnalysisResults["planToExecute"]> {
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
          content: `You are a startup execution planning expert with deep knowledge of ${country}'s startup ecosystem. Create a DETAILED, EXPERT-LEVEL budget and execution plan for a startup with an initial budget of ${initialBudget} ${currencyCode}.

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
          Provide DETAILED, EXPERT-LEVEL INSIGHTS with industry-specific recommendations.
          
          Format your response as a valid JSON object.
          IMPORTANT: Focus on QUALITY and ACCURACY with realistic market-based data.
          Return ONLY valid JSON format without any additional text.`
        },
        {
          role: "user",
          content: `Create a detailed, expert-level budget and execution plan for this startup idea in ${country} with an initial budget of ${initialBudget} ${currencyCode}. Include realistic market data and specific recommendations: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for consistent, high-quality expert responses
      max_tokens: 2000, // Increased token count for detailed expert analysis
      top_p: 0.9, // Wider sampling for more nuanced, expert responses
      frequency_penalty: 0.1, // Slight penalty to avoid repetitive language
      presence_penalty: 0.1 // Slight penalty to encourage diverse coverage
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
      
      return planContent as AnalysisResults["planToExecute"];
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
          content: `You are an expert in startup investment with deep knowledge of venture capital and angel investors. For the given startup idea, identify 3-5 specific, real investors that would be most likely to invest in this type of startup in the specified country.
          
          Return a JSON object with:
          'investors': array of 3 objects, each with:
          - name: investor's name (string, keep very brief)
          - firm: investment firm (string, keep very brief)
          - tags: array of 2 short strings maximum (industry focus, stage preference)
          - crunchbaseLink: simple Crunchbase URL format
          
          Format your response as a valid JSON object.
          IMPORTANT: Provide REAL, SPECIFIC INVESTORS that match the startup idea with accurate information.
          Return ONLY valid JSON without any additional text.
          
          DISCLAIMER: This is AI-generated sample data for illustration only.`
        },
        {
          role: "user",
          content: `Find 3-5 real, specific investors with a strong track record who would be particularly interested in this startup idea in ${country}, including their investment focus and portfolio fit: ${startupIdea}`
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.2, // Lower temperature for consistent, high-quality expert responses
      max_tokens: 1000, // Increased token count for detailed investor information
      top_p: 0.9, // Wider sampling for more accurate investor matching
      frequency_penalty: 0.1, // Slight penalty to avoid repetitive suggestions
      presence_penalty: 0.1 // Slight penalty to encourage diverse investor options
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
