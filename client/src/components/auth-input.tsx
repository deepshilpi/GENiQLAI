import * as React from "react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

// Completely redesigned AuthInput component with explicit value handling
const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onValueChange?: (value: string) => void;
  }
>(({ className, onChange, onValueChange, value, ...props }, ref) => {
  // Create a local ref if one wasn't passed in
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
  
  // Setup local value state that always matches the input
  const [inputValue, setInputValue] = useState(value as string || "");
  
  // Make sure to update local state if value prop changes
  useEffect(() => {
    if (value !== undefined && value !== inputValue) {
      setInputValue(value as string);
    }
  }, [value]);

  // Handle input changes with multiple callbacks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // Call the original onChange if provided
    if (onChange) {
      onChange(e);
    }
    
    // Call additional value change handler if provided
    if (onValueChange) {
      onValueChange(newValue);
    }
  };

  return (
    <input
      ref={resolvedRef}
      className={cn(
        "flex h-10 w-full rounded-md border border-[#6f42c1]/30 bg-[#25135a]/40 px-3 py-2 text-base placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7551FF] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      style={{
        color: "white",
        caretColor: "white",
        WebkitTextFillColor: "white"
      }}
      value={inputValue}
      onChange={handleChange}
      {...props}
    />
  );
});

AuthInput.displayName = "AuthInput";

export { AuthInput };