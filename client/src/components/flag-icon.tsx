import React from "react";

interface FlagIconProps {
  country: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function FlagIcon({ country, className = "", size = 'md' }: FlagIconProps) {
  // Map of countries to their 2-letter ISO codes for flags
  const countryToCode: Record<string, string> = {
    "United States": "us",
    "United Kingdom": "gb",
    "Canada": "ca",
    "Australia": "au",
    "India": "in",
    "China": "cn",
    "Japan": "jp",
    "Germany": "de",
    "France": "fr",
    "Brazil": "br",
    "Singapore": "sg",
    "Israel": "il",
    "Global": "globe",
    // Add more countries as needed
  };
  
  // Get the country code
  const code = countryToCode[country] || "globe";
  
  // Size mapping
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6"
  };
  
  // If it's the globe (global) icon, show a globe icon
  if (code === "globe") {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full flex items-center justify-center bg-blue-500/20`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-3/4 h-3/4 text-blue-400">
          <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3.6 9h16.8M3.6 15h16.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 3a4.5 4.5 0 0 1 0 18 4.5 4.5 0 0 1 0-18z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    );
  }
  
  // Return a flag emoji for the country
  return (
    <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden flex items-center justify-center`}>
      <span className="text-base" style={{ lineHeight: 1 }}>
        {
          // Convert country code to regional indicator symbols for flag emoji
          code.toUpperCase().split('').map(char => 
            String.fromCodePoint(char.charCodeAt(0) + 127397)
          ).join('')
        }
      </span>
    </div>
  );
}