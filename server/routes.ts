import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeStartupIdea, generateExecutionPlan, findInvestors } from "./openai";
import { searchStartupNews } from "./tavily";
import { detectCountryFromIP } from "./utils";
import { InsertPost, InsertComment, InsertVote, InsertFollow, AnalysisResults } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication routes
  setupAuth(app);

  // API routes
  // Analyze startup idea
  app.post("/api/analyze", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
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
    
    // Detect country from IP (simplified for demo)
    const country = req.body.country || detectCountryFromIP(req.ip || '');
    
    try {
      // Add timeout to prevent long-running requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000);
      });
      
      // Race between the analysis and the timeout
      const analysisResults = await Promise.race([
        analyzeStartupIdea(startupIdea, country, req.user.planType),
        timeoutPromise
      ]) as AnalysisResults;
      
      // Validate the response structure
      if (!analysisResults || !analysisResults.successRate) {
        throw new Error("Invalid response format from AI service");
      }
      
      // Save the analysis to storage
      await storage.createAnalysis({
        userId: req.user.id,
        startupIdea,
        country,
        results: analysisResults
      });
      
      return res.status(200).json(analysisResults);
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
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze startup idea. Please try again later.",
        error: "server_error"
      });
    }
  });
  
  // Generate execution plan (Unicorn feature)
  app.post("/api/execution-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.planType !== "unicorn") {
      return res.status(403).json({ message: "Unicorn plan required for this feature" });
    }
    
    const { startupIdea, initialBudget } = req.body;
    
    if (!startupIdea || !initialBudget) {
      return res.status(400).json({ message: "Startup idea and initial budget are required" });
    }
    
    try {
      const executionPlan = await generateExecutionPlan(startupIdea, initialBudget);
      return res.status(200).json(executionPlan);
    } catch (error) {
      console.error("Error generating execution plan:", error);
      return res.status(500).json({ message: "Failed to generate execution plan" });
    }
  });
  
  // Find investors (Unicorn feature)
  app.post("/api/investors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    if (req.user.planType !== "unicorn") {
      return res.status(403).json({ message: "Unicorn plan required for this feature" });
    }
    
    const { startupIdea } = req.body;
    
    if (!startupIdea) {
      return res.status(400).json({ message: "Startup idea is required" });
    }
    
    try {
      const investors = await findInvestors(startupIdea, detectCountryFromIP(req.ip || ''));
      return res.status(200).json(investors);
    } catch (error) {
      console.error("Error finding investors:", error);
      return res.status(500).json({ message: "Failed to find investors" });
    }
  });
  
  // Get news articles (Available to all users)
  app.get("/api/news", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // All users can now access news articles
    
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
  app.post("/api/update-plan", async (req, res) => {
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
      return res.status(400).json({ message: "Bio is required" });
    }
    
    try {
      const updatedUser = await storage.updateUserBio(req.user.id, bio);
      return res.status(200).json(updatedUser);
    } catch (error) {
      console.error("Error updating bio:", error);
      return res.status(500).json({ message: "Failed to update bio" });
    }
  });
  
  // Community features
  // Get all posts
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts();
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      return res.status(500).json({ message: "Failed to fetch posts" });
    }
  });
  
  // Get a specific post
  app.get("/api/posts/:id", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
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
  
  // Create a post (Available to all users)
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    // All users can now create posts
    const { title, description, tags } = req.body;
    
    if (!title || !description || !tags) {
      return res.status(400).json({ message: "Title, description, and tags are required" });
    }
    
    try {
      const newPost: InsertPost = {
        title,
        description,
        tags,
        authorId: req.user.id
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
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getCommentsByPostId(postId);
      return res.status(200).json(comments);
    } catch (error) {
      console.error("Error fetching comments:", error);
      return res.status(500).json({ message: "Failed to fetch comments" });
    }
  });
  
  // Create a comment
  app.post("/api/comments", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { content, postId } = req.body;
    
    if (!content || !postId) {
      return res.status(400).json({ message: "Content and postId are required" });
    }
    
    try {
      const post = await storage.getPostById(parseInt(postId));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const newComment: InsertComment = {
        content,
        postId: parseInt(postId),
        authorId: req.user.id
      };
      
      const comment = await storage.createComment(newComment);
      return res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      return res.status(500).json({ message: "Failed to create comment" });
    }
  });
  
  // Create a vote
  app.post("/api/votes", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { postId, voteType } = req.body;
    
    if (!postId || !voteType || !["pump", "dump"].includes(voteType)) {
      return res.status(400).json({ message: "PostId and valid voteType are required" });
    }
    
    try {
      const post = await storage.getPostById(parseInt(postId));
      if (!post) {
        return res.status(404).json({ message: "Post not found" });
      }
      
      const newVote: InsertVote = {
        postId: parseInt(postId),
        userId: req.user.id,
        voteType
      };
      
      const vote = await storage.createVote(newVote);
      return res.status(201).json(vote);
    } catch (error) {
      console.error("Error creating vote:", error);
      return res.status(500).json({ message: "Failed to create vote" });
    }
  });
  
  // Follow a user
  app.post("/api/follows", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const { followingId } = req.body;
    
    if (!followingId) {
      return res.status(400).json({ message: "FollowingId is required" });
    }
    
    // Cannot follow yourself
    if (req.user.id === parseInt(followingId)) {
      return res.status(400).json({ message: "Cannot follow yourself" });
    }
    
    try {
      const userToFollow = await storage.getUser(parseInt(followingId));
      if (!userToFollow) {
        return res.status(404).json({ message: "User to follow not found" });
      }
      
      const newFollow: InsertFollow = {
        followerId: req.user.id,
        followingId: parseInt(followingId)
      };
      
      const follow = await storage.createFollow(newFollow);
      return res.status(201).json(follow);
    } catch (error) {
      console.error("Error following user:", error);
      return res.status(500).json({ message: "Failed to follow user" });
    }
  });
  
  // Unfollow a user
  app.delete("/api/follows/:followingId", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const followingId = parseInt(req.params.followingId);
    
    try {
      await storage.deleteFollow(req.user.id, followingId);
      return res.status(200).json({ message: "Unfollowed successfully" });
    } catch (error) {
      console.error("Error unfollowing user:", error);
      return res.status(500).json({ message: "Failed to unfollow user" });
    }
  });
  
  // Get user by username
  app.get("/api/users/:username", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Don't return the password
      const { password, ...userWithoutPassword } = user;
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // Get posts by username
  app.get("/api/users/:username/posts", async (req, res) => {
    try {
      const user = await storage.getUserByUsername(req.params.username);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const posts = await storage.getPostsByUserId(user.id);
      return res.status(200).json(posts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
      return res.status(500).json({ message: "Failed to fetch user posts" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
