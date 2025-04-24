import OpenAI from "openai";
import { AnalysisResults } from "@shared/schema";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
if (!process.env.OPENAI_API_KEY) {
  console.warn("Missing OPENAI_API_KEY environment variable. AI analysis features will not work properly.");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

// Helper function to get appropriate currency for a country
function getCountryCurrency(country: string): string {
  const currencyMap: Record<string, string> = {
    "United States": "USD",
    "Canada": "CAD",
    "United Kingdom": "GBP",
    "European Union": "EUR",
    "Germany": "EUR",
    "France": "EUR",
    "Italy": "EUR",
    "Spain": "EUR",
    "Australia": "AUD",
    "New Zealand": "NZD",
    "China": "CNY",
    "Japan": "JPY",
    "South Korea": "KRW",
    "India": "INR",
    "Brazil": "BRL",
    "Mexico": "MXN",
    "Russia": "RUB",
    "South Africa": "ZAR",
    "Nigeria": "NGN",
    "Global": "USD"
    // Add more countries as needed
  };
  
  return currencyMap[country] || "USD";
}

// Add delay function for retry backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to perform structured API calls for analysis steps with retry logic
async function executeAnalysisStep(stepName: string, systemPrompt: string, userPrompt: string) {
  console.log(`Executing analysis step: ${stepName}`);
  
  // Set up retry parameters
  const MAX_RETRIES = 3;
  let retries = 0;
  let lastError: any = null;
  
  while (retries <= MAX_RETRIES) {
    try {
      // Log retry attempt
      if (retries > 0) {
        console.log(`Retry attempt ${retries}/${MAX_RETRIES} for step: ${stepName}`);
      }
      
      // Record start time to monitor API call duration
      const startTime = Date.now();
      
      // Make OpenAI API request with reduced token count to avoid timeouts
      // Note: Using AbortController for timeout since the OpenAI client doesn't support direct timeout option
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => abortController.abort(), 30000); // 30 second timeout
      
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.2,
        max_tokens: 1200, // Reduced from 1500 to help prevent timeouts
        top_p: 0.9
      }, { signal: abortController.signal });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      // Log completion time for monitoring
      const callDuration = Date.now() - startTime;
      console.log(`API call for ${stepName} completed in ${callDuration}ms`);
      
      if (!response.choices || response.choices.length === 0 || !response.choices[0].message.content) {
        console.error(`Empty response for ${stepName} step`);
        throw new Error(`Failed to get ${stepName} analysis`);
      }
      
      const content = response.choices[0].message.content.trim();
      
      // Parse JSON with fallback mechanisms
      try {
        // Direct parsing attempt
        const result = JSON.parse(content);
        console.log(`Successfully parsed ${stepName} JSON directly`);
        return result;
      } catch (parseError) {
        console.log(`Direct JSON parse failed for ${stepName}, trying extraction methods`);
        
        // Try multiple extraction methods in sequence
        
        // Method 1: Basic regex extraction
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const jsonContent = jsonMatch[0];
            const result = JSON.parse(jsonContent);
            console.log(`Successfully extracted and parsed ${stepName} JSON using method 1`);
            return result;
          } catch (extractError) {
            console.log(`Extraction method 1 failed for ${stepName}`);
          }
        }
        
        // Method 2: Try to extract content between markdown code blocks
        const markdownMatch = content.match(/```(?:json)?([\s\S]*?)```/) || 
                             content.match(/```([\s\S]*?)```/);
        if (markdownMatch && markdownMatch[1]) {
          try {
            const extractedJson = markdownMatch[1].trim();
            const result = JSON.parse(extractedJson);
            console.log(`Successfully extracted and parsed ${stepName} JSON using method 2`);
            return result;
          } catch (extractError) {
            console.log(`Extraction method 2 failed for ${stepName}`);
          }
        }
        
        console.error(`All JSON parsing methods failed for ${stepName}`);
        throw new Error(`Failed to parse ${stepName} response`);
      }
    } catch (error: any) {
      lastError = error;
      
      // Determine if this error is retriable
      const errorMessage = String(error.message || error);
      const isNetworkError = 
        errorMessage.includes('timeout') || 
        errorMessage.includes('rate limit') || 
        errorMessage.includes('429') ||
        errorMessage.includes('500') ||
        errorMessage.includes('502') ||
        errorMessage.includes('503') ||
        errorMessage.includes('504') ||
        errorMessage.includes('busy') ||
        errorMessage.includes('capacity') ||
        errorMessage.includes('overloaded');
      
      if (isNetworkError && retries < MAX_RETRIES) {
        // This is a retriable error
        retries++;
        console.warn(`Retriable error in ${stepName}: ${errorMessage}. Attempt ${retries}/${MAX_RETRIES}`);
        
        // Exponential backoff
        const backoffMs = 1000 * Math.pow(2, retries - 1);
        console.log(`Waiting ${backoffMs}ms before retry...`);
        await delay(backoffMs);
        continue;
      }
      
      // Non-retriable error or we've exhausted our retries
      console.error(`Error in ${stepName} step (attempt ${retries}/${MAX_RETRIES}):`, error);
      
      if (retries >= MAX_RETRIES) {
        throw new Error(`${stepName} analysis failed after ${MAX_RETRIES} attempts: ${errorMessage}`);
      } else {
        throw new Error(`${stepName} analysis failed: ${errorMessage}`);
      }
    }
  }
  
  // This should never execute due to the throw in the loop above
  throw new Error(`Unexpected execution flow in ${stepName}`);
}

