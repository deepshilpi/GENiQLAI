import { pgTable, text, serial, integer, boolean, timestamp, json, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  profilePictureUrl: text("profile_picture_url"),
  planType: text("plan_type").notNull().default("free"), // "free", "pro", "unicorn"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
  analysisCount: integer("analysis_count").notNull().default(0),
  successRate: integer("success_rate").notNull().default(0),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
}).extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters")
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  tags: text("tags").array().notNull(),
  authorId: integer("author_id").notNull().references(() => users.id),
  pumpCount: integer("pump_count").notNull().default(0),
  dumpCount: integer("dump_count").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  description: true,
  tags: true,
  authorId: true,
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull().references(() => posts.id),
  authorId: integer("author_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true,
  authorId: true,
});

export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  postId: integer("post_id").notNull().references(() => posts.id),
  userId: integer("user_id").notNull().references(() => users.id),
  voteType: text("vote_type").notNull(), // "pump" or "dump"
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  postId: true,
  userId: true,
  voteType: true,
});

export const follows = pgTable("follows", {
  id: serial("id").primaryKey(),
  followerId: integer("follower_id").notNull().references(() => users.id),
  followingId: integer("following_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFollowSchema = createInsertSchema(follows).pick({
  followerId: true,
  followingId: true,
});

export const analyses = pgTable("analyses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  startupIdea: text("startup_idea").notNull(),
  country: text("country").notNull(),
  results: json("results").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const savedIdeas = pgTable("saved_ideas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  ideaType: text("idea_type").notNull().default("general"),
  notes: text("notes").default(""),
  resultsSnapshot: json("results_snapshot"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Direct messaging tables
export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  name: text("name"), // Optional name for group chats
  isGroup: boolean("is_group").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const conversationParticipants = pgTable("conversation_participants", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  userId: integer("user_id").notNull().references(() => users.id),
  isAdmin: boolean("is_admin").notNull().default(false),
  joinedAt: timestamp("joined_at").notNull().defaultNow(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id),
  senderId: integer("sender_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const messageReads = pgTable("message_reads", {
  id: serial("id").primaryKey(),
  messageId: integer("message_id").notNull().references(() => messages.id),
  userId: integer("user_id").notNull().references(() => users.id),
  readAt: timestamp("read_at").notNull().defaultNow(),
});

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  userId: true,
  startupIdea: true,
  country: true,
  results: true,
});

export const insertSavedIdeaSchema = createInsertSchema(savedIdeas).pick({
  userId: true,
  title: true,
  description: true,
  ideaType: true,
  notes: true,
  resultsSnapshot: true,
});

// Create insert schemas for messaging tables
export const insertConversationSchema = createInsertSchema(conversations).pick({
  name: true,
  isGroup: true,
});

export const insertConversationParticipantSchema = createInsertSchema(conversationParticipants).pick({
  conversationId: true,
  userId: true,
  isAdmin: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  conversationId: true,
  senderId: true,
  content: true,
});

export const insertMessageReadSchema = createInsertSchema(messageReads).pick({
  messageId: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Follow = typeof follows.$inferSelect;
export type InsertFollow = z.infer<typeof insertFollowSchema>;
export type Analysis = typeof analyses.$inferSelect;
export type InsertAnalysis = z.infer<typeof insertAnalysisSchema>;
export type SavedIdea = typeof savedIdeas.$inferSelect;
export type InsertSavedIdea = z.infer<typeof insertSavedIdeaSchema>;
export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type ConversationParticipant = typeof conversationParticipants.$inferSelect;
export type InsertConversationParticipant = z.infer<typeof insertConversationParticipantSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type MessageRead = typeof messageReads.$inferSelect;
export type InsertMessageRead = z.infer<typeof insertMessageReadSchema>;

// Define relationships between tables
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
  comments: many(comments),
  votes: many(votes),
  followedBy: many(follows, { relationName: "followers" }),
  following: many(follows, { relationName: "following" }),
  analyses: many(analyses),
  savedIdeas: many(savedIdeas),
  participatedConversations: many(conversationParticipants),
  sentMessages: many(messages, { relationName: "sender" }),
  messageReads: many(messageReads),
}));

export const postsRelations = relations(posts, ({ one, many }) => ({
  author: one(users, {
    fields: [posts.authorId],
    references: [users.id],
  }),
  comments: many(comments),
  votes: many(votes),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  author: one(users, {
    fields: [comments.authorId],
    references: [users.id],
  }),
}));

export const votesRelations = relations(votes, ({ one }) => ({
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
}));

export const followsRelations = relations(follows, ({ one }) => ({
  follower: one(users, {
    fields: [follows.followerId],
    references: [users.id],
    relationName: "following",
  }),
  following: one(users, {
    fields: [follows.followingId],
    references: [users.id],
    relationName: "followers",
  }),
}));

export const analysesRelations = relations(analyses, ({ one }) => ({
  user: one(users, {
    fields: [analyses.userId],
    references: [users.id],
  }),
}));

export const savedIdeasRelations = relations(savedIdeas, ({ one }) => ({
  user: one(users, {
    fields: [savedIdeas.userId],
    references: [users.id],
  }),
}));

// Messaging relationships
export const conversationsRelations = relations(conversations, ({ many }) => ({
  participants: many(conversationParticipants),
  messages: many(messages),
}));

export const conversationParticipantsRelations = relations(conversationParticipants, ({ one }) => ({
  conversation: one(conversations, {
    fields: [conversationParticipants.conversationId],
    references: [conversations.id],
  }),
  user: one(users, {
    fields: [conversationParticipants.userId],
    references: [users.id],
  }),
}));

export const messagesRelations = relations(messages, ({ one, many }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
    relationName: "sender",
  }),
  reads: many(messageReads),
}));

