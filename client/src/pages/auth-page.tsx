import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Auth form schemas
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // If user is already logged in, redirect to home
  if (user) {
    navigate("/");
    return null;
  }

  // Get return URL from query params (if any)
  const queryParams = new URLSearchParams(window.location.search);
  const returnUrl = queryParams.get("returnUrl") || "/";
  
  // Login form setup
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Register form setup
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        navigate(returnUrl);
      }
    });
  };

  // Handle register submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        navigate(returnUrl);
      }
    });
  };

  return (
    <div 
      className="flex min-h-screen bg-gradient-to-br from-[#11083c] to-[#0B1437] text-white"
    >
      {/* Left Column - Auth Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center px-4 py-10 relative">
        <Link href="/" className="absolute top-6 left-6">
          <Button variant="ghost" size="icon">
            <X className="h-6 w-6" />
          </Button>
        </Link>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="bg-[#1a1045]/40 backdrop-blur-xl border-purple-500/20 shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {isLogin ? "Welcome back" : "Create an account"}
              </CardTitle>
              <CardDescription className="text-center text-gray-300">
                {isLogin 
                  ? "Sign in to your account to continue" 
                  : "Join GENIQL to analyze your startup ideas"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLogin ? (
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your username" 
                              className="bg-[#25135a]/40 border-[#6f42c1]/30" 
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Enter your password" 
                              className="bg-[#25135a]/40 border-[#6f42c1]/30" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#7551FF] to-[#A163F7] hover:opacity-90"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                      ) : (
                        "Sign in"
                      )}
                    </Button>
                  </form>
                </Form>
              ) : (
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              className="bg-[#25135a]/40 border-[#6f42c1]/30" 
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
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="Enter your email" 
                              className="bg-[#25135a]/40 border-[#6f42c1]/30" 
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
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input 
                              type="password" 
                              placeholder="Create a password" 
                              className="bg-[#25135a]/40 border-[#6f42c1]/30" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full bg-gradient-to-r from-[#7551FF] to-[#A163F7] hover:opacity-90"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating account...</>
                      ) : (
                        "Create account"
                      )}
                    </Button>
                  </form>
                </Form>
              )}
              
              {/* Google Sign In placeholder - will be updated when credentials are provided */}
              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-[#1a1045] px-2 text-gray-400">Or continue with</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button 
                    variant="outline" 
                    className="w-full bg-transparent border-gray-600 hover:bg-gray-800/50 text-white"
                    disabled={true}
                  >
                    <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Sign in with Google (Coming Soon)
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <div className="text-sm text-center w-full text-gray-400">
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <button 
                      className="text-[#A163F7] hover:underline"
                      onClick={() => setIsLogin(false)}
                    >
                      Register
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button 
                      className="text-[#A163F7] hover:underline"
                      onClick={() => setIsLogin(true)}
                    >
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>

      {/* Right Column - Hero Image/Text (hidden on mobile) */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-r from-[#190f42] to-[#150c3b] flex-col justify-center items-center p-10">
        <div className="max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
              GENIQL Startup Analysis
            </h1>
            <p className="text-xl mb-6 text-gray-300">
              Get comprehensive analysis for your startup ideas with our AI-powered platform.
            </p>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="rounded-full bg-purple-800/30 p-2 mr-4">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">In-depth SWOT Analysis</h3>
                  <p className="text-gray-400">Detailed breakdown of strengths, weaknesses, opportunities and threats</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-purple-800/30 p-2 mr-4">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Market Size Estimation</h3>
                  <p className="text-gray-400">Real-time data to understand your addressable market</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="rounded-full bg-purple-800/30 p-2 mr-4">
                  <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-white">Funding Requirement Analysis</h3>
                  <p className="text-gray-400">Accurate estimations for how much capital you need</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}