/**
 * Multi-step startup idea analysis service that breaks down the analysis
 * into smaller, more focused API calls to improve reliability and quality
 */
export async function analyzeStartupIdeaStepByStep(
  startupIdea: string,
  country: string,
  planType: string
): Promise<AnalysisResults> {
  try {
    console.log("Starting multi-phase OpenAI analysis for startup idea...");
    
    // Verify the API key is available
    if (!process.env.OPENAI_API_KEY) {
      console.error("OPENAI_API_KEY is missing");
      throw new Error("OpenAI API key is not configured");
    }
    
    // Test the API key with a simple call
    try {
      await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: "Test" }],
        max_tokens: 5
      });
    } catch (apiError: any) {
      console.error("OpenAI API key validation failed:", apiError.message);
      
      if (apiError.status === 401) {
        throw new Error("Invalid OpenAI API key. Please update your API key in the settings.");
      }
      
      throw new Error(`OpenAI API error: ${apiError.message}`);
    }
    
    // Determine which blocks to include based on the user's plan
    const includeProBlocks = planType === "pro" || planType === "unicorn";
    
    // Initialize complete result structure
    const analysisResults: AnalysisResults = {
      successRate: {
        percentage: 50,
        goodPoints: [
          "Technical feasibility is within current capabilities",
          "Addresses a meaningful problem",
          "Market need exists and can be verified"
        ],
        badPoints: [
          "Competitive landscape may be challenging",
          "User acquisition can be expensive",
          "Regulatory considerations should be evaluated" 
        ],
        message: "Your startup idea shows potential but requires further analysis. We'll evaluate multiple aspects to provide a comprehensive assessment."
      },
      competitors: {
        competitors: [],
        message: "Analyzing competitors in your market..."
      },
      targetAudienceFit: {
        segments: [],
        message: "Identifying optimal target audience segments..."
      },
      marketSize: {
        segments: [],
        totalSize: 0,
        currency: country === "Global" ? "USD" : getCountryCurrency(country),
        message: "Calculating addressable market size..."
      },
      businessModelStrength: {
        overall: 0,
        components: [{
          name: "Initial Assessment",
          score: 50,
          description: "Analyzing business model components..."
        }],
        message: "Evaluating your business model structure..."
      },
      fundingRequired: {
        total: 0,
        currency: country === "Global" ? "USD" : getCountryCurrency(country),
        breakdown: [],
        fundingStages: [],
        message: "Estimating required investment and funding stages..."
      },
      swotAnalysis: {
        strengths: [],
        weaknesses: [],
        opportunities: [],
        threats: [],
        priorityActions: []
      },
      previousFailedExecutions: {
        failures: [],
        message: "Researching similar past ventures..."
      },
      relatedIdeas: [],
      meta: {
        analysisVersion: "2.1",
        analysisDate: new Date().toISOString(),
        analysisTime: "enhanced",
        modelUsed: "gpt-4o",
        includedBlocks: []
      }
    };
    
    // Setup base context for all analysis steps
    const baseContext = `You are analyzing this startup idea for the ${country} market: "${startupIdea}"`;
    
    // Extract function to avoid strict mode issues
    return await executeStepByStepAnalysis(startupIdea, country, includeProBlocks, analysisResults, baseContext);
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    
    if (error.response) {
      console.error("OpenAI API error details:", error.response.data);
    }
    
    // Return a user-friendly error message
    const errorMessage = error.message || "Failed to analyze startup idea";
    throw new Error(`Analysis failed: ${errorMessage}. Please try again later.`);
  }
}

