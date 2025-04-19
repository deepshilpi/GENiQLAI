import { useState } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityPost } from "@/components/community-post";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Post } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");

  // Query user profile
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: [`/api/users/${username}`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user profile");
      const userData = await res.json();
      setBio(userData.bio || "");
      return userData;
    }
  });

  // Query user posts
  const { data: posts, isLoading: isLoadingPosts } = useQuery<Post[]>({
    queryKey: [`/api/users/${username}/posts`],
    queryFn: async () => {
      const res = await fetch(`/api/users/${username}/posts`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch user posts");
      return res.json();
    }
  });

  // Follow/unfollow mutations
  const followMutation = useMutation({
    mutationFn: async (followingId: number) => {
      await apiRequest("POST", "/api/follows", { followingId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Success",
        description: `You are now following ${username}`,
      });
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: async (followingId: number) => {
      await apiRequest("DELETE", `/api/follows/${followingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Success",
        description: `You have unfollowed ${username}`,
      });
    }
  });

  // Update bio mutation
  const updateBioMutation = useMutation({
    mutationFn: async (newBio: string) => {
      await apiRequest("PATCH", "/api/user/bio", { bio: newBio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      setEditing(false);
      toast({
        title: "Success",
        description: "Your bio has been updated",
      });
    }
  });

  const handleFollow = () => {
    if (!user) return;
    followMutation.mutate(user.id);
  };

  const handleUnfollow = () => {
    if (!user) return;
    unfollowMutation.mutate(user.id);
  };

  const handleSaveBio = () => {
    updateBioMutation.mutate(bio);
  };

  const isOwnProfile = currentUser?.username === username;
  const isFollowing = false; // In a real app, this would check if currentUser is following user

  if (isLoadingUser) {
    return (
      <div className="flex-1">
        <main className="p-6 flex-1">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-card rounded-xl"></div>
            <div className="h-24 bg-card rounded-xl"></div>
            <div className="h-48 bg-card rounded-xl"></div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1">
        <main className="p-6 flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
            <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex-1">
      <main className="p-6 flex-1">
        {/* Profile Header */}
        <div className="bg-card rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold">
              {username.charAt(0).toUpperCase()}
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{username}</h1>
                  <p className="text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="ml-auto">
                  {isOwnProfile ? (
                    <Button 
                      variant={editing ? "default" : "outline"} 
                      onClick={() => setEditing(!editing)}
                    >
                      {editing ? "Cancel" : "Edit Profile"}
                    </Button>
                  ) : (
                    <Button 
                      variant={isFollowing ? "outline" : "default"}
                      onClick={isFollowing ? handleUnfollow : handleFollow}
                    >
                      {isFollowing ? "Unfollow" : "Follow"}
                    </Button>
                  )}
                </div>
              </div>
              
              <div className="flex gap-4 mb-4">
                <div>
                  <span className="font-bold">{posts?.length || 0}</span>
                  <span className="text-muted-foreground ml-1">Posts</span>
                </div>
                <div>
                  <span className="font-bold">{user.followersCount}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-bold">{user.followingCount}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
              </div>
              
              {editing ? (
                <div className="space-y-3">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea 
                    id="bio" 
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell others about yourself..."
                    rows={3}
                  />
                  <Button onClick={handleSaveBio} disabled={updateBioMutation.isPending}>
                    {updateBioMutation.isPending ? "Saving..." : "Save Bio"}
                  </Button>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {user.bio || "No bio provided."}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Profile Content */}
        <Tabs defaultValue="posts">
          <TabsList>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-4">
            {isLoadingPosts ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-card animate-pulse rounded-xl h-64"></div>
                ))}
              </div>
            ) : posts && posts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {posts.map(post => (
                  <CommunityPost 
                    key={post.id} 
                    post={post} 
                    onVote={() => {}} 
                    currentUser={currentUser}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No posts yet.</p>
                {isOwnProfile && (
                  <Button>Create Your First Post</Button>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="analytics" className="mt-4">
            <div className="bg-card rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Startup Analysis History</h3>
              <p className="text-muted-foreground">
                {isOwnProfile 
                  ? "Your past analyses will appear here." 
                  : "This user's analysis history is private."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
}