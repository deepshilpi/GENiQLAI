import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let errorText = res.statusText;
    try {
      // Try to parse the error as JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorBody = await res.json();
        errorText = errorBody.message || JSON.stringify(errorBody);
      } else {
        errorText = await res.text() || res.statusText;
      }
    } catch (e) {
      // Don't re-throw or log this error as it's already being handled
      errorText = res.statusText || "Unknown error";
    }
    
    // Create an error with additional properties for better debugging
    const error: any = new Error(errorText);
    error.status = res.status;
    error.statusText = res.statusText;
    error.url = res.url;
    
    throw error;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add timestamp to auth-related endpoints to prevent caching
  const finalUrl = url.includes("/api/login") || url.includes("/api/logout") || url.includes("/api/user") || url.includes("/api/register")
    ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
    : url;
    
  const res = await fetch(finalUrl, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      // Add cache control headers for all auth-related requests
      ...(url.includes("/api/login") || url.includes("/api/logout") || url.includes("/api/user") || url.includes("/api/register") 
        ? {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          } 
        : {})
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Extract the URL from the query key (first element is always the URL)
    const url = queryKey[0] as string;
    
    // Add timestamp to auth-related endpoints to prevent caching issues
    const finalUrl = url.includes("/api/user")
      ? `${url}${url.includes('?') ? '&' : '?'}_t=${Date.now()}`
      : url;
    
    // Only log auth requests when debugging is needed
    const isAuthRequest = url.includes("/api/user");
    if (isAuthRequest && queryKey.length > 1) {
      // Only log non-standard auth requests for debugging (those with additional params)
      console.log(`[Auth] Fetching user data with queryKey:`, queryKey);
    }
    
    try {
      const res = await fetch(finalUrl, {
        credentials: "include",
        // Add cache busting for auth-related endpoints to prevent browser caching
        headers: isAuthRequest ? {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        } : {}
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        // Don't log every 401 error as it's expected behavior when not logged in
        return null;
      }
  
      await throwIfResNotOk(res);
      
      const data = await res.json();
      
      // Only log successful auth responses for debugging
      if (isAuthRequest && data && 'username' in data) {
        console.log(`[Auth] User fetch successful:`, data.username);
      }
      
      return data;
    } catch (error: any) {
      // For auth requests, we want to handle errors differently
      if (isAuthRequest) {
        console.error(`[Auth] Error fetching user:`, error);
        
        // For 401s with returnNull behavior, we should return null
        if (unauthorizedBehavior === "returnNull" && error.status === 401) {
          return null;
        }
      }
      
      // Re-throw the error for the caller to handle
      throw error;
    }
  };

// Silent error handler for React Query - we handle errors in the components
// This prevents unhandled promise rejections in the console
const silentErrorHandler = () => {
  // Intentionally empty - errors are handled at component level
};

// Enhanced QueryClient configuration for better performance and caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable automatic refetching on window focus for better performance
      refetchOnMount: 'always', // Always refetch when component mounts for consistency
      staleTime: 30000, // Keep data fresh for 30 seconds before refetching
      retry: (failureCount, error: any) => {
        // Don't retry on 401 or 403 errors
        if (error.status === 401 || error.status === 403) {
          return false;
        }
        // Only retry other errors once
        return failureCount < 1;
      },
      retryDelay: 2000, // Wait 2 seconds before retry
      gcTime: 1000 * 60 * 60, // Keep unused data in the cache for 1 hour
    },
    mutations: {
      retry: false, // No automatic retries for mutations (handled manually in auth system)
      onError: silentErrorHandler
    },
  },
});
