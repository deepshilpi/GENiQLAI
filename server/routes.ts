import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { analyzeStartupIdea, generateExecutionPlan, findInvestors } from "./openai";
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
  InsertMessageRead
} from "@shared/schema";
import session from "express-session";

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
  
  // Create HTTP server
  const httpServer = createServer(app);
  
  // Setup WebSocket server
  setupWebSocketServer(httpServer);
  
  // API routes
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
    
    // No limits on analysis for any users
    
    // Detect country from IP (simplified for demo)
    const country = req.body.country || detectCountryFromIP(req.ip || '');
    
    try {
      // Add timeout to prevent long-running requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), 30000);
      });
      
      // Determine plan type (free for anonymous users)
      const planType = req.isAuthenticated() ? req.user.planType : 'free';
      
      // Race between the analysis and the timeout
      const analysisResults = await Promise.race([
        analyzeStartupIdea(startupIdea, country, planType),
        timeoutPromise
      ]) as AnalysisResults;
      
      // Validate the response structure
      if (!analysisResults || !analysisResults.successRate) {
        throw new Error("Invalid response format from AI service");
      }
      
      // Save the analysis to storage only if user is authenticated
      if (req.isAuthenticated()) {
        await storage.createAnalysis({
          userId: req.user.id,
          startupIdea,
          country,
          results: analysisResults
        });
      }
      
      // Add metadata about usage
      const responseData = {
        ...analysisResults,
        meta: {
          isAuthenticated: req.isAuthenticated()
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
      }
      
      return res.status(500).json({ 
        message: "Failed to analyze startup idea. Please try again later.",
        error: "server_error"
      });
    }
  });
  
  // Generate execution plan
  app.post("/api/execution-plan", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
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
  
  // Find investors
  app.post("/api/investors", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Authentication required" });
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
      const posts = await storage.getPosts();
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
    
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }
    
    try {
      const newPost: InsertPost = {
        authorId: req.user.id,
        title,
        content,
        pumpCount: 0,
        dumpCount: 0
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
          // Validate user ID from authentication payload
          const userId = data.payload.userId;
          if (typeof userId !== 'number' || isNaN(userId)) {
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
            
            console.log('User found, authenticating WebSocket connection');
            
            // Set the authenticated user ID
            ws.userId = userId;
            
            // Add connection to active connections map
            if (!activeConnections.has(userId)) {
              activeConnections.set(userId, new Set());
            }
            const connections = activeConnections.get(userId);
            if (connections) {
              connections.add(ws);
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
    
    // Handle disconnection
    ws.on('close', () => {
      if (ws.userId !== undefined) {
        const userConnections = activeConnections.get(ws.userId);
        
        if (userConnections) {
          userConnections.delete(ws);
          
          if (userConnections.size === 0) {
            activeConnections.delete(ws.userId);
          }
        }
      }
    });
  });
}