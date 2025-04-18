import { 
  users, type User, type InsertUser, 
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  votes, type Vote, type InsertVote,
  follows, type Follow, type InsertFollow,
  analyses, type Analysis, type InsertAnalysis
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPlan(userId: number, planType: string): Promise<User>;
  updateUserBio(userId: number, bio: string): Promise<User>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPosts(): Promise<Post[]>;
  getPostById(id: number): Promise<Post | undefined>;
  getPostsByUserId(userId: number): Promise<Post[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getCommentsByPostId(postId: number): Promise<Comment[]>;
  
  // Vote operations
  createVote(vote: InsertVote): Promise<Vote>;
  getVoteByUserAndPost(userId: number, postId: number): Promise<Vote | undefined>;
  updateVote(id: number, voteType: string): Promise<Vote>;
  
  // Follow operations
  createFollow(follow: InsertFollow): Promise<Follow>;
  deleteFollow(followerId: number, followingId: number): Promise<void>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;
  
  // Analysis operations
  createAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getAnalysesByUserId(userId: number): Promise<Analysis[]>;

  // Session store
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users)
      .values({
        ...insertUser,
        planType: "free",
        bio: "",
      })
      .returning();
    return user;
  }
  
  async updateUserPlan(userId: number, planType: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ planType })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  async updateUserBio(userId: number, bio: string): Promise<User> {
    const [updatedUser] = await db.update(users)
      .set({ bio })
      .where(eq(users.id, userId))
      .returning();
    
    if (!updatedUser) {
      throw new Error("User not found");
    }
    
    return updatedUser;
  }
  
  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const [newPost] = await db.insert(posts)
      .values(post)
      .returning();
    return newPost;
  }
  
  async getPosts(): Promise<Post[]> {
    return db.select().from(posts).orderBy(desc(posts.createdAt));
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post;
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return db.select().from(posts)
      .where(eq(posts.authorId, userId))
      .orderBy(desc(posts.createdAt));
  }
  
  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const [newComment] = await db.insert(comments)
      .values(comment)
      .returning();
    return newComment;
  }
  
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt));
  }
  
  // Vote operations
  async createVote(vote: InsertVote): Promise<Vote> {
    // Check if user already voted on this post
    const existingVote = await this.getVoteByUserAndPost(vote.userId, vote.postId);
    
    if (existingVote) {
      // If vote type is different, update post counts
      if (existingVote.voteType !== vote.voteType) {
        // Update post count
        const post = await this.getPostById(vote.postId);
        if (post) {
          if (existingVote.voteType === "pump") {
            await db.update(posts)
              .set({ 
                pumpCount: post.pumpCount - 1,
                dumpCount: post.dumpCount + 1
              })
              .where(eq(posts.id, post.id));
          } else {
            await db.update(posts)
              .set({ 
                pumpCount: post.pumpCount + 1,
                dumpCount: post.dumpCount - 1
              })
              .where(eq(posts.id, post.id));
          }
        }
        
        // Update the vote
        return this.updateVote(existingVote.id, vote.voteType);
      }
      
      // If vote type is the same, just return the existing vote
      return existingVote;
    }
    
    // Create new vote
    const [newVote] = await db.insert(votes)
      .values(vote)
      .returning();
    
    // Update post count
    const post = await this.getPostById(vote.postId);
    if (post) {
      if (vote.voteType === "pump") {
        await db.update(posts)
          .set({ pumpCount: post.pumpCount + 1 })
          .where(eq(posts.id, post.id));
      } else {
        await db.update(posts)
          .set({ dumpCount: post.dumpCount + 1 })
          .where(eq(posts.id, post.id));
      }
    }
    
    return newVote;
  }
  
  async getVoteByUserAndPost(userId: number, postId: number): Promise<Vote | undefined> {
    const [vote] = await db.select().from(votes)
      .where(and(
        eq(votes.userId, userId),
        eq(votes.postId, postId)
      ));
    return vote;
  }
  
  async updateVote(id: number, voteType: string): Promise<Vote> {
    const [updatedVote] = await db.update(votes)
      .set({ voteType })
      .where(eq(votes.id, id))
      .returning();
    
    if (!updatedVote) {
      throw new Error("Vote not found");
    }
    
    return updatedVote;
  }
  
  // Follow operations
  async createFollow(follow: InsertFollow): Promise<Follow> {
    // Check if already following
    const isAlreadyFollowing = await this.isFollowing(follow.followerId, follow.followingId);
    if (isAlreadyFollowing) {
      throw new Error("Already following this user");
    }
    
    const [newFollow] = await db.insert(follows)
      .values(follow)
      .returning();
    
    // Update follower and following counts
    const follower = await this.getUser(follow.followerId);
    const following = await this.getUser(follow.followingId);
    
    if (follower) {
      await db.update(users)
        .set({ followingCount: follower.followingCount + 1 })
        .where(eq(users.id, follower.id));
    }
    
    if (following) {
      await db.update(users)
        .set({ followersCount: following.followersCount + 1 })
        .where(eq(users.id, following.id));
    }
    
    return newFollow;
  }
  
  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    const [follow] = await db.select().from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    
    if (follow) {
      await db.delete(follows).where(eq(follows.id, follow.id));
      
      // Update follower and following counts
      const follower = await this.getUser(followerId);
      const following = await this.getUser(followingId);
      
      if (follower) {
        await db.update(users)
          .set({ followingCount: Math.max(0, follower.followingCount - 1) })
          .where(eq(users.id, follower.id));
      }
      
      if (following) {
        await db.update(users)
          .set({ followersCount: Math.max(0, following.followersCount - 1) })
          .where(eq(users.id, following.id));
      }
    }
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    const [follow] = await db.select().from(follows)
      .where(and(
        eq(follows.followerId, followerId),
        eq(follows.followingId, followingId)
      ));
    return !!follow;
  }
  
  // Analysis operations
  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const [newAnalysis] = await db.insert(analyses)
      .values(analysis)
      .returning();
    return newAnalysis;
  }
  
  async getAnalysesByUserId(userId: number): Promise<Analysis[]> {
    return db.select().from(analyses)
      .where(eq(analyses.userId, userId))
      .orderBy(desc(analyses.createdAt));
  }
}

export const storage = new DatabaseStorage();
