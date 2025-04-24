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

  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    // Use a proper query function that handles auth errors correctly
    queryFn: async () => {
      try {
        const res = await fetch('/api/user', {
          credentials: 'include'
        });
        
        // Handle 401 by returning null (user not logged in)
        if (res.status === 401) {
          return null;
        }
        
        // For other errors, throw
        if (!res.ok) {
          throw new Error(`Authentication error: ${res.statusText}`);
        }
        
        // Return the user data
        return await res.json();
      } catch (error) {
        // Just return null on any error - we'll handle this as "not logged in"
        return null;
      }
    },
    // Simple settings that work well
    staleTime: 60000, // 1 minute
    retry: false,     // Don't retry auth failures
    refetchOnWindowFocus: true
  });

  // Simple refetch method that just calls the query's refetch
  const refetchUser = async (): Promise<User | null> => {
    try {
      const result = await refetch();
      return result.data as User | null;
    } catch {
      return null;
    }
  };

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation<User, Error, InsertUser>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/register", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache
      queryClient.setQueryData(["/api/user"], userData);
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Could not create account. Please try again.",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      // Clear user data in cache
      queryClient.setQueryData(["/api/user"], null);
      
      // Redirect to login page
      navigate("/auth");
      
      // Show success message
      toast({
        title: "Logged out successfully",
      });
    },
    onError: () => {
      // Even if the server call fails, we'll clear the user from the client
      queryClient.setQueryData(["/api/user"], null);
      navigate("/auth");
      
      toast({
        title: "Logout issue",
        description: "You've been logged out but there was a server error.",
        variant: "destructive",
      });
    },
  });

  const updatePlanMutation = useMutation<User, Error, { planType: string }>({
    mutationFn: async ({ planType }) => {
      const res = await apiRequest("POST", "/api/user/plan", { planType });
      return await res.json();
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["/api/user"], updatedUser);
      
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
      queryClient.setQueryData(["/api/user"], updatedUser);
      
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