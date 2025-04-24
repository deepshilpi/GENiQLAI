import { useState, useRef } from "react";
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
  Moon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  
  // File input reference for profile picture uploads
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Update password mutation
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: { currentPassword: string; newPassword: string }) => {
      await apiRequest("PATCH", "/api/user/password", data);
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
  
  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md max-w-md mx-auto">
                <CardHeader>
                  <CardTitle className="text-white">Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Please log in to access your settings
                  </CardDescription>
                </CardHeader>
                <CardFooter>
                  <Button className="w-full" onClick={() => window.location.href = "/auth"}>
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
              <h1 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-2">
                <User className="hidden sm:inline-block h-5 w-5 text-primary" />
                Account Settings
              </h1>
              <p className="text-sm text-muted-foreground">Manage your profile, security, and preferences</p>
            </div>
            
            <Button 
              variant="destructive"
              size="sm"
              className="bg-red-600 hover:bg-red-700"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
          
          {/* Tabs - Improved for mobile */}
          <Tabs defaultValue="profile" className="w-full">
            <div className="relative mb-6 overflow-hidden">
              <ScrollArea className="w-full">
                <TabsList className="bg-vision-card/90 backdrop-blur-md border-vision-purple-200/20 w-auto min-w-full inline-flex rounded-lg shadow-lg">
                  <TabsTrigger value="profile" className="py-3 px-4 whitespace-nowrap">
                    <User className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">Profile</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="py-3 px-4 whitespace-nowrap">
                    <Shield className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Security</span>
                    <span className="sm:hidden">Security</span>
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="py-3 px-4 whitespace-nowrap">
                    <Bell className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Notifications</span>
                    <span className="sm:hidden">Alerts</span>
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="py-3 px-4 whitespace-nowrap">
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
              {/* Profile Picture Card */}
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                <CardContent className="p-6">
                  <div className="flex flex-col sm:flex-row items-center gap-6">
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-36 h-36 rounded-full bg-vision-purple-100/5 flex items-center justify-center overflow-hidden border-2 border-vision-purple-200/30">
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
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-vision-purple-200/20 text-white hover:border-primary"
                          onClick={triggerFileUpload}
                        >
                          Select Image
                        </Button>
                        <Button
                          size="sm"
                          onClick={handleProfilePictureUpload}
                          disabled={!selectedFile || updateProfilePicture.isPending}
                        >
                          {updateProfilePicture.isPending ? "Uploading..." : "Upload"}
                        </Button>
                      </div>
                      {selectedFile && (
                        <p className="text-xs text-white/70">
                          Selected: {selectedFile.name}
                        </p>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <h3 className="text-lg font-medium text-white">{user.username}</h3>
                      <p className="text-sm text-white/70">{user.bio || "No bio available"}</p>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">{user.followersCount || 0}</p>
                          <p className="text-xs text-white/50">Followers</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">{user.followingCount || 0}</p>
                          <p className="text-xs text-white/50">Following</p>
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-medium text-white">0</p>
                          <p className="text-xs text-white/50">Posts</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                  {/* Basic Info Card */}
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Basic Information</CardTitle>
                      <CardDescription className="text-white/70">
                        Manage your personal information
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="username" className="text-white">Username</Label>
                          <Input 
                            id="username" 
                            value={user.username}
                            disabled
                            className="bg-transparent border-vision-purple-200/20 text-white/90 placeholder:text-white/40"
                          />
                          <p className="text-xs text-white/50">Username cannot be changed</p>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-white">Email</Label>
                          <div className="flex space-x-2">
                            <Input 
                              id="email" 
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="bg-transparent border-vision-purple-200/20 text-white/90 flex-1 placeholder:text-white/40"
                            />
                            <Button 
                              onClick={handleEmailUpdate}
                              disabled={updateEmailMutation.isPending}
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
                          placeholder="Tell us about yourself"
                          defaultValue={user.bio || ""}
                          rows={4}
                          className="bg-transparent border-vision-purple-200/20 text-white/90 placeholder:text-white/40"
                        />
                        <div className="flex justify-end">
                          <Button>Save Bio</Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Account Summary Card */}
                <div>
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Account Summary</CardTitle>
                      <CardDescription className="text-white/70">
                        Overview of your account status
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/70">Plan</div>
                        <Badge className="bg-vision-primary-gradient text-white">
                          {user.planType || "Free"}
                        </Badge>
                      </div>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/70">Member Since</div>
                        <div className="text-sm text-white">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/70">Posts</div>
                        <div className="text-sm text-white">
                          0
                        </div>
                      </div>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/70">Followers</div>
                        <div className="text-sm text-white">
                          {user.followersCount || 0}
                        </div>
                      </div>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-white/70">Following</div>
                        <div className="text-sm text-white">
                          {user.followingCount || 0}
                        </div>
                      </div>
                      
                      <div className="pt-4">
                        <Button variant="outline" className="w-full border-vision-purple-200/20 text-white hover:border-primary">
                          <Trash2 className="h-4 w-4 mr-2 text-red-500" />
                          Delete Account
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Security Tab */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Change Password</CardTitle>
                      <CardDescription className="text-white/70">
                        Update your password to keep your account secure
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password" className="text-white">Current Password</Label>
                        <div className="relative">
                          <Input 
                            id="current-password" 
                            type={showCurrentPassword ? "text" : "password"}
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="bg-transparent border-vision-purple-200/20 text-white/90 pr-10 placeholder:text-white/40"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          >
                            {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="new-password" className="text-white">New Password</Label>
                        <div className="relative">
                          <Input 
                            id="new-password" 
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="bg-transparent border-vision-purple-200/20 text-white/90 pr-10 placeholder:text-white/40"
                          />
                          <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                          >
                            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-white/50">Password must be at least 8 characters long</p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password" className="text-white">Confirm New Password</Label>
                        <Input 
                          id="confirm-password" 
                          type="password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="bg-transparent border-vision-purple-200/20 text-white/90 placeholder:text-white/40"
                        />
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <Button 
                        onClick={handlePasswordUpdate}
                        disabled={updatePasswordMutation.isPending}
                      >
                        {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                <div>
                  <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-white text-xl">Security Status</CardTitle>
                      <CardDescription className="text-white/70">
                        Overview of your account security
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/20 w-8 h-8 rounded-full flex items-center justify-center">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Password Strength</p>
                          <p className="text-xs text-white/50">Your password is secure</p>
                        </div>
                      </div>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-500/20 w-8 h-8 rounded-full flex items-center justify-center">
                          <Key className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Two-Factor Authentication</p>
                          <p className="text-xs text-white/50">Not enabled</p>
                        </div>
                      </div>
                      
                      <Button variant="secondary" className="w-full mt-2">
                        Enable 2FA
                      </Button>
                      
                      <Separator className="bg-vision-purple-200/10" />
                      
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-white">Recent Login Activity</p>
                        <div className="bg-vision-purple-100/5 rounded-lg p-3">
                          <p className="text-xs text-white font-medium">Today at 7:15 AM</p>
                          <p className="text-xs text-white/50">New York, United States</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-0 space-y-6">
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Notification Preferences</CardTitle>
                  <CardDescription className="text-white/70">
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-white/70" />
                          <Label className="text-white">Email Notifications</Label>
                        </div>
                        <p className="text-xs text-white/50">Receive emails about important updates and activity</p>
                      </div>
                      <Switch 
                        checked={notificationsEmail} 
                        onCheckedChange={setNotificationsEmail} 
                      />
                    </div>
                    
                    <Separator className="bg-vision-purple-200/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <BellRing className="h-4 w-4 mr-2 text-white/70" />
                          <Label className="text-white">In-App Notifications</Label>
                        </div>
                        <p className="text-xs text-white/50">Show notifications within the application</p>
                      </div>
                      <Switch 
                        checked={notificationsApp} 
                        onCheckedChange={setNotificationsApp} 
                      />
                    </div>
                    
                    <Separator className="bg-vision-purple-200/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <MessageSquare className="h-4 w-4 mr-2 text-white/70" />
                          <Label className="text-white">Community Updates</Label>
                        </div>
                        <p className="text-xs text-white/50">Receive notifications about community posts and comments</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    
                    <Separator className="bg-vision-purple-200/10" />
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <UserPlus className="h-4 w-4 mr-2 text-white/70" />
                          <Label className="text-white">New Followers</Label>
                        </div>
                        <p className="text-xs text-white/50">Get notified when someone follows you</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button 
                    onClick={handleNotificationsUpdate}
                    disabled={updateNotificationsMutation.isPending}
                  >
                    {updateNotificationsMutation.isPending ? "Saving..." : "Save Preferences"}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            {/* Preferences Tab */}
            <TabsContent value="preferences" className="mt-0 space-y-6">
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Display Settings</CardTitle>
                  <CardDescription className="text-white/70">
                    Customize your application experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <div className="flex items-center">
                          <Moon className="h-4 w-4 mr-2 text-white/70" />
                          <Label className="text-white">Dark Mode</Label>
                        </div>
                        <p className="text-xs text-white/50">Use dark theme for the application</p>
                      </div>
                      <Switch 
                        checked={darkMode} 
                        onCheckedChange={setDarkMode} 
                      />
                    </div>
                    
                    <Separator className="bg-vision-purple-200/10" />
                    
                    <div className="space-y-2">
                      <Label htmlFor="language" className="text-white flex items-center">
                        <Languages className="h-4 w-4 mr-2 text-white/70" />
                        Language
                      </Label>
                      <div className="flex space-x-2">
                        <Input 
                          id="language"
                          value="English"
                          disabled
                          className="bg-transparent border-vision-purple-200/20 text-white/90 flex-1 placeholder:text-white/40"
                        />
                        <Button variant="outline" className="border-vision-purple-200/20 text-white">
                          Change
                        </Button>
                      </div>
                      <p className="text-xs text-white/50">Additional languages coming soon</p>
                    </div>
                    
                    <Separator className="bg-vision-purple-200/10" />
                    
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Download className="h-4 w-4 mr-2 text-white/70" />
                        <Label className="text-white">Data Export</Label>
                      </div>
                      <p className="text-xs text-white/50 mb-2">Download all your data and analyses</p>
                      <Button variant="outline" className="border-vision-purple-200/20 text-white">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-vision-purple-200/20 bg-vision-card/90 backdrop-blur-md shadow-lg">
                <CardHeader>
                  <CardTitle className="text-white text-xl">Help & Support</CardTitle>
                  <CardDescription className="text-white/70">
                    Get help with using the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="h-4 w-4 text-white/70" />
                      <p className="text-sm font-medium text-white">Need help with GENIQL?</p>
                    </div>
                    <p className="text-sm text-white/70">
                      Our support team is here to help you with any questions or issues you may have.
                    </p>
                    <div className="space-x-2 pt-2">
                      <Button variant="outline" className="border-vision-purple-200/20 text-white">
                        Documentation
                      </Button>
                      <Button>
                        Contact Support
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