import * as React from "react";
import { cn } from "@/lib/utils";
import { useState } from "react";

// Create a special Input component just for the auth page that guarantees white text and tracks value state
const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, value, onChange, ...props }, ref) => {
  // Internal state to ensure value is properly managed
  const [inputValue, setInputValue] = useState(value || "");
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    // Pass the event to original onChange if provided
    if (onChange) {
      onChange(e);
    }
  };

  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#6f42c1]/30 bg-[#25135a]/40 px-3 py-2 text-base text-white placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7551FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className
      )}
      ref={ref}
      style={{ color: "white", caretColor: "white" }}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
});

AuthInput.displayName = "AuthInput";

export { AuthInput };