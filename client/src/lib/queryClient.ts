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
      console.error("Error parsing error response:", e);
      errorText = await res.text() || res.statusText;
    }
    throw new Error(errorText);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
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
    
    // Log the query being made for debugging purposes
    console.log(`Making query request to: ${url}, queryKey:`, queryKey);
    
    const res = await fetch(url, {
      credentials: "include",
      // Add cache busting for auth-related endpoints to prevent browser caching
      headers: url.includes("/api/user") ? {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      } : {}
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      console.log(`Query to ${url} returned 401, handling with returnNull`);
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

// Enhanced QueryClient configuration for better performance and caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false, // Disable refetching on window focus to avoid delays
      staleTime: Infinity, // Set to Infinity to prevent automatic refetching
      retry: 1, // Allow one retry for better resilience and user experience
      retryDelay: 1000 // Wait 1 second before retry
      // Note: TanStack Query v5 doesn't use keepPreviousData or placeholderData in defaultOptions
    },
    mutations: {
      retry: 1, // Allow one retry for better resilience
      retryDelay: 1000 // Wait 1 second before retry
    },
  },
});