export const messageReadsRelations = relations(messageReads, ({ one }) => ({
  message: one(messages, {
    fields: [messageReads.messageId],
    references: [messages.id],
  }),
  user: one(users, {
    fields: [messageReads.userId],
    references: [users.id],
  }),
}));

export type AnalysisResults = {
  // Initial 8 interactive blocks
  successRate: {
    percentage: number;
    goodPoints: string[];
    badPoints: string[];
    message: string;
  };
  competitors: {
    competitors: Array<{
      name: string;
      marketShare: number;
      websiteUrl?: string;
    }>;
    message: string;
  };
  targetAudienceFit: {
    segments: Array<{
      name: string;
      score: number; // 0-100 for radar chart
    }>;
    message: string;
  };
  marketSize: {
    segments: Array<{
      name: string; // local, national, global
      percentage: number;
      value?: number; // optional monetary value
    }>;
    totalSize?: number;
    message: string;
  };
  businessModelStrength: {
    overall: number; // 0-100
    components: Array<{
      name: string; // e.g., "Revenue Streams", "Cost Structure"
      score: number; // 0-100
      description: string;
    }>;
    message: string;
  };
  fundingRequired: {
    total: number;
    breakdown: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
    message: string;
  };
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  previousFailedExecutions: {
    failures: Array<{
      name: string;
      year: string;
      reason: string;
    }>;
    message: string;
  };
  
  // Related ideas suggestion
  relatedIdeas?: Array<{
    title: string;
    description: string;
    potentialScore: number; // 0-100
  }>;
  
  // Budget-based analysis (6 additional blocks)
  budgetAnalysis?: {
    initialBudget: number;
    
    feasibilityAndScalability: {
      initialFeasibility: number; // 0-100
      scalingPoints: Array<{
        milestone: string;
        investment: number;
        potentialReturns: number;
        feasibilityScore: number; // 0-100
      }>;
      message: string;
    };
    
    riskAnalysis: {
      overallRisk: number; // 0-100, higher means more risky
      risks: Array<{
        category: string;
        likelihood: number; // 0-100
        impact: number; // 0-100
        mitigationStrategy: string;
      }>;
      message: string;
    };
    
    goToMarketStrategy: {
      timeline: Array<{
        phase: string;
        duration: string;
        activities: string[];
        estimatedCost: number;
      }>;
      message: string;
    };
    
    longTermVision: {
      milestones: Array<{
        year: string;
        goals: string[];
        projectedMetrics: {
          revenue?: number;
          users?: number;
          marketShare?: number;
        };
      }>;
      message: string;
    };
    
    teamExecutionCapability: {
      requiredRoles: Array<{
        title: string;
        skills: string[];
        importance: number; // 0-100
        estimatedCost: number;
      }>;
      hiringTimeline: string;
      message: string;
    };
    
    fundingAndInvestmentPotential: {
      investors: Array<{
        name: string;
        firm: string;
        investmentFocus: string[];
        location: string;
        contactInfo?: string;
        portfolioFit: number; // 0-100
      }>;
      message: string;
    };
  };
  
  // Original fields preserved for compatibility
  marketViability?: {
    points: Array<{
      title: string;
      subtitle: string;
      type: 'success' | 'warning' | 'danger';
    }>;
  };
  uniqueValueProposition?: {
    differentiator: string;
    strengths: string[];
  };
  cagr?: {
    industryAverage: number;
    potential: number;
    data: {
      years: string[];
      industryAverageData: number[];
      potentialData: number[];
    };
  };
  goToMarketStrategy?: {
    steps: Array<{
      name: string;
      timeframe: string;
    }>;
  };
  planningToExecute?: {
    budget: {
      development: number;
      marketing: number;
      operations: number;
    };
    roadmap: Array<{
      step: string;
      timeframe: string;
      cost: number;
    }>;
  };
  findingInvestors?: {
    investors: Array<{
      name: string;
      firm: string;
      tags: string[];
      crunchbaseLink: string;
    }>;
  };
};
