import { Post, User } from "@shared/schema";

export interface PostComment {
  id: number;
  content: string;
  userId: number;
  username: string;
  profilePic?: string;
  createdAt: string;
  likesCount?: number;
  currentUserLiked?: boolean;
}

export interface ExtendedPost extends Post {
  author?: {
    username: string;
    profilePic?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
  };
  commentsCount?: number;
  comments?: PostComment[];
  likesCount?: number;
  currentUserLiked?: boolean;
  currentUserVote?: 'pump' | 'dump' | null;
  isFollowingAuthor?: boolean;
}