// Utility functions for the server

/**
 * Extracts and returns the country information from an IP address
 * Note: In a real application, this would use a geo-IP service
 * For this demo, it returns a default country or extracts from header
 */
export function detectCountryFromIP(ip: string): string {
  // In a real application, this would use a geo-IP service like MaxMind
  // For this demo, we're using a simple approach
  
  // Check for localhost IPs (for development)
  if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    return "United States"; // Default country for local development
  }
  
  // For demo purposes, extract country from IP format (if it's our special format)
  // Format: country.0.0.0
  if (ip.includes("country")) {
    const parts = ip.split(".");
    if (parts.length > 0 && parts[0] !== "country") {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  }
  
  // Default country if we couldn't determine from IP
  return "United States";
}