import { useState, useEffect, useContext } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { XStylePost } from "@/components/x-style-post";
import { PostForm } from "@/components/post-form";
import { AuthContext } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Post } from "@shared/schema";
import { 
  Dialog, 
  DialogContent, 
  DialogTitle,
  DialogDescription,
  DialogTrigger 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

import { 
  Search, 
  TrendingUp, 
  Clock, 
  Users,
  Filter,
  Image as ImageIcon,
  Pin,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Flame,
  BarChart,
  RefreshCcw,
  HelpCircle,
  Hash,
  ChevronRight,
  BellPlus,
  Award
} from "lucide-react";

// Extended post type for UI with author and current user vote
interface ExtendedPost extends Omit<Post, 'tags'> {
  author?: {
    username?: string;
  };
  currentUserVote?: 'pump' | 'dump' | null;
  tags: string[];
}

export default function CommunityPage() {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const [showPostForm, setShowPostForm] = useState(false);
  // No longer using plan dialog
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"posts" | "users" | "tags">("posts");
  const [filteredPosts, setFilteredPosts] = useState<ExtendedPost[] | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Query posts
  const { data: postsData, isLoading } = useQuery<ExtendedPost[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });

  // Ensure the posts are properly typed as ExtendedPost[]
  const posts = postsData as ExtendedPost[];

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: any) => {
      const res = await apiRequest("POST", "/api/posts", postData);
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      setShowPostForm(false);
      toast({
        title: "Success",
        description: "Your post has been created!",
        variant: "default",
      });
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
      const data = await res.json();
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to vote: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  const handleNewPost = () => {
    if (!user) {
      // Redirect to auth page instead of opening dialog
      navigate('/auth');
      return;
    }
    setShowPostForm(true);
  };

  const handleVote = (postId: number, voteType: string) => {
    if (!user) {
      // Redirect to auth page instead of opening dialog
      navigate('/auth');
      return;
    }
    voteMutation.mutate({ postId, voteType });
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredPosts(null);
      return;
    }

    if (searchType === "posts") {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = posts?.filter(post => 
        post.title.toLowerCase().includes(lowerQuery) || 
        post.description.toLowerCase().includes(lowerQuery) ||
        post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
      setFilteredPosts(filtered || []);
    } else if (searchType === "tags") {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = posts?.filter(post => 
        post.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
      setFilteredPosts(filtered || []);
    } else if (searchType === "users") {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = posts?.filter(post => 
        post.author?.username?.toLowerCase().includes(lowerQuery)
      );
      setFilteredPosts(filtered || []);
    }
  };

  // Run search when query changes
  useEffect(() => {
    handleSearch();
  }, [searchQuery, posts]);

  const handleSearchTypeChange = (type: "posts" | "users" | "tags") => {
    if (type !== searchType) {
      setSearchType(type);
      // Re-trigger search with new type
      setSearchQuery(searchQuery);
    }
  };

  return (
    <div className="flex h-screen w-full max-w-full overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col w-full max-w-full transition-all duration-300">
        <Header />
        
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto w-full">
          {/* Page Header with Responsive Design */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Users className="hidden sm:inline-block h-5 w-5 text-primary" />
                Startup Community
              </h1>
              <p className="text-sm text-muted-foreground">Connect with founders and share your innovative ideas</p>
            </div>
            
            <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
              <DialogTrigger asChild>
                <Button 
                  onClick={handleNewPost} 
                  className="bg-primary hover:bg-primary/90 text-white rounded-full transition-all duration-200" 
                  size="sm"
                >
                  <ImageIcon className="w-4 h-4 mr-2" /> 
                  Share Idea
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] bg-card">
                <DialogTitle className="font-bold tracking-tight">Share Your Startup Idea</DialogTitle>
                <DialogDescription>
                  Get feedback from the community and AI analysis to validate your concept.
                </DialogDescription>
                <PostForm onComplete={() => setShowPostForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Search Box - Redesigned with Mobile Optimization */}
          <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-xl p-4 mb-6">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none opacity-50"></div>
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold">Find Startup Ideas & Founders</h2>
              
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 bg-background/50 rounded-lg focus:ring-1 focus:ring-primary border-border w-full"
                  />
                </div>
                
                <div className="flex flex-row gap-2">
                  <Button
                    variant={searchType === "posts" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSearchTypeChange("posts")}
                    className="flex-1 sm:flex-none"
                  >
                    Posts
                  </Button>
                  <Button
                    variant={searchType === "tags" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSearchTypeChange("tags")}
                    className="flex-1 sm:flex-none"
                  >
                    Tags
                  </Button>
                  <Button
                    variant={searchType === "users" ? "default" : "outline"} 
                    size="sm"
                    onClick={() => handleSearchTypeChange("users")}
                    className="flex-1 sm:flex-none"
                  >
                    Users
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Trending Tags Card - Optimized for mobile, shown first */}
          <div className="w-full mb-5">
            <Card className="border-primary/20 overflow-hidden bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none"></div>
              <CardHeader className="py-3">
                <CardTitle className="text-base flex items-center">
                  <Hash className="h-4 w-4 mr-2 text-primary" />
                  Trending Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="py-0 px-4 pb-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("ai")}>
                    #ai
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("saas")}>
                    #saas
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("marketplace")}>
                    #marketplace
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("fintech")}>
                    #fintech
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("mobile")}>
                    #mobile
                  </Badge>
                  <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20 text-xs cursor-pointer" onClick={() => setSearchQuery("sustainability")}>
                    #sustainability
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Content area for mobile optimized layout */}
          <div className="flex flex-col w-full max-w-full gap-4 md:gap-6">
            <Tabs defaultValue="latest" className="mb-6">
              <TabsList className="mb-4 bg-card w-full rounded-lg shadow-sm overflow-hidden">
                <TabsTrigger value="latest" className="flex-1 py-3">
                  <Clock className="h-4 w-4 mr-2" />
                  Latest
                </TabsTrigger>
                <TabsTrigger value="trending" className="flex-1 py-3">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="following" className="flex-1 py-3">
                  <Users className="h-4 w-4 mr-2" />
                  Following
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="latest" className="mt-0">
                {searchQuery.trim() && filteredPosts && (
                  <div className="bg-card border border-border rounded-lg p-4 mb-4">
                    <h3 className="font-medium mb-1">Search Results</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Found {filteredPosts.length} results for "{searchQuery}" in {searchType}
                      {filteredPosts.length === 0 && (
                        <Button variant="link" onClick={() => setSearchQuery("")} className="p-0 h-auto ml-2">
                          Clear search
                        </Button>
                      )}
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="bg-card animate-pulse rounded-lg h-32 shadow-sm"></div>
                    ))
                  ) : (filteredPosts || posts)?.length ? (
                    (filteredPosts || posts).map((post: any) => (
                      <XStylePost 
                        key={post.id}
                        post={post}
                        onVote={handleVote}
                        onReact={(postId, reactionType) => {
                          if (!user) {
                            // Redirect to auth page if not logged in
                            navigate('/auth');
                            return;
                          }
                          // Call the API to add reaction
                          apiRequest("POST", `/api/posts/${postId}/react`, { reactionType })
                            .then(() => {
                              // Immediately invalidate posts to update UI with the latest data
                              queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
                              toast({
                                title: `${reactionType} reaction added`,
                                description: "Your reaction has been added to the post"
                              });
                            })
                            .catch(error => {
                              toast({
                                title: "Error adding reaction",
                                description: error.message || "Failed to add reaction",
                                variant: "destructive"
                              });
                            });
                        }}
                        onComment={(postId, comment) => {
                          if (!user) {
                            // Redirect to auth page if not logged in
                            navigate('/auth');
                            return;
                          }
                          toast({
                            title: "Comment added",
                            description: "Your comment has been added to the post"
                          });
                        }}
                        currentUser={user || null}
                      />
                    ))
                  ) : (
                    <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-lg p-8 text-center relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none"></div>
                      <div className="relative z-10">
                        <p className="text-muted-foreground mb-4">
                          {searchQuery 
                            ? "No posts matching your search." 
                            : `No posts yet. ${user ? "Be the first to share your startup idea!" : "Sign in to create a post!"}`}
                        </p>
                        {!searchQuery && (
                          <Button onClick={handleNewPost} className="bg-primary hover:bg-primary/90">
                            {user ? "Create Post" : "Sign In to Post"}
                          </Button>
                        )}
                        {searchQuery && (
                          <Button variant="outline" onClick={() => setSearchQuery("")}>
                            Clear Search
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="trending" className="mt-0">
                <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-lg p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none"></div>
                  <div className="relative z-10">
                    <p className="text-muted-foreground">Trending posts will appear here based on engagement.</p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="following" className="mt-0">
                <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border rounded-lg p-8 text-center relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none"></div>
                  <div className="relative z-10">
                    <p className="text-muted-foreground">Posts from people you follow will appear here.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}