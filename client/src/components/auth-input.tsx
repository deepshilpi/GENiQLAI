import * as React from "react";
import { cn } from "@/lib/utils";
import { useRef, useState, useEffect } from "react";

// Completely redesigned AuthInput component with explicit value handling and validation
const AuthInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & {
    onValueChange?: (value: string) => void;
  }
>(({ className, onChange, onValueChange, value, ...props }, ref) => {
  // Create a local ref if one wasn't passed in
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolvedRef = (ref as React.RefObject<HTMLInputElement>) || inputRef;
  
  // Convert undefined/null values to empty string to avoid uncontrolled->controlled warnings
  const currentValue = value === undefined || value === null ? "" : value;
  
  // Setup local value state that always matches the input
  const [inputValue, setInputValue] = useState(currentValue as string);
  
  // Make sure to update local state if value prop changes
  useEffect(() => {
    if (currentValue !== inputValue) {
      setInputValue(currentValue as string);
    }
  }, [currentValue]);

  // Handle input changes with multiple callbacks
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    // We immediately call onValueChange with the raw value
    if (onValueChange) {
      onValueChange(newValue);
    }
    
    // Call the original onChange after our internal update
    if (onChange) {
      onChange(e);
    }
  };

  // Filter out the onBlur prop since we handle it ourselves
  const { onBlur, ...restProps } = props;
  
  // Handle blur event with improved validation
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // If there's an onBlur prop, call it first
    if (onBlur) {
      onBlur(e);
    }
    
    // Don't auto-trim on blur as it can cause unexpected behavior
    // Only notify of the current value through onValueChange
    if (onValueChange) {
      // Just pass the current value without modifying it
      onValueChange(inputValue);
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
      onBlur={handleBlur}
      {...restProps}
    />
  );
});

AuthInput.displayName = "AuthInput";

export { AuthInput };