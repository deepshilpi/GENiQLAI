import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
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
import { isPlanAllowed } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogTrigger 
} from "@/components/ui/dialog";

// Extended post type for UI with author and current user vote
interface ExtendedPost extends Post {
  author?: {
    username?: string;
  };
  currentUserVote?: 'pump' | 'dump' | null;
  tags?: string[];
}
import { PricingPlans } from "@/components/pricing-plans";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  TrendingUp, 
  Clock, 
  Users,
  Filter,
  Image as ImageIcon
} from "lucide-react";

export default function CommunityPage() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState<"posts" | "users" | "tags">("posts");
  const [filteredPosts, setFilteredPosts] = useState<Post[] | null>(null);
  const [_, navigate] = useLocation();
  const { toast } = useToast();

  // Query posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });

  // Update filtered posts when posts or search query changes
  useEffect(() => {
    if (!posts || !searchQuery.trim()) {
      setFilteredPosts(null);
      return;
    }

    const query = searchQuery.toLowerCase();
    let filtered: Post[] = [];

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
    
    if (isPlanAllowed(user?.planType || "free", "pro")) {
      setShowPostForm(true);
    } else {
      setShowPlanDialog(true);
    }
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
      
      <div className="ml-64 flex-1 flex flex-col">
        <Header />
        
        <main className="p-6 flex-1">
          <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold">Startup Community</h2>
              <p className="text-muted-foreground">Connect with founders and share your ideas</p>
            </div>
            
            <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
              <DialogTrigger asChild>
                <Button onClick={handleNewPost} className="bg-primary text-white">
                  <ImageIcon className="w-4 h-4 mr-2" /> Create Post
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border max-w-3xl">
                <PostForm onComplete={() => setShowPostForm(false)} />
              </DialogContent>
            </Dialog>
          </div>
          
          <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
            <DialogContent className="bg-card border-border max-w-3xl">
              <h2 className="text-xl font-bold mb-4">Upgrade to Post</h2>
              <p className="text-muted-foreground mb-6">
                You need at least a Pro subscription to create posts in the community.
              </p>
              <PricingPlans />
            </DialogContent>
          </Dialog>
          
          {/* Search Bar - Reddit Style */}
          <div className="bg-card border border-border rounded-lg p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts, users, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background"
                />
              </div>
              <div className="flex gap-2">
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
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-3">
              <Tabs defaultValue="latest" className="mb-6">
                <TabsList className="mb-4 bg-card w-full">
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
                        <div key={index} className="bg-card animate-pulse rounded-xl h-32"></div>
                      ))
                    ) : (filteredPosts || posts)?.length ? (
                      (filteredPosts || posts).map(post => (
                        <div key={post.id} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
                          <div className="flex">
                            {/* Vote Column */}
                            <div className="w-16 bg-background flex flex-col items-center py-4">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => handleVote(post.id, "pump")}
                              >
                                <TrendingUp className={`h-5 w-5 ${post.currentUserVote === 'pump' ? 'text-green-500' : 'text-muted-foreground'}`} />
                              </Button>
                              <span className="my-1 font-bold">
                                {post.pumpCount && post.dumpCount
                                  ? post.pumpCount - post.dumpCount
                                  : 0}
                              </span>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 rotate-180"
                                onClick={() => handleVote(post.id, "dump")}
                              >
                                <TrendingUp className={`h-5 w-5 ${post.currentUserVote === 'dump' ? 'text-red-500' : 'text-muted-foreground'}`} />
                              </Button>
                            </div>
                            
                            {/* Content Column */}
                            <div className="flex-1 p-4">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                                  {post.author?.username?.charAt(0).toUpperCase()}
                                </div>
                                <span>Posted by {post.author?.username || "Anonymous"}</span>
                                <span>•</span>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                              </div>
                              
                              <h3 className="font-bold text-lg mb-2">{post.title}</h3>
                              <p className="text-muted-foreground line-clamp-3 mb-3">{post.description}</p>
                              
                              {post.tags?.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                  {post.tags.map((tag, index) => (
                                    <div key={index} className="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs">
                                      {tag}
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
            
            {/* Right Column - Sidebar */}
            <div className="hidden lg:block">
              <div className="bg-card border border-border rounded-lg p-4 mb-4">
                <h3 className="font-bold mb-2">About Community</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  A place to share and discuss startup ideas, get feedback, and connect with other founders.
                </p>
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <span>Members</span>
                    <span className="font-bold">{posts?.length || 0}+</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Online</span>
                    <span className="font-bold">
                      {Math.floor(Math.random() * (posts?.length || 10) + 1)}
                    </span>
                  </div>
                  <div className="border-t border-border my-2"></div>
                  <Button className="w-full" onClick={handleNewPost}>
                    <ImageIcon className="w-4 h-4 mr-2" /> Create Post
                  </Button>
                </div>
              </div>
              
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="font-bold mb-2">Top Tags</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['AI', 'SaaS', 'Fintech', 'E-commerce', 'Health', 'Education'].map((tag) => (
                    <div 
                      key={tag} 
                      className="bg-primary/10 text-primary rounded-full px-3 py-1 text-sm cursor-pointer hover:bg-primary/20 transition-colors"
                      onClick={() => {
                        setSearchType("tags");
                        setSearchQuery(tag);
                      }}
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
