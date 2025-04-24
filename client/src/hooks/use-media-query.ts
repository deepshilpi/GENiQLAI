import { useState, useEffect } from 'react';

/**
 * Custom hook for handling media queries with performance optimizations
 * Uses a single listener per query and cleanup on unmount
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state to avoid layout shifts
  const getMatches = (query: string): boolean => {
    // Check if window is defined (to support SSR)
    if (typeof window !== 'undefined') {
      return window.matchMedia(query).matches;
    }
    return false;
  };

  const [matches, setMatches] = useState<boolean>(getMatches(query));

  // Memoize the event listener setup to prevent unnecessary re-renders
  useEffect(() => {
    // Use a debounced function to prevent rapid re-renders during resize
    let debounceTimeout: NodeJS.Timeout;
    
    const handleChange = () => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        setMatches(getMatches(query));
      }, 100); // 100ms debounce time
    };

    // Create the MediaQueryList and add the listener
    const matchMedia = window.matchMedia(query);
    
    // Initial check
    setMatches(matchMedia.matches);
    
    // Use the appropriate event listener based on browser support
    if (matchMedia.addEventListener) {
      matchMedia.addEventListener('change', handleChange);
    } else {
      // Fallback for older browsers
      matchMedia.addListener(handleChange);
    }

    // Cleanup function
    return () => {
      clearTimeout(debounceTimeout);
      if (matchMedia.removeEventListener) {
        matchMedia.removeEventListener('change', handleChange);
      } else {
        // Fallback for older browsers
        matchMedia.removeListener(handleChange);
      }
    };
  }, [query]);

  return matches;
}