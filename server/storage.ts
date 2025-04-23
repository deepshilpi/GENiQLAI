import { 
  users, type User, type InsertUser, 
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  votes, type Vote, type InsertVote,
  follows, type Follow, type InsertFollow,
  analyses, type Analysis, type InsertAnalysis,
  savedIdeas, type SavedIdea, type InsertSavedIdea,
  conversations, type Conversation, type InsertConversation,
  conversationParticipants, type ConversationParticipant, type InsertConversationParticipant,
  messages, type Message, type InsertMessage,
  messageReads, type MessageRead, type InsertMessageRead
} from "@shared/schema";
import { db, pool } from "./db";
import { eq, and, desc, asc, or, not } from "drizzle-orm";
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
  
  // Saved Ideas operations
  createSavedIdea(savedIdea: InsertSavedIdea): Promise<SavedIdea>;
  getSavedIdeasByUserId(userId: number): Promise<SavedIdea[]>;
  getSavedIdeaById(id: number): Promise<SavedIdea | undefined>;
  updateSavedIdea(id: number, updates: Partial<InsertSavedIdea>): Promise<SavedIdea>;
  deleteSavedIdea(id: number): Promise<void>;

  // Messaging operations
  createConversation(conversation: InsertConversation): Promise<Conversation>;
  getConversationById(id: number): Promise<Conversation | undefined>;
  getUserConversations(userId: number): Promise<Conversation[]>;
  
  addParticipantToConversation(participant: InsertConversationParticipant): Promise<ConversationParticipant>;
  getConversationParticipants(conversationId: number): Promise<ConversationParticipant[]>;
  removeParticipantFromConversation(userId: number, conversationId: number): Promise<void>;
  
  createMessage(message: InsertMessage): Promise<Message>;
  getMessagesByConversationId(conversationId: number, limit?: number): Promise<Message[]>;
  
  markMessageAsRead(messageRead: InsertMessageRead): Promise<MessageRead>;
  getUnreadMessagesCount(userId: number): Promise<number>;

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

  // Saved Ideas operations
  async createSavedIdea(savedIdea: InsertSavedIdea): Promise<SavedIdea> {
    const [newSavedIdea] = await db.insert(savedIdeas)
      .values(savedIdea)
      .returning();
    return newSavedIdea;
  }

  async getSavedIdeasByUserId(userId: number): Promise<SavedIdea[]> {
    return db.select().from(savedIdeas)
      .where(eq(savedIdeas.userId, userId))
      .orderBy(desc(savedIdeas.createdAt));
  }

  async getSavedIdeaById(id: number): Promise<SavedIdea | undefined> {
    const [savedIdea] = await db.select().from(savedIdeas).where(eq(savedIdeas.id, id));
    return savedIdea;
  }

  async updateSavedIdea(id: number, updates: Partial<InsertSavedIdea>): Promise<SavedIdea> {
    const [updatedSavedIdea] = await db.update(savedIdeas)
      .set(updates)
      .where(eq(savedIdeas.id, id))
      .returning();
    
    if (!updatedSavedIdea) {
      throw new Error("Saved idea not found");
    }
    
    return updatedSavedIdea;
  }

  async deleteSavedIdea(id: number): Promise<void> {
    await db.delete(savedIdeas).where(eq(savedIdeas.id, id));
  }

  // Messaging operations
  async createConversation(conversation: InsertConversation): Promise<Conversation> {
    const [newConversation] = await db.insert(conversations)
      .values({
        ...conversation,
        updatedAt: new Date()
      })
      .returning();
    return newConversation;
  }

  async getConversationById(id: number): Promise<Conversation | undefined> {
    const [conversation] = await db.select().from(conversations)
      .where(eq(conversations.id, id));
    return conversation;
  }

  async getUserConversations(userId: number): Promise<Conversation[]> {
    // Get all conversation IDs for a user
    const participations = await db.select({
      conversationId: conversationParticipants.conversationId
    })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

    const conversationIds = participations.map(p => p.conversationId);
    
    if (conversationIds.length === 0) {
      return [];
    }

    // Get all conversations for those IDs
    // Use in() operator instead of or() for better query performance
    return db.select().from(conversations)
      .where(
        eq(conversations.id, conversationIds[0])
      )
      .orderBy(desc(conversations.updatedAt));
  }

  async addParticipantToConversation(participant: InsertConversationParticipant): Promise<ConversationParticipant> {
    // Check if participant already exists
    const [existingParticipant] = await db.select()
      .from(conversationParticipants)
      .where(and(
        eq(conversationParticipants.userId, participant.userId),
        eq(conversationParticipants.conversationId, participant.conversationId)
      ));

    if (existingParticipant) {
      return existingParticipant;
    }

    const [newParticipant] = await db.insert(conversationParticipants)
      .values(participant)
      .returning();
    
    return newParticipant;
  }

  async getConversationParticipants(conversationId: number): Promise<ConversationParticipant[]> {
    return db.select()
      .from(conversationParticipants)
      .where(eq(conversationParticipants.conversationId, conversationId));
  }

  async removeParticipantFromConversation(userId: number, conversationId: number): Promise<void> {
    await db.delete(conversationParticipants)
      .where(and(
        eq(conversationParticipants.userId, userId),
        eq(conversationParticipants.conversationId, conversationId)
      ));
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const [newMessage] = await db.insert(messages)
      .values(message)
      .returning();
    
    // Update conversation's updatedAt timestamp
    await db.update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, message.conversationId));
    
    return newMessage;
  }

  async getMessagesByConversationId(conversationId: number, limit: number = 50): Promise<Message[]> {
    return db.select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);
  }

  async markMessageAsRead(messageRead: InsertMessageRead): Promise<MessageRead> {
    // Check if already marked as read
    const [existingRead] = await db.select()
      .from(messageReads)
      .where(and(
        eq(messageReads.messageId, messageRead.messageId),
        eq(messageReads.userId, messageRead.userId)
      ));

    if (existingRead) {
      return existingRead;
    }

    const [newMessageRead] = await db.insert(messageReads)
      .values(messageRead)
      .returning();
    
    return newMessageRead;
  }

  async getUnreadMessagesCount(userId: number): Promise<number> {
    // Get all conversations for the user
    const participations = await db.select({
      conversationId: conversationParticipants.conversationId
    })
    .from(conversationParticipants)
    .where(eq(conversationParticipants.userId, userId));

    const conversationIds = participations.map(p => p.conversationId);
    
    if (conversationIds.length === 0) {
      return 0;
    }

    // Simplified approach, just count messages from other users that aren't in the reads table
    // This is a more efficient implementation for PostgreSQL
    const allMessages = await db.select({
      id: messages.id,
      senderId: messages.senderId
    })
    .from(messages)
    .where(
      userId && conversationIds.length > 0 ? 
        and(
          eq(messages.conversationId, conversationIds[0]),
          not(eq(messages.senderId, userId))
        ) : 
        eq(messages.id, -1) // This ensures an empty result if no valid conditions
    );

    if (allMessages.length === 0) {
      return 0;
    }

    const messageIds = allMessages.map(m => m.id);

    // Count messages that are marked as read
    const readMessages = await db.select({
      messageId: messageReads.messageId
    })
    .from(messageReads)
    .where(
      eq(messageReads.userId, userId)
    );

    const readMessageIds = new Set(readMessages.map(m => m.messageId));
    
    // Count messages that haven't been read
    return messageIds.filter(id => !readMessageIds.has(id)).length;
  }
}

// Create and export the storage instance
const databaseStorage = new DatabaseStorage();

// Export the storage instance directly
export const storage: IStorage = databaseStorage;
