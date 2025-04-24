import { useState, useEffect, useContext, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { ThreadsStylePost } from "@/components/threads-style-post";
import { AuthContext } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Post } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { 
  Search, 
  PlusSquare,
  TrendingUp, 
  Clock, 
  Users,
  Hash,
  XCircle,
  Loader2,
  Sparkles,
  Filter,
  Image as ImageIcon,
  ArrowLeft
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Extended post type for UI with author and current user vote
interface ExtendedPost extends Omit<Post, 'tags'> {
  author?: {
    username?: string;
    profilePic?: string;
    bio?: string;
    followersCount?: number;
    followingCount?: number;
  };
  currentUserVote?: 'pump' | 'dump' | null;
  currentUserLiked?: boolean;
  isFollowingAuthor?: boolean;
  tags: string[];
  commentsCount?: number;
  likesCount?: number;
  comments?: Array<{
    id: number;
    content: string;
    userId: number;
    username: string;
    profilePic?: string;
    createdAt: string;
  }>;
}

interface ThreadsCommunityPageProps {
  postId?: string;
}

export default function ThreadsCommunityPage({ postId }: ThreadsCommunityPageProps = {}) {
  // Context and state
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [postInput, setPostInput] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postTags, setPostTags] = useState("");
  const [currentTag, setCurrentTag] = useState("");
  const [tagsArray, setTagsArray] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPostForm, setShowPostForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"posts" | "users" | "tags">("posts");
  const [filteredPosts, setFilteredPosts] = useState<ExtendedPost[] | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedTab, setSelectedTab] = useState("latest");
  const loadMoreRef = useRef(null);
  const isInView = useInView(loadMoreRef);
  const [activeTab, setActiveTab] = useState<string>("latest");

  const [_, navigate] = useLocation();
  const { toast } = useToast();

  const ws = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<number | null>(null);

  // Connect to WebSocket for real-time updates
  useEffect(() => {
    const connectWebSocket = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const socket = new WebSocket(wsUrl);
      ws.current = socket;
      
      socket.onopen = () => {
        console.log('WebSocket connection established');
        // Authenticate the WebSocket connection if user is logged in
        if (user) {
          socket.send(JSON.stringify({
            type: 'authenticate',
            payload: { userId: user.id }
          }));
        }
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle different types of messages
          if (data.type === 'new_post') {
            // Add new post to the list
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
          } else if (data.type === 'new_comment') {
            // Update comments for a specific post
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
          } else if (data.type === 'vote_update') {
            // Update votes for a specific post
            queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      socket.onclose = () => {
        console.log('WebSocket connection closed, attempting to reconnect...');
        // Set up reconnection logic
        if (reconnectTimeoutRef.current) {
          clearTimeout(reconnectTimeoutRef.current);
        }
        reconnectTimeoutRef.current = window.setTimeout(connectWebSocket, 3000);
      };
      
      socket.onerror = (error) => {
        console.error('WebSocket error:', error);
        socket.close();
      };
    };
    
    connectWebSocket();
    
    // Clean up the WebSocket connection when the component unmounts
    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [user]);

  // Query a single post when postId is provided
  const { 
    data: singlePostData,
    isLoading: isSinglePostLoading
  } = useQuery<ExtendedPost>({
    queryKey: ['/api/posts', postId],
    queryFn: async () => {
      if (!postId) return null;
      
      const res = await fetch(`/api/posts/${postId}`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch post');
      
      return res.json();
    },
    enabled: !!postId,
  });

  // Query posts with pagination when not viewing a single post
  const { 
    data: postsData, 
    isLoading: isPostsLoading, 
    isFetching,
    refetch 
  } = useQuery<ExtendedPost[]>({
    queryKey: ['/api/posts', page, activeTab, searchQuery, searchType],
    queryFn: async () => {
      // Don't fetch list if viewing a single post
      if (postId) return [];
      
      // Construct the URL based on the filters
      let url = `/api/posts?page=${page}&limit=10`;
      
      // Add sorting based on the active tab
      if (activeTab === 'trending') {
        url += '&sort=trending';
      } else if (activeTab === 'following' && user) {
        url += '&filter=following';
      }
      
      // Add search parameters if there's a search query
      if (searchQuery.trim()) {
        url += `&query=${encodeURIComponent(searchQuery)}&type=${searchType}`;
      }
      
      const res = await fetch(url, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch posts');
      
      return res.json();
    },
    enabled: !postId,
  });

  // Infinite scroll loading logic
  useEffect(() => {
    if (isInView && !isFetching && hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [isInView, isFetching, hasMore]);

  // Set hasMore flag when posts data changes
  useEffect(() => {
    if (postsData && postsData.length < 10) {
      setHasMore(false);
    }
  }, [postsData]);

  // Process posts data
  const posts = postsData || [];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setShowPostForm(false);
      setPostInput("");
      setPostTitle("");
      setTagsArray([]);
      toast({
        title: "Success",
        description: "Your post has been created!",
        variant: "default",
      });

      // Send a WebSocket message to notify others about the new post
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'new_post',
          payload: { userId: user?.id }
        }));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to create post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number, voteType: string }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/vote`, { voteType });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });

      // Send WebSocket update
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'vote_update',
          payload: { 
            postId: variables.postId, 
            voteType: variables.voteType,
            userId: user?.id 
          }
        }));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to vote: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async (postId: number) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/like`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to like post: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Comment mutation
  const commentMutation = useMutation({
    mutationFn: async ({ postId, comment }: { postId: number, comment: string }) => {
      const res = await apiRequest("POST", `/api/posts/${postId}/comment`, { content: comment });
      return await res.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      
      // Send WebSocket update for new comment
      if (ws.current?.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({
          type: 'new_comment',
          payload: { 
            postId: variables.postId,
            userId: user?.id 
          }
        }));
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add comment: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Follow user mutation
  const followMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/users/${userId}/follow`, {});
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      toast({
        title: "Success",
        description: "Follow status updated!",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to update follow status: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle new post creation
  const handleNewPost = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowPostForm(true);
  };

  // Handle post submission
  const handleSubmitPost = () => {
    if (isSubmitting) return;
    
    if (!postInput.trim()) {
      toast({
        title: "Error",
        description: "Post content cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    createPostMutation.mutate({
      title: postTitle.trim(),
      description: postInput.trim(),
      tags: tagsArray,
    });
    
    setIsSubmitting(false);
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (currentTag && !tagsArray.includes(currentTag)) {
      setTagsArray(prev => [...prev, currentTag]);
      setCurrentTag('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tag: string) => {
    setTagsArray(prev => prev.filter(t => t !== tag));
  };

  // Handle post voting
  const handleVote = (postId: number, voteType: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    voteMutation.mutate({ postId, voteType });
  };

  // Handle post liking
  const handleLike = (postId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    likeMutation.mutate(postId);
  };

  // Handle post commenting
  const handleComment = (postId: number, comment: string) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    if (!comment.trim()) return;
    
    commentMutation.mutate({ postId, comment });
  };

  // Handle following a user
  const handleFollow = (userId: number) => {
    if (!user) {
      navigate('/auth');
      return;
    }
    
    followMutation.mutate(userId);
  };

  // Handle sharing a user profile
  const handleShareProfile = (username: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/profile/${username}`);
    toast({
      title: "Profile link copied",
      description: `Link to @${username}'s profile copied to clipboard`,
    });
  };

  // Handle sending a direct message
  const handleSendMessage = (userId: number) => {
    navigate(`/messages?userId=${userId}`);
  };

  // Handle search operations
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(null);
      return;
    }
    
    // Reset page when performing a new search
    setPage(1);
    // Trigger a refetch with the new search parameters
    refetch();
  };

  // Change search type
  const handleSearchTypeChange = (type: "posts" | "users" | "tags") => {
    if (type !== searchType) {
      setSearchType(type);
      setPage(1);
      // Trigger a refetch with the new search type
      refetch();
    }
  };

  // Run search when query changes
  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      }
    }, 300);
    
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Handle tab changes
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setPage(1);
    setHasMore(true);
    // This will trigger a refetch with the new tab value
    refetch();
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col w-full max-w-full transition-all duration-300">
        <Header />
        
        <main className="overflow-y-auto w-full h-full">
          <div className="max-w-screen-sm mx-auto">
            {/* Header Bar */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 px-4 py-3 flex justify-between items-center backdrop-blur-sm bg-opacity-80 dark:bg-opacity-80">
              <h1 className="text-xl font-semibold dark:text-white">Startup Community</h1>
              
              <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full"
                  onClick={() => {
                    setSearchQuery("");
                    setFilteredPosts(null);
                    setPage(1);
                    refetch();
                  }}
                >
                  <Sparkles className="h-5 w-5 text-primary" />
                </Button>
                
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Search className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="top" className="max-w-screen-sm mx-auto">
                    <SheetHeader>
                      <SheetTitle>Search</SheetTitle>
                      <SheetDescription>
                        Find startup ideas, founders, and topics
                      </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                      <div className="relative">
                        <Input
                          className="pr-10"
                          placeholder="Search..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setSearchQuery("")}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          variant={searchType === "posts" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSearchTypeChange("posts")}
                        >
                          Posts
                        </Button>
                        <Button 
                          variant={searchType === "users" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSearchTypeChange("users")}
                        >
                          Users
                        </Button>
                        <Button 
                          variant={searchType === "tags" ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSearchTypeChange("tags")}
                        >
                          Tags
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
            
            {/* Back button for single post view */}
            {postId && (
              <div className="border-b border-gray-200 dark:border-gray-800">
                <Button
                  variant="ghost"
                  onClick={() => navigate('/community/threads')}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Back to all posts</span>
                </Button>
              </div>
            )}
            
            {/* Feed Tabs - only shown when not viewing a single post */}
            {!postId && (
              <Tabs defaultValue="latest" className="bg-white dark:bg-gray-950" onValueChange={handleTabChange}>
                <TabsList className="w-full grid grid-cols-3 rounded-none bg-transparent h-12 border-b border-gray-200 dark:border-gray-800">
                  <TabsTrigger 
                    value="latest" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Latest
                  </TabsTrigger>
                  <TabsTrigger 
                    value="trending" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Trending
                  </TabsTrigger>
                  <TabsTrigger 
                    value="following" 
                    className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Following
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="latest" className="mt-0 p-0">
                  {/* Display search results or normal feed */}
                  {searchQuery && (
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-500">
                          Results for <span className="font-medium text-gray-700 dark:text-gray-300">"{searchQuery}"</span> in {searchType}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSearchQuery("");
                            setFilteredPosts(null);
                          }}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  {/* Single Post View */}
                  {postId && (
                    <>
                      {isSinglePostLoading ? (
                        // Loading skeleton for single post
                        <div className="border-b border-gray-200 dark:border-gray-800 p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        </div>
                      ) : singlePostData ? (
                        <ThreadsStylePost
                          post={singlePostData}
                          onVote={handleVote}
                          onLike={handleLike}
                          onComment={handleComment}
                          onFollow={handleFollow}
                          onShareProfile={handleShareProfile}
                          onSendMessage={handleSendMessage}
                          currentUser={user}
                          isDetailView={true}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          <p className="text-gray-500 mb-4">Post not found</p>
                          <Button 
                            variant="outline"
                            onClick={() => navigate('/community/threads')}
                          >
                            Back to community
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                  
                  {/* Post List - only shown when not viewing a single post */}
                  {!postId && (
                    <>
                      {isPostsLoading && page === 1 ? (
                        // Loading skeletons for initial load
                        <>
                          {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="border-b border-gray-200 dark:border-gray-800 p-4">
                              <div className="flex items-start gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1 space-y-2">
                                  <Skeleton className="h-4 w-32" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-full" />
                                  <Skeleton className="h-4 w-3/4" />
                                </div>
                              </div>
                            </div>
                          ))}
                        </>
                      ) : posts.length > 0 ? (
                        <div>
                          <AnimatePresence initial={false}>
                            {posts.map((post) => (
                              <ThreadsStylePost
                                key={post.id}
                                post={post}
                                onVote={handleVote}
                                onLike={handleLike}
                                onComment={handleComment}
                                onFollow={handleFollow}
                                onShareProfile={handleShareProfile}
                                onSendMessage={handleSendMessage}
                                currentUser={user}
                              />
                            ))}
                          </AnimatePresence>
                          
                          {/* Load more indicator */}
                          {hasMore && (
                            <div 
                              ref={loadMoreRef} 
                              className="py-4 flex justify-center"
                            >
                              {isFetching && page > 1 ? (
                                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                              ) : (
                                <p className="text-sm text-gray-500">Loading more posts...</p>
                              )}
                            </div>
                          )}
                          
                          {/* End of feed indicator */}
                          {!hasMore && posts.length > 0 && (
                            <div className="py-8 text-center">
                              <p className="text-sm text-gray-500">You've seen all posts</p>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="mt-2"
                                onClick={() => {
                                  window.scrollTo(0, 0);
                                  setPage(1);
                                  setHasMore(true);
                                  refetch();
                                }}
                              >
                                Refresh
                              </Button>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                          {searchQuery ? (
                            <>
                              <p className="text-gray-500 mb-4">No results found for "{searchQuery}"</p>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setSearchQuery("");
                                  setFilteredPosts(null);
                                }}
                              >
                                Clear search
                              </Button>
                            </>
                          ) : (
                            <>
                              <p className="text-gray-500 mb-4">No posts yet. Be the first to share an idea!</p>
                              <Button onClick={handleNewPost}>
                                <PlusSquare className="h-4 w-4 mr-2" />
                                Create Post
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </TabsContent>
                
                <TabsContent value="trending" className="mt-0 p-0">
                  {/* Same structure as "latest" tab, with different data from the query */}
                  {/* The filtering logic is handled in the query parameters */}
                  {isPostsLoading && page === 1 ? (
                    // Loading skeletons
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b border-gray-200 dark:border-gray-800 p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : posts.length > 0 ? (
                    <div>
                      <AnimatePresence initial={false}>
                        {posts.map((post) => (
                          <ThreadsStylePost
                            key={post.id}
                            post={post}
                            onVote={handleVote}
                            onLike={handleLike}
                            onComment={handleComment}
                            onFollow={handleFollow}
                            onShareProfile={handleShareProfile}
                            onSendMessage={handleSendMessage}
                            currentUser={user}
                          />
                        ))}
                      </AnimatePresence>
                      
                      {/* Load more indicator */}
                      {hasMore && (
                        <div 
                          ref={loadMoreRef} 
                          className="py-4 flex justify-center"
                        >
                          {isFetching && page > 1 ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          ) : (
                            <p className="text-sm text-gray-500">Loading more posts...</p>
                          )}
                        </div>
                      )}
                      
                      {/* End of feed indicator */}
                      {!hasMore && posts.length > 0 && (
                        <div className="py-8 text-center">
                          <p className="text-sm text-gray-500">You've seen all trending posts</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              setPage(1);
                              setHasMore(true);
                              refetch();
                            }}
                          >
                            Refresh
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 mb-4">No trending posts right now</p>
                      <Button onClick={handleNewPost}>
                        <PlusSquare className="h-4 w-4 mr-2" />
                        Create the first trending post
                      </Button>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="following" className="mt-0 p-0">
                  {!user ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 mb-4">Sign in to see posts from people you follow</p>
                      <Button onClick={() => navigate('/auth')}>
                        Sign In
                      </Button>
                    </div>
                  ) : isPostsLoading && page === 1 ? (
                    // Loading skeletons
                    <>
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="border-b border-gray-200 dark:border-gray-800 p-4">
                          <div className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="flex-1 space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-full" />
                              <Skeleton className="h-4 w-3/4" />
                            </div>
                          </div>
                        </div>
                      ))}
                    </>
                  ) : posts.length > 0 ? (
                    <div>
                      <AnimatePresence initial={false}>
                        {posts.map((post) => (
                          <ThreadsStylePost
                            key={post.id}
                            post={post}
                            onVote={handleVote}
                            onLike={handleLike}
                            onComment={handleComment}
                            onFollow={handleFollow}
                            onShareProfile={handleShareProfile}
                            onSendMessage={handleSendMessage}
                            currentUser={user}
                          />
                        ))}
                      </AnimatePresence>
                      
                      {/* Load more indicator */}
                      {hasMore && (
                        <div 
                          ref={loadMoreRef} 
                          className="py-4 flex justify-center"
                        >
                          {isFetching && page > 1 ? (
                            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                          ) : (
                            <p className="text-sm text-gray-500">Loading more posts...</p>
                          )}
                        </div>
                      )}
                      
                      {/* End of feed indicator */}
                      {!hasMore && posts.length > 0 && (
                        <div className="py-8 text-center">
                          <p className="text-sm text-gray-500">You've seen all posts from people you follow</p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => {
                              window.scrollTo(0, 0);
                              setPage(1);
                              setHasMore(true);
                              refetch();
                            }}
                          >
                            Refresh
                          </Button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-500 mb-4">You're not following anyone yet or they haven't posted</p>
                      <Button
                        variant="outline"
                        onClick={() => setActiveTab('latest')}
                      >
                        Discover people to follow
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}