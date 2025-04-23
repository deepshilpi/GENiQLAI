import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = "USD", country?: string): string {
  // Map of countries to their locale codes for proper formatting
  const countryToLocale: Record<string, string> = {
    "United States": "en-US",
    "United Kingdom": "en-GB",
    "Canada": "en-CA",
    "Australia": "en-AU",
    "India": "en-IN",
    "China": "zh-CN",
    "Japan": "ja-JP",
    "Germany": "de-DE",
    "France": "fr-FR",
    "Brazil": "pt-BR",
    "Singapore": "en-SG",
    "Israel": "he-IL",
    // Default to US format for other countries
  };
  
  // Get the appropriate locale based on country
  const locale = country && countryToLocale[country] ? countryToLocale[country] : "en-US";
  
  // Format with locale-specific settings
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
    currencyDisplay: "symbol"
  }).format(amount);
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function timeAgo(date: Date | string): string {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60
  };
  
  if (seconds < intervals.minute) {
    return `${Math.floor(seconds)} seconds ago`;
  } else if (seconds < intervals.hour) {
    return `${Math.floor(seconds / intervals.minute)} minutes ago`;
  } else if (seconds < intervals.day) {
    return `${Math.floor(seconds / intervals.hour)} hours ago`;
  } else if (seconds < intervals.week) {
    return `${Math.floor(seconds / intervals.day)} days ago`;
  } else if (seconds < intervals.month) {
    return `${Math.floor(seconds / intervals.week)} weeks ago`;
  } else if (seconds < intervals.year) {
    return `${Math.floor(seconds / intervals.month)} months ago`;
  } else {
    return `${Math.floor(seconds / intervals.year)} years ago`;
  }
}

export function detectUserCountry(): string {
  // In a real application, we would use an IP geolocation service
  // For demo purposes, returning a default value
  return "United States";
}

export function getCountryCurrency(country: string): string {
  const countryToCurrency: Record<string, string> = {
    "United States": "USD",
    "Canada": "CAD",
    "United Kingdom": "GBP",
    "Australia": "AUD",
    "India": "INR",
    "Japan": "JPY",
    "China": "CNY",
    "Brazil": "BRL",
    "European Union": "EUR",
    "Mexico": "MXN",
    "Singapore": "SGD",
    "South Korea": "KRW",
    "South Africa": "ZAR",
    "Nigeria": "NGN",
    "Kenya": "KES"
  };
  
  return countryToCurrency[country] || "USD";
}

export function isPlanAllowed(userPlan: string, requiredPlan: string): boolean {
  const planHierarchy = {
    "free": 0,
    "pro": 1,
    "unicorn": 2
  };
  
  return planHierarchy[userPlan as keyof typeof planHierarchy] >= 
         planHierarchy[requiredPlan as keyof typeof planHierarchy];
}

export function redirectToAuthIfNeeded(user: any, navigate: Function, message?: string): boolean {
  if (!user) {
    // Show an optional message using toast instead of alert for better UX
    if (message) {
      // Just navigate without message, component should handle toast
    }
    
    // Redirect to auth page
    navigate('/auth');
    return true;
  }
  
  return false;
}
