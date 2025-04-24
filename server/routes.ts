import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeStartupIdea, generateBudgetAnalysis, generateExecutionPlan, findInvestors } from "./openai";
import { analyzeStartupIdeaStepByStep } from "./analysis-service";
import { searchStartupNews } from "./tavily";
import { detectCountryFromIP } from "./utils";
import { 
  InsertPost, 
  InsertComment, 
  InsertVote, 
  InsertFollow, 
  AnalysisResults, 
  InsertConversation,
  InsertConversationParticipant,
  InsertMessage,
  InsertMessageRead,
  InsertSavedIdea
} from "@shared/schema";
import session from "express-session";
import multer from "multer";
import path from "path";
import fs from "fs";
import express from "express";

// Extend express-session types to include our custom properties
declare module "express-session" {
  interface SessionData {
    anonymousAnalysisCount?: number;
  }
}

// Websocket message types
type WebSocketMessage = {
  type: string;
  payload: any;
};

// Extend WebSocket with user ID property
interface UserWebSocket extends WebSocket {
  userId?: number;
}

// Map to store active WebSocket connections by user ID
// Using non-null assertion to ensure we only add connections with valid IDs
const activeConnections = new Map<number, Set<UserWebSocket>>();

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);
  
  // Create upload directory if it doesn't exist
  const uploadDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  
  // Set up storage for profile pictures
  const multerStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, 'profile-' + uniqueSuffix + ext);
    }
  });
  
  // Create the multer upload instance
  const upload = multer({
    storage: multerStorage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max file size
    fileFilter: function (req, file, cb) {
      // Accept images only
      if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
        return cb(null, false);
      }
      cb(null, true);
    }
  });
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);
  
  // API routes
  // Check remaining free analyses for anonymous users
  app.get("/api/check-free-analyses", (req, res) => {
    // For authenticated users, no limit
    if (req.isAuthenticated()) {
      return res.json({ remainingFreeAnalyses: Infinity });
    }
    
    // For anonymous users, check session
    const MAX_FREE_ANALYSES = 2;
    const anonymousAnalysisCount = req.session.anonymousAnalysisCount || 0;
    const remainingFreeAnalyses = Math.max(0, MAX_FREE_ANALYSES - anonymousAnalysisCount);
    
    return res.json({ remainingFreeAnalyses });
  });
  
  // Analyze startup idea - allow limited free usage for anonymous users
  app.post("/api/analyze", async (req, res) => {
    const { startupIdea } = req.body;
    
    if (!startupIdea) {
      return res.status(400).json({ message: "Startup idea is required" });
    }
    
    // Check for OpenAI API key
    if (!process.env.OPENAI_API_KEY) {
      return res.status(503).json({ 
        message: "AI analysis is currently unavailable. Please try again later.",
        error: "missing_api_key"
      });
    }
    
    // Track free analysis usage for anonymous users
    if (!req.isAuthenticated()) {
      // Initialize the session counter if not already present
      if (req.session.anonymousAnalysisCount === undefined) {
        req.session.anonymousAnalysisCount = 0;
      }
      
      // Check if user has exceeded the free limit (2 analyses)
      if (req.session.anonymousAnalysisCount >= 2) {
        return res.status(403).json({ 
          message: "Free analysis limit reached. Please sign up to continue analyzing startup ideas.",
          error: "free_limit_reached",
          remainingFreeAnalyses: 0,
          totalFreeAnalyses: 2
        });
      }
      
      // Increment the counter for anonymous users
      req.session.anonymousAnalysisCount++;
    }
    
    // Detect country from IP (simplified for demo)
    const country = req.body.country || detectCountryFromIP(req.ip || '');
    
    try {
      // Enhanced in-memory cache with hashing for better performance
      const analysisCache = (req.app.locals.analysisCache = req.app.locals.analysisCache || new Map());
      
      // Create a unique cache key based on idea and country - use a more efficient hash
      const hashedIdea = Buffer.from(startupIdea.trim().toLowerCase().substring(0, 50)).toString('base64');
      const cacheKey = `analysis_${hashedIdea}_${country}`;
      
      // Longer cache duration (24 hours instead of 60 minutes) to improve response times
      const cachedResult = analysisCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000)) {
        console.log("Using cached analysis result from cache");
        return res.json(cachedResult.data);
      }
      
      console.log("Starting new analysis for idea:", startupIdea.substring(0, 50) + "...");
      console.log("Target country:", country);
      
      // Determine plan type (free for anonymous users)
      const planType = req.isAuthenticated() ? req.user.planType : 'free';
      
      // Add longer timeout to prevent long-running requests but give enough time for quality analysis
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Analysis request timeout after 90 seconds")), 90000); // 90 seconds timeout for detailed analysis
      });
      
      // Get analysis results using a more robust, multi-step approach
      let analysisResults;
      try {
        console.log("Using multi-step analysis workflow for better reliability");
        
        // Step 1: Get core analysis using the new step-by-step approach
        console.log("Step 1: Requesting core analysis data with step-by-step analysis");
        analysisResults = await Promise.race([
          analyzeStartupIdeaStepByStep(startupIdea, country, planType),
          timeoutPromise
        ]);
        
        console.log("Core analysis completed successfully");
        
        // Step 2: Extend with execution plan (if we have core analysis)
        if (analysisResults) {
          try {
            console.log("Step 2: Enhancing analysis with execution planning data");
            const initialBudget = analysisResults.fundingRequired?.total || 500000;
            
            // Use a separate promise race for the execution plan with a shorter timeout
            const planningPromise = new Promise((_, planReject) => {
              setTimeout(() => planReject(new Error("Planning step timeout")), 45000);
            });
            
            const planToExecute = await Promise.race([
              generateExecutionPlan(startupIdea, initialBudget, country),
              planningPromise
            ]);
            
            // Add planning data if available, but don't fail if this step fails
            if (planToExecute) {
              console.log("Successfully added execution planning data");
              analysisResults.planToExecute = planToExecute;
            }
          } catch (planningError) {
            // Don't fail the whole analysis if just the planning step fails
            console.warn("Planning enhancement failed, continuing with core analysis:", planningError.message);
          }
        }
        
        console.log("Multi-step analysis workflow completed");
      } catch (innerError) {
        console.error("Error in OpenAI analysis:", innerError);
        throw innerError;
      }
      
      // Validate and ensure the response structure is complete
      if (!analysisResults) {
        console.error("Analysis results are undefined or null");
        throw new Error("Empty response from AI service");
      }

      // Log the response keys to help with debugging
      console.log("Analysis results keys:", Object.keys(analysisResults));

      // Check if all required fields are present
      const requiredFields = [
        'successRate', 'competitors', 'targetAudienceFit', 'marketSize', 
        'businessModelStrength', 'fundingRequired', 'swotAnalysis', 'previousFailedExecutions'
      ];
      
      const missingFields = requiredFields.filter(field => !Object.prototype.hasOwnProperty.call(analysisResults, field));
      
      if (missingFields.length > 0) {
        console.error("Missing required fields in analysis results:", missingFields);
        // Initialize missing fields with default values to prevent app crashes
        missingFields.forEach(field => {
          if (field === 'successRate') {
            (analysisResults as any).successRate = {
              percentage: 50,
              goodPoints: ["Analysis incomplete - please try again"],
              badPoints: ["Server encountered an issue processing your request"],
              message: "Analysis could not be fully completed"
            };
          } else if (field === 'competitors') {
            (analysisResults as any).competitors = {
              competitors: [],
              message: "Could not analyze competitors at this time"
            };
          } else if (field === 'targetAudienceFit') {
            (analysisResults as any).targetAudienceFit = {
              segments: [],
              message: "Could not analyze target audience at this time"
            };
          } else if (field === 'marketSize') {
            (analysisResults as any).marketSize = {
              segments: [],
              totalSize: 0,
              message: "Could not analyze market size at this time"
            };
          } else if (field === 'businessModelStrength') {
            (analysisResults as any).businessModelStrength = {
              overall: 50,
              components: [],
              message: "Could not analyze business model at this time"
            };
          } else if (field === 'fundingRequired') {
            (analysisResults as any).fundingRequired = {
              total: 0,
              breakdown: [],
              message: "Could not analyze funding requirements at this time"
            };
          } else if (field === 'swotAnalysis') {
            (analysisResults as any).swotAnalysis = {
              strengths: ["Could not analyze strengths at this time"],
              weaknesses: ["Could not analyze weaknesses at this time"],
              opportunities: ["Could not analyze opportunities at this time"],
              threats: ["Could not analyze threats at this time"]
            };
          } else if (field === 'previousFailedExecutions') {
            (analysisResults as any).previousFailedExecutions = {
              failures: [],
              message: "Could not analyze previous failures at this time"
            };
          }
        });
        
        console.log("Added default values for missing fields");
      }
      
      // Cache the successful result
      analysisCache.set(cacheKey, {
        data: analysisResults,
        timestamp: Date.now()
      });
      
      // Save the analysis to storage only if user is authenticated
      if (req.isAuthenticated()) {
        try {
          const savedAnalysis = await storage.createAnalysis({
            userId: req.user.id,
            startupIdea,
            country,
            results: analysisResults
          });
          console.log("Successfully saved analysis with ID:", savedAnalysis.id);
        } catch (saveError) {
          console.error("Error saving analysis:", saveError);
          // Continue with the response even if storing fails
        }
      }
      
      // Add metadata about free analysis usage for anonymous users
      const responseData = {
        ...analysisResults,
        meta: {
          isAuthenticated: req.isAuthenticated(),
          remainingFreeAnalyses: req.isAuthenticated() ? 
            null : 
            Math.max(0, 2 - (req.session.anonymousAnalysisCount || 0)),
          totalFreeAnalyses: 2
        }
      };
      
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error analyzing startup idea:", error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("timeout")) {
        return res.status(504).json({ 
          message: "Analysis is taking too long. Please try a shorter description or try again later.",
          error: "timeout"
        });
      } else if (errorMessage.includes("rate limits")) {
        return res.status(429).json({ 
          message: "Too many requests. Please try again in a few minutes.",
          error: "rate_limit" 
        });
      } else if (errorMessage.includes("content policy")) {
        return res.status(400).json({ 
          message: "Your startup idea could not be analyzed. Please revise your content and try again.",
          error: "content_policy" 
        });
      } else if (errorMessage.includes("Invalid OpenAI API key") || errorMessage.includes("Incorrect API key provided")) {
        return res.status(503).json({ 
          message: "AI analysis is currently unavailable due to API key validation issues. Please try again later or contact support.",
          error: "invalid_api_key" 
        });
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze startup idea. Please try again later.",
        error: "server_error"
      });
    }
  });
  
  // Generate execution plan (Unicorn feature)
  // Budget analysis endpoint (Enhanced feature for paid plans)
  app.post("/api/budget-analysis", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.planType === "free") {
      return res.status(403).json({ message: "Pro or Unicorn plan required for this feature" });
    }
    
    const { startupIdea, initialBudget } = req.body;
    
    if (!startupIdea || !initialBudget) {
      return res.status(400).json({ message: "Startup idea and initial budget are required" });
    }
    
    // Detect country from IP or use provided country
    const country = req.body.country || detectCountryFromIP(req.ip || '');
    
    try {
      // Enhanced in-memory cache for budget analysis
      const budgetCache = (req.app.locals.budgetCache = req.app.locals.budgetCache || new Map());
      
      // Create a unique cache key with Base64 hashing for better performance
      const hashedIdea = Buffer.from(startupIdea.trim().toLowerCase().substring(0, 50)).toString('base64');
      const cacheKey = `budget_${hashedIdea}_${initialBudget}_${country}`;
      
      // Longer cache duration (24 hours) for better performance
      const cachedResult = budgetCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000)) {
        console.log("Using cached budget analysis from cache");
        return res.json(cachedResult.data);
      }
      
      // Add shorter timeout to prevent long-running requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 60000); // 60 seconds timeout for detailed analysis
      });
      
      // Race between the analysis and the timeout
      const budgetAnalysis = await Promise.race([
        generateBudgetAnalysis(startupIdea, initialBudget, country),
        timeoutPromise
      ]);
      
      // Cache the successful result
      budgetCache.set(cacheKey, {
        data: budgetAnalysis,
        timestamp: Date.now()
      });
      
      return res.status(200).json(budgetAnalysis);
    } catch (error) {
      console.error("Error generating budget analysis:", error);
      
      // Provide more specific error messages
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("timeout")) {
        return res.status(504).json({ 
          message: "Analysis is taking too long. Please try again later.",
          error: "timeout"
        });
      } else {
        return res.status(500).json({ 
          message: "Failed to generate budget analysis",
          error: "analysis_error"
        });
      }
    }
  });
  
  // Legacy execution plan endpoint (kept for backward compatibility)
  app.post("/api/execution-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // All features now available to all users
    // Premium plan check removed
    
    const { startupIdea, initialBudget } = req.body;
    
    if (!startupIdea || !initialBudget) {
      return res.status(400).json({ message: "Startup idea and initial budget are required" });
    }
    
    try {
      // Get the user's country for context
      const userCountry = req.user.country || "United States"; // Default if not specified
      
      // Log request data
      console.log("Execution plan request:", { startupIdea, initialBudget, userCountry });
      
      // First, get the enhanced execution plan with country-specific data
      const executionPlan = await generateExecutionPlan(startupIdea, initialBudget, userCountry);
      console.log("Execution plan response:", JSON.stringify(executionPlan).substring(0, 100) + "...");
      
      // Then, get the comprehensive budget analysis
      const budgetAnalysis = await generateBudgetAnalysis(startupIdea, initialBudget, userCountry);
      console.log("Budget analysis response:", JSON.stringify(budgetAnalysis).substring(0, 100) + "...");
      
      // Combine the data in the correct structure - use the same structure expected by the client
      // Make sure budgetAnalysis is properly nested to match what the client expects
      const responseData = {
        planningToExecute: executionPlan,
        budgetAnalysis
      };
      
      console.log("Full response structure:", Object.keys(responseData));
      console.log("Budget analysis (budgetAnalysis) exists:", !!responseData.budgetAnalysis);
      
      // Log the first few properties of budgetAnalysis to verify its structure
      if (responseData.budgetAnalysis) {
        console.log("Budget analysis keys:", Object.keys(responseData.budgetAnalysis));
        console.log("Budget analysis first property:", 
          Object.keys(responseData.budgetAnalysis).length > 0 ? 
          Object.keys(responseData.budgetAnalysis)[0] + ": " + 
          JSON.stringify((responseData.budgetAnalysis as any)[Object.keys(responseData.budgetAnalysis)[0]]).substring(0, 50) : 
          "No properties");
      }
      
      // Return the combined data
      return res.status(200).json(responseData);
    } catch (error) {
      console.error("Error generating execution plan:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      if (errorMessage.includes("Invalid OpenAI API key") || errorMessage.includes("Incorrect API key provided")) {
        return res.status(503).json({ 
          message: "AI analysis is currently unavailable due to API key validation issues. Please try again later or contact support.",
          error: "invalid_api_key" 
        });
      }
      
      return res.status(500).json({ message: "Failed to generate execution plan" });
    }
  });
  
  // Find investors (Previously Unicorn feature, now available to all)
  app.post("/api/investors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // All features now available to all users
    // Premium plan check removed
    
    const { startupIdea } = req.body;
    
    if (!startupIdea) {
      return res.status(400).json({ message: "Startup idea is required" });
    }
    
    try {
      // Enhanced in-memory cache for investors results
      const investorsCache = (req.app.locals.investorsCache = req.app.locals.investorsCache || new Map());
      
      // Create a unique cache key with Base64 hashing for better performance
      const hashedIdea = Buffer.from(startupIdea.trim().toLowerCase().substring(0, 50)).toString('base64');
      const country = detectCountryFromIP(req.ip || '');
      const cacheKey = `investor_${hashedIdea}_${country}`;
      
      // Longer cache duration (24 hours) for better performance
      const cachedResult = investorsCache.get(cacheKey);
      if (cachedResult && (Date.now() - cachedResult.timestamp < 24 * 60 * 60 * 1000)) {
        console.log("Using cached investors result from cache");
        return res.json(cachedResult.data);
      }
      
      // Add shorter timeout to prevent long-running requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 60000); // 60 seconds timeout for detailed analysis
      });
      
      // Race between the investors search and the timeout
      const investors = await Promise.race([
        findInvestors(startupIdea, country),
        timeoutPromise
      ]);
      
      // Cache the successful result
      investorsCache.set(cacheKey, {
        data: investors,
        timestamp: Date.now()
      });
      
      return res.status(200).json(investors);
    } catch (error) {
      console.error("Error finding investors:", error);
      return res.status(500).json({ message: "Failed to find investors" });
    }
  });
  
  // Upload profile picture (Authentication required)
  app.post("/api/profile-picture", upload.single('profilePicture'), async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create URL for the uploaded file
      const fileUrl = `/uploads/${req.file.filename}`;
      
      // Update user's profile picture URL
      const updatedUser = await storage.updateUserProfilePicture(req.user.id, fileUrl);
      
      return res.status(200).json({ 
        message: "Profile picture updated successfully",
        user: updatedUser 
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return res.status(500).json({ message: "Failed to update profile picture" });
    }
  });

  // Get news articles (Authentication required)
  app.get("/api/news", async (req, res) => {
    // Only authenticated users can access news articles
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Authentication required to view news articles",
        error: "auth_required"
      });
    }
    
    try {
      const country = detectCountryFromIP(req.ip || '');
      const articles = await searchStartupNews(country);
      return res.status(200).json(articles);
    } catch (error) {
      console.error("Error fetching news articles:", error);
      return res.status(500).json({ message: "Failed to fetch news articles" });
    }
  });
  
  // Update user plan
  app.post("/api/user/plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { planType } = req.body;
    
    if (!planType || !["free", "pro", "unicorn"].includes(planType)) {
      return res.status(400).json({ message: "Invalid plan type" });
    }
    
    try {
      const updatedUser = await storage.updateUserPlan(req.user.id, planType);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating plan:", error);
      return res.status(500).json({ message: "Failed to update plan" });
    }
  });
  
  // Update user bio
  app.patch("/api/user/bio", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { bio } = req.body;
    
    if (bio === undefined) {
      return res.status(400).json({ message: "Bio field is required" });
    }
    
    try {
      const updatedUser = await storage.updateUserBio(req.user.id, bio);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating bio:", error);
      return res.status(500).json({ message: "Failed to update bio" });
    }
  });

  // Get all community posts
  app.get("/api/posts", async (req, res) => {
    try {
      console.log("Attempting to fetch posts...");
      const posts = await storage.getPosts();
      console.log(`Successfully fetched ${posts.length} posts`);
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Get a specific post by ID
  app.get("/api/posts/:id", async (req, res) => {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    try {
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      return res.status(200).json(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      return res.status(500).json({ message: "Failed to fetch post" });
    }
  });
  
  // Create a new post
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { title, description, tags } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    
    try {
      const newPost: InsertPost = {
        authorId: req.user.id,
        title,
        description,
        tags: tags || []
      };
      
      const post = await storage.createPost(newPost);
      return res.status(201).json(post);
    } catch (error) {
      console.error("Error creating post:", error);
      return res.status(500).json({ message: "Failed to create post" });
    }
  });
  
  // Get comments for a post
  app.get("/api/posts/:id/comments", async (req, res) => {
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    try {
      const comments = await storage.getCommentsByPostId(postId);
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Add a comment to a post
  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: "Comment content is required" });
    }
    
    try {
      // Verify the post exists
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const newComment: InsertComment = {
        postId,
        authorId: req.user.id,
        content
      };
      
      const comment = await storage.createComment(newComment);
      return res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      return res.status(500).json({ message: "Failed to create comment" });
    }
  });
  
  // Vote on a post (pump or dump)
  app.post("/api/posts/:id/vote", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const postId = parseInt(req.params.id);
    
    if (isNaN(postId)) {
      return res.status(400).json({ message: "Invalid post ID" });
    }
    
    const { voteType } = req.body;
    
    if (!voteType || !["pump", "dump"].includes(voteType)) {
      return res.status(400).json({ message: "Valid vote type (pump/dump) is required" });
    }
    
    try {
      // Verify the post exists
      const post = await storage.getPostById(postId);
      
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const newVote: InsertVote = {
        postId,
        userId: req.user.id,
        voteType
      };
      
      const vote = await storage.createVote(newVote);
      return res.status(200).json(vote);
    } catch (error) {
      console.error("Error voting on post:", error);
      return res.status(500).json({ message: "Failed to vote on post" });
    }
  });
  
  // Follow a user
  app.post("/api/follow/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = parseInt(req.params.id);
    
    if (isNaN(followingId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    if (followingId === req.user.id) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    
    try {
      // Verify user exists
      const user = await storage.getUser(followingId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const newFollow: InsertFollow = {
        followerId: req.user.id,
        followingId
      };
      
      const follow = await storage.createFollow(newFollow);
      return res.status(200).json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      
      if (error instanceof Error && error.message === "Already following this user") {
        return res.status(400).json({ message: error.message });
      }
      
      return res.status(500).json({ message: "Failed to follow user" });
    }
  });
  
  // Unfollow a user
  app.delete("/api/follow/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = parseInt(req.params.id);
    
    if (isNaN(followingId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      // Check if already following
      const isFollowing = await storage.isFollowing(req.user.id, followingId);
      
      if (!isFollowing) {
        return res.status(400).json({ message: "You are not following this user" });
      }
      
      await storage.deleteFollow(req.user.id, followingId);
      return res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return res.status(500).json({ message: "Failed to unfollow user" });
    }
  });
  
  // Check if following a user
  app.get("/api/follow/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = parseInt(req.params.id);
    
    if (isNaN(followingId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    
    try {
      const isFollowing = await storage.isFollowing(req.user.id, followingId);
      return res.status(200).json({ isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      return res.status(500).json({ message: "Failed to check follow status" });
    }
  });

  // Get analyses history for authenticated user
  app.get("/api/analyses", async (req, res) => {
    // Only authenticated users can access their analysis history
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Authentication required to view analyses history",
        error: "auth_required"
      });
    }
    
    try {
      const analyses = await storage.getAnalysesByUserId(req.user.id);
      return res.status(200).json(analyses);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      return res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });
  
  // Saved Ideas API endpoints
  // Get all saved ideas for the authenticated user
  app.get("/api/saved-ideas", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Authentication required to view saved ideas",
        error: "auth_required"
      });
    }
    
    try {
      console.log("Attempting to fetch saved ideas for user:", req.user.id);
      const savedIdeas = await storage.getSavedIdeasByUserId(req.user.id);
      console.log(`Successfully fetched ${savedIdeas.length} saved ideas`);
      return res.status(200).json(savedIdeas);
    } catch (error) {
      console.error("Error fetching saved ideas:", error);
      return res.status(500).json({ message: "Failed to fetch saved ideas" });
    }
  });
  
  // Get a single saved idea by ID
  app.get("/api/saved-ideas/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const savedIdea = await storage.getSavedIdeaById(id);
      
      if (!savedIdea) {
        return res.status(404).json({ message: "Saved idea not found" });
      }
      
      // Check if the saved idea belongs to the authenticated user
      if (savedIdea.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      return res.status(200).json(savedIdea);
    } catch (error) {
      console.error("Error fetching saved idea:", error);
      return res.status(500).json({ message: "Failed to fetch saved idea" });
    }
  });
  
  // Create a new saved idea
  app.post("/api/saved-ideas", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { title, description, ideaType, notes, resultsSnapshot } = req.body;
    
    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }
    
    try {
      const newSavedIdea: InsertSavedIdea = {
        userId: req.user.id,
        title,
        description,
        ideaType: ideaType || "general",
        notes: notes || "",
        resultsSnapshot: resultsSnapshot || null,
      };
      
      const savedIdea = await storage.createSavedIdea(newSavedIdea);
      return res.status(201).json(savedIdea);
    } catch (error) {
      console.error("Error creating saved idea:", error);
      return res.status(500).json({ message: "Failed to create saved idea" });
    }
  });
  
  // Update an existing saved idea (PUT method)
  app.put("/api/saved-ideas/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const existingSavedIdea = await storage.getSavedIdeaById(id);
      
      if (!existingSavedIdea) {
        return res.status(404).json({ message: "Saved idea not found" });
      }
      
      // Check if the saved idea belongs to the authenticated user
      if (existingSavedIdea.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Only update fields that are provided
      const updates: Partial<InsertSavedIdea> = {};
      
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.ideaType !== undefined) updates.ideaType = req.body.ideaType;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;
      if (req.body.resultsSnapshot !== undefined) updates.resultsSnapshot = req.body.resultsSnapshot;
      
      const updatedSavedIdea = await storage.updateSavedIdea(id, updates);
      return res.status(200).json(updatedSavedIdea);
    } catch (error) {
      console.error("Error updating saved idea:", error);
      return res.status(500).json({ message: "Failed to update saved idea" });
    }
  });
  
  // Update an existing saved idea (PATCH method - partial update)
  app.patch("/api/saved-ideas/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const existingSavedIdea = await storage.getSavedIdeaById(id);
      
      if (!existingSavedIdea) {
        return res.status(404).json({ message: "Saved idea not found" });
      }
      
      // Check if the saved idea belongs to the authenticated user
      if (existingSavedIdea.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Only update fields that are provided
      const updates: Partial<InsertSavedIdea> = {};
      
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.description !== undefined) updates.description = req.body.description;
      if (req.body.ideaType !== undefined) updates.ideaType = req.body.ideaType;
      if (req.body.notes !== undefined) updates.notes = req.body.notes;
      if (req.body.resultsSnapshot !== undefined) updates.resultsSnapshot = req.body.resultsSnapshot;
      
      const updatedSavedIdea = await storage.updateSavedIdea(id, updates);
      return res.status(200).json(updatedSavedIdea);
    } catch (error) {
      console.error("Error updating saved idea:", error);
      return res.status(500).json({ message: "Failed to update saved idea" });
    }
  });
  
  // Delete a saved idea
  app.delete("/api/saved-ideas/:id", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }
    
    try {
      const existingSavedIdea = await storage.getSavedIdeaById(id);
      
      if (!existingSavedIdea) {
        return res.status(404).json({ message: "Saved idea not found" });
      }
      
      // Check if the saved idea belongs to the authenticated user
      if (existingSavedIdea.userId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      await storage.deleteSavedIdea(id);
      return res.status(200).json({ message: "Saved idea deleted successfully" });
    } catch (error) {
      console.error("Error deleting saved idea:", error);
      return res.status(500).json({ message: "Failed to delete saved idea" });
    }
  });

  // Return the HTTP server
  return httpServer;
}

