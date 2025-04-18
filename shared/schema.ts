import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  bio: text("bio"),
  planType: text("plan_type").notNull().default("free"), // "free", "pro", "unicorn"
  createdAt: timestamp("created_at").notNull().defaultNow(),
  followersCount: integer("followers_count").notNull().default(0),
  followingCount: integer("following_count").notNull().default(0),
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

export const insertAnalysisSchema = createInsertSchema(analyses).pick({
  userId: true,
  startupIdea: true,
  country: true,
  results: true,
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

export type AnalysisResults = {
  successRate?: {
    percentage: number;
    message: string;
  };
  competitors?: {
    competitors: Array<{
      name: string;
      marketShare: number;
    }>;
    message: string;
  };
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
  previousFailedExecutions?: {
    failures: Array<{
      name: string;
      year: string;
      reason: string;
    }>;
    message: string;
  };
  fundingRequirements?: {
    seedRound: {
      min: number;
      max: number;
    };
    seriesA: {
      min: number;
      max: number;
      timeframe: string;
    };
    allocation: {
      productDevelopment: number;
      marketing: number;
      operations: number;
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
