import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { BrainCircuit, BarChart3, MessageSquare, Settings } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { insertUserSchema } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();

  // Get the return URL from the query string if present
  const searchParams = new URLSearchParams(window.location.search);
  const returnTo = searchParams.get('returnTo') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(returnTo);
    }
  }, [user, navigate, returnTo]);

  // Registration form
  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onRegisterSubmit = (values: z.infer<typeof insertUserSchema>) => {
    registerMutation.mutate(values);
  };

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-vision-bg flex overflow-hidden">
      {/* Left column - Auth forms */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 flex items-center justify-center">
                <img src="/src/assets/logo.svg" alt="GENIQL Logo" className="w-full h-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">GENIQL</h1>
            <p className="text-white/70">
              Sign in to start analyzing your startup ideas
            </p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6 bg-vision-card/50 p-1">
              <TabsTrigger value="login" className="text-white data-[state=active]:bg-vision-primary-gradient data-[state=active]:text-white">Login</TabsTrigger>
              <TabsTrigger value="register" className="text-white data-[state=active]:bg-vision-primary-gradient data-[state=active]:text-white">Register</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <div className="vision-card p-6">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={loginForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Your username" 
                              {...field}
                              className="bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500" 
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Your password"
                              {...field}
                              className="bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium mt-2"
                      disabled={loginMutation.isPending}
                    >
                      {loginMutation.isPending ? "Logging in..." : "Login"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <div className="vision-card p-6">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                    className="space-y-5"
                  >
                    <FormField
                      control={registerForm.control}
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Username</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Choose a username" 
                              {...field} 
                              className="bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Email</FormLabel>
                          <FormControl>
                            <Input
                              type="email"
                              placeholder="Your email address"
                              {...field}
                              className="bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={registerForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Password</FormLabel>
                          <FormControl>
                            <Input
                              type="password"
                              placeholder="Create a password"
                              {...field}
                              className="bg-vision-card/80 border-vision-purple-200/20 text-white placeholder:text-white/40 focus:border-vision-purple-500"
                            />
                          </FormControl>
                          <FormDescription className="text-white/50">
                            Must be at least 6 characters
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full bg-vision-primary-gradient hover:brightness-110 transition-all text-white font-medium mt-2"
                      disabled={registerMutation.isPending}
                    >
                      {registerMutation.isPending
                        ? "Creating account..."
                        : "Create Account"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Right column - Hero section */}
      <div className="hidden lg:flex flex-1 bg-vision-card/30 backdrop-blur-sm items-center justify-center p-8">
        <div className="max-w-lg text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 flex items-center justify-center">
              <img src="/src/assets/logo.svg" alt="GENIQL Logo" className="w-full h-full" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-white">GENIQL</h1>
          <p className="text-xl mb-8 text-white/80">
            Generative Execution Network for Intelligent Query Learning
          </p>
          <div className="space-y-8 text-left">
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-vision-primary-gradient/20 flex-shrink-0 flex items-center justify-center mr-4">
                <BarChart3 className="w-5 h-5 text-vision-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">AI-Powered Analysis</h3>
                <p className="text-white/60">
                  Get comprehensive analysis of your startup idea across 8 critical dimensions
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-vision-primary-gradient/20 flex-shrink-0 flex items-center justify-center mr-4">
                <MessageSquare className="w-5 h-5 text-vision-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Entrepreneur Community</h3>
                <p className="text-white/60">
                  Connect with like-minded founders, share ideas, and vote on posts
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="w-10 h-10 rounded-lg bg-vision-primary-gradient/20 flex-shrink-0 flex items-center justify-center mr-4">
                <Settings className="w-5 h-5 text-vision-purple-700" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">Execution Planning</h3>
                <p className="text-white/60">
                  Get budget breakdowns, roadmaps, and investor matching with premium plans
                </p>
              </div>
            </div>
          </div>
          
          {/* Glowing bottom effect */}
          <div className="relative mt-12">
            <div 
              className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-3/4 h-20" 
              style={{
                background: "radial-gradient(ellipse at center, rgba(161, 99, 247, 0.15) 0%, rgba(161, 99, 247, 0) 70%)",
                filter: "blur(20px)"
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
