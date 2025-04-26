import React, { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import Logo from "@/assets/logo";

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

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { user, isLoading, loginMutation, registerMutation } = useAuth();
  const [randomQuote] = useState(
    entrepreneurQuotes[Math.floor(Math.random() * entrepreneurQuotes.length)]
  );
  
  // Form state without react-hook-form
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Get return URL from query params (for use later)
  const queryParams = new URLSearchParams(window.location.search);
  const returnUrl = queryParams.get("returnUrl") || "/";
  
  // Enhanced redirect for logged-in users
  useEffect(() => {
    if (user) {
      console.log("[Auth] User already logged in, redirecting to home page");
      navigate("/");
    }
  }, [user, navigate]);
  
  // Handle login submission
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate(returnUrl);
        },
        onError: (error: Error) => {
          toast({
            title: "Login failed",
            description: error.message || "Please check your credentials and try again",
            variant: "destructive",
          });
        },
      }
    );
  };

  // Handle register submission
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!username || !email || !password) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    registerMutation.mutate(
      { username, email, password },
      {
        onSuccess: () => {
          navigate(returnUrl);
        },
        onError: (error: Error) => {
          toast({
            title: "Registration failed",
            description: error.message || "Please try a different username or email",
            variant: "destructive",
          });
        },
      }
    );
  };
  
  // If user is already logged in or loading, show loading state
  if (user || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#11083c] to-[#0B1437]">
        <Card className="w-[400px] max-w-sm border-purple-500/20 bg-[#1a1045]/40 backdrop-blur-md">
          <CardHeader className="text-center">
            <CardTitle className="text-white">
              {user ? "Redirecting..." : "Loading..."}
            </CardTitle>
            <CardDescription className="text-white/70">
              {user ? "You're already logged in" : "Checking authentication status"}
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
                // Simple login form without React Hook Form
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Username
                    </label>
                    <input
                      id="username"
                      className="flex h-10 w-full rounded-md border border-purple-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1A1349] text-white"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Password
                    </label>
                    <input
                      id="login-password"
                      type="password"
                      className="flex h-10 w-full rounded-md border border-purple-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1A1349] text-white"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
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
              ) : (
                // Simple registration form without React Hook Form
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="reg-username" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Username
                    </label>
                    <input
                      id="reg-username"
                      className="flex h-10 w-full rounded-md border border-purple-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1A1349] text-white"
                      placeholder="Choose a username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-email" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Email
                    </label>
                    <input
                      id="reg-email"
                      type="email"
                      className="flex h-10 w-full rounded-md border border-purple-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1A1349] text-white"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="reg-password" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Password
                    </label>
                    <input
                      id="reg-password"
                      type="password"
                      className="flex h-10 w-full rounded-md border border-purple-500/30 bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-[#1A1349] text-white"
                      placeholder="Choose a password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
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
              )}
              
              <div className="mt-6">
                <div className="relative flex items-center">
                  <div className="flex-grow border-t border-gray-700/30"></div>
                  <span className="mx-4 flex-shrink text-gray-500">Or continue with</span>
                  <div className="flex-grow border-t border-gray-700/30"></div>
                </div>
                
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-700 text-gray-300 hover:text-white hover:bg-gray-800/30"
                    disabled
                  >
                    <svg className="h-5 w-5 mr-2 text-red-500" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.283 10.356h-8.327v3.451h4.792c-.446 2.193-2.313 3.453-4.792 3.453a5.27 5.27 0 0 1-5.279-5.28 5.27 5.27 0 0 1 5.279-5.279c1.259 0 2.397.447 3.29 1.178l2.6-2.599c-1.584-1.381-3.615-2.233-5.89-2.233a8.908 8.908 0 0 0-8.934 8.934 8.907 8.907 0 0 0 8.934 8.934c4.467 0 8.529-3.249 8.529-8.934 0-.528-.081-1.097-.202-1.625z"></path>
                    </svg>
                    Sign in with Google (Coming Soon)
                  </Button>
                </div>
                
                <div className="mt-6 text-center">
                  {isLogin ? (
                    <p className="text-sm text-gray-300">
                      Don't have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(false);
                          setUsername("");
                          setPassword("");
                          setEmail("");
                        }}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Sign up
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-300">
                      Already have an account?{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setIsLogin(true);
                          setUsername("");
                          setPassword("");
                          setEmail("");
                        }}
                        className="text-purple-400 hover:text-purple-300 font-medium"
                      >
                        Sign in
                      </button>
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      {/* Right Column - Clean, attractive design with background image */}
      <div className="hidden md:flex md:w-1/2 relative overflow-hidden">
        {/* Background image with overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center" 
          style={{ 
            backgroundImage: "url('https://images.pexels.com/photos/1181244/pexels-photo-1181244.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1')",
            filter: "brightness(0.3)"
          }}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B1437]/90 to-[#11083c]/80" />
        
        {/* Content container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full p-8 text-center"
        >
          {/* Logo */}
          <div className="mb-4">
            <Logo width={80} height={80} className="mx-auto" />
          </div>
          
          {/* Brand name */}
          <h1 className="text-5xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-[#A163F7] to-[#7551FF]">
            GENIQL
          </h1>
          
          {/* Short description */}
          <p className="text-gray-300 text-lg max-w-md mx-auto mb-12">
            AI-powered startup analysis to transform your business ideas into success
          </p>
          
          {/* Quote card */}
          <div className="relative w-full max-w-md mb-8">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#A163F7]/20 to-[#7551FF]/20 backdrop-blur-sm -m-2 transform rotate-1"></div>
            <div className="relative bg-[#1a1045]/60 border border-purple-500/40 p-6 rounded-xl shadow-xl backdrop-blur-sm">
              <p className="text-xl italic mb-4 text-white">{randomQuote.quote}</p>
              <div className="flex items-center justify-center">
                <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                  <img 
                    src={randomQuote.image} 
                    alt={randomQuote.author} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-white">{randomQuote.author}</p>
                  <p className="text-xs text-gray-400">{randomQuote.company}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}