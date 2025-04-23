import { useState, useRef } from "react";
import { useParams, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CommunityPost } from "@/components/community-post";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Post, Analysis } from "@shared/schema";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { 
  Camera, Edit, Activity, BarChart, 
  ThumbsUp, MessageSquare, Users, Star,
  Calendar, TrendingUp, ChevronRight,
  Brain, Wallet, Lock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

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
        <div className="flex-1 flex flex-col w-full max-w-full">
          <Header />
          <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto w-full">
            <div className="animate-pulse space-y-6">
              <div className="h-12 w-48 bg-vision-card/60 rounded-lg"></div>
              <div className="h-40 bg-vision-card/90 rounded-lg shadow-lg"></div>
              <div className="h-12 bg-vision-card/60 rounded-lg"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-vision-card/60 animate-pulse rounded-lg h-64"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full max-w-full">
          <Header />
          <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto w-full flex items-center justify-center">
            <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg max-w-md w-full">
              <CardHeader>
                <CardTitle className="text-white text-center">User Not Found</CardTitle>
                <CardDescription className="text-white/70 text-center">
                  The user you're looking for doesn't exist
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex justify-center">
                <Button 
                  onClick={() => window.location.href = "/community"}
                  className="bg-vision-primary-gradient text-white hover:brightness-110"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Explore Community
                </Button>
              </CardFooter>
            </Card>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col w-full max-w-full">
        <Header />
        
        <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto w-full">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <Users className="hidden sm:inline-block h-5 w-5 text-primary" />
                {username}'s Profile
              </h1>
              <p className="text-sm text-muted-foreground">
                View profile details, posts, and activity
              </p>
            </div>
          </div>
          
          {/* Profile Header Card */}
          <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg mb-6">
            <CardContent className="p-6">
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
                    className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-vision-primary-gradient/30 flex items-center justify-center text-2xl font-bold overflow-hidden border-4 border-vision-purple-200/30"
                    style={{ position: 'relative' }}
                  >
                    {profilePic || user.profilePictureUrl ? (
                      <img 
                        src={profilePic || user.profilePictureUrl || ''} 
                        alt={`${username}'s profile`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white">{username.charAt(0).toUpperCase()}</span>
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
                  <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
                    <div>
                      <h1 className="text-2xl font-bold text-white">{username}</h1>
                      <div className="flex items-center text-white/60 mt-1 text-sm">
                        <Calendar className="w-4 h-4 mr-1.5" />
                        Member since {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      
                      {user.planType && (
                        <Badge className="mt-2 bg-vision-primary-gradient text-white">
                          {user.planType} Plan
                        </Badge>
                      )}
                    </div>
                    
                    <div className="md:ml-auto">
                      {isOwnProfile ? (
                        <Button 
                          variant={editing ? "default" : "outline"}
                          className={editing 
                            ? "bg-vision-primary-gradient text-white hover:brightness-110" 
                            : "border-vision-purple-200/30 text-white hover:border-primary"}
                          onClick={() => setEditing(!editing)}
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          {editing ? "Cancel" : "Edit Profile"}
                        </Button>
                      ) : (
                        <Button 
                          variant={isFollowing ? "outline" : "default"}
                          className={isFollowing 
                            ? "border-vision-purple-200/30 text-white hover:border-primary" 
                            : "bg-vision-primary-gradient text-white hover:brightness-110"}
                          onClick={isFollowing ? handleUnfollow : handleFollow}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          {isFollowing ? "Unfollow" : "Follow"}
                        </Button>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-6 mb-6">
                    <div className="text-center px-4 py-2 bg-vision-purple-100/10 rounded-lg">
                      <div className="text-xl font-bold text-white">{posts?.length || 0}</div>
                      <div className="text-xs text-white/60 mt-1">Posts</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-vision-purple-100/10 rounded-lg">
                      <div className="text-xl font-bold text-white">{user.followersCount || 0}</div>
                      <div className="text-xs text-white/60 mt-1">Followers</div>
                    </div>
                    <div className="text-center px-4 py-2 bg-vision-purple-100/10 rounded-lg">
                      <div className="text-xl font-bold text-white">{user.followingCount || 0}</div>
                      <div className="text-xs text-white/60 mt-1">Following</div>
                    </div>
                  </div>
                  
                  {editing ? (
                    <div className="space-y-3">
                      <Label htmlFor="bio" className="text-white">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell others about yourself..."
                        rows={3}
                        className="bg-vision-purple-100/10 border-vision-purple-200/20 text-white/90"
                      />
                      <Button 
                        onClick={handleSaveBio} 
                        disabled={updateBioMutation.isPending}
                        className="bg-vision-primary-gradient text-white hover:brightness-110"
                      >
                        {updateBioMutation.isPending ? "Saving..." : "Save Bio"}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-vision-purple-100/5 rounded-lg p-4 text-white/80">
                      {user.bio || "No bio provided."}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Profile Content */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="mb-6 bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 w-full rounded-lg shadow-sm overflow-x-auto">
              <TabsTrigger value="posts" className="flex-1 py-3">
                <MessageSquare className="h-4 w-4 mr-2" />
                Posts
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex-1 py-3">
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1 py-3">
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="posts" className="mt-4">
              {isLoadingPosts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-vision-card/60 animate-pulse rounded-lg h-64"></div>
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
                <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg text-center py-8">
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 text-white/30" />
                      <h3 className="text-xl font-medium text-white mb-2">No Posts Yet</h3>
                      <p className="text-white/60 mb-6">
                        {isOwnProfile 
                          ? "You haven't shared any posts with the community yet." 
                          : `${username} hasn't shared any posts with the community yet.`}
                      </p>
                      {isOwnProfile && (
                        <Button 
                          className="bg-vision-primary-gradient text-white hover:brightness-110"
                          onClick={() => window.location.href = "/community"}
                        >
                          Create Your First Post
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="activity" className="mt-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Activity className="h-5 w-5 text-primary" />
                        <span>Recent Activity</span>
                      </CardTitle>
                      <CardDescription className="text-white/70">
                        See what {isOwnProfile ? "you've" : `${username} has`} been up to.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px] pr-4">
                        {/* Activity Items - This would be populated from real data in a production app */}
                        <div className="space-y-6">
                          {/* Post Activity */}
                          <div className="relative pl-6 border-l border-vision-purple-200/20">
                            <div className="absolute -left-2 top-0 bg-vision-primary-gradient rounded-full p-1">
                              <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">
                                Created a post
                                <span className="text-white/40 font-normal ml-2">2 hours ago</span>
                              </div>
                              <Link href="/community" className="block text-sm p-3 bg-vision-purple-100/10 rounded-lg hover:bg-vision-purple-100/20 text-white/80 transition-colors">
                                "AI-powered dog walking service that automates scheduling and payments while optimizing routes."
                              </Link>
                            </div>
                          </div>
                          
                          {/* Vote Activity */}
                          <div className="relative pl-6 border-l border-vision-purple-200/20">
                            <div className="absolute -left-2 top-0 bg-vision-primary-gradient rounded-full p-1">
                              <ThumbsUp className="h-3 w-3 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">
                                Pumped a post
                                <span className="text-white/40 font-normal ml-2">4 hours ago</span>
                              </div>
                              <Link href="/community" className="block text-sm p-3 bg-vision-purple-100/10 rounded-lg hover:bg-vision-purple-100/20 text-white/80 transition-colors">
                                "On-demand marketplace connecting home chefs with hungry customers for authentic, home-cooked meals."
                              </Link>
                            </div>
                          </div>
                          
                          {/* Analysis Activity */}
                          <div className="relative pl-6 border-l border-vision-purple-200/20">
                            <div className="absolute -left-2 top-0 bg-vision-primary-gradient rounded-full p-1">
                              <BarChart className="h-3 w-3 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">
                                Analyzed a startup idea
                                <span className="text-white/40 font-normal ml-2">1 day ago</span>
                              </div>
                              <div className="text-sm p-3 bg-vision-purple-100/10 rounded-lg text-white/80">
                                "Subscription box for exotic spices with recipe cards and cultural information for home cooks."
                                <div className="mt-2">
                                  <Badge className="bg-vision-primary-gradient/50 text-white border-none">Success Rate: 76%</Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Follow Activity */}
                          <div className="relative pl-6 border-l border-vision-purple-200/20">
                            <div className="absolute -left-2 top-0 bg-vision-primary-gradient rounded-full p-1">
                              <Users className="h-3 w-3 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">
                                Started following
                                <span className="text-white/40 font-normal ml-2">2 days ago</span>
                              </div>
                              <div className="flex items-center gap-2 p-3 bg-vision-purple-100/10 rounded-lg">
                                <div className="w-8 h-8 rounded-full bg-vision-primary-gradient/30 flex items-center justify-center text-white font-medium text-xs">
                                  SV
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-white">SarahV</div>
                                  <div className="text-xs text-white/50">Fintech Entrepreneur</div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Comment Activity */}
                          <div className="relative pl-6 border-l border-vision-purple-200/20">
                            <div className="absolute -left-2 top-0 bg-vision-primary-gradient rounded-full p-1">
                              <MessageSquare className="h-3 w-3 text-white" />
                            </div>
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-white">
                                Commented on a post
                                <span className="text-white/40 font-normal ml-2">3 days ago</span>
                              </div>
                              <div className="text-sm p-3 bg-vision-purple-100/10 rounded-lg text-white/80">
                                "I think this has huge potential. Have you considered how you'll handle logistics for perishable items?"
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="space-y-6">
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Star className="h-4 w-4 text-primary" />
                        <span>Top Categories</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {['AI', 'SaaS', 'Marketplace', 'EdTech', 'Fintech'].map((category, i) => (
                        <div key={i} className="flex justify-between items-center">
                          <span className="text-white">{category}</span>
                          <Progress value={100 - i * 15} className="w-24 h-2 bg-vision-purple-100/10" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span>Activity Overview</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-5">
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center p-3 bg-vision-purple-100/10 rounded-lg">
                            <div className="text-xl font-bold text-white">{posts?.length || 0}</div>
                            <div className="text-xs text-white/50 mt-1">Posts</div>
                          </div>
                          <div className="text-center p-3 bg-vision-purple-100/10 rounded-lg">
                            <div className="text-xl font-bold text-white">{user.analysisCount || 0}</div>
                            <div className="text-xs text-white/50 mt-1">Analyses</div>
                          </div>
                          <div className="text-center p-3 bg-vision-purple-100/10 rounded-lg">
                            <div className="text-xl font-bold text-white">{user.followersCount || 0}</div>
                            <div className="text-xs text-white/50 mt-1">Followers</div>
                          </div>
                        </div>
                        
                        <Separator className="bg-vision-purple-200/10" />
                        
                        <div>
                          <div className="text-sm font-medium text-white mb-2">Activity Level</div>
                          <div className="flex items-center gap-2">
                            <Progress value={65} className="h-2 flex-1 bg-vision-purple-100/10" />
                            <span className="text-xs font-medium text-white">65%</span>
                          </div>
                          <div className="text-xs text-white/50 mt-1">
                            More active than 65% of users
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="analytics" className="mt-4">
              {isOwnProfile ? (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Brain className="h-4 w-4 text-primary" />
                          Analysis Count
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-white">{user.analysisCount || 0}</div>
                        <p className="text-white/60 text-sm">Ideas analyzed</p>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Star className="h-4 w-4 text-primary" />
                          Success Rate
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-col gap-2">
                          <div className="text-3xl font-bold text-white">{user.successRate || 75}%</div>
                          <Progress value={user.successRate || 75} className="h-2 bg-vision-purple-100/10" />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg text-white flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-primary" />
                          Plan Status
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-vision-primary-gradient text-white">
                            {user.planType === 'free' ? 'Free' : (user.planType === 'pro' ? 'Pro' : 'Unicorn')}
                          </Badge>
                          <span className="text-white/60 text-sm">
                            {user.analysisCount || 0}/
                            {user.planType === 'free' ? '2' : (user.planType === 'pro' ? '10' : 'Unlimited')}
                          </span>
                        </div>
                        <p className="text-white/60 text-sm mt-2">
                          {user.planType === 'free' 
                            ? 'Upgrade to Pro for more analyses' 
                            : (user.planType === 'pro' 
                              ? 'Pro plan active' 
                              : 'Unicorn plan active')}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-white">
                        <Brain className="h-5 w-5 text-primary" />
                        <span>Recent Analyses</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {/* If we had real analyses, we would render them here */}
                      <div className="text-center py-8">
                        <Brain className="h-12 w-12 mx-auto mb-4 text-white/30" />
                        <p className="text-white/60 mb-4">No analyses yet.</p>
                        <Button className="bg-vision-primary-gradient text-white hover:brightness-110">
                          Start Your First Analysis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg text-center py-12">
                  <CardContent>
                    <div className="max-w-md mx-auto">
                      <div className="w-16 h-16 rounded-full bg-vision-purple-100/10 mx-auto mb-4 flex items-center justify-center">
                        <span className="text-white/50">
                          <Lock className="h-8 w-8" />
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Private Analytics</h3>
                      <p className="text-white/60 mb-4">
                        Analysis data is private to each user.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </main>
        
        {/* Footer removed */}
      </div>
    </div>
  );
}