// Implementation of stepwise analysis process
async function executeStepByStepAnalysis(
  startupIdea: string,
  country: string,
  includeProBlocks: boolean,
  analysisResults: AnalysisResults,
  baseContext: string
): Promise<AnalysisResults> {
  // STEP 1: Initial assessment and success rate
  try {
    const successRateSystemPrompt = `You are a senior venture capital analyst. Provide an initial assessment of this startup idea.
    Return JSON in this exact format:
    {
      "percentage": number (0-100 realistic success probability),
      "goodPoints": [array of 4-5 detailed strengths with market insights],
      "badPoints": [array of 4-5 detailed challenges or risks],
      "message": string (comprehensive assessment with clear rationale)
    }`;
    
    const successRatePrompt = `${baseContext}
    
    Evaluate the overall viability and potential success rate of this idea in the current market.
    Include realistic market insights and specific factors that influence success probability.`;
    
    const successRateResult = await executeAnalysisStep("Success Rate", successRateSystemPrompt, successRatePrompt);
    analysisResults.successRate = successRateResult;
    if (analysisResults.meta && analysisResults.meta.includedBlocks) {
      analysisResults.meta.includedBlocks.push('successRate');
    }
    console.log("Completed success rate analysis");
  } catch (error) {
    console.error("Success rate analysis failed, using default:", error);
    // Keep default values already in analysisResults
  }
  
  // STEP 2: Market analysis (competitors and market size)
  try {
    const marketAnalysisSystemPrompt = `You are a market research expert specializing in competitor and market size analysis.
    Return JSON in this exact format:
    {
      "competitors": {
        "competitors": [
          {
            "name": string (actual company name),
            "marketShare": number (realistic market percentage),
            "websiteUrl": string (actual URL),
            "uniqueStrength": string (detailed strength analysis)
          },
          ... include 4-5 actual competitors
        ],
        "message": string (competitive landscape assessment)
      },
      "marketSize": {
        "segments": [
          {
            "name": string (market segment name),
            "percentage": number (% of total market),
            "value": number (realistic market size in billions),
            "growth": number (yearly growth percentage),
            "currency": string (3-letter code)
          },
          ... include 3-4 market segments
        ],
        "totalSize": number (total market size),
        "currency": string (3-letter code),
        "cagr": number (compound annual growth rate),
        "message": string (market opportunity assessment)
      }
    }`;
    
    const marketAnalysisPrompt = `${baseContext}
    
    Analyze the competitive landscape and market size for this idea.
    Identify actual competitors with real data and segment the market accurately.
    Include country-specific metrics and realistic financial figures.
    Use ${country === "Global" ? "USD" : getCountryCurrency(country)} as the primary currency.`;
    
    const marketResult = await executeAnalysisStep("Market Analysis", marketAnalysisSystemPrompt, marketAnalysisPrompt);
    
    if (marketResult.competitors) {
      analysisResults.competitors = marketResult.competitors;
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('competitors');
      }
    }
    
    if (marketResult.marketSize) {
      analysisResults.marketSize = marketResult.marketSize;
      // Ensure correct format for all market segments
      if (analysisResults.marketSize.segments) {
        // Convert segment data to match our expected schema format
        analysisResults.marketSize.segments = analysisResults.marketSize.segments.map((segment: any) => {
          // Extract properties safely
          const name = segment.name || 'Unknown Segment';
          const value = segment.value || segment.sizeBillion || 0;
          const percentage = segment.percentage || 0;
          const growth = segment.growth || segment.growthRate || 0;
          
          // Return properly formatted segment
          return {
            name,
            value,
            percentage,
            growth,
            currency: segment.currency || (country === "Global" ? "USD" : getCountryCurrency(country))
          };
        });
      }
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('marketSize');
      }
    }
    
    console.log("Completed market analysis");
  } catch (error) {
    console.error("Market analysis failed, using default:", error);
    // Keep default values already in analysisResults
  }
  
  // STEP 3: Business model and target audience
  try {
    const businessModelSystemPrompt = `You are a business model analyst and customer segmentation expert.
    Return JSON in this exact format:
    {
      "businessModelStrength": {
        "overall": number (0-100 score),
        "components": [
          {
            "name": string (business model component),
            "score": number (0-100 score),
            "description": string (comprehensive analysis),
            "keyMetrics": [array of key metrics for this component]
          },
          ... include 4-5 business model components
        ],
        "message": string (comprehensive business model evaluation)
      },
      "targetAudienceFit": {
        "segments": [
          {
            "name": string (specific demographic or market segment),
            "score": number (0-100 fit score),
            "behaviorsAndPreferences": [array of behaviors and preferences]
          },
          ... include 3-4 target segments
        ],
        "message": string (holistic audience targeting strategy)
      }
    }`;
    
    const businessModelPrompt = `${baseContext}
    
    Analyze the business model viability and target audience fit.
    Identify strengths and weaknesses in the business model and opportunities for improvement.
    Segment the target audience with realistic demographic data for ${country}.
    Provide specific acquisition channels for each segment.`;
    
    const businessResult = await executeAnalysisStep("Business Model", businessModelSystemPrompt, businessModelPrompt);
    
    if (businessResult.businessModelStrength) {
      analysisResults.businessModelStrength = businessResult.businessModelStrength;
      
      // Normalize business model components format
      if (analysisResults.businessModelStrength.components) {
        analysisResults.businessModelStrength.components = analysisResults.businessModelStrength.components.map((component: any) => {
          // Extract properties safely, supporting various field names
          const name = component.name || 'Business Component';
          const score = component.score || 0;
          
          // Create a unified description from various potential fields
          let description = component.description || '';
          
          if (component.strength || component.weakness || component.improvement) {
            if (!description) {
              description = '';
              if (component.strength) description += `Strength: ${component.strength} `;
              if (component.weakness) description += `Weakness: ${component.weakness} `;
              if (component.improvement) description += `Improvement: ${component.improvement}`;
              description = description.trim();
            }
          }
          
          // Compile metrics from various fields
          const keyMetrics = component.keyMetrics || 
                            (component.metrics ? 
                              (Array.isArray(component.metrics) ? component.metrics : [component.metrics]) 
                              : undefined);
          
          // Return properly formatted component
          return {
            name,
            score,
            description: description || "Component analysis",
            keyMetrics
          };
        });
      }
      
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('businessModelStrength');
      }
    }
    
    if (businessResult.targetAudienceFit) {
      analysisResults.targetAudienceFit = businessResult.targetAudienceFit;
      
      // Normalize target audience segments format
      if (analysisResults.targetAudienceFit.segments) {
        analysisResults.targetAudienceFit.segments = analysisResults.targetAudienceFit.segments.map((segment: any) => {
          // Extract properties safely, supporting various field names
          const name = segment.name || 'General Audience';
          const score = segment.score || segment.fitScore || 0;
          // Support different naming conventions in the API response
          const behaviors = segment.behaviorsAndPreferences || 
                          segment.behaviors || 
                          segment.needsFulfilled || 
                          [];
          
          // Return properly formatted segment
          return {
            name,
            score,
            behaviorsAndPreferences: Array.isArray(behaviors) ? behaviors : [behaviors]
          };
        });
      }
      
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('targetAudienceFit');
      }
    }
    
    console.log("Completed business model and target audience analysis");
  } catch (error) {
    console.error("Business model analysis failed, using default:", error);
    // Keep default values already in analysisResults
  }
  
  // STEP 4: SWOT analysis and funding
  try {
    const strategicAnalysisSystemPrompt = `You are a strategic planning and financial analyst.
    Return JSON in this exact format:
    {
      "swotAnalysis": {
        "strengths": [array of 5-6 specific internal advantages],
        "weaknesses": [array of 5-6 specific internal challenges],
        "opportunities": [array of 5-6 specific external favorable factors],
        "threats": [array of 5-6 specific external challenges],
        "priorityActions": [array of 3-4 most critical next steps]
      },
      "fundingRequired": {
        "total": number (realistic funding requirements),
        "currency": string (3-letter code),
        "breakdown": [
          {
            "category": string (e.g., product development, marketing),
            "amount": number (specific amount needed),
            "percentage": number (of total funding),
            "keyExpenses": [array of specific costs within this category],
            "timeline": string (when these funds will be deployed)
          },
          ... include 4-5 funding categories
        ],
        "fundingStages": [
          {
            "stage": string (funding round name),
            "amount": number (funding needed at this stage),
            "timeline": string (when this funding will be needed),
            "milestones": [array of achievements expected by this stage]
          },
          ... include 2-3 funding stages
        ],
        "message": string (strategic funding approach)
      }
    }`;
    
    const strategicAnalysisPrompt = `${baseContext}
    
    Conduct a SWOT analysis and determine realistic funding requirements.
    Be specific about internal strengths and weaknesses, and external opportunities and threats.
    Identify priority actions based on the SWOT analysis.
    Create a detailed funding breakdown with realistic figures for ${country}.
    Use ${country === "Global" ? "USD" : getCountryCurrency(country)} as the currency.`;
    
    const strategicResult = await executeAnalysisStep("Strategic Analysis", strategicAnalysisSystemPrompt, strategicAnalysisPrompt);
    
    if (strategicResult.swotAnalysis) {
      analysisResults.swotAnalysis = strategicResult.swotAnalysis;
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('swotAnalysis');
      }
    }
    
    if (strategicResult.fundingRequired) {
      analysisResults.fundingRequired = strategicResult.fundingRequired;
      // Ensure currency field exists
      if (!analysisResults.fundingRequired.currency) {
        analysisResults.fundingRequired.currency = country === "Global" ? "USD" : getCountryCurrency(country);
      }
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('fundingRequired');
      }
    }
    
    console.log("Completed SWOT and funding analysis");
  } catch (error) {
    console.error("Strategic analysis failed, using default:", error);
    // Keep default values already in analysisResults
  }
  
  // STEP 5: Previous failures and related ideas
  try {
    const learningSectionSystemPrompt = `You are a startup historian and innovation expert.
    Return JSON in this exact format:
    {
      "previousFailedExecutions": {
        "failures": [
          {
            "name": string (actual company name),
            "year": string (year of failure),
            "reason": string (detailed failure analysis),
            "lessonLearned": string (specific actionable learning)
          },
          ... include 3-4 relevant failed startups in this space
        ],
        "message": string (synthesized lessons and implementation strategy)
      }
      ${includeProBlocks ? `, 
      "relatedIdeas": [
        {
          "title": string (5 words maximum),
          "description": string (15 words maximum),
          "potentialScore": number (0-100)
        },
        ... exactly 3 ideas only
      ]` : ''}
    }`;
    
    const learningPrompt = `${baseContext}
    
    Research previous failed startups in this domain and identify key lessons.
    Find actual examples of companies that tried similar ideas and failed.
    ${includeProBlocks ? 'Also suggest 3 related startup ideas that could complement or build upon the main idea.' : ''}`;
    
    const learningResult = await executeAnalysisStep("Learning Analysis", learningSectionSystemPrompt, learningPrompt);
    
    if (learningResult.previousFailedExecutions) {
      analysisResults.previousFailedExecutions = learningResult.previousFailedExecutions;
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('previousFailedExecutions');
      }
    }
    
    if (includeProBlocks && learningResult.relatedIdeas) {
      analysisResults.relatedIdeas = learningResult.relatedIdeas;
      if (analysisResults.meta && analysisResults.meta.includedBlocks) {
        analysisResults.meta.includedBlocks.push('relatedIdeas');
      }
    }
    
    console.log("Completed failure analysis and related ideas");
  } catch (error) {
    console.error("Learning analysis failed, using default:", error);
    // Keep default values already in analysisResults
  }
  
  console.log("Successfully completed all analysis steps");
  return analysisResults;
}
