import { useState, useEffect, useContext } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthContext } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Form validation schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters")
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

interface AuthDialogProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: "login" | "register";
  returnTo?: string;
}

export function AuthDialog({ isOpen, onClose, defaultTab = "login", returnTo }: AuthDialogProps) {
  const [activeTab, setActiveTab] = useState<"login" | "register">(defaultTab);
  const [location, navigate] = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const loginMutation = auth?.loginMutation;
  const registerMutation = auth?.registerMutation;
  const { toast } = useToast();

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: ""
    }
  });

  // Register form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  // If user becomes authenticated, close dialog and redirect if needed
  useEffect(() => {
    if (user && isOpen) {
      // Add a slight delay to ensure any state updates have completed
      setTimeout(() => {
        onClose();
        if (returnTo) {
          navigate(returnTo);
        }
      }, 300);
    }
  }, [user, isOpen, onClose, navigate, returnTo]);

  // Reset active tab when dialog opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      if (!loginMutation) {
        console.error("Login error: AuthContext or loginMutation is not available");
        toast({
          title: "Login Error",
          description: "Authentication service is not available. Please try refreshing the page.",
          variant: "destructive"
        });
        return;
      }
      
      await loginMutation.mutateAsync({
        username: data.username,
        password: data.password
      });
      toast({
        title: "Login Successful",
        description: "Welcome back!",
        variant: "default"
      });
    } catch (error) {
      // Error is already handled by the mutation's onError
      console.error("Login error caught:", error);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    try {
      if (!registerMutation) {
        toast({
          title: "Registration Error",
          description: "Authentication service is not available",
          variant: "destructive"
        });
        return;
      }
      
      await registerMutation.mutateAsync({
        username: data.username,
        email: data.email,
        password: data.password
      });
      toast({
        title: "Registration Successful",
        description: "Your account has been created",
        variant: "default"
      });
    } catch (error) {
      // Error is already handled by the mutation's onError
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="vision-card max-w-md border-vision-purple-200/10">
        <DialogHeader>
          <DialogTitle className="text-xl text-white font-bold text-center">
            {activeTab === "login" ? "Welcome back" : "Create an account"}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "register")} className="mt-2">
          <TabsList className="grid grid-cols-2 bg-vision-card-dark">
            <TabsTrigger value="login" className="data-[state=active]:bg-vision-purple-700/30">Login</TabsTrigger>
            <TabsTrigger value="register" className="data-[state=active]:bg-vision-purple-700/30">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="mt-4">
            <Form {...loginForm}>
              <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                <FormField
                  control={loginForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          autoComplete="username"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a password" 
                          autoComplete="current-password"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-vision-primary-gradient hover:brightness-110 transition-all"
                  disabled={loginMutation?.isPending}
                >
                  {loginMutation?.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="register" className="mt-4">
            <Form {...registerForm}>
              <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                <FormField
                  control={registerForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Username</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Choose a username" 
                          autoComplete="username"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Email</FormLabel>
                      <FormControl>
                        <Input 
                          type="email"
                          placeholder="Enter your email" 
                          autoComplete="email"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Create a password" 
                          autoComplete="new-password"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={registerForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white">Confirm Password</FormLabel>
                      <FormControl>
                        <Input 
                          type="password" 
                          placeholder="Confirm your password" 
                          autoComplete="new-password"
                          className="bg-transparent text-white border-vision-purple-200/20 placeholder:text-white/40" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full bg-vision-primary-gradient hover:brightness-110 transition-all"
                  disabled={registerMutation?.isPending}
                >
                  {registerMutation?.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}