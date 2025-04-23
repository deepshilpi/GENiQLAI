import { useState, useRef } from "react";
import { useParams } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityPost } from "@/components/community-post";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Post, Analysis } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Camera, Edit, Activity, BarChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
  
  // Update profile picture mutation
  const updateProfilePicMutation = useMutation({
    mutationFn: async (imageData: string) => {
      await apiRequest("PATCH", "/api/user/profile-picture", { profilePictureUrl: imageData });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${username}`] });
      toast({
        title: "Success",
        description: "Your profile picture has been updated",
      });
      setIsUploadingImage(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update profile picture: " + error.message,
        variant: "destructive",
      });
      setIsUploadingImage(false);
    }
  });
  
  // Handle profile picture upload
  const handleProfilePicUpload = async (file: File) => {
    if (!file) return;
    
    // Validate file
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "File too large",
        description: "Please choose an image under 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please choose an image file",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    
    try {
      // Create base64 version of the image
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        setProfilePic(base64);
        
        // In a real app, we would upload to a storage service
        // For now, we'll just use the base64 string
        updateProfilePicMutation.mutate(base64);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to process image",
        variant: "destructive",
      });
      setIsUploadingImage(false);
    }
  };

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

  // Check if this is the logged-in user's profile
  const isOwnProfile = currentUser?.username === username;
  
  // In a real app, we would query if the current user is following the profile user
  // For now we'll use a placeholder
  const isFollowing = false;

  if (isLoadingUser) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <Header />
          <main className="p-6 flex-1">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-card rounded-xl"></div>
              <div className="h-24 bg-card rounded-xl"></div>
              <div className="h-48 bg-card rounded-xl"></div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="ml-64 flex-1 flex flex-col">
          <Header />
          <main className="p-6 flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">User Not Found</h2>
              <p className="text-muted-foreground">The user you're looking for doesn't exist.</p>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="ml-64 flex-1 flex flex-col">
        <Header />
        
        <main className="p-6 flex-1">
          {/* Profile Header */}
          <div className="bg-card rounded-xl p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start gap-6">
              <div className="relative">
                {/* Hidden file input */}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleProfilePicUpload(file);
                    }
                  }}
                />
                
                {/* Profile picture display */}
                <div 
                  className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-xl font-bold overflow-hidden"
                  style={{ position: 'relative' }}
                >
                  {profilePic || user.profilePictureUrl ? (
                    <img 
                      src={profilePic || user.profilePictureUrl || ''} 
                      alt={`${username}'s profile`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                  
                  {/* Edit overlay button for own profile */}
                  {isOwnProfile && (
                    <div 
                      className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera className="text-white h-6 w-6" />
                    </div>
                  )}
                  
                  {/* Loading overlay */}
                  {isUploadingImage && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                </div>
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
              {isOwnProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Analysis Count</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold">{user.analysisCount || 0}</div>
                        <p className="text-muted-foreground text-sm">Ideas analyzed</p>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Success Rate</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="text-3xl font-bold">{user.successRate || 0}%</div>
                          <Progress value={user.successRate || 0} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Plan Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge variant={user.planType === 'free' ? 'outline' : (user.planType === 'pro' ? 'default' : 'secondary')}>
                            {user.planType === 'free' ? 'Free' : (user.planType === 'pro' ? 'Pro' : 'Unicorn')}
                          </Badge>
                          <span className="text-muted-foreground text-sm">
                            {user.analysisCount || 0}/
                            {user.planType === 'free' ? '2' : (user.planType === 'pro' ? '10' : 'Unlimited')}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mt-2">
                          {user.planType === 'free' 
                            ? 'Upgrade to Pro for more analyses' 
                            : (user.planType === 'pro' 
                              ? 'Pro plan active' 
                              : 'Unicorn plan active')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>
                        <div className="flex items-center gap-2">
                          <BarChart className="h-5 w-5" />
                          <span>Recent Analyses</span>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* If we had real analyses, we would render them here */}
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-2">No analyses yet.</p>
                        <Button>Start Your First Analysis</Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Startup Analysis History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      This user's analysis history is private.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}
