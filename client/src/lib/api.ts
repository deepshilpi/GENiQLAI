import { apiRequest } from "./queryClient";
import { InsertUser, InsertPost, InsertComment, InsertVote, InsertFollow } from "@shared/schema";

export async function registerUser(userData: InsertUser) {
  const res = await apiRequest("POST", "/api/register", userData);
  return await res.json();
}

export async function loginUser(credentials: Pick<InsertUser, "username" | "password">) {
  const res = await apiRequest("POST", "/api/login", credentials);
  return await res.json();
}

export async function logoutUser() {
  await apiRequest("POST", "/api/logout");
}

export async function getStartupAnalysis(startupIdea: string) {
  const res = await apiRequest("POST", "/api/analyze", { startupIdea });
  return await res.json();
}

export async function getNewsArticles() {
  const res = await apiRequest("GET", "/api/news");
  return await res.json();
}

export async function createPost(postData: Omit<InsertPost, "authorId">) {
  const res = await apiRequest("POST", "/api/posts", postData);
  return await res.json();
}

export async function getPosts() {
  const res = await apiRequest("GET", "/api/posts");
  return await res.json();
}

export async function getPostById(id: number) {
  const res = await apiRequest("GET", `/api/posts/${id}`);
  return await res.json();
}

export async function createComment(commentData: Omit<InsertComment, "authorId">) {
  const res = await apiRequest("POST", "/api/comments", commentData);
  return await res.json();
}

export async function getCommentsByPostId(postId: number) {
  const res = await apiRequest("GET", `/api/posts/${postId}/comments`);
  return await res.json();
}

export async function createVote(voteData: Omit<InsertVote, "userId">) {
  const res = await apiRequest("POST", "/api/votes", voteData);
  return await res.json();
}

export async function followUser(followingId: number) {
  const res = await apiRequest("POST", "/api/follows", { followingId });
  return await res.json();
}

export async function unfollowUser(followingId: number) {
  const res = await apiRequest("DELETE", `/api/follows/${followingId}`);
  return await res.json();
}

export async function getUserByUsername(username: string) {
  const res = await apiRequest("GET", `/api/users/${username}`);
  return await res.json();
}

export async function getUserPosts(username: string) {
  const res = await apiRequest("GET", `/api/users/${username}/posts`);
  return await res.json();
}

export async function updatePlan(planType: "free" | "pro" | "unicorn") {
  const res = await apiRequest("POST", "/api/update-plan", { planType });
  return await res.json();
}
