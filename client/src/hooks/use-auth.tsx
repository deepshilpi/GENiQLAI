import { createContext, ReactNode, useContext, useEffect } from "react";
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
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<User, Error, InsertUser>;
  updatePlanMutation: UseMutationResult<User, Error, { planType: string }>;
  updateProfilePicture: UseMutationResult<User, Error, FormData>;
  refetchUser: () => Promise<User | null>; // Add direct refetch method
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Force immediate validation and smaller stale time for auth data
  const {
    data: user,
    error,
    isLoading,
    refetch,
  } = useQuery<User | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    staleTime: 10000, // 10 seconds - keep user data fresh
    refetchOnWindowFocus: true, // Refetch when window focuses to ensure auth state is current
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

  // Clean up any stale auth flags when the provider mounts
  useEffect(() => {
    const cleanupOldAuthFlags = () => {
      // Clear any stale auth flags
      if (sessionStorage.getItem('auth_login_success')) {
        console.log("[Auth] Cleaning up stale login success flag");
        sessionStorage.removeItem('auth_login_success');
      }
      
      if (sessionStorage.getItem('auth_logout_requested')) {
        console.log("[Auth] Cleaning up stale logout requested flag");
        sessionStorage.removeItem('auth_logout_requested');
      }
    };
    
    cleanupOldAuthFlags();
  }, []);

  const loginMutation = useMutation<User, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const res = await apiRequest("POST", "/api/login", credentials);
      return await res.json();
    },
    onSuccess: (userData) => {
      // Update the auth data in cache immediately
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.username}!`,
      });
      
      // Force refresh other dependent queries
      queryClient.invalidateQueries();
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
      // Update the auth data in cache immediately
      queryClient.setQueryData(["/api/user"], userData);
      
      // Invalidate the query to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Redirect to home page
      navigate("/");
      
      // Show success message
      toast({
        title: "Registration successful",
        description: `Welcome to GENIQL, ${userData.username}!`,
      });
      
      // Force refresh other dependent queries
      queryClient.invalidateQueries();
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
    onMutate: async () => {
      // Set up optimistic update - clear user data immediately
      // for faster UI response
      await queryClient.cancelQueries({ queryKey: ["/api/user"] });
      
      // Save the previous user value in case we need to roll back
      const previousUser = queryClient.getQueryData<User | null>(["/api/user"]);
      
      // Optimistically update the cache
      queryClient.setQueryData(["/api/user"], null);
      
      return { previousUser };
    },
    onSuccess: () => {
      // Clear user data in cache (again, to ensure consistency)
      queryClient.setQueryData(["/api/user"], null);
      
      // Invalidate all queries to refresh data without user context
      queryClient.invalidateQueries();
      
      // Redirect to login page
      navigate("/auth");
      
      // Show success message
      toast({
        title: "Logged out successfully",
      });
    },
    onError: (error, _, context) => {
      // If there was an error logging out, we don't want to revert the UI
      // as it's better to show logged out state even if the server had issues
      console.error("Logout error:", error);
      
      // Clear user data in cache anyway
      queryClient.setQueryData(["/api/user"], null);
      
      // Redirect to auth page
      navigate("/auth");
      
      toast({
        title: "Logout issue",
        description: "You've been logged out but there was a server error.",
        variant: "destructive",
      });
    },
    onSettled: () => {
      // Refetch auth state after logout is settled
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
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