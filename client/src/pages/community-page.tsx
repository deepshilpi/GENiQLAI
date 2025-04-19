import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Footer } from "@/components/footer";
import { CommunityPost } from "@/components/community-post";
import { PostForm } from "@/components/post-form";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Post } from "@shared/schema";
import { isPlanAllowed } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { PricingPlans } from "@/components/pricing-plans";

export default function CommunityPage() {
  const { user } = useAuth();
  const [showPostForm, setShowPostForm] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);

  // Query posts
  const { data: posts, isLoading } = useQuery<Post[]>({
    queryKey: ["/api/posts"],
    queryFn: async () => {
      const res = await fetch("/api/posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      return res.json();
    }
  });

  // Vote mutation
  const voteMutation = useMutation({
    mutationFn: async ({ postId, voteType }: { postId: number, voteType: string }) => {
      await apiRequest("POST", "/api/votes", { postId, voteType });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
    }
  });

  const handleVote = (postId: number, voteType: string) => {
    voteMutation.mutate({ postId, voteType });
  };

  const handleNewPost = () => {
    if (isPlanAllowed(user?.planType || "free", "pro")) {
      setShowPostForm(true);
    } else {
      setShowPlanDialog(true);
    }
  };

  return (
    <div className="flex-1">
      <main className="p-6 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Startup Community</h2>
          <Dialog open={showPostForm} onOpenChange={setShowPostForm}>
            <DialogTrigger asChild>
              <Button onClick={handleNewPost} className="bg-primary text-white">
                <i className="fas fa-plus mr-2"></i> New Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
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
        
        <Tabs defaultValue="latest" className="mb-6">
          <TabsList>
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
          </TabsList>
          
          <TabsContent value="latest" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="bg-card animate-pulse rounded-xl h-64"></div>
                ))
              ) : posts && posts.length > 0 ? (
                posts.map(post => (
                  <CommunityPost 
                    key={post.id} 
                    post={post} 
                    onVote={handleVote}
                    currentUser={user}
                  />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <p className="text-muted-foreground mb-4">No posts yet. Be the first to share your startup idea!</p>
                  <Button onClick={handleNewPost}>Create Post</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="trending" className="mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Trending posts will appear here.</p>
            </div>
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Posts from people you follow will appear here.</p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}