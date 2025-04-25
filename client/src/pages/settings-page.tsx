import { useState, useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  User, 
  Shield, 
  Bell, 
  Wallet, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff,
  LogOut,
  CheckCircle,
  Trash2,
  Key,
  BellRing,
  Languages,
  Monitor,
  Download,
  UserPlus,
  HelpCircle,
  MessageSquare,
  Moon,
  Smartphone,
  Computer,
  Heart,
  Settings,
  Calendar
} from "lucide-react";

export default function SettingsPage() {
  const { user, logoutMutation, updateProfilePicture } = useAuth();
  const { toast } = useToast();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [email, setEmail] = useState(user?.email || "");
  const [notificationsEmail, setNotificationsEmail] = useState(true);
  const [notificationsApp, setNotificationsApp] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("english");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState("profile");
  
  // File input reference for profile picture uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      const response = await apiRequest("PATCH", "/api/user/password", data);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your password has been updated",
      });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update password: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update email mutation
  const updateEmailMutation = useMutation({
    mutationFn: async (newEmail: string) => {
      await apiRequest("PATCH", "/api/user/email", { email: newEmail });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Your email has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update email: " + error.message,
        variant: "destructive",
      });
    }
  });

  // Update notification settings mutation
  const updateNotificationsMutation = useMutation({
    mutationFn: async (data: { email: boolean; inApp: boolean }) => {
      await apiRequest("PATCH", "/api/user/notifications", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Notification settings updated",
      });
    }
  });
  
  // Add bio update mutation
  const [bio, setBio] = useState(user?.bio || "");
  const updateBioMutation = useMutation({
    mutationFn: async (newBio: string) => {
      await apiRequest("PATCH", "/api/user/bio", { bio: newBio });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Success",
        description: "Your bio has been updated",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update bio: " + error.message,
        variant: "destructive",
      });
    }
  });
  
  const handleBioUpdate = () => {
    updateBioMutation.mutate(bio);
  };

  const handlePasswordUpdate = () => {
    if (!currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    updatePasswordMutation.mutate({
      currentPassword,
      newPassword
    });
  };

  const handleEmailUpdate = () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Error",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    updateEmailMutation.mutate(email);
  };

  const handleNotificationsUpdate = () => {
    updateNotificationsMutation.mutate({
      email: notificationsEmail,
      inApp: notificationsApp
    });
  };

  // Improved logout handler with immediate UI feedback and reliable redirect
  const handleLogout = () => {
    // Check if already in progress
    if (logoutMutation.isPending) {
      console.log("Logout already in progress, preventing duplicate request");
      return;
    }
    
    // First update the UI immediately
    queryClient.setQueryData(["/api/user"], null);
    
    // Clear session storage flags
    sessionStorage.removeItem('auth_login_success');
    sessionStorage.removeItem('auth_logout_requested');
    
    // Then do the API call with hard redirect afterward
    console.log("Executing logout from settings page");
    logoutMutation.mutate(undefined, {
      onSettled: () => {
        // Force navigation to auth page
        window.location.href = "/auth";
      }
    });
  };
  
  // Handle profile picture selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  // Handle profile picture upload
  const handleProfilePictureUpload = () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Please select an image file first",
        variant: "destructive",
      });
      return;
    }
    
    const formData = new FormData();
    formData.append('profilePicture', selectedFile);
    
    updateProfilePicture.mutate(formData);
  };
  
  // Trigger file input click - improved with error handling and logging
  const triggerFileUpload = () => {
    console.log("Triggering file upload with ref:", fileInputRef.current);
    if (fileInputRef.current) {
      // Use a timeout to ensure the click event is processed correctly
      setTimeout(() => {
        try {
          fileInputRef.current?.click();
          console.log("File input click triggered");
        } catch (error) {
          console.error("Error triggering file input click:", error);
          // Fallback method if the click() method fails
          const event = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          fileInputRef.current?.dispatchEvent(event);
        }
      }, 0);
    } else {
      console.error("File input reference is null");
      toast({
        title: "Error",
        description: "Could not open file selector, please try again",
        variant: "destructive",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col w-full max-w-full">
          <Header />
          <main className="p-3 sm:p-4 md:p-6 flex-1 overflow-y-auto w-full">
            <div className="flex items-center justify-center h-full">
              <Card className="border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-white">Settings</CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Please log in to access your settings
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white" onClick={() => window.location.href = "/auth"}>
                    Log In
                  </Button>
                </CardFooter>
              </Card>
            </div>
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
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Settings className="hidden sm:inline-block h-5 w-5 text-[#A163F7]" />
                Account Settings
              </h1>
              <p className="text-sm text-[#a09dd2]">Manage your profile, security, and preferences</p>
            </div>
            
            <Button 
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          {/* Tabs - Improved for mobile with controlled state */}
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="w-full"
          >
            <div className="relative mb-6 overflow-hidden">
              <ScrollArea className="w-full">
                <TabsList className="bg-[#11083C]/90 backdrop-blur-md border-[#A163F7]/20 w-auto min-w-full inline-flex rounded-lg shadow-lg">
                  <TabsTrigger 
                    value="profile" 
                    className="py-3 px-4 whitespace-nowrap text-white data-[state=active]:bg-[#A163F7]/20 data-[state=active]:text-white"
                    onClick={() => console.log("Profile tab clicked")}
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="security" 
                    className="py-3 px-4 whitespace-nowrap text-white data-[state=active]:bg-[#A163F7]/20 data-[state=active]:text-white"
                    onClick={() => console.log("Security tab clicked")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Security</span>
                    <span className="sm:hidden">Security</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="notifications" 
                    className="py-3 px-4 whitespace-nowrap text-white data-[state=active]:bg-[#A163F7]/20 data-[state=active]:text-white"
                    onClick={() => console.log("Notifications tab clicked")}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                    <span className="sm:hidden">Alerts</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="preferences" 
                    className="py-3 px-4 whitespace-nowrap text-white data-[state=active]:bg-[#A163F7]/20 data-[state=active]:text-white"
                    onClick={() => console.log("Preferences tab clicked")}
                  >
                    <Monitor className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Preferences</span>
                    <span className="sm:hidden">Prefs</span>
                  </TabsTrigger>
                </TabsList>
              </ScrollArea>
              <div className="absolute left-0 top-0 bottom-0 w-4 pointer-events-none bg-gradient-to-r from-background to-transparent"></div>
              <div className="absolute right-0 top-0 bottom-0 w-4 pointer-events-none bg-gradient-to-l from-background to-transparent"></div>
            </div>
            
            {/* Profile Tab */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              {/* Profile Overview Card */}
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <div className="relative">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-[#7551FF]/30 to-[#CB9FFF]/30"></div>
                  <div className="p-6 flex flex-col items-center">
                    <div className="text-center mb-5">
                      <div className="relative w-[120px] h-[120px] rounded-full bg-[#11083C] border-4 border-[#A163F7]/30 flex items-center justify-center overflow-hidden mx-auto">
                        {user.profilePictureUrl ? (
                          <img 
                            src={user.profilePictureUrl} 
                            alt={user.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-16 h-16 text-white/40" />
                        )}
                      </div>
                      
                      <h2 className="text-xl font-semibold text-white mt-4">{user.email}</h2>
                      <p className="text-[#a09dd2] text-sm">{user.bio || "No bio available"}</p>
                      
                      <div className="flex justify-center mt-4 space-x-8">
                        <div className="text-center">
                          <p className="text-[#CB9FFF] font-semibold">{user.followersCount || 0}</p>
                          <p className="text-[#a09dd2] text-xs">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#CB9FFF] font-semibold">{user.followingCount || 0}</p>
                          <p className="text-[#a09dd2] text-xs">Following</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[#CB9FFF] font-semibold">0</p>
                          <p className="text-[#a09dd2] text-xs">Posts</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-3 mt-5">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#A163F7]/30 text-white hover:bg-[#A163F7]/10"
                          onClick={triggerFileUpload}
                        >
                          Select Image
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] hover:from-[#7551FF]/90 hover:to-[#A163F7]/90 text-white"
                          onClick={handleProfilePictureUpload}
                          disabled={!selectedFile || updateProfilePicture.isPending}
                        >
                          {updateProfilePicture.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-[#a09dd2] mt-2">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Information Card */}
                <div className="lg:col-span-2">
                  <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                      <CardTitle className="text-white text-lg">Basic Information</CardTitle>
                      <CardDescription className="text-[#a09dd2]">
                        Manage your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-white">Username</Label>
                          <Input 
                            id="username" 
                            value={user.username}
                            disabled
                            className="bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40"
                          />
                          <p className="text-xs text-[#a09dd2]">Username cannot be changed</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40"
                            />
                            <Button
                              onClick={handleEmailUpdate}
                              disabled={updateEmailMutation.isPending}
                              className="whitespace-nowrap bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white"
                            >
                              {updateEmailMutation.isPending ? "Saving..." : "Save"}
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-white">Bio</Label>
                        <Textarea 
                          id="bio" 
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Tell others about yourself..."
                          className="min-h-[120px] bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40 resize-none"
                        />
                        <div className="flex justify-end">
                          <Button
                            size="sm"
                            className="ml-auto bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white"
                            onClick={handleBioUpdate}
                            disabled={updateBioMutation.isPending}
                          >
                            {updateBioMutation.isPending ? "Saving..." : "Save Bio"}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Account Summary Card */}
                <div>
                  <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                    <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                      <CardTitle className="text-white text-lg">Account Summary</CardTitle>
                      <CardDescription className="text-[#a09dd2]">
                        Overview of your account status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Plan</Label>
                            <Badge className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white border-none rounded-full px-3">
                              {user.planType === "free" ? "free" : user.planType}
                            </Badge>
                          </div>
                          {user.planType === "free" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full mt-2 border-[#A163F7]/30 text-white hover:bg-[#A163F7]/10"
                            >
                              Upgrade Plan
                            </Button>
                          )}
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Member Since</Label>
                            <span className="text-[#a09dd2] text-sm">
                              {new Date(user.createdAt).toLocaleDateString("en-GB")}
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Posts</Label>
                            <span className="text-[#a09dd2] text-sm">0</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Followers</Label>
                            <span className="text-[#a09dd2] text-sm">{user.followersCount || 0}</span>
                          </div>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <Label className="text-white">Following</Label>
                            <span className="text-[#a09dd2] text-sm">{user.followingCount || 0}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                  <CardTitle className="text-white text-lg">Password Security</CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Change your password
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6 p-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword" className="text-white">Current Password</Label>
                      <div className="relative">
                        <Input 
                          id="currentPassword"
                          type={showCurrentPassword ? "text" : "password"}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40 pr-10"
                          placeholder="Enter your current password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-white">New Password</Label>
                      <div className="relative">
                        <Input 
                          id="newPassword"
                          type={showNewPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40 pr-10"
                          placeholder="Enter your new password"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 text-white/70 hover:text-white"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-white">Confirm New Password</Label>
                      <Input 
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-[#0B1437]/50 border-[#A163F7]/20 text-white/90 placeholder:text-white/40"
                        placeholder="Confirm your new password"
                      />
                    </div>
                    
                    <div className="pt-2">
                      <Progress 
                        value={newPassword.length > 0 ? Math.min(100, newPassword.length * 12.5) : 0} 
                        className="h-1.5 bg-[#0B1437]/50" 
                      />
                      <p className="text-xs mt-1 text-[#a09dd2]">Password strength: {newPassword.length === 0 ? "Not set" : newPassword.length < 6 ? "Weak" : newPassword.length < 10 ? "Medium" : "Strong"}</p>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handlePasswordUpdate}
                        disabled={updatePasswordMutation.isPending}
                        className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white"
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                    <CardTitle className="text-white text-lg">Security Features</CardTitle>
                    <CardDescription className="text-[#a09dd2]">
                      Additional security settings
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white flex items-center gap-2">
                            <Key className="h-4 w-4 text-[#A163F7]" />
                            Two-Factor Authentication
                          </Label>
                          <p className="text-xs text-[#a09dd2]">Secure your account with 2FA</p>
                        </div>
                        <Switch id="two-factor" disabled />
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white flex items-center gap-2">
                            <BellRing className="h-4 w-4 text-[#A163F7]" />
                            Login Notifications
                          </Label>
                          <p className="text-xs text-[#a09dd2]">Get notified on new login</p>
                        </div>
                        <Switch id="login-notifications" checked={true} className="data-[state=checked]:bg-[#A163F7]" />
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label className="text-white flex items-center gap-2">
                            <Smartphone className="h-4 w-4 text-[#A163F7]" />
                            Device Management
                          </Label>
                          <p className="text-xs text-[#a09dd2]">Manage your logged in devices</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-[#A163F7]/30 text-white hover:bg-[#A163F7]/10"
                        >
                          Manage
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                    <CardTitle className="text-white text-lg">Recent Activity</CardTitle>
                    <CardDescription className="text-[#a09dd2]">
                      Recent login activity on your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Computer className="h-5 w-5 text-[#A163F7] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">Desktop - Chrome</p>
                            <p className="text-xs text-[#a09dd2]">New Delhi, India</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#a09dd2]">Today, 8:30 AM</p>
                          <Badge variant="outline" className="text-green-400 border-green-400/30 text-xs mt-1">
                            Current
                          </Badge>
                        </div>
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Smartphone className="h-5 w-5 text-[#A163F7] mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-white">iPhone - Safari</p>
                            <p className="text-xs text-[#a09dd2]">New Delhi, India</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#a09dd2]">Yesterday, 6:12 PM</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Trash2 className="h-4 w-4 text-red-400" />
                    Danger Zone
                  </CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Irreversible account actions
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="border border-red-500/20 rounded-lg p-4 bg-red-500/5">
                    <h3 className="text-red-400 font-medium">Delete Account</h3>
                    <p className="text-[#a09dd2] text-sm mt-1">This action is permanent and cannot be undone.</p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-3 bg-red-600 hover:bg-red-700"
                    >
                      Delete Account
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                  <CardTitle className="text-white text-lg">Notification Settings</CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Choose when and how to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <Mail className="h-4 w-4 text-[#A163F7]" />
                          Email Notifications
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Receive notifications by email</p>
                      </div>
                      <Switch 
                        id="email-notifications" 
                        checked={notificationsEmail}
                        onCheckedChange={setNotificationsEmail}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <Bell className="h-4 w-4 text-[#A163F7]" />
                          In-App Notifications
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Receive notifications in the app</p>
                      </div>
                      <Switch 
                        id="app-notifications" 
                        checked={notificationsApp}
                        onCheckedChange={setNotificationsApp}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-[#A163F7]" />
                          New Follower Alerts
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Get notified when someone follows you</p>
                      </div>
                      <Switch 
                        id="follower-notifications" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-[#A163F7]" />
                          Comment Alerts
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Get notified on comments on your posts</p>
                      </div>
                      <Switch 
                        id="comment-notifications" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-[#A163F7]" />
                          Direct Message Alerts
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Get notified on new direct messages</p>
                      </div>
                      <Switch 
                        id="dm-notifications" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button
                        onClick={handleNotificationsUpdate}
                        disabled={updateNotificationsMutation.isPending}
                        className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white"
                      >
                        {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                  <CardTitle className="text-white text-lg">Newsletter Subscription</CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Manage email newsletter preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-[#A163F7]" />
                          Weekly Digest
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Top startup news and insights</p>
                      </div>
                      <Switch 
                        id="weekly-digest" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <HelpCircle className="h-4 w-4 text-[#A163F7]" />
                          Monthly Success Stories
                        </Label>
                        <p className="text-xs text-[#a09dd2]">Inspirational startup journey stories</p>
                      </div>
                      <Switch 
                        id="success-stories" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white flex items-center gap-2">
                          <Download className="h-4 w-4 text-[#A163F7]" />
                          Product Updates
                        </Label>
                        <p className="text-xs text-[#a09dd2]">New features and improvements</p>
                      </div>
                      <Switch 
                        id="product-updates" 
                        checked={true}
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white">
                        Save Newsletter Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                    <CardTitle className="text-white text-lg">Appearance</CardTitle>
                    <CardDescription className="text-[#a09dd2]">
                      Customize how GENIQL looks for you
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-white flex items-center gap-2">
                            <Moon className="h-4 w-4 text-[#A163F7]" />
                            Dark Mode
                          </Label>
                          <p className="text-xs text-[#a09dd2]">Use dark theme</p>
                        </div>
                        <Switch 
                          id="dark-mode" 
                          checked={darkMode}
                          onCheckedChange={setDarkMode}
                          className="data-[state=checked]:bg-[#A163F7]"
                        />
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                          <Languages className="h-4 w-4 text-[#A163F7]" />
                          Language
                        </Label>
                        <select 
                          className="w-full rounded-md p-2 border bg-[#0B1437]/50 border-[#A163F7]/20 text-white"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          <option value="english" className="bg-[#11083C]">English</option>
                          <option value="hindi" className="bg-[#11083C]">Hindi</option>
                          <option value="spanish" className="bg-[#11083C]">Spanish</option>
                          <option value="french" className="bg-[#11083C]">French</option>
                          <option value="german" className="bg-[#11083C]">German</option>
                        </select>
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="space-y-2">
                        <Label className="text-white flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-[#A163F7]" />
                          Currency Display
                        </Label>
                        <select className="w-full rounded-md p-2 border bg-[#0B1437]/50 border-[#A163F7]/20 text-white">
                          <option value="inr" className="bg-[#11083C]">Indian Rupee (₹)</option>
                          <option value="usd" className="bg-[#11083C]">US Dollar ($)</option>
                          <option value="eur" className="bg-[#11083C]">Euro (€)</option>
                          <option value="gbp" className="bg-[#11083C]">British Pound (£)</option>
                        </select>
                        <p className="text-xs text-[#a09dd2]">For displaying market size and funding data</p>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white">
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                  <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                    <CardTitle className="text-white text-lg">Content Preferences</CardTitle>
                    <CardDescription className="text-[#a09dd2]">
                      Customize your feed and content experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-white">Auto-play Videos</Label>
                          <p className="text-xs text-[#a09dd2]">Automatically play videos in feed</p>
                        </div>
                        <Switch 
                          id="auto-play" 
                          checked={false}
                          className="data-[state=checked]:bg-[#A163F7]"
                        />
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5 flex-1">
                          <Label className="text-white">Show Post Analytics</Label>
                          <p className="text-xs text-[#a09dd2]">Display analytics on your posts</p>
                        </div>
                        <Switch 
                          id="post-analytics" 
                          checked={true}
                          className="data-[state=checked]:bg-[#A163F7]"
                        />
                      </div>
                      <Separator className="bg-[#A163F7]/10" />
                      
                      <div className="space-y-2">
                        <Label className="text-white">Default Landing Page</Label>
                        <select className="w-full rounded-md p-2 border bg-[#0B1437]/50 border-[#A163F7]/20 text-white">
                          <option value="dashboard" className="bg-[#11083C]">Dashboard</option>
                          <option value="feed" className="bg-[#11083C]">Community Feed</option>
                          <option value="analysis" className="bg-[#11083C]">Analysis</option>
                          <option value="saved" className="bg-[#11083C]">Saved Ideas</option>
                        </select>
                      </div>
                      
                      <div className="flex justify-between pt-4">
                        <Button 
                          variant="outline" 
                          className="border-[#A163F7]/30 text-white hover:bg-[#A163F7]/10"
                        >
                          Reset to Default
                        </Button>
                        <Button className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <Card className="border border-[#A163F7]/20 bg-[#11083C]/90 backdrop-blur-md shadow-lg rounded-xl overflow-hidden">
                <CardHeader className="border-b border-[#A163F7]/10 bg-[#11083C]/50">
                  <CardTitle className="text-white text-lg">Accessibility</CardTitle>
                  <CardDescription className="text-[#a09dd2]">
                    Customize accessibility settings
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white">Reduced Motion</Label>
                        <p className="text-xs text-[#a09dd2]">Minimize animations</p>
                      </div>
                      <Switch 
                        id="reduced-motion"
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="text-white">High Contrast Mode</Label>
                        <p className="text-xs text-[#a09dd2]">Improve text visibility</p>
                      </div>
                      <Switch 
                        id="high-contrast"
                        className="data-[state=checked]:bg-[#A163F7]"
                      />
                    </div>
                    <Separator className="bg-[#A163F7]/10" />
                    
                    <div className="space-y-2">
                      <Label className="text-white">Font Size</Label>
                      <select className="w-full rounded-md p-2 border bg-[#0B1437]/50 border-[#A163F7]/20 text-white">
                        <option value="small" className="bg-[#11083C]">Small</option>
                        <option value="medium" className="bg-[#11083C]">Medium</option>
                        <option value="large" className="bg-[#11083C]">Large</option>
                        <option value="xlarge" className="bg-[#11083C]">Extra Large</option>
                      </select>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                      <Button className="bg-gradient-to-r from-[#7551FF] to-[#A163F7] text-white">
                        Save Settings
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          

        </main>
      </div>
    </div>
  );
}