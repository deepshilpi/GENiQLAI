import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: Currency | string = "USD", country?: string, useSuffix: boolean = true): string {
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
  const currencyCode = typeof currency === 'string' ? currency : currency.code;
  
  // Special handling for Indian currency using appropriate terms
  if (country === "India" && useSuffix) {
    if (amount >= 1e9) { // 1 Arab (100 Crore)
      return `₹${(amount / 1e9).toFixed(1)} Arab`;
    } else if (amount >= 1e7) { // 1 Crore
      return `₹${(amount / 1e7).toFixed(1)} Crore`;
    } else if (amount >= 1e5) { // 1 Lakh
      return `₹${(amount / 1e5).toFixed(1)} Lakh`;
    } else if (amount >= 1e3) { // 1 Thousand
      return `₹${(amount / 1e3).toFixed(1)}K`;
    }
  } 
  // For non-Indian currencies or when Indian suffixes are not used
  else if (useSuffix) {
    if (amount >= 1e12) { // Trillion
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 1,
        currencyDisplay: "symbol"
      }).format(amount / 1e12) + " T";
    } else if (amount >= 1e9) { // Billion
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 1,
        currencyDisplay: "symbol"
      }).format(amount / 1e9) + " B";
    } else if (amount >= 1e6) { // Million
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 1,
        currencyDisplay: "symbol"
      }).format(amount / 1e6) + " M";
    } else if (amount >= 1e3) { // Thousand
      return new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 1,
        currencyDisplay: "symbol"
      }).format(amount / 1e3) + " K";
    }
  }
  
  // Regular formatting for smaller numbers or when suffix is disabled
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currencyCode,
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

interface Currency {
  code: string;
  symbol: string;
}

export function getCountryCurrency(country: string): Currency {
  const countryToCurrency: Record<string, Currency> = {
    "United States": { code: "USD", symbol: "$" },
    "Canada": { code: "CAD", symbol: "C$" },
    "United Kingdom": { code: "GBP", symbol: "£" },
    "Australia": { code: "AUD", symbol: "A$" },
    "India": { code: "INR", symbol: "₹" },
    "Japan": { code: "JPY", symbol: "¥" },
    "China": { code: "CNY", symbol: "¥" },
    "Brazil": { code: "BRL", symbol: "R$" },
    "European Union": { code: "EUR", symbol: "€" },
    "Germany": { code: "EUR", symbol: "€" },
    "France": { code: "EUR", symbol: "€" },
    "Mexico": { code: "MXN", symbol: "$" },
    "Singapore": { code: "SGD", symbol: "S$" },
    "South Korea": { code: "KRW", symbol: "₩" },
    "South Africa": { code: "ZAR", symbol: "R" },
    "Nigeria": { code: "NGN", symbol: "₦" },
    "Kenya": { code: "KES", symbol: "KSh" },
    "Israel": { code: "ILS", symbol: "₪" }
  };
  
  return countryToCurrency[country] || { code: "USD", symbol: "$" };
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

// Market data interfaces
interface CountryMarketData {
  growthRate: string;
  maturity: string;
  competitiveIntensity: string;
  consumerAdoption: string;
  regulatoryEnvironment: string;
  investmentActivity: string;
}

// Function to get country flag emoji
export function getCountryFlag(country: string): string {
  const countryToFlag: Record<string, string> = {
    "United States": "🇺🇸",
    "United Kingdom": "🇬🇧",
    "Canada": "🇨🇦",
    "Australia": "🇦🇺",
    "India": "🇮🇳",
    "China": "🇨🇳",
    "Japan": "🇯🇵",
    "Germany": "🇩🇪",
    "France": "🇫🇷",
    "Brazil": "🇧🇷",
    "Singapore": "🇸🇬",
    "Israel": "🇮🇱",
    "South Korea": "🇰🇷",
    "Nigeria": "🇳🇬",
    "Kenya": "🇰🇪",
    "Mexico": "🇲🇽",
    "South Africa": "🇿🇦",
  };
  
  return countryToFlag[country] || "🌐"; // Default to globe if country not found
}

// Country-specific market data with consistent values
export function getCountryMarketData(country: string): CountryMarketData {
  const marketData: Record<string, CountryMarketData> = {
    "United States": {
      growthRate: "7.2",
      maturity: "Mature",
      competitiveIntensity: "Very High",
      consumerAdoption: "Early Majority",
      regulatoryEnvironment: "Moderate",
      investmentActivity: "High"
    },
    "United Kingdom": {
      growthRate: "5.8",
      maturity: "Mature",
      competitiveIntensity: "High",
      consumerAdoption: "Early Majority",
      regulatoryEnvironment: "Moderate",
      investmentActivity: "Moderate"
    },
    "Canada": {
      growthRate: "6.3",
      maturity: "Growing",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Early Adopters",
      regulatoryEnvironment: "Favorable",
      investmentActivity: "Moderate"
    },
    "Australia": {
      growthRate: "5.5",
      maturity: "Growing",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Early Adopters",
      regulatoryEnvironment: "Favorable",
      investmentActivity: "Moderate"
    },
    "India": {
      growthRate: "12.7",
      maturity: "Emerging",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Innovators",
      regulatoryEnvironment: "Evolving",
      investmentActivity: "High"
    },
    "China": {
      growthRate: "9.4",
      maturity: "Growing",
      competitiveIntensity: "High",
      consumerAdoption: "Early Adopters",
      regulatoryEnvironment: "Restrictive",
      investmentActivity: "Very High"
    },
    "Japan": {
      growthRate: "4.2",
      maturity: "Mature",
      competitiveIntensity: "High",
      consumerAdoption: "Late Majority",
      regulatoryEnvironment: "Strict",
      investmentActivity: "Moderate"
    },
    "Germany": {
      growthRate: "5.1",
      maturity: "Mature",
      competitiveIntensity: "High",
      consumerAdoption: "Early Majority",
      regulatoryEnvironment: "Strict",
      investmentActivity: "Moderate"
    },
    "France": {
      growthRate: "4.9",
      maturity: "Mature",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Early Majority",
      regulatoryEnvironment: "Moderate",
      investmentActivity: "Moderate"
    },
    "Brazil": {
      growthRate: "8.3",
      maturity: "Emerging",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Innovators",
      regulatoryEnvironment: "Complex",
      investmentActivity: "Growing"
    },
    "Singapore": {
      growthRate: "7.8",
      maturity: "Growing",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Early Adopters",
      regulatoryEnvironment: "Favorable",
      investmentActivity: "High"
    },
    "Israel": {
      growthRate: "9.1",
      maturity: "Growing",
      competitiveIntensity: "Moderate",
      consumerAdoption: "Innovators",
      regulatoryEnvironment: "Supportive",
      investmentActivity: "Very High"
    },
    "South Korea": {
      growthRate: "6.9",
      maturity: "Growing",
      competitiveIntensity: "High",
      consumerAdoption: "Early Adopters",
      regulatoryEnvironment: "Moderate",
      investmentActivity: "High"
    },
    "Nigeria": {
      growthRate: "11.2",
      maturity: "Emerging",
      competitiveIntensity: "Low",
      consumerAdoption: "Innovators",
      regulatoryEnvironment: "Developing",
      investmentActivity: "Growing"
    },
    "Kenya": {
      growthRate: "10.5",
      maturity: "Emerging",
      competitiveIntensity: "Low",
      consumerAdoption: "Innovators",
      regulatoryEnvironment: "Developing",
      investmentActivity: "Growing"
    }
  };
  
  // Return data for the specified country, or US data as default
  return marketData[country] || marketData["United States"];
}
