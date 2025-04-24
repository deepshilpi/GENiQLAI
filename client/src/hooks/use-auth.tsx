import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useQuery, useMutation, UseMutationResult } from "@tanstack/react-query";
import { User, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

type LoginCredentials = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<User, Error, LoginCredentials>;
  logoutMutation: UseMutationResult<any, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  updatePlanMutation: UseMutationResult<User, Error, { planType: string }>;
  updateProfilePicture: UseMutationResult<User, Error, FormData>;
  refetchUser: () => Promise<User | null>; // Add direct refetch method
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  
  // Local state to track manual log state to force re-renders
  const [forceAuthUpdate, setForceAuthUpdate] = useState(0);

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user", forceAuthUpdate], // Include forceAuthUpdate in query key
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: Infinity, // Never consider data stale - completely avoid automatic refetching
    retry: 0, // Don't retry on failure - reduces queries
    refetchOnWindowFocus: false, // Don't refetch on window focus
  });

  // Expose refetch method for use elsewhere
  const refetchUser = async () => {
    setForceAuthUpdate(prev => prev + 1); // Force a refetch by updating the state
    const result = await refetch();
    return result.data ?? null;
  };

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      try {
        const res = await apiRequest("POST", "/api/login", credentials);
        const userData = await res.json();
        return userData;
      } catch (err: any) {
        console.error("Login API error:", err);
        throw new Error(err.message || "Login failed");
      }
    },
    onSuccess: (userData) => {
      console.log("Login successful, setting user data:", userData);
      
      // Update user data in the cache
      queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
      
      // Force a rerender of the auth context
      setForceAuthUpdate(prev => prev + 1);
      
      // Immediately refresh data that depends on auth status
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // Close any auth dialogs and redirect
      if (location !== "/") {
        navigate("/");
      }
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Login error:", error);
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, InsertUser>({
    mutationFn: async (credentials) => {
      try {
        const res = await apiRequest("POST", "/api/register", credentials);
        const userData = await res.json();
        return userData;
      } catch (err: any) {
        console.error("Registration API error:", err);
        throw new Error(err.message || "Registration failed");
      }
    },
    onSuccess: (userData) => {
      console.log("Registration successful, setting user data:", userData);
      
      // Update user data in the cache
      queryClient.setQueryData(["/api/user", forceAuthUpdate], userData);
      
      // Force a rerender of the auth context
      setForceAuthUpdate(prev => prev + 1);
      
      // Immediately refresh data that depends on auth status
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // Close any auth dialogs and redirect
      if (location !== "/") {
        navigate("/");
      }
      
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      console.error("Registration error:", error);
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<any, Error, void>({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/logout");
        return true;
      } catch (err: any) {
        console.error("Logout API error:", err);
        throw new Error(err.message || "Logout failed");
      }
    },
    onSuccess: () => {
      // Clear user data
      queryClient.setQueryData(["/api/user", forceAuthUpdate], null);
      
      // Force a rerender of the auth context
      setForceAuthUpdate(prev => prev + 1);
      
      // Reset all auth-dependent queries to their initial state
      queryClient.resetQueries({ 
        predicate: (query) => {
          const queryKey = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return [
            "/api/saved-ideas", 
            "/api/analyses", 
            "/api/posts",
            "/api/notifications"
          ].some(key => String(queryKey).includes(key));
        }
      });
      
      // Use navigation to avoid full page reload
      navigate("/");
      
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error: Error) => {
      console.error("Logout error:", error);
      toast({
        title: "Logout failed",
        description: "There was a problem logging out. Please try again.",
        variant: "destructive",
      });
      
      // Force refetch user data to ensure consistent state
      refetchUser();
    },
  });

  const updatePlanMutation = useMutation<User, Error, { planType: string }>({
    mutationFn: async ({ planType }) => {
      const res = await apiRequest("POST", "/api/user/plan", { planType });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user", forceAuthUpdate], updatedUser);
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Subscription updated",
        description: `Your plan has been upgraded to ${updatedUser.planType}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Subscription update failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateProfilePicture = useMutation<User, Error, FormData>({
    mutationFn: async (formData) => {
      const res = await fetch('/api/profile-picture', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload profile picture');
      }
      
      const responseData = await res.json();
      return responseData.user;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user", forceAuthUpdate], updatedUser);
      setForceAuthUpdate(prev => prev + 1);
      
      toast({
        title: "Profile updated",
        description: "Your profile picture has been updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Profile update failed",
        description: error.message || "Failed to update profile picture. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
        registerMutation,
        updatePlanMutation,
        updateProfilePicture,
        refetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}