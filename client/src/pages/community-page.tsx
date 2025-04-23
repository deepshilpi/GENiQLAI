import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { CommunityPost } from "@/components/community-post";
import { PostForm } from "@/components/post-form";
import { useAuth } from "@/hooks/use-auth";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Extended post type for UI with author and current user vote
interface ExtendedPost extends Omit<Post, 'tags'> {
  author?: {
    username?: string;
  };
  currentUserVote?: 'pump' | 'dump' | null;
  tags: string[];
}

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
  BellPlus
} from "lucide-react";

export default function CommunityPage() {
  const { user } = useAuth();
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

  // Update filtered posts when posts or search query changes
  useEffect(() => {
    if (!posts || !searchQuery.trim()) {
      setFilteredPosts(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    let filtered: ExtendedPost[] = [];

    switch (searchType) {
      case "posts":
        filtered = posts.filter(post => 
          post.title.toLowerCase().includes(query) || 
          post.description.toLowerCase().includes(query)
        );
        break;
      case "users":
        filtered = posts.filter(post => 
          post.author?.username?.toLowerCase().includes(query)
        );
        break;
      case "tags":
        filtered = posts.filter(post => 
          post.tags?.some(tag => tag.toLowerCase().includes(query))
        );
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, searchQuery, searchType]);

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number, voteType: string }) => {
      await apiRequest("POST", `/api/posts/${postId}/vote`, { voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    }
  });

  const handleVote = (postId: number, voteType: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to vote on posts",
        variant: "default",
      });
      return;
    }
    voteMutation.mutate({ postId, voteType });
  };

  const handleNewPost = () => {
    if (!user) {
      // Show toast and navigate to auth
      toast({
        title: "Authentication Required",
        description: "Please sign in to create posts in the community",
        variant: "default",
      });
      navigate('/auth');
      return;
    }
    
    // Allow all users to post
    setShowPostForm(true);
  };
  
  const handleSearchTypeChange = (type: "posts" | "users" | "tags") => {
    setSearchType(type);
    if (searchQuery) {
      // Re-trigger search with new type
      setSearchQuery(searchQuery);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-0 md:ml-64 flex-1 flex flex-col transition-all duration-300">
        <Header />
        
        <main className="p-4 md:p-6 flex-1">
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
                  <span className="hidden sm:inline">Create Post</span>
                  <span className="sm:hidden">Post</span>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-3xl">
                <PostForm onComplete={() => setShowPostForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          {/* Plan dialog removed - all users can post now */}
          
          {/* Enhanced Search Bar with Better Mobile Support */}
          <div className="bg-card border border-border rounded-lg p-3 md:p-4 mb-6 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, users, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background h-10 focus-visible:ring-primary/50"
                />
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                <Button 
                  variant={searchType === "posts" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleSearchTypeChange("posts")}
                  className="rounded-full px-3 sm:px-4 text-xs whitespace-nowrap min-w-[70px]"
                >
                  <ImageIcon className="h-3.5 w-3.5 mr-1.5" />
                  Posts
                </Button>
                <Button 
                  variant={searchType === "users" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleSearchTypeChange("users")}
                  className="rounded-full px-3 sm:px-4 text-xs whitespace-nowrap min-w-[70px]"
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" />
                  Users
                </Button>
                <Button 
                  variant={searchType === "tags" ? "default" : "outline"} 
                  size="sm"
                  onClick={() => handleSearchTypeChange("tags")}
                  className="rounded-full px-3 sm:px-4 text-xs whitespace-nowrap min-w-[70px]"
                >
                  <Filter className="h-3.5 w-3.5 mr-1.5" />
                  Tags
                </Button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Main Content Area - Responsive Grid (9/12 on desktop, full on mobile) */}
            <div className="lg:col-span-8 xl:col-span-9 order-2 lg:order-1">
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
                        <div key={post.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 hover:shadow-md transition-all duration-200">
                          <div className="flex flex-col sm:flex-row">
                            {/* Vote Column - Horizontal on Mobile, Vertical on Desktop */}
                            <div className="sm:w-16 bg-accent/30 flex flex-row sm:flex-col items-center justify-center py-2 sm:py-4 px-4 sm:px-0 border-b sm:border-b-0 sm:border-r border-border">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rounded-full"
                                onClick={() => handleVote(post.id, "pump")}
                                aria-label="Vote up"
                              >
                                <TrendingUp className={`h-4 w-4 ${post.currentUserVote === 'pump' ? 'text-green-500' : 'text-muted-foreground'}`} />
                              </Button>
                              <span className="mx-2 sm:mx-0 sm:my-1 font-medium text-sm">
                                {post.pumpCount && post.dumpCount
                                  ? post.pumpCount - post.dumpCount
                                  : 0}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rotate-180 rounded-full"
                                onClick={() => handleVote(post.id, "dump")}
                                aria-label="Vote down"
                              >
                                <TrendingUp className={`h-4 w-4 ${post.currentUserVote === 'dump' ? 'text-red-500' : 'text-muted-foreground'}`} />
                              </Button>
                            </div>
                            
                            {/* Content Column - Enhanced for Mobile */}
                            <div className="flex-1 p-3 sm:p-4">
                              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground mb-2">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                  {post.author?.username?.charAt(0).toUpperCase() || post.authorId?.toString().charAt(0)}
                                </div>
                                <span className="truncate max-w-[120px] sm:max-w-none">
                                  Posted by {post.author?.username || "Anonymous"}
                                </span>
                                <span className="hidden xs:inline">•</span>
                                <span className="text-xs">{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              
                              <h3 className="font-semibold text-base sm:text-lg mb-2 line-clamp-2">{post.title}</h3>
                              <p className="text-muted-foreground text-sm line-clamp-2 sm:line-clamp-3 mb-3">{post.description}</p>
                              
                              {post.imageUrl && (
                                <div className="mb-3 rounded-md overflow-hidden bg-accent/30">
                                  <img 
                                    src={post.imageUrl} 
                                    alt={post.title}
                                    loading="lazy"
                                    className="w-full h-auto max-h-40 sm:max-h-56 object-cover transition-transform hover:scale-105 duration-300"
                                  />
                                </div>
                              )}
                              
                              {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                  {post.tags.map((tag: string, index: number) => (
                                    <div 
                                      key={index} 
                                      className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs hover:bg-primary/20 transition-colors cursor-pointer"
                                      onClick={() => setSearchQuery(tag)}
                                    >
                                      #{tag}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-card border border-border rounded-lg p-8 text-center">
                        <p className="text-muted-foreground mb-4">
                          {searchQuery 
                            ? "No posts matching your search." 
                            : `No posts yet. ${user ? "Be the first to share your startup idea!" : "Sign in to create a post!"}`}
                        </p>
                        {!searchQuery && (
                          <Button onClick={handleNewPost}>
                            {user ? "Create Post" : "Sign In to Post"}
                          </Button>
                        )}
                        {searchQuery && (
                          <Button variant="outline" onClick={() => setSearchQuery("")}>
                            Clear Search
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="trending" className="mt-0">
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Trending posts will appear here based on engagement.</p>
                  </div>
                </TabsContent>
                
                <TabsContent value="following" className="mt-0">
                  <div className="bg-card border border-border rounded-lg p-8 text-center">
                    <p className="text-muted-foreground">Posts from people you follow will appear here.</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
            
            {/* Right Column - Sidebar (Mobile & Desktop Optimized) */}
            <div className="lg:col-span-4 xl:col-span-3 order-1 lg:order-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                {/* Community Card - Modern Vision UI Style */}
                <Card className="border-primary/20 overflow-hidden bg-gradient-to-br from-card to-card/80 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 pointer-events-none"></div>
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg">
                        <Users className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg tracking-tight">GENIQL Community</CardTitle>
                        <CardDescription>Founded April 2025</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-4">
                    <p className="text-sm text-muted-foreground mb-4">
                      A place to share and discuss startup ideas, get feedback, and connect with other founders.
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-primary/10 rounded-md p-2.5 text-center backdrop-blur-sm">
                        <div className="font-semibold text-lg">{posts?.length || 0}</div>
                        <div className="text-xs text-muted-foreground">Members</div>
                      </div>
                      <div className="bg-primary/10 rounded-md p-2.5 text-center backdrop-blur-sm">
                        <div className="font-semibold text-lg">
                          {Math.min(Math.floor((posts?.length || 10) / 3) + 1, 50)}
                        </div>
                        <div className="text-xs text-muted-foreground">Online</div>
                      </div>
                    </div>
                    
                    <Button 
                      className="w-full rounded-md shadow-md border border-primary/20 bg-primary/90 hover:bg-primary" 
                      onClick={handleNewPost}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" /> 
                      Create Post
                    </Button>
                  </CardContent>
                </Card>
                
                {/* Popular Tags Card */}
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Hash className="h-4 w-4 mr-2 text-primary" />
                      Trending Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
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
                
                {/* Community Resources */}
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <HelpCircle className="h-4 w-4 mr-2 text-primary" />
                      Community Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between hover:bg-muted/30 p-2 rounded-md transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-blue-500" />
                          </div>
                          <span className="text-sm">Discussion Guidelines</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center justify-between hover:bg-muted/30 p-2 rounded-md transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <RefreshCcw className="h-4 w-4 text-green-500" />
                          </div>
                          <span className="text-sm">Iterating on Ideas</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center justify-between hover:bg-muted/30 p-2 rounded-md transition-colors">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <Flame className="h-4 w-4 text-amber-500" />
                          </div>
                          <span className="text-sm">Finding Co-Founders</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Getting Started Card */}
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-primary" />
                      Getting Started
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="bg-primary/20 text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">1</div>
                        <span>Share your innovative startup idea with the community</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-primary/20 text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">2</div>
                        <span>Get constructive feedback from experienced founders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="bg-primary/20 text-primary text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">3</div>
                        <span>Use the AI analysis tool to evaluate market potential</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>
                
                {/* Top Contributors Card */}
                <Card className="border-primary/20 overflow-hidden">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center">
                      <Award className="h-4 w-4 mr-2 text-primary" />
                      Top Contributors
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="relative">
                            <Avatar className="h-8 w-8 border border-primary/20">
                              <AvatarImage src={`/avatars/0${i}.png`} />
                              <AvatarFallback>{["JD", "AS", "MK"][i-1]}</AvatarFallback>
                            </Avatar>
                            <div className="absolute -bottom-1 -right-1 bg-primary rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold text-white">
                              {i}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{["JaneDoe", "AlexSmith", "MikeKhan"][i-1]}</div>
                            <div className="text-xs text-muted-foreground">
                              {[52, 47, 36][i-1]} posts
                            </div>
                          </div>
                          <Badge variant="outline" className="bg-primary/10 h-5 text-[10px]">
                            <span className="text-primary">+{[12, 9, 7][i-1]}</span>
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer removed */}
      </div>
    </div>
  );
}
