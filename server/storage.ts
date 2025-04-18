import { 
  users, type User, type InsertUser, 
  posts, type Post, type InsertPost,
  comments, type Comment, type InsertComment,
  votes, type Vote, type InsertVote,
  follows, type Follow, type InsertFollow,
  analyses, type Analysis, type InsertAnalysis
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

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
  sessionStore: session.SessionStore;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private votes: Map<number, Vote>;
  private follows: Map<number, Follow>;
  private analyses: Map<number, Analysis>;
  
  userIdCounter: number;
  postIdCounter: number;
  commentIdCounter: number;
  voteIdCounter: number;
  followIdCounter: number;
  analysisIdCounter: number;
  
  sessionStore: session.SessionStore;

  constructor() {
    this.users = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.votes = new Map();
    this.follows = new Map();
    this.analyses = new Map();
    
    this.userIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.voteIdCounter = 1;
    this.followIdCounter = 1;
    this.analysisIdCounter = 1;
    
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // 24 hours
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { 
      ...insertUser, 
      id, 
      planType: "free",
      bio: "",
      createdAt,
      followersCount: 0,
      followingCount: 0
    };
    this.users.set(id, user);
    return user;
  }
  
  async updateUserPlan(userId: number, planType: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, planType };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  async updateUserBio(userId: number, bio: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error("User not found");
    }
    
    const updatedUser = { ...user, bio };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }
  
  // Post operations
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const createdAt = new Date();
    const newPost: Post = {
      ...post,
      id,
      pumpCount: 0,
      dumpCount: 0,
      createdAt
    };
    this.posts.set(id, newPost);
    return newPost;
  }
  
  async getPosts(): Promise<Post[]> {
    return Array.from(this.posts.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  async getPostById(id: number): Promise<Post | undefined> {
    return this.posts.get(id);
  }
  
  async getPostsByUserId(userId: number): Promise<Post[]> {
    return Array.from(this.posts.values())
      .filter(post => post.authorId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
  
  // Comment operations
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const createdAt = new Date();
    const newComment: Comment = {
      ...comment,
      id,
      createdAt
    };
    this.comments.set(id, newComment);
    return newComment;
  }
  
  async getCommentsByPostId(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }
  
  // Vote operations
  async createVote(vote: InsertVote): Promise<Vote> {
    // Check if user already voted on this post
    const existingVote = await this.getVoteByUserAndPost(vote.userId, vote.postId);
    if (existingVote) {
      // If vote type is different, update post counts
      if (existingVote.voteType !== vote.voteType) {
        const post = await this.getPostById(vote.postId);
        if (post) {
          const updatedPost = { ...post };
          if (existingVote.voteType === "pump") {
            updatedPost.pumpCount--;
            updatedPost.dumpCount++;
          } else {
            updatedPost.pumpCount++;
            updatedPost.dumpCount--;
          }
          this.posts.set(post.id, updatedPost);
        }
        
        // Update the vote
        return this.updateVote(existingVote.id, vote.voteType);
      }
      
      // If vote type is the same, just return the existing vote
      return existingVote;
    }
    
    // Create new vote
    const id = this.voteIdCounter++;
    const createdAt = new Date();
    const newVote: Vote = {
      ...vote,
      id,
      createdAt
    };
    this.votes.set(id, newVote);
    
    // Update post count
    const post = await this.getPostById(vote.postId);
    if (post) {
      const updatedPost = { ...post };
      if (vote.voteType === "pump") {
        updatedPost.pumpCount++;
      } else {
        updatedPost.dumpCount++;
      }
      this.posts.set(post.id, updatedPost);
    }
    
    return newVote;
  }
  
  async getVoteByUserAndPost(userId: number, postId: number): Promise<Vote | undefined> {
    return Array.from(this.votes.values())
      .find(vote => vote.userId === userId && vote.postId === postId);
  }
  
  async updateVote(id: number, voteType: string): Promise<Vote> {
    const vote = this.votes.get(id);
    if (!vote) {
      throw new Error("Vote not found");
    }
    
    const updatedVote = { ...vote, voteType };
    this.votes.set(id, updatedVote);
    return updatedVote;
  }
  
  // Follow operations
  async createFollow(follow: InsertFollow): Promise<Follow> {
    // Check if already following
    const isAlreadyFollowing = await this.isFollowing(follow.followerId, follow.followingId);
    if (isAlreadyFollowing) {
      throw new Error("Already following this user");
    }
    
    const id = this.followIdCounter++;
    const createdAt = new Date();
    const newFollow: Follow = {
      ...follow,
      id,
      createdAt
    };
    this.follows.set(id, newFollow);
    
    // Update follower and following counts
    const follower = await this.getUser(follow.followerId);
    const following = await this.getUser(follow.followingId);
    
    if (follower) {
      const updatedFollower = { ...follower, followingCount: follower.followingCount + 1 };
      this.users.set(follower.id, updatedFollower);
    }
    
    if (following) {
      const updatedFollowing = { ...following, followersCount: following.followersCount + 1 };
      this.users.set(following.id, updatedFollowing);
    }
    
    return newFollow;
  }
  
  async deleteFollow(followerId: number, followingId: number): Promise<void> {
    const follow = Array.from(this.follows.values())
      .find(f => f.followerId === followerId && f.followingId === followingId);
    
    if (follow) {
      this.follows.delete(follow.id);
      
      // Update follower and following counts
      const follower = await this.getUser(followerId);
      const following = await this.getUser(followingId);
      
      if (follower) {
        const updatedFollower = { ...follower, followingCount: Math.max(0, follower.followingCount - 1) };
        this.users.set(follower.id, updatedFollower);
      }
      
      if (following) {
        const updatedFollowing = { ...following, followersCount: Math.max(0, following.followersCount - 1) };
        this.users.set(following.id, updatedFollowing);
      }
    }
  }
  
  async isFollowing(followerId: number, followingId: number): Promise<boolean> {
    return Array.from(this.follows.values())
      .some(follow => follow.followerId === followerId && follow.followingId === followingId);
  }
  
  // Analysis operations
  async createAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const id = this.analysisIdCounter++;
    const createdAt = new Date();
    const newAnalysis: Analysis = {
      ...analysis,
      id,
      createdAt
    };
    this.analyses.set(id, newAnalysis);
    return newAnalysis;
  }
  
  async getAnalysesByUserId(userId: number): Promise<Analysis[]> {
    return Array.from(this.analyses.values())
      .filter(analysis => analysis.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }
}

export const storage = new MemStorage();