// WebSocket server setup
function setupWebSocketServer(httpServer: Server) {
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/ws'
  });
  
  wss.on('connection', (ws: UserWebSocket, req) => {
    // Initialize user as unauthenticated
    // Later, client will need to send authentication with user ID
    ws.userId = undefined;
    
    ws.on('message', async (message) => {
      try {
        const data: WebSocketMessage = JSON.parse(message.toString());
        
        // Handle authentication
        if (data.type === 'auth') {
          // Validate the payload has a userId field
          if (!data.payload || typeof data.payload !== 'object') {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Authentication failed: Invalid payload' }
            }));
            console.log('WebSocket auth failed: Invalid payload', data);
            return;
          }

          // Validate user ID from authentication payload
          const userId = data.payload.userId;
          if (typeof userId !== 'number' || isNaN(userId) || userId <= 0) {
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Authentication failed: Invalid user ID' }
            }));
            console.log('WebSocket auth failed: Invalid user ID', userId);
            return;
          }

          // Verify user exists in the database
          try {
            console.log('Verifying user in database, ID:', userId);
            const user = await storage.getUser(userId);
            
            if (!user) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Authentication failed: User not found' }
              }));
              console.log('WebSocket auth failed: User not found for ID', userId);
              return;
            }
            
            console.log('User found, authenticating WebSocket connection for', user.username);
            
            // Set the authenticated user ID
            ws.userId = userId;
            
            // Add connection to active connections map
            if (!activeConnections.has(userId)) {
              activeConnections.set(userId, new Set());
              console.log(`Creating new connection set for user ${userId}`);
            }
            const connections = activeConnections.get(userId);
            if (connections) {
              connections.add(ws);
              console.log(`Added connection to pool for user ${userId}. Total connections: ${connections.size}`);
            } else {
              console.error(`Unexpected: connection set for user ${userId} is undefined`);
            }
          } catch (error) {
            console.error('Error authenticating WebSocket connection:', error);
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Authentication failed' }
            }));
            return;
          }
          
          // Send confirmation
          ws.send(JSON.stringify({
            type: 'auth_success',
            payload: { userId: ws.userId }
          }));
          
          // Send unread messages count if user is authenticated
          if (ws.userId !== undefined) {
            const unreadCount = await storage.getUnreadMessagesCount(ws.userId);
            ws.send(JSON.stringify({
              type: 'unread_count',
              payload: { count: unreadCount }
            }));
          }
          
          return;
        }
        
        // For all other message types, ensure the user is authenticated
        if (ws.userId === undefined) {
          ws.send(JSON.stringify({
            type: 'error',
            payload: { message: 'Authentication required' }
          }));
          return;
        }
        
        // Handle different message types
        switch (data.type) {
          case 'get_conversations':
            const conversations = await storage.getUserConversations(ws.userId);
            ws.send(JSON.stringify({
              type: 'conversations',
              payload: { conversations }
            }));
            break;
            
          case 'get_messages':
            const { conversationId, limit } = data.payload;
            const messages = await storage.getMessagesByConversationId(
              conversationId,
              limit || 50
            );
            ws.send(JSON.stringify({
              type: 'messages',
              payload: { 
                conversationId, 
                messages 
              }
            }));
            break;
            
          case 'send_message':
            const { content, conversationId: msgConversationId } = data.payload;
            
            // Validate that user is a participant in the conversation
            const participants = await storage.getConversationParticipants(msgConversationId);
            const isParticipant = participants.some(p => p.userId === ws.userId);
            
            if (!isParticipant) {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'Not a participant in this conversation' }
              }));
              break;
            }
            
            // Create message
            const newMessage = await storage.createMessage({
              conversationId: msgConversationId,
              senderId: ws.userId,
              content
            });
            
            // Send message to all participants in conversation
            participants.forEach(participant => {
              const participantConnections = activeConnections.get(participant.userId);
              
              if (participantConnections) {
                participantConnections.forEach(conn => {
                  if (conn.readyState === WebSocket.OPEN) {
                    conn.send(JSON.stringify({
                      type: 'new_message',
                      payload: { message: newMessage }
                    }));
                  }
                });
              }
            });
            break;
            
          case 'mark_read':
            const { messageId } = data.payload;
            
            await storage.markMessageAsRead({
              messageId,
              userId: ws.userId
            });
            
            // Send updated unread count
            const newUnreadCount = await storage.getUnreadMessagesCount(ws.userId);
            ws.send(JSON.stringify({
              type: 'unread_count',
              payload: { count: newUnreadCount }
            }));
            break;
            
          case 'create_conversation':
            const { name, isGroup, participants: participantIds } = data.payload;
            
            // Type check to ensure ws.userId is defined
            if (typeof ws.userId !== 'number') {
              ws.send(JSON.stringify({
                type: 'error',
                payload: { message: 'User authentication required' }
              }));
              break;
            }
            
            // Create conversation
            const newConversation = await storage.createConversation({
              name: name || null,
              isGroup: isGroup || false
            });
            
            // Add participants
            const participantPromises = [
              // Add the creator as admin
              storage.addParticipantToConversation({
                conversationId: newConversation.id,
                userId: ws.userId,
                isAdmin: true
              })
            ];
            
            // Add other participants if they exist
            if (Array.isArray(participantIds)) {
              const otherParticipants = participantIds
                .filter((id: number) => typeof id === 'number' && id !== ws.userId)
                .map((id: number) => 
                  storage.addParticipantToConversation({
                    conversationId: newConversation.id,
                    userId: id,
                    isAdmin: false
                  })
                );
              
              participantPromises.push(...otherParticipants);
            }
            
            await Promise.all(participantPromises);
            
            // Notify all participants
            const allParticipantIds = [ws.userId];
            if (Array.isArray(participantIds)) {
              allParticipantIds.push(...participantIds.filter((id: number) => typeof id === 'number'));
            }
            
            allParticipantIds.forEach((participantId: number) => {
              const participantConnections = activeConnections.get(participantId);
              
              if (participantConnections) {
                participantConnections.forEach(conn => {
                  if (conn.readyState === WebSocket.OPEN) {
                    conn.send(JSON.stringify({
                      type: 'new_conversation',
                      payload: { conversation: newConversation }
                    }));
                  }
                });
              }
            });
            break;
            
          default:
            ws.send(JSON.stringify({
              type: 'error',
              payload: { message: 'Unknown message type' }
            }));
        }
        
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          payload: { message: 'Server error processing message' }
        }));
      }
    });
    
    // Handle disconnection with improved cleanup
    ws.on('close', () => {
      if (ws.userId !== undefined) {
        const userConnections = activeConnections.get(ws.userId);
        
        if (userConnections) {
          const wasDeleted = userConnections.delete(ws);
          console.log(`WebSocket connection closed for user ${ws.userId}. Connection removed: ${wasDeleted}`);
          
          // If this was the last connection for this user, remove the user from active connections
          if (userConnections.size === 0) {
            activeConnections.delete(ws.userId);
            console.log(`Removed user ${ws.userId} from active connections (no more connections)`);
          } else {
            console.log(`User ${ws.userId} still has ${userConnections.size} active connections`);
          }
        } else {
          console.log(`User ${ws.userId} had no active connections set`);
        }
      } else {
        console.log(`WebSocket connection closed for unauthenticated user`);
      }
    });
  });
}