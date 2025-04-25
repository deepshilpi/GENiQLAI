import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AuthInput } from "@/components/auth-input";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, X, Quote as QuoteIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Entrepreneur quotes with their images for the right column
const entrepreneurQuotes = [
  {
    quote: "Your work is going to fill a large part of your life, and the only way to be truly satisfied is to do what you believe is great work.",
    author: "Steve Jobs",
    company: "Apple",
    image: "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    quote: "The biggest risk is not taking any risk. In a world that's changing quickly, the only strategy that is guaranteed to fail is not taking risks.",
    author: "Mark Zuckerberg",
    company: "Meta",
    image: "https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    quote: "If you are not embarrassed by the first version of your product, you've launched too late.",
    author: "Reid Hoffman",
    company: "LinkedIn",
    image: "https://images.pexels.com/photos/1181345/pexels-photo-1181345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney",
    company: "Disney",
    image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  },
  {
    quote: "Your most unhappy customers are your greatest source of learning.",
    author: "Bill Gates",
    company: "Microsoft",
    image: "https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
  }
];

// Simplified auth form schemas with better error messages
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
  // The order of hooks declaration matters! Don't change it
  const [isLogin, setIsLogin] = useState(true);
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [randomQuote] = useState(
    entrepreneurQuotes[Math.floor(Math.random() * entrepreneurQuotes.length)]
  );
  
  // Get return URL from query params (for use later)
  const queryParams = new URLSearchParams(window.location.search);
  const returnUrl = queryParams.get("returnUrl") || "/";
  
  // Login form setup with validation only on submit
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onSubmit", // Only validate when the form is submitted
    reValidateMode: "onSubmit",
  });

  // Register form setup with validation only on submit
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
    mode: "onSubmit", // Only validate when the form is submitted
    reValidateMode: "onSubmit",
  });
  
  // Enhanced redirect for logged-in users with useEffect to avoid state update during render
  useEffect(() => {
    if (user) {
      console.log("[Auth] User already logged in, redirecting to home page");
      
      // Clean up any auth flags that might be lingering
      sessionStorage.removeItem('auth_login_success');
      sessionStorage.removeItem('auth_logout_requested');
      
      // Use setTimeout to ensure this happens after render
      setTimeout(() => {
        navigate("/");
      }, 0);
    }
  }, [user, navigate]);
  
  // Handle login submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data, {
      onSuccess: () => {
        // Set a session flag to indicate successful login for post-redirect detection
        sessionStorage.setItem('auth_login_success', 'true');
        
        // Add a delay before navigating to ensure the flag is set
        setTimeout(() => {
          navigate(returnUrl);
        }, 100);
      }
    });
  };

  // Handle register submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data, {
      onSuccess: () => {
        // Set a session flag to indicate successful registration/login for post-redirect detection
        sessionStorage.setItem('auth_login_success', 'true');
        
        // Add a delay before navigating to ensure the flag is set
        setTimeout(() => {
          navigate(returnUrl);
        }, 100);
      }
    });
  };
  
  // If user is already logged in, show loading state
  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#11083c] to-[#0B1437]">
        <Card className="w-[400px] max-w-sm border-purple-500/20 bg-[#1a1045]/40 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Redirecting...</CardTitle>
            <CardDescription className="text-white/70">
              You're already logged in
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#11083c] to-[#0B1437]">
        <Card className="w-[400px] max-w-sm border-purple-500/20 bg-[#1a1045]/40 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">Loading...</CardTitle>
            <CardDescription className="text-white/70">
              Checking authentication status
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#11083c] to-[#0B1437] text-white">
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
                            <AuthInput 
                              placeholder="Enter your username" 
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              onValueChange={(value) => {
                                // This helps ensure the field value is updated
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {/* Only show errors after form submission */}
                          {loginForm.formState.submitCount > 0 && <FormMessage />}
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
                            <AuthInput 
                              type="password" 
                              placeholder="Enter your password" 
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              onValueChange={(value) => {
                                // This helps ensure the field value is updated
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {/* Only show errors after form submission */}
                          {loginForm.formState.submitCount > 0 && <FormMessage />}
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
                            <AuthInput 
                              placeholder="Choose a username" 
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              onValueChange={(value) => {
                                // This helps ensure the field value is updated
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {/* Only show errors after form submission */}
                          {registerForm.formState.submitCount > 0 && <FormMessage />}
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
                            <AuthInput 
                              type="email" 
                              placeholder="Enter your email" 
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              onValueChange={(value) => {
                                // This helps ensure the field value is updated
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {/* Only show errors after form submission */}
                          {registerForm.formState.submitCount > 0 && <FormMessage />}
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
                            <AuthInput 
                              type="password" 
                              placeholder="Create a password" 
                              value={field.value}
                              onChange={field.onChange}
                              onBlur={field.onBlur}
                              name={field.name}
                              onValueChange={(value) => {
                                // This helps ensure the field value is updated
                                field.onChange(value);
                              }}
                            />
                          </FormControl>
                          {/* Only show errors after form submission */}
                          {registerForm.formState.submitCount > 0 && <FormMessage />}
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
          
          {/* Mobile Quote Section (only visible on mobile) */}
          <div className="mt-8 md:hidden w-full p-4 bg-[#1a1045]/40 backdrop-blur-sm rounded-xl border border-purple-500/20">
            <div className="flex items-start mb-4">
              <QuoteIcon className="h-5 w-5 text-purple-400 mr-3 shrink-0 mt-1" />
              <p className="text-base text-white italic">"{randomQuote.quote}"</p>
            </div>
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm font-bold text-purple-300">{randomQuote.author}</p>
                <p className="text-xs text-gray-400">{randomQuote.company}</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right Column - Entrepreneur Quote with Background (hidden on mobile) */}
      <div 
        className="hidden md:flex md:w-1/2 flex-col justify-center items-center p-10 relative overflow-hidden"
        style={{
          backgroundImage: `linear-gradient(rgba(17, 8, 60, 0.85), rgba(21, 12, 59, 0.9)), url('${randomQuote.image}')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Subtle overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#190f42]/60 to-[#150c3b]/70 backdrop-blur-sm"></div>
        
        <div className="max-w-lg z-10 relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="p-6 rounded-xl bg-black/20 backdrop-blur-md border border-purple-500/20"
          >
            <QuoteIcon className="h-8 w-8 text-purple-400 mb-4 opacity-80" />
            
            <h2 className="text-2xl font-medium mb-6 text-white leading-relaxed">
              "{randomQuote.quote}"
            </h2>
            
            <div className="mt-6">
              <p className="text-xl font-bold text-purple-300">{randomQuote.author}</p>
              <p className="text-gray-400">{randomQuote.company}</p>
            </div>
            
            <div className="mt-8 pt-6 border-t border-purple-500/20">
              <h3 className="text-xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-purple-200">
                GENIQL Startup Analysis
              </h3>
              <p className="text-gray-300 mb-4">
                Join thousands of entrepreneurs using our AI-powered platform to validate and refine their startup ideas.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